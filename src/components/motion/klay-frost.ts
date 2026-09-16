/**
 * THE SERVICES BAND'S FROST, BAKED ONCE (20260917).
 *
 * A closed panel on /en-ae/'s six-service band wears a frosted sheet: the
 * photograph behind it blurred and a dark gradient over that. It was drawn with
 * `backdrop-filter: blur(7px) saturate(105%)`, and a backdrop filter is not a
 * picture the browser keeps — it is recomputed from whatever is behind it on
 * every frame that anything behind it changes. While the band moves, that is
 * every frame, on five sheets at once.
 *
 * MEASURED (headless Chrome on this project's development laptop, Intel UHD
 * Graphics, 1440x900 at 125%, the hover sequence and a sweep, transitions only):
 * with the live blur, frames stalled in the paint-and-composite step for 300 to
 * 940ms at a time — "way too laggy" — while style and layout took 1 to 5ms of
 * those frames. With the blur taken out and the photographs kept on their own
 * layers, the same sequence ran at 55fps with 1.8% of frames over 20ms.
 *
 * WHAT THIS DOES INSTEAD. It draws, once, in a canvas, exactly what the backdrop
 * filter was producing — the photograph as a closed panel shows it (zoomed 5%,
 * 92% opaque over the band's dark ground, with its grayscale, brightness and
 * saturation), blurred by the same 7px and saturated by the same 5% — and hands
 * the result to the frost as an ordinary background image. The gradient over it
 * is untouched. A picture costs nothing to move, so nothing is recomputed while
 * the band animates; at rest the panel looks as it did.
 *
 * The bitmap is the WHOLE photograph, sized by `background-size: cover`, which
 * is the same crop `object-fit: cover` gives the photograph beneath it — so it
 * lines up with the picture at any panel width, including every width between
 * two resting states.
 *
 * WHERE IT DOES NOT APPLY: a browser whose canvas cannot filter (Safari before
 * 18) keeps the live backdrop filter, since a frost without its blur would be a
 * visible change. So does any panel whose photograph has not loaded yet.
 */

/** What the closed panel's photograph looks like, from valunxt-landing.css
    (.vxn-klay--six .vxn-klay__panel:not(.is-active) .vxn-klay__bg img) and
    valunxt-brand.css (.vxn-klay__bg img). */
const PHOTO = {
  filter: 'grayscale(.22) brightness(.9) saturate(.95)',
  alpha: 0.92,
  zoom: 1.05,
};

/** The frost itself, from the sheet's backdrop-filter. */
const FROST = { blur: 7, saturate: '105%' };

/** The band's ground behind the photograph: the midpoint of
    `linear-gradient(115deg, #0D1622 0%, #080D15 100%)`. Only 8% of it shows
    through, so the gradient's own slope is below what can be seen. */
const GROUND = '#0b121c';

/** Can this browser's canvas apply a CSS filter? */
export function canBakeFrost(): boolean {
  try {
    const ctx = document.createElement('canvas').getContext('2d');
    if (!ctx || !('filter' in ctx)) return false;
    ctx.filter = 'blur(2px)';
    return ctx.filter === 'blur(2px)';
  } catch {
    return false;
  }
}

function loaded(img: HTMLImageElement): Promise<void> {
  if (img.complete && img.naturalWidth) return img.decode().catch(() => undefined);
  return new Promise<void>((resolve) => {
    const done = () => resolve();
    img.addEventListener('load', done, { once: true });
    img.addEventListener('error', done, { once: true });
    /* A lazy image far from the viewport may not start loading on its own. */
    if (img.loading === 'lazy') img.loading = 'eager';
  }).then(() => img.decode().catch(() => undefined));
}

/** Draw the photograph centred and zoomed, the way `transform: scale()` zooms it. */
function drawZoomed(ctx: CanvasRenderingContext2D, img: HTMLImageElement, pad: number, w: number, h: number, zoom: number) {
  const dw = w * zoom;
  const dh = h * zoom;
  ctx.drawImage(img, pad + (w - dw) / 2, pad + (h - dh) / 2, dw, dh);
}

/**
 * Bake the frost for one photograph, for a closed panel of `box` CSS pixels.
 * Resolves to an object URL for the bitmap, or null if it cannot be made.
 */
export async function bakeFrost(img: HTMLImageElement, box: { w: number; h: number }): Promise<string | null> {
  await loaded(img);
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  if (!iw || !ih || !box.w || !box.h) return null;

  /* How the photograph is displayed in a closed panel: `object-fit: cover`,
     in CSS pixels per image pixel. */
  const shown = Math.max(box.w / iw, box.h / ih);
  const dpr = window.devicePixelRatio || 1;
  /* The bitmap is made at half the resolution it is shown at. A picture blurred
     by 7px has no detail at that scale to lose, and it quarters the memory. */
  const res = Math.min(1, 0.5 * shown * dpr);
  const w = Math.max(1, Math.round(iw * res));
  const h = Math.max(1, Math.round(ih * res));
  /* The blur's radius in the bitmap's own pixels, so that shown at `shown` it
     is the 7 CSS pixels the backdrop filter used. */
  const sigma = (FROST.blur * res) / shown;
  /* A margin round the picture, so the blur finds photograph at the edges
     rather than empty canvas, which would darken them. */
  const pad = Math.ceil(sigma * 3);

  const ground = document.createElement('canvas');
  ground.width = w + pad * 2;
  ground.height = h + pad * 2;
  const g = ground.getContext('2d');
  if (!g) return null;
  g.fillStyle = GROUND;
  g.fillRect(0, 0, ground.width, ground.height);
  g.filter = PHOTO.filter;
  g.globalAlpha = PHOTO.alpha;
  /* The margin first, from a slightly larger copy… */
  drawZoomed(g, img, pad, w, h, PHOTO.zoom + 0.12);
  /* …cleared back to ground where the real picture goes, so the two passes do
     not stack their 92% into something more opaque… */
  g.filter = 'none';
  g.globalAlpha = 1;
  const zw = w * PHOTO.zoom;
  const zh = h * PHOTO.zoom;
  g.fillRect(pad + (w - zw) / 2, pad + (h - zh) / 2, zw, zh);
  /* …then the picture itself, as the closed panel shows it. */
  g.filter = PHOTO.filter;
  g.globalAlpha = PHOTO.alpha;
  drawZoomed(g, img, pad, w, h, PHOTO.zoom);

  const blurred = document.createElement('canvas');
  blurred.width = ground.width;
  blurred.height = ground.height;
  const b = blurred.getContext('2d');
  if (!b) return null;
  b.filter = `blur(${sigma.toFixed(2)}px) saturate(${FROST.saturate})`;
  b.drawImage(ground, 0, 0);

  const out = document.createElement('canvas');
  out.width = w;
  out.height = h;
  const o = out.getContext('2d');
  if (!o) return null;
  o.drawImage(blurred, -pad, -pad);

  const blob = await new Promise<Blob | null>((resolve) => out.toBlob(resolve, 'image/webp', 0.9));
  return blob ? URL.createObjectURL(blob) : null;
}
