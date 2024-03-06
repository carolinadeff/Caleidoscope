import { angleRad } from "../utils/angleUtils";
import { Point, Side } from "../types";
import Constant from "../utils/constants";
import { Ref, ref } from "vue";
import { getLineParams, getReflection } from "../utils/reflectionUtils";

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

    const formattedTriangles = this.arrTriangles
      .sort((tr1, tr2) => {
        if (tr1.rc < tr2.rc) {
          return -1;
        }
        if (tr1.rc > tr2.rc) {
          return 1;
        }
        return 0;
      })
      .reverse();

    formattedTriangles.forEach(({ points, rc, tc }) => {
      const { p1, p2, p3 } = points;

      const subTriangles: Record<any, Point>[] = [
        { p1, p2, p3 },
        { p2, p3, p1 },
        { p3, p1, p2 },
      ];

      subTriangles.forEach((subTriangleEl: Record<any, Point>) => {
        const [p1, p2, pOp] = Object.values(subTriangleEl);
        const { x: xc, y: yc } = this.center.value;

        const rp1 = Math.sqrt(Math.pow(p1.x - xc, 2) + Math.pow(p1.y - yc, 2));
        const rp2 = Math.sqrt(Math.pow(p2.x - xc, 2) + Math.pow(p2.y - yc, 2));
        if (rp1 > rc || rp2 > rc) {
          const { a, b, constantX } = getLineParams(p1, p2);
          let tcProjectionX;
          let tcProjectionY;
          if (constantX) {
            tcProjectionX = constantX;
            tcProjectionY = pOp.y;
          } else {
            const aPerp = -1 / a;
            const bPerp = pOp.y - aPerp * pOp.x;
            tcProjectionX = (b! - bPerp) / (aPerp - a);
            tcProjectionY = a * tcProjectionX + b!;
          }

          const path = new Path2D();
          path.moveTo(p1.x, p1.y);
          path.lineTo(p2.x, p2.y);
          path.lineTo(this.center.value.x, this.center.value.y);
          path.closePath();
          const gradientFill = ctx.createLinearGradient(
            tcProjectionX,
            tcProjectionY,
            pOp.x,
            pOp.y
          );

          const endColorStop = Math.max(Math.min(rc / 300, 1), 0.2);
          gradientFill.addColorStop(0.01, "#2b4030");
          gradientFill.addColorStop(endColorStop, Constant.BG_COLOR);
          ctx.fillStyle = gradientFill;
          ctx.fill(path);
        }
      });

      const pathShadow = new Path2D();

      ctx.lineWidth = 5;
      ctx.save();
      ctx.shadowColor = "black";
      ctx.shadowBlur = 50;
      ctx.shadowOffsetX = -(tc.x - this.center.value.x) / 40;
      ctx.shadowOffsetY = -(tc.y - this.center.value.y) / 40;

      pathShadow.moveTo(p1.x, p1.y);
      pathShadow.lineTo(p2.x, p2.y);
      pathShadow.lineTo(p3.x, p3.y);
      pathShadow.closePath();
      ctx.stroke(pathShadow);
      ctx.restore();
    });

    ctx.lineWidth = 5;
    this.arrTriangles.forEach(({ points }) => {
      const { p1, p2, p3 } = points;
      const path = new Path2D();

      ctx.strokeStyle = "#97b09d";
      ctx.lineWidth = 5;
      path.moveTo(p1.x, p1.y);
      path.lineTo(p2.x, p2.y);
      path.lineTo(p3.x, p3.y);
      path.closePath();
      ctx.stroke(path);
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
      const tc = {
        x: (p1.x + p2.x + p3.x) / 3,
        y: (p1.y + p2.y + p3.y) / 3,
      };

      const rc = Math.sqrt(
        Math.pow(tc.x - this.center.value.x, 2) +
          Math.pow(tc.y - this.center.value.y, 2)
      );
      return {
        rc,
        tc,
      };
    };

    const cvsWidth = 2 * this.center.value.x;

    return arrPointsInPerspective
      .filter((pointsEl) => {
        const { rc } = getRc(pointsEl);
        //remove se não está no círculo visível
        return rc < this.center.value.x + 20;
      })
      .map((pointsEl) => ({
        points: pointsEl,
        sides: Triangle.getFormattedSides(pointsEl),
        ...getRc(pointsEl),
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
