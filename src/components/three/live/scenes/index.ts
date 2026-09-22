/**
 * A spec's family to its builder. Each builder returns the scene, its
 * camera, a per-frame update and a dispose; ../host.ts drives them.
 */
import type { LiveScene } from '../kit';
import type { LiveSpec } from '../registry';
import { buildArcs } from './arcs';
import { buildCurtain } from './curtain';
import { buildMesh } from './mesh';
import { buildPleats } from './pleats';
import { buildRibbons } from './ribbons';
import { buildSatin } from './satin';
import { buildStrata } from './strata';
import { buildTorus } from './torus';
import { buildTrails } from './trails';

export function buildScene(spec: LiveSpec): LiveScene {
  switch (spec.family) {
    case 'satin':
      return buildSatin(spec);
    case 'pleats':
      return buildPleats(spec);
    case 'arcs':
      return buildArcs(spec);
    case 'ribbons':
      return buildRibbons(spec);
    case 'mesh':
      return buildMesh(spec);
    case 'curtain':
      return buildCurtain(spec);
    case 'torus':
      return buildTorus(spec);
    case 'strata':
      return buildStrata(spec);
    case 'trails':
      return buildTrails(spec);
    default:
      return buildSatin(spec);
  }
}
