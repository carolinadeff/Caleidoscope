import { ref } from "vue";
import { Point } from "../types";

const ANGLE_INCR = 1;
export const useUpdateAngle = () => {
  const angle = ref(0);
  const isOver = ref(false);
  const isMouseDown = ref(false);
  const angleSpeed = ref(0);
  const mouseMovement = ref<MouseEvent | undefined>();

  const center = ref<Point>({ x: 400, y: 400 });

  function updateAngle() {
    const v = updateAngleSpeed(angleSpeed.value);
    console.log(v);

    angleSpeed.value = v!;

    const incr = angleSpeed.value * ANGLE_INCR;
    angle.value = angle.value + incr;
    if (angle.value % 60 === 0) {
      angle.value = angle.value + incr;
    }
    if (angle.value >= 360) {
      angle.value = 1;
    }
  }

  function updateAngleSpeed(v: number) {
    if (!isMouseDown.value) {
      if (v <= 0.01 && v >= -0.01) {
        return 0;
      }

      return 0.99 * v;
    }

    if (!mouseMovement.value) {
      return v;
    }

    const { offsetX, offsetY, movementX, movementY } = mouseMovement.value;

    try {
      if (movementX === 0 && movementY === 0) {
        return 0;
      }

      const tanRtoP = (center.value.y - offsetY) / (center.value.x - offsetX);

      if (!isFinite(tanRtoP)) {
        return v;
      }

      const tanNormal = -1 / tanRtoP;
      const alphaN = Math.atan(tanNormal);

      const tanMovement = movementY / movementX;
      const alphaMovement = Math.atan(tanMovement);

      const alpha = alphaN - alphaMovement;

      const vMouse = Math.sqrt(Math.pow(movementX, 2) + Math.pow(movementY, 2));

      let vMouseComponent = vMouse * Math.cos(alpha);
      if (vMouseComponent > 2) {
        vMouseComponent = 2;
      }
      if (vMouseComponent < -2) {
        vMouseComponent = -2;
      }

      return vMouseComponent;
    } catch (err) {
      console.error(err);
    }
  }

  const callbacks = {
    onMouseEnter: (event: MouseEvent) => {
      isOver.value = true;
    },
    onMouseDown: (event: MouseEvent) => {
      isMouseDown.value = true;
      mouseMovement.value = event;
    },
    onMouseMove: (event: MouseEvent) => {
      if (isMouseDown.value) {
        mouseMovement.value = event;
      }
    },
    onMouseUp: (event: MouseEvent) => {
      isMouseDown.value = false;
      mouseMovement.value = event;
    },
    onMouseLeave: (event: MouseEvent) => {
      isOver.value = false;

      isMouseDown.value = false;
      mouseMovement.value = undefined;
    },
  };

  return {
    updateAngle,
    angle,
    center,
    callbacks,
  };
};
