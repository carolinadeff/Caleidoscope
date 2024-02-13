import { Ref, ref } from "vue";
import { Point } from "../types";
import Triangle, { correctPositionInPersp } from "./Triangle";
import { purpleYellow, redGreen } from "./../assets/colors";
import { getHasIntersection, getReflection } from "../utils/reflectionUtils";

export default class Particle {
  triangle: Triangle;
  ctx: Ref<CanvasRenderingContext2D | undefined> = ref();
  p: Point;
  pPrev: Point;
  index = Math.random() > 0.5 ? 1 : 0;
  palette: string[] = [purpleYellow, redGreen][this.index];
  colorIndex = this.getColorIndex();
  color1 = this.palette[this.colorIndex + 3];
  color2 = this.palette[this.colorIndex];
  acY: number;
  r: number;

  constructor(ctx: Ref<CanvasRenderingContext2D>, triangle: Triangle) {
    this.triangle = triangle;
    this.ctx = ctx;
    this.palette = [...this.palette];

    this.p = triangle.center.value;
    this.pPrev = triangle.center.value;

    this.acY = this.getParticleAc();
    this.r = this.getParticleR();
  }

  getParticleAc() {
    let ac = 0;
    while (ac < 0.05 || ac >= 0.3) {
      ac = Math.floor(Math.random() * 100) / 100;
    }

    return ac;
  }

  getParticleR() {
    return [8, 13, 14, 18].find(() => Math.random() > 0.5) ?? 14;
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

    this.pReflectedArr.forEach(({ p }, index) => {
      if (index > 0) {
        ctx.globalAlpha = 0.4;
      }
      ctx.beginPath();
      const gradientReflected = ctx.createRadialGradient(
        p.x,
        p.y,
        1,
        p.x,
        p.y,
        this.r
      );

      // Add three color stops
      gradientReflected.addColorStop(0.9, this.color1);
      gradientReflected.addColorStop(0.1, this.color2);

      // Set the fill style and draw a rectangle
      ctx.fillStyle = gradientReflected;
      ctx.arc(p.x, p.y, this.r, 0, Math.PI * 2, true);
      ctx.fill();
    });

    ctx.globalAlpha = 1;
  }

  reset() {
    if (this.p?.x > 800 || this.p?.y > 800 || this.p?.x < 0 || this.p?.y < 0) {
      this.p = this.triangle.center.value;
      this.pPrev = this.triangle.center.value;
    }
  }

  get pReflectedArr() {
    const arrPoints: { p: Point }[] = [];
    arrPoints.push({ p: this.p });

    this.triangle.arrReflectionTriangles.forEach((refTriangle) => {
      const arrReflectionTriangleSides =
        Triangle.getFormattedSides(refTriangle);

      const arrReflectedPoints: { p: Point }[] = [];

      arrReflectionTriangleSides.forEach(({ side: [pInit, pEnd] }) => {
        arrPoints.forEach(({ p }) => {
          arrReflectedPoints.push({
            p: getReflection([pInit, pEnd], p),
          });
        });
      });

      arrPoints.push(...arrReflectedPoints);
    });

    return arrPoints.map(({ p }) => ({
      p: correctPositionInPersp(p, this.triangle.center.value),
    }));
  }

  updateTriangle(triangle: Triangle) {
    this.triangle = triangle;
  }

  // updateColorIndex() {
  //   const lastIndex = this.palette.length - 1;
  //   if (this.colorIndex >= lastIndex - 3) {
  //     this.palette = this.palette.reverse();
  //     this.colorIndex = 0;
  //   } else {
  //     this.colorIndex += 1;
  //   }
  // }

  getColorIndex() {
    const lastIndex = this.palette.length - 1;

    return Math.floor(Math.random() * (lastIndex - 3));
  }

  updatePosition() {
    const pCenter: Point = this.triangle.center.value;

    let pNew: Point = {
      x: this.p.x + (this.p.x - this.pPrev.x),
      y: this.p.y + (this.p.y - this.pPrev.y) + this.acY,
    };

    const adaptedSides = this.triangle.getParticleLimitsSides(this.r);

    adaptedSides.forEach(({ side, otherSides }) => {
      const intersection = getHasIntersection(side, [pCenter, pNew]);
      if (intersection) {
        //this.updateColorIndex();
        this.p = getReflection(side, this.p);
        pNew = getReflection(side, pNew);

        otherSides.forEach((otherSide) => {
          const otherIntersection = getHasIntersection(otherSide, [
            pCenter,
            pNew,
          ]);
          if (otherIntersection) {
            this.p = getReflection(otherSide, this.p);
            pNew = getReflection(otherSide, pNew);
          }
        });

        pNew = reduceSpeed(side, this.p, pNew);
      }
    });

    this.pPrev = this.p;
    this.p = pNew;
  }
}

function reduceSpeed(side: [Point, Point], pInit: Point, pNew: Point) {
  // const sideParams = getLineParams(...side);
  // const pathParams = getLineParams(pInit, pNew);

  // const angle = Math.atan(sideParams.a - pathParams.a);
  // const reductionFactor = Math.cos(angle);
  side;
  const reductionFactor = 0.99;

  const x =
    pInit.x + (pNew.x - pInit.x) * (1 - 0.1 * Math.abs(reductionFactor));
  const y =
    pInit.y + (pNew.y - pInit.y) * (1 - 0.1 * Math.abs(reductionFactor));
  return { x, y };
}
