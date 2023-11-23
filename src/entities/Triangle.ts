import { angleRad } from "../utils/angleUtils";
import { Point, Side } from "../types";
import Constant from "../utils/constants";
import { Ref, ref } from "vue";
import { getReflection } from "../utils/reflectionUtils";

class Triangle {
  angle = 0;
  reflectionCount = 0;
  ctx: Ref<CanvasRenderingContext2D | undefined> = ref();

  constructor(ctx: Ref<CanvasRenderingContext2D>, angle: number) {
    this.ctx = ctx;
    this.angle = angle;
  }

  draw() {
    if (!this.ctx.value) {
      return;
    }

    const ctx = this.ctx.value!;
    //const colors = ["green", "blue", "purple"];

    this.arrTriangles.forEach((reflectedSidesEl, index) => {
      if (index > 0) {
        ctx.globalAlpha = 0.5;
      }
      reflectedSidesEl.forEach(({ side }) => {
        const [pInit, pEnd] = side;

        ctx.beginPath();
        ctx.moveTo(pInit.x, pInit.y);
        ctx.lineTo(pEnd.x, pEnd.y);
        ctx.strokeStyle = "grey";
        ctx.stroke();
      });
    });

    ctx.globalAlpha = 1;
  }

  static getFormattedSides(
    points: Record<"p1" | "p2" | "p3", Point>
  ): [Side, Side, Side] {
    const { p1, p2, p3 } = points;

    return [
      {
        key: "12",
        side: [p1, p2],
        thirdPoint: p3,
        otherSides: [
          [p2, p3],
          [p3, p1],
        ],
      },
      {
        key: "23",
        side: [p2, p3],
        thirdPoint: p1,
        otherSides: [
          [p1, p2],
          [p3, p1],
        ],
      },
      {
        key: "31",
        side: [p3, p1],
        thirdPoint: p2,
        otherSides: [
          [p1, p2],
          [p2, p3],
        ],
      },
    ];
  }

  redraw(angle: number) {
    this.updateAngle(angle);
    this.draw();
  }

  updateAngle(angle: number): void {
    this.angle = angle;
  }

  get points() {
    return this.getPoints();
  }

  get outterPoints() {
    return this.getPoints(Constant.R + Constant.DELTA_R);
  }

  get arrReflectionTriangles() {
    const reflectionUnit = Constant.R + Constant.DELTA_R;

    const arr = Array(4)
      .fill(0)
      .map((_, index) => {
        const r = Math.pow(2, index) * reflectionUnit;
        const angleIncr = index % 2 === 0 ? 0 : 180;
        const angle = this.angle + angleIncr;

        return this.getPoints(r, angle);
      });
    return arr;
  }

  getPoints(r = Constant.R, angle = this.angle) {
    return {
      p1: this.getpoint(angle + 0, r),
      p2: this.getpoint(angle + 120, r),
      p3: this.getpoint(angle + 240, r),
    };
  }

  get arrTriangles() {
    const arrPoints: { p1: Point; p2: Point; p3: Point }[] = [];
    arrPoints.push(this.points);

    this.arrReflectionTriangles.forEach((refTriangle) => {
      const arrReflectionTriangleSides =
        Triangle.getFormattedSides(refTriangle);

      const arrReflectedPoints: { p1: Point; p2: Point; p3: Point }[] = [];

      arrReflectionTriangleSides.forEach(({ side: [pInit, pEnd] }) => {
        arrPoints.forEach(({ p1, p2, p3 }) => {
          arrReflectedPoints.push({
            p1: getReflection([pInit, pEnd], p1),
            p2: getReflection([pInit, pEnd], p2),
            p3: getReflection([pInit, pEnd], p3),
          });
        });
      });

      arrPoints.push(...arrReflectedPoints);
    });

    return arrPoints.map((pointsEl) => Triangle.getFormattedSides(pointsEl));
  }

  getpoint(theta: number, r: number): Point {
    const thetaRad = angleRad(theta);

    return {
      x: Constant.C_X + r * Math.cos(thetaRad),
      y: Constant.C_Y + r * Math.sin(thetaRad),
    };
  }
}

export default Triangle;
