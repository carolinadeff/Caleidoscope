import { Ref, ref } from "vue";
import { Point } from "../types";
import Triangle, { correctPositionInPersp } from "./Triangle";
import { purpleYellow, redGreen } from "./../assets/colors";
import Constant from "../utils/constants";
import {
  getHasIntersection,
  getLineParams,
  getReflection,
} from "../utils/reflectionUtils";

export default class Particle {
  triangle: Triangle;
  ctx: Ref<CanvasRenderingContext2D | undefined> = ref();
  p: Point = { x: Constant.C_X, y: Constant.C_Y };
  pPrev: Point = { x: Constant.C_X, y: Constant.C_Y };
  index = Math.random() > 0.5 ? 1 : 0;
  palette: string[] = [purpleYellow, redGreen][this.index];
  colorIndex = 0;

  constructor(ctx: Ref<CanvasRenderingContext2D>, triangle: Triangle) {
    this.triangle = triangle;
    this.ctx = ctx;
    this.palette = [...this.palette];
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
        ctx.globalAlpha = 0.3;
      }
      ctx.beginPath();
      const gradientReflected = ctx.createRadialGradient(
        p.x,
        p.y,
        1,
        p.x,
        p.y,
        10
      );

      // Add three color stops

      gradientReflected.addColorStop(0.9, this.palette[this.colorIndex + 3]);
      gradientReflected.addColorStop(0.1, this.palette[this.colorIndex]);

      // Set the fill style and draw a rectangle
      ctx.fillStyle = gradientReflected;
      ctx.arc(p.x, p.y, 10, 0, Math.PI * 2, true);
      ctx.fill();
    });

    ctx.globalAlpha = 1;
  }

  reset() {
    if (this.p?.x > 800 || this.p?.y > 800 || this.p?.x < 0 || this.p?.y < 0) {
      this.p = { x: Constant.C_X, y: Constant.C_Y };
      this.pPrev = { x: Constant.C_X, y: Constant.C_Y };
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
      p: correctPositionInPersp(p),
    }));
  }

  updateTriangle(triangle: Triangle) {
    this.triangle = triangle;
  }

  updateColorIndex() {
    const lastIndex = this.palette.length - 1;
    if (this.colorIndex >= lastIndex - 3) {
      this.palette = this.palette.reverse();
      this.colorIndex = 0;
    } else {
      this.colorIndex += 1;
    }
  }

  updatePosition() {
    const pCenter: Point = { x: Constant.C_X, y: Constant.C_Y };

    let pNew: Point = {
      x: this.p.x + (this.p.x - this.pPrev.x),
      y: this.p.y + (this.p.y - this.pPrev.y) + Constant.AC_Y,
    };

    const mainTriangleSides = Triangle.getFormattedSides(this.triangle.points);

    mainTriangleSides.forEach(({ side, otherSides }) => {
      const intersection = getHasIntersection(side, [pCenter, pNew]);
      if (intersection) {
        this.updateColorIndex();
        this.p = getReflection(side, this.p);
        pNew = getReflection(side, pNew);

        //pNew = reduceSpeed(side, this.p, pNew);

        otherSides.forEach((otherSide) => {
          const otherIntersection = getHasIntersection(otherSide, [
            pCenter,
            pNew,
          ]);
          if (otherIntersection) {
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
}

function reduceSpeed(side: [Point, Point], pInit: Point, pNew: Point) {
  const sideParams = getLineParams(...side);
  const pathParams = getLineParams(pInit, pNew);

  const angle = Math.atan(sideParams.a - pathParams.a);
  const reductionFactor = Math.cos(angle);

  const x =
    pInit.x + (pNew.x - pInit.x) * (1 - 0.1 * Math.abs(reductionFactor));
  const y =
    pInit.y + (pNew.y - pInit.y) * (1 - 0.1 * Math.abs(reductionFactor));
  return { x, y };
}
