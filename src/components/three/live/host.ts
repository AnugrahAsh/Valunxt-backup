/**
 * ONE WEBGL CONTEXT FOR EVERY LIVE ABSTRACT ON THE PAGE.
 *
 * A page can carry a dozen of these (the home page alone has eight below the
 * hero), and a browser allows about sixteen WebGL contexts before it starts
 * losing the oldest. So no abstract owns a context. This host owns one
 * renderer on a canvas that is never in the document; each abstract is a
 * plain 2D canvas in the page, and every frame the host renders each live
 * scene into a corner of its own canvas and copies the pixels across with
 * drawImage. The copy is a GPU-side blit in every current browser.
 *
 * WHAT RUNS. A scene renders once when it registers, so its canvas is never
 * blank when it scrolls in, and then only while its component says it is on
 * screen (an IntersectionObserver in LiveImage / LiveBackdrop). Time advances
 * only while a scene is live, so it resumes where it paused rather than
 * jumping. Nothing runs while the tab is hidden. Reduced motion never
 * reaches here: the components leave the poster image in place instead.
 *
 * Scenes are built lazily, at most two per frame, so a page with many of
 * them does not stall on arrival.
 */
import * as THREE from 'three';

import { buildScene } from './scenes';
import type { LiveScene } from './kit';
import type { LiveSpec } from './registry';

export interface LiveHandle {
  setActive(on: boolean): void;
  setSize(w: number, h: number): void;
  destroy(): void;
}

interface Entry {
  id: number;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  spec: LiveSpec;
  scene: LiveScene | null;
  w: number;
  h: number;
  active: boolean;
  drawn: boolean;
  dirty: boolean;
  time: number;
  onReady?: () => void;
}

const MAX_W = 2560;
const MAX_H = 1600;
const MAX_PIXELS = 2.4e6;
/* How many live scenes advance in one frame. A practice page can have eight
   on screen at once (the deck's silks); past this many they take turns, so
   each runs at a slightly lower rate rather than the whole page dropping. */
const LIVE_BUDGET = 5;

class Host {
  private gl: HTMLCanvasElement | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private entries = new Map<number, Entry>();
  private next = 1;
  private raf = 0;
  private last = 0;
  private W = 0;
  private H = 0;
  private lost = false;
  private listening = false;
  private cursor = 0;

  register(canvas: HTMLCanvasElement, spec: LiveSpec, opts: { onReady?: () => void }): LiveHandle {
    const ctx = canvas.getContext('2d', { alpha: true });
    const id = this.next++;
    if (!ctx) {
      return { setActive() {}, setSize() {}, destroy() {} };
    }
    const entry: Entry = {
      id,
      canvas,
      ctx,
      spec,
      scene: null,
      w: 0,
      h: 0,
      active: false,
      drawn: false,
      dirty: true,
      time: 0,
      onReady: opts.onReady,
    };
    this.entries.set(id, entry);
    this.listen();
    this.schedule();
    return {
      setActive: (on) => {
        if (entry.active === on) return;
        entry.active = on;
        if (on) this.schedule();
      },
      setSize: (w, h) => {
        const nw = Math.max(1, Math.round(w));
        const nh = Math.max(1, Math.round(h));
        if (nw === entry.w && nh === entry.h) return;
        entry.w = nw;
        entry.h = nh;
        entry.dirty = true;
        this.schedule();
      },
      destroy: () => {
        this.entries.delete(id);
        entry.scene?.dispose();
        entry.scene = null;
      },
    };
  }

  private listen() {
    if (this.listening) return;
    this.listening = true;
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(this.raf);
        this.raf = 0;
      } else {
        this.last = performance.now();
        this.schedule();
      }
    });
  }

  private ensureRenderer(): THREE.WebGLRenderer | null {
    if (this.renderer) return this.lost ? null : this.renderer;
    try {
      const gl = document.createElement('canvas');
      const renderer = new THREE.WebGLRenderer({
        canvas: gl,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: false,
      });
      renderer.setPixelRatio(1);
      renderer.setClearColor(0x000000, 0);
      renderer.autoClear = true;
      gl.addEventListener('webglcontextlost', (e) => {
        e.preventDefault();
        this.lost = true;
      });
      gl.addEventListener('webglcontextrestored', () => {
        this.lost = false;
        for (const e of this.entries.values()) e.dirty = true;
        this.schedule();
      });
      this.gl = gl;
      this.renderer = renderer;
      return renderer;
    } catch (err) {
      console.warn('[vxn-live] no renderer', err);
      return null;
    }
  }

  /** What is registered and drawn, for a console. */
  status() {
    return [...this.entries.values()].map((e) => ({ id: e.id, family: e.spec.family, w: e.w, h: e.h, active: e.active, drawn: e.drawn, built: !!e.scene }));
  }

  private schedule() {
    if (this.raf || document.hidden) return;
    this.raf = requestAnimationFrame(this.frame);
  }

  private frame = (now: number) => {
    this.raf = 0;
    const dt = Math.min(0.05, Math.max(0, (now - this.last) / 1000));
    this.last = now;
    const renderer = this.ensureRenderer();
    if (!renderer) return;

    let more = false;
    let built = 0;
    let live = 0;
    /* The live ones take turns from where the last frame left off. */
    const all = [...this.entries.values()];
    const start = all.length ? this.cursor % all.length : 0;
    for (let k = 0; k < all.length; k++) {
      const e = all[(start + k) % all.length]!;
      const first = !e.drawn;
      const wants = e.dirty || e.active || first;
      if (!wants || e.w === 0) continue;
      if (!e.scene) {
        if (built >= 2) {
          more = true;
          continue;
        }
        try {
          e.scene = buildScene(e.spec);
        } catch (err) {
          /* A scene that fails to build leaves its poster image showing. */
          console.warn('[vxn-live] scene failed', e.spec.family, err);
          this.entries.delete(e.id);
          continue;
        }
        built++;
      }
      const routine = e.active && !e.dirty && !first;
      if (routine) {
        if (live >= LIVE_BUDGET) {
          more = true;
          this.cursor = (start + k) % all.length;
          continue;
        }
        live++;
        e.time += dt;
      }
      this.draw(renderer, e);
      e.dirty = false;
      if (first) {
        e.drawn = true;
        e.onReady?.();
      }
      if (e.active) more = true;
    }
    if (live < LIVE_BUDGET) this.cursor = 0;
    if (more) this.schedule();
  };

  private draw(renderer: THREE.WebGLRenderer, e: Entry) {
    const gl = this.gl!;
    let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    dpr = Math.min(dpr, Math.sqrt(MAX_PIXELS / (e.w * e.h)), MAX_W / e.w, MAX_H / e.h);
    const pw = Math.max(1, Math.round(e.w * dpr));
    const ph = Math.max(1, Math.round(e.h * dpr));
    if (e.canvas.width !== pw) e.canvas.width = pw;
    if (e.canvas.height !== ph) e.canvas.height = ph;
    if (pw > this.W || ph > this.H) {
      this.W = Math.max(this.W, pw);
      this.H = Math.max(this.H, ph);
      renderer.setSize(this.W, this.H, false);
    }
    const { scene, camera, update } = e.scene!;
    camera.aspect = pw / ph;
    camera.updateProjectionMatrix();
    /* The scene is drawn into the top-left corner of the shared canvas. GL
       counts rows from the bottom, drawImage from the top, hence the two
       different y origins here. */
    renderer.setViewport(0, this.H - ph, pw, ph);
    renderer.setScissor(0, this.H - ph, pw, ph);
    renderer.setScissorTest(true);
    update(e.time);
    renderer.render(scene, camera);
    e.ctx.clearRect(0, 0, pw, ph);
    e.ctx.drawImage(gl, 0, 0, pw, ph, 0, 0, pw, ph);
  }
}

export const host = new Host();
(window as unknown as { __vxnLive?: Host }).__vxnLive = host;
