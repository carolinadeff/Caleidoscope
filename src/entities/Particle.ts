import { Ref, ref } from "vue";
import { Point, LineParams, Side } from "../types";
import Triangle from "./Triangle";

const AC_Y = 0.1;
const C_X = 250;
const C_Y = 250;

let position = 0;

export default class Particle {
  triangleSides: Triangle["sides"];
  ctx: Ref<CanvasRenderingContext2D | undefined> = ref();
  p: Point = { x: C_X + position, y: C_Y };
  pPrev: Point = { x: C_X + position, y: C_Y };

  constructor(ctx: Ref<CanvasRenderingContext2D>, triangle: Triangle) {
    this.triangleSides = triangle.sides;
    this.ctx = ctx;
  }

  redraw(triangle: Triangle) {
    if (!this.ctx.value) {
      return;
    }

    this.reset();
    this.updateTriangle(triangle);
    this.updatePosition();

    this.draw();
  }

  draw() {
    const ctx = this.ctx.value!;

    ctx.beginPath();
    ctx.fillStyle = "green";
    ctx.arc(this.p.x, this.p.y, 2, 0, Math.PI * 2, true);
    ctx.fill();
  }

  reset() {
    if (this.p?.x > 500 || this.p?.y > 500 || this.p?.x < 0 || this.p?.y < 0) {
      this.p = { x: C_X, y: C_Y };
      this.pPrev = { x: C_X, y: C_Y };
    }
  }

  updateTriangle(triangle: Triangle) {
    this.triangleSides = triangle.sides;
  }

  updatePosition() {
    let pNew: Point = {
      x: this.p.x + (this.p.x - this.pPrev.x),
      y: this.p.y + (this.p.y - this.pPrev.y) + AC_Y,
    };

    this.triangleSides.forEach(({ side, otherSides }) => {
      const intersection = this.getIntersectionSideToRCenterParticle(
        side,
        pNew
      );
      if (intersection) {
        console.log("primeiro ", side, intersection);
        this.p = getReflection(side, this.p);
        pNew = getReflection(side, pNew);

        //pNew = reduceSpeed(side, this.p, pNew);

        otherSides.forEach((otherSide) => {
          const otherIntersection = this.getIntersectionSideToRCenterParticle(
            otherSide,
            pNew
          );
          if (otherIntersection) {
            console.log("outro ", otherSide, otherIntersection);
            this.p = getReflection(otherSide, this.p);
            pNew = getReflection(otherSide, pNew);

            //pNew = reduceSpeed(side, this.p, pNew);
          }
        });
      }
    });

    this.pPrev = this.p;
    this.p = pNew;
  }

  getIntersectionSideToRCenterParticle(
    [pInit, pEnd]: [pInit: Point, pEnd: Point],
    pNew: Point
  ) {
    const pCenter: Point = { x: C_X, y: C_Y };

    const sideParams = Triangle.getLineParams(pInit, pEnd);
    const particlePathParams = Triangle.getLineParams(pCenter, pNew);

    const intersection = getPathIntersectionPoint([
      sideParams,
      particlePathParams,
    ]);
    return (
      intersection &&
      isPointInsideLine(intersection as Point, pInit, pEnd) &&
      isPointInsideLine(intersection as Point, pCenter, pNew)
    );
  }
}

function isPointInsideLine(intersection: Point, pInit: Point, pEnd: Point) {
  return (
    intersection.x >= Math.min(pInit.x, pEnd.x) &&
    intersection.x <= Math.max(pInit.x, pEnd.x) &&
    intersection.y >= Math.min(pInit.y, pEnd.y) &&
    intersection.y <= Math.max(pInit.y, pEnd.y)
  );
}

function getPathIntersectionPoint(arrLinesParams: LineParams[]) {
  const [
    { a: a1, b: b1, constantX: constantX1 },
    { a: a2, b: b2, constantX: constantX2 },
  ] = arrLinesParams;
  if (a1 === a2) {
    //paralelas
    return;
  }

  //console.log(a1, b1, constantX1, a2, b2, constantX2);

  const intersection: Partial<Point> = {
    x: undefined,
    y: undefined,
  };

  const constantX = constantX1 || constantX2;

  const a = b1 ? a1 : a2;
  const b = b1 ? b1 : b2;

  intersection.x = constantX ?? (b2! - b1!) / (a1 - a2);
  intersection.y = a * intersection.x! + b;

  return intersection;
}

function getReflection(side: [Point, Point], point: Point) {
  const sideParams = Triangle.getLineParams(...side);

  const aReflection = sideParams.a === 0 ? Infinity : -1 / sideParams.a;
  const isVerticalReflection = aReflection === Infinity;

  const reflectionParams: LineParams = {
    a: aReflection,
    b: isVerticalReflection ? undefined : point.y - aReflection * point.x,
    constantX: isVerticalReflection ? point.x : undefined,
  };

  const pIntersection: Partial<Point> = getPathIntersectionPoint([
    sideParams,
    reflectionParams,
  ])!;

  const correctedPoint = {
    x: point.x + 2 * (pIntersection.x! - point.x),
    y: point.y + 2 * (pIntersection.y! - point.y),
  };

  return correctedPoint;
}

function reduceSpeed(side: [Point, Point], pInit: Point, pNew: Point) {
  const sideParams = Triangle.getLineParams(...side);
  const pathParams = Triangle.getLineParams(pInit, pNew);

  const angle = Math.atan(sideParams.a - pathParams.a);
  const reductionFactor = Math.sin(angle);
  console.log(angle, reductionFactor);

  const x =
    pInit.x + (pNew.x - pInit.x) * (1 - 0.2 * Math.abs(reductionFactor));
  const y =
    pInit.y + (pNew.y - pInit.y) * (1 - 0.2 * Math.abs(reductionFactor));
  return { x, y };
}
