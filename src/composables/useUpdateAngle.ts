import { onMounted, ref, Ref } from "vue";
import { Point } from "../types";

const V_MAX = 8;

export const useUpdateAngle = (myDraw: Ref<HTMLCanvasElement | undefined>) => {
  const angle = ref(1);
  const isOver = ref(false);
  const isMouseDown = ref(false);
  const angleSpeed = ref(0);
  let mouseP: Point | undefined;
  let lastMouseP: Point | undefined;
  const spun = ref(false);

  const center = ref<Point>({ x: 0, y: 0 });

  onMounted(() => {
    setCenter();
  });

  window.onresize = () => {
    setCenter();
  };

  function setCenter() {
    if (!myDraw.value) {
      return;
    }

    center.value.x = myDraw.value.clientWidth / 2;
    center.value.y = myDraw.value.clientHeight / 2;
  }

  function getFreeV(v: number) {
    return v * (1 - 0.05 * (Math.abs(v) / V_MAX));
  }

  function updateAngle() {
    let v = angleSpeed.value;

    if (!isMouseDown.value || !mouseP || !lastMouseP) {
      v = Math.abs(v) > 0.005 ? getFreeV(v) : 0;
    } else {
      const tanRtoP = (center.value.y - mouseP.y) / (center.value.x - mouseP.x);
      const tanRtoLastP =
        (center.value.y - lastMouseP.y) / (center.value.x - lastMouseP.x);

      if (isFinite(tanRtoP) && isFinite(tanRtoLastP)) {
        const alphaRToP = Math.atan(tanRtoP);
        const alphaRToLastP = Math.atan(tanRtoLastP);

        const alpha = alphaRToP - alphaRToLastP;
        const alphaDeg = alpha * (180 / Math.PI);

        v = alphaDeg;
      }
    }

    angleSpeed.value = Math.min(V_MAX, v);

    let newAngle = angle.value + angleSpeed.value;

    if (newAngle % 60 === 0) {
      newAngle = newAngle + 0.1;
    }
    if (newAngle > 360) {
      newAngle = newAngle - 360;
    }

    angle.value = newAngle;
  }

  const callbacks = {
    onMouseEnter: () => {
      isOver.value = true;
    },
    onMouseLeave: () => {
      isOver.value = false;

      isMouseDown.value = false;
      mouseP = undefined;
      lastMouseP = undefined;
    },
    onMouseDown: (event: MouseEvent) => {
      isMouseDown.value = true;

      const { offsetX, offsetY } = event;
      mouseP = { x: offsetX, y: offsetY };
      lastMouseP = { x: offsetX, y: offsetY };
    },
    onMouseUp: () => {
      isMouseDown.value = false;
      mouseP = undefined;
      lastMouseP = undefined;
    },
    onMouseMove: (event: MouseEvent) => {
      if (isMouseDown.value) {
        if (!spun.value) {
          spun.value = true;
        }

        lastMouseP = mouseP;

        const { offsetX, offsetY } = event;
        mouseP = { x: offsetX, y: offsetY };
      }
    },
  };

  return {
    updateAngle,
    angle,
    center,
    callbacks,
    spun,
  };
};
