import { angleRad } from "../utils/angleUtils";
import { LineParams, Point, Side } from "../types";
import Constant from "../utils/constants";
import { Ref, ref } from "vue";

class Triangle {
  ctx: Ref<CanvasRenderingContext2D | undefined> = ref();
  angle: number = 0;

  constructor(ctx: Ref<CanvasRenderingContext2D>, angle: number) {
    this.ctx = ctx;
    this.angle = angle;
  }

  redraw(angle: number) {
    if (!this.ctx.value) {
      return;
    }

    this.updateAngle(angle);
    this.draw();
  }

  draw() {
    const ctx = this.ctx.value!;
    const colors = ["green", "blue", "purple"];
    this.sides.forEach(({ side, key }, index) => {
      const [pInit, pEnd] = side;

      ctx.beginPath();
      ctx.moveTo(pInit.x, pInit.y);
      ctx.lineTo(pEnd.x, pEnd.y);
      ctx.strokeStyle = colors[index];
      ctx.stroke();

      const textX = (pInit.x + pEnd.x) / 2;
      const textY = (pInit.y + pEnd.y) / 2;
      ctx.fillText(key, textX, textY);
    });
  }

  get sides(): [Side, Side, Side] {
    const { p1, p2, p3 } = this.points;

    return [
      {
        key: "12",
        side: [p1, p2],
        otherSides: [
          [p2, p3],
          [p3, p1],
        ],
      },
      {
        key: "23",
        side: [p2, p3],
        otherSides: [
          [p1, p2],
          [p3, p1],
        ],
      },
      {
        key: "31",
        side: [p3, p1],
        otherSides: [
          [p1, p2],
          [p2, p3],
        ],
      },
    ];
  }

  get points() {
    return {
      p1: this.getpoint(this.angle + 0),
      p2: this.getpoint(this.angle + 120),
      p3: this.getpoint(this.angle + 240),
    };
  }

  updateAngle(angle: number): void {
    this.angle = angle;
  }

  getpoint(theta: number): Point {
    const thetaRad = angleRad(theta);

    return {
      x: Constant.C_X + Constant.R * Math.cos(thetaRad),
      y: Constant.C_Y + Constant.R * Math.sin(thetaRad),
    };
  }

  static getLineParams(p1: Point, p2: Point): LineParams {
    let a = Infinity;
    let b = undefined;
    let isVertical = true;
    if (p2.x !== p1.x) {
      a = (p2.y - p1.y) / (p2.x - p1.x);
      b = p1.y - a * p1.x;
      isVertical = false;
    }

    return { a, b, constantX: isVertical ? p1.x : undefined };
  }
}

export default Triangle;
