import { angleRad } from "../utils/angleUtils";
import { Point, Side } from "../types";
import Constant from "../utils/constants";
import { Ref, ref } from "vue";
import { getReflection } from "../utils/reflectionUtils";

class Triangle {
  angle: Ref<number>;
  center: Ref<Point>;
  reflectionCount = 0;
  ctx: Ref<CanvasRenderingContext2D | undefined> = ref();

  constructor(
    ctx: Ref<CanvasRenderingContext2D>,
    angle: Ref<number>,
    center: Ref<Point>
  ) {
    this.ctx = ctx;
    this.angle = angle;
    this.center = center;
  }

  redraw() {
    if (!this.ctx.value) {
      return;
    }

    const ctx = this.ctx.value!;

    this.arrTriangles.forEach(({ points, sides, rc }, index) => {
      // using points
      const { p1, p2, p3 } = points;
      const path = new Path2D();
      path.moveTo(p1.x, p1.y);
      path.lineTo(p2.x, p2.y);
      path.lineTo(p3.x, p3.y);
      path.closePath();

      const r = index === 0 ? 0 : rc;

      let outterR = r + 300;
      if (r > 200) {
        outterR = r + 220;
      }

      if (r > 300) {
        outterR = r + 170;
      }

      if (r > 400) {
        outterR = r + 120;
      }

      if (r > 500) {
        outterR = r + 80;
      }

      if (index > 0) {
        const gradientfill = ctx.createRadialGradient(
          this.center.value.x,
          this.center.value.y,
          r - 60,
          this.center.value.x,
          this.center.value.y,
          outterR
        );

        gradientfill.addColorStop(0.1, "#f5f5f5");
        gradientfill.addColorStop(0.9, "#ddd");
        ctx.fillStyle = gradientfill;
        ctx.fill(path);
        ctx.strokeStyle = "#eaeaea";
        ctx.stroke(path);
      } else {
        ctx.fillStyle = "#f5f5f5";
        ctx.fill(path);
        ctx.strokeStyle = "#c4bfd9";
        ctx.stroke(path);
      }

      //using sides
      // sides.forEach(({ side }) => {
      //   const [pInit, pEnd] = side;

      //   ctx.beginPath();
      //   ctx.moveTo(pInit.x, pInit.y);
      //   ctx.lineTo(pEnd.x, pEnd.y);
      //   ctx.strokeStyle = "#EADCE7";
      //   ctx.stroke();
      // });
    });
  }

  getParticleLimitsSides(r: number) {
    const innerR = Constant.R - r / Math.cos(Math.PI / 3);
    const innerPoints = this.getPoints(innerR);
    return Triangle.getFormattedSides(innerPoints);
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
        const angle = this.angle.value + angleIncr;

        return this.getPoints(r, angle);
      });
    return arr;
  }

  getPoints(r = Constant.R, angle = this.angle.value) {
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
          const newTr = {
            p1: getReflection([pInit, pEnd], p1),
            p2: getReflection([pInit, pEnd], p2),
            p3: getReflection([pInit, pEnd], p3),
          };

          arrReflectedPoints.push(newTr);
        });
      });

      arrPoints.push(...arrReflectedPoints);
    });

    const arrPointsInPerspective = arrPoints.map(({ p1, p2, p3 }) => ({
      p1: correctPositionInPersp(p1, this.center.value),
      p2: correctPositionInPersp(p2, this.center.value),
      p3: correctPositionInPersp(p3, this.center.value),
    }));

    const getRc = ({ p1, p2, p3 }: Record<"p1" | "p2" | "p3", Point>) => {
      const triangleC = {
        x: (p1.x + p2.x + p3.x) / 3,
        y: (p1.y + p2.y + p3.y) / 3,
      };
      return Math.sqrt(
        Math.pow(triangleC.x - this.center.value.x, 2) +
          Math.pow(triangleC.y - this.center.value.y, 2)
      );
    };

    return arrPointsInPerspective.map((pointsEl) => ({
      points: pointsEl,
      sides: Triangle.getFormattedSides(pointsEl),
      rc: getRc(pointsEl),
    }));
  }

  getpoint(theta: number, r: number): Point {
    const thetaRad = angleRad(theta);

    return {
      x: this.center.value.x + r * Math.cos(thetaRad),
      y: this.center.value.y + r * Math.sin(thetaRad),
    };
  }
}

export function correctPositionInPersp(p: Point, center: Point) {
  const { x: xInit, y: yInit } = p;
  const distPCenter =
    Math.sqrt(Math.pow(xInit - center.x, 2) + Math.pow(yInit - center.y, 2)) -
    Constant.R;

  const tanTheta = distPCenter / 1000;

  const angle = Math.atan(tanTheta);
  if (angle > Math.PI / 2) {
    return p;
  }
  const correct = (coord: number, centerCoord: number) => {
    const reductionFactor = 1 - angle / (Math.PI / 2);
    const newCoord = (coord - centerCoord) * reductionFactor + centerCoord;

    return newCoord;
  };

  const newX = correct(xInit, center.x);
  const newY = correct(yInit, center.y);

  return { x: newX, y: newY };
}

export default Triangle;
