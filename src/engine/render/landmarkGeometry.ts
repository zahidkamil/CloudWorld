import { BoxGeometry, ConeGeometry, CylinderGeometry, SphereGeometry, TorusGeometry } from 'three';
import type { BufferGeometry } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { LandmarkKind } from './landmarkKind';

/** Each landmark is three merged meshes: body, trim (roofs, frames, rims), and glow (windows, lamps). */
export interface LandmarkGeometry {
  body: BufferGeometry;
  trim: BufferGeometry;
  glow: BufferGeometry;
}

type Part = 'body' | 'trim' | 'glow';

class Builder {
  private parts: Record<Part, BufferGeometry[]> = { body: [], trim: [], glow: [] };

  add(part: Part, geometry: BufferGeometry, x: number, y: number, z: number, rotX = 0, rotY = 0): this {
    geometry.rotateX(rotX);
    geometry.rotateY(rotY);
    geometry.translate(x, y, z);
    this.parts[part].push(geometry);
    return this;
  }

  /** A box whose base sits at `y`. */
  box(part: Part, w: number, h: number, d: number, x: number, y: number, z: number): this {
    return this.add(part, new BoxGeometry(w, h, d), x, y + h / 2, z);
  }

  /** A cylinder whose base sits at `y`. */
  cyl(part: Part, rTop: number, rBottom: number, h: number, x: number, y: number, z: number, seg = 14): this {
    return this.add(part, new CylinderGeometry(rTop, rBottom, h, seg), x, y + h / 2, z);
  }

  cone(part: Part, r: number, h: number, x: number, y: number, z: number, seg = 4, rotY = Math.PI / 4): this {
    return this.add(part, new ConeGeometry(r, h, seg), x, y + h / 2, z, 0, rotY);
  }

  dome(part: Part, r: number, x: number, y: number, z: number): this {
    return this.add(part, new SphereGeometry(r, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), x, y, z);
  }

  ball(part: Part, r: number, x: number, y: number, z: number): this {
    return this.add(part, new SphereGeometry(r, 12, 8), x, y, z);
  }

  ring(part: Part, r: number, tube: number, x: number, y: number, z: number): this {
    return this.add(part, new TorusGeometry(r, tube, 6, 24), x, y, z, Math.PI / 2);
  }

  build(): LandmarkGeometry {
    const merge = (list: BufferGeometry[]) => {
      // An empty part becomes a tiny degenerate box so every landmark always has three meshes.
      const geometry = list.length ? mergeGeometries(list, false) : new BoxGeometry(0.001, 0.001, 0.001);
      list.forEach((g) => g.dispose());
      return geometry;
    };
    return { body: merge(this.parts.body), trim: merge(this.parts.trim), glow: merge(this.parts.glow) };
  }
}

/** Every landmark stands on a shared plinth so it has a footprint that is easy to hover and click. */
const plinth = (b: Builder, size = 2.7) => b.box('trim', size, 0.16, size, 0, 0, 0);

const BUILDERS: Record<LandmarkKind, () => LandmarkGeometry> = {
  /** Office block: podium, shaft with lit bands, setback, rooftop unit. */
  tower: () => {
    const b = new Builder();
    plinth(b);
    b.box('body', 2.3, 0.5, 2.3, 0, 0.16, 0);
    b.box('body', 1.9, 2.5, 1.9, 0, 0.66, 0);
    for (const y of [1.15, 1.75, 2.35]) b.box('glow', 1.96, 0.13, 1.96, 0, y, 0);
    b.box('body', 1.3, 0.9, 1.3, 0, 3.16, 0);
    b.box('glow', 1.36, 0.1, 1.36, 0, 3.55, 0);
    b.box('trim', 1.5, 0.12, 1.5, 0, 4.06, 0);
    b.box('trim', 0.5, 0.4, 0.5, 0.3, 4.18, -0.2);
    b.cyl('trim', 0.03, 0.03, 0.9, -0.35, 4.18, 0.3, 6);
    return b.build();
  },
  /** Data drum: stacked disc rings under a dome. */
  drum: () => {
    const b = new Builder();
    plinth(b);
    b.cyl('body', 1.15, 1.2, 0.9, 0, 0.16, 0, 20);
    b.cyl('glow', 1.2, 1.2, 0.1, 0, 0.62, 0, 20);
    b.cyl('body', 1.1, 1.15, 0.9, 0, 1.06, 0, 20);
    b.cyl('glow', 1.15, 1.15, 0.1, 0, 1.52, 0, 20);
    b.cyl('trim', 1.18, 1.18, 0.14, 0, 1.96, 0, 20);
    b.dome('trim', 1.05, 0, 2.1, 0);
    b.cyl('trim', 0.05, 0.05, 0.5, 0, 3.1, 0, 6);
    return b.build();
  },
  /** Silo cluster beside a loading shed. */
  silos: () => {
    const b = new Builder();
    plinth(b);
    for (const [x, z] of [
      [-0.55, -0.45],
      [0.55, -0.45],
      [0, 0.45],
    ] as const) {
      b.cyl('body', 0.5, 0.5, 1.9, x, 0.16, z, 16);
      b.cyl('glow', 0.52, 0.52, 0.08, x, 1.2, z, 16);
      b.cone('trim', 0.55, 0.5, x, 2.06, z, 16, 0);
    }
    b.box('trim', 0.9, 0.55, 0.7, 0.95, 0.16, 0.95);
    return b.build();
  },
  /** Arch gateway: two pillars, lintel, glowing underside. */
  gate: () => {
    const b = new Builder();
    plinth(b);
    b.box('body', 0.55, 2.1, 0.7, -1.0, 0.16, 0);
    b.box('body', 0.55, 2.1, 0.7, 1.0, 0.16, 0);
    b.box('trim', 2.9, 0.5, 0.9, 0, 2.26, 0);
    b.box('glow', 1.5, 0.1, 0.5, 0, 2.12, 0);
    b.box('trim', 0.5, 0.35, 0.5, 0, 2.76, 0);
    b.cyl('trim', 0.05, 0.05, 0.5, -1.0, 2.4, 0, 6);
    return b.build();
  },
  /** Roundabout with lamps: where traffic fans out. */
  roundabout: () => {
    const b = new Builder();
    b.cyl('trim', 1.5, 1.5, 0.2, 0, 0, 0, 28);
    b.cyl('body', 1.35, 1.35, 0.26, 0, 0.1, 0, 28);
    b.cyl('trim', 0.7, 0.7, 0.4, 0, 0.2, 0, 20);
    b.ball('glow', 0.32, 0, 0.9, 0);
    for (let i = 0; i < 4; i += 1) {
      const a = (i * Math.PI) / 2 + Math.PI / 4;
      b.cyl('trim', 0.04, 0.04, 0.8, Math.cos(a) * 1.1, 0.2, Math.sin(a) * 1.1, 6);
      b.ball('glow', 0.1, Math.cos(a) * 1.1, 1.05, Math.sin(a) * 1.1);
    }
    return b.build();
  },
  /** Vault with a round door. */
  vault: () => {
    const b = new Builder();
    plinth(b);
    b.box('body', 1.9, 1.5, 1.9, 0, 0.16, 0);
    b.box('trim', 2.2, 0.28, 2.2, 0, 1.66, 0);
    b.add('glow', new CylinderGeometry(0.46, 0.46, 0.08, 20), 0, 0.95, 0.97, Math.PI / 2);
    b.add('trim', new TorusGeometry(0.5, 0.06, 6, 20), 0, 0.95, 0.98);
    b.box('trim', 0.6, 0.4, 0.6, 0, 1.94, 0);
    return b.build();
  },
  /** Glass pavilion under a pyramid roof. */
  pavilion: () => {
    const b = new Builder();
    plinth(b);
    b.box('body', 1.7, 1.3, 1.7, 0, 0.16, 0);
    b.box('glow', 1.74, 0.5, 1.74, 0, 0.56, 0);
    b.cone('trim', 1.45, 0.95, 0, 1.46, 0, 4, Math.PI / 4);
    b.box('glow', 0.14, 0.5, 0.14, 0, 2.38, 0);
    return b.build();
  },
  /** Post-office box with a gabled roof. */
  mailbox: () => {
    const b = new Builder();
    plinth(b);
    b.box('body', 1.6, 1.1, 1.2, 0, 0.16, 0);
    b.box('glow', 1.0, 0.12, 0.05, 0, 0.85, 0.62);
    b.cone('trim', 1.2, 0.7, 0, 1.26, 0, 4, Math.PI / 4);
    b.box('trim', 0.2, 0.9, 0.2, 1.0, 0.16, 0.7);
    return b.build();
  },
  /** Radio mast with dishes and a beacon. */
  mast: () => {
    const b = new Builder();
    plinth(b);
    b.box('body', 1.4, 0.4, 1.4, 0, 0.16, 0);
    b.cyl('body', 0.1, 0.18, 3.9, 0, 0.56, 0, 8);
    b.dome('trim', 0.45, 0.5, 2.2, 0.1);
    b.dome('trim', 0.35, -0.45, 2.9, -0.1);
    b.ball('glow', 0.22, 0, 4.55, 0);
    return b.build();
  },
  /** Ring of posts: a fence around whatever shares the group. */
  fence: () => {
    const b = new Builder();
    plinth(b);
    for (let i = 0; i < 10; i += 1) {
      const a = (i / 10) * Math.PI * 2;
      b.box('body', 0.18, 0.9, 0.18, Math.cos(a) * 1.15, 0.16, Math.sin(a) * 1.15);
      b.cone('trim', 0.14, 0.26, Math.cos(a) * 1.15, 1.06, Math.sin(a) * 1.15, 4, Math.PI / 4);
    }
    b.ring('glow', 1.15, 0.04, 0, 0.7, 0);
    return b.build();
  },
  /** Flat tile for plumbing resources (subnets, route tables, attachments). */
  pad: () => {
    const b = new Builder();
    plinth(b, 2.2);
    b.box('body', 1.7, 0.18, 1.7, 0, 0.16, 0);
    b.box('glow', 0.5, 0.08, 0.5, 0, 0.34, 0);
    return b.build();
  },
  /** Generic building for any AWS service without its own silhouette. */
  block: () => {
    const b = new Builder();
    plinth(b);
    b.box('body', 1.8, 1.5, 1.8, 0, 0.16, 0);
    b.box('glow', 1.84, 0.12, 1.84, 0, 1.0, 0);
    b.box('trim', 2.0, 0.2, 2.0, 0, 1.66, 0);
    return b.build();
  },
};

const built = new Map<LandmarkKind, LandmarkGeometry>();

/** Geometry is built once per kind and shared by every landmark of that kind. */
export function landmarkGeometry(kind: LandmarkKind): LandmarkGeometry {
  let g = built.get(kind);
  if (!g) {
    g = BUILDERS[kind]();
    built.set(kind, g);
  }
  return g;
}
