export interface Point {
  x: number;
  y: number;
}

export type Side = {
  key: string;
  side: [p1: Point, p2: Point];
  thirdPoint: Point;
  otherSides: [[p2: Point, p3: Point], [p3: Point, p1: Point]];
};

export interface Particle extends Point {
  r: number;
}

export interface LineParams {
  a: number;
  b: number | undefined;
  constantX: number | undefined;
}
