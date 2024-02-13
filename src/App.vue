<script setup lang="ts">
import { onMounted, ref, reactive } from "vue";
import Particle from "./entities/Particle";
import Triangle from "./entities/Triangle";
import { useUpdateAngle } from "./composables/useUpdateAngle";

const myDraw = ref<HTMLCanvasElement>();
const ctx = ref();

const container = ref<HTMLDivElement>();
const { angle, center, updateAngle, callbacks, spun } = useUpdateAngle(myDraw);
const { onMouseDown, onMouseEnter, onMouseLeave, onMouseMove, onMouseUp } =
  callbacks;

const triangle = new Triangle(ctx, angle, center);
const particles: Particle[] = [];

const addDisabled = ref(false);

const sign = reactive({
  addParticle: true,
});

function redraw() {
  updateAngle();

  const { width, height } = myDraw.value ?? { width: 0, height: 0 };
  ctx.value.clearRect(0, 0, width, height);

  triangle.redraw();
  particles.forEach((p) => p.redraw(triangle));
}

function addParticle() {
  if (sign.addParticle) {
    sign.addParticle = false;
  }

  if (particles.length > 10) {
    addDisabled.value = true;
  }

  const particle = new Particle(ctx, triangle);
  particles.push(particle);
}

onMounted(() => {
  if (!myDraw.value) {
    return;
  }
  const canvas = myDraw.value;
  const { height } = container.value!.getBoundingClientRect();

  canvas.height = height;
  canvas.width = height;

  if (canvas.getContext) {
    ctx.value = canvas.getContext("2d");

    const redraLoop = () => {
      requestAnimationFrame(redraLoop);
      redraw();
    };
    redraLoop();
  }
});
</script>

<template>
  <div ref="container" class="container">
    <canvas ref="myDraw"></canvas>
    <div class="elements-layer">
      <div
        ref="lens"
        class="lens"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave"
        @mousedown="onMouseDown"
        @mouseup="onMouseUp"
        @mousemove="onMouseMove"
      >
        <div :class="{ spun }" class="spin-sign">Hold And Spin</div>
      </div>
    </div>
    <div class="actions">
      <button
        class="add-button"
        :class="{ text: sign.addParticle }"
        :disabled="addDisabled"
        @click="addParticle()"
      >
        <span class="plus-container">+</span>
        <span class="text-container" :class="{ hidden: !sign.addParticle }"
          >Click here to add beed</span
        >
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.container {
  position: relative;
  display: flex;
  justify-content: center;
  background: white;

  .elements-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;

    .lens {
      background: radial-gradient(
        transparent 0%,
        transparent 55%,
        white 70%,
        white 100%
      );
      height: 100%;
      width: auto;
      aspect-ratio: 1 / 1;

      display: flex;
      align-items: center;
      justify-content: center;

      .spin-sign {
        border-radius: 50px;
        border: none;
        background: #fefefe;
        width: fit-content;
        height: fit-content;
        color: #9570ba;
        font-size: 24px;
        box-shadow: 0 0 5px 1px inset #eeedf7;
        background: #fefefe;
        padding: 35px 45px;
        opacity: 1;
        transition: opacity ease 0.5s;
        user-select: none;
        &.spun {
          opacity: 0;
        }
      }
    }
  }

  .actions {
    position: absolute;
    top: 30px;
    left: 30px;
    width: fit-content;
    height: fit-content;

    .add-button {
      border-radius: 40px;
      border: none;
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      color: #9570ba;
      box-shadow: 0 0 5px 1px inset #eeedf7;
      background: #fefefe;
      gap: 10px;
      padding: 0 28px;

      transition: width ease 0.5s;
      &.text {
        width: 300px;
      }

      .plus-container {
        font-weight: bolder;
        font-size: 40px;
        font-family: "Varela Round";
      }

      .text-container {
        font-size: 20px;
        overflow: hidden;
        white-space: nowrap;
        font-family: "Varela Round";
        &.hidden {
          animation-duration: 500ms;
          animation-name: animatesign;
          animation-fill-mode: both;
        }
      }
    }
    .add-button:disabled {
      display: none;
    }
  }

  canvas {
    height: 100%;
    aspect-ratio: 1 / 1;
  }
}

@keyframes animatesign {
  0% {
    width: 220px;
    opacity: 100%;
  }
  100% {
    width: 0;
    opacity: 0;
    display: none;
  }
}
</style>
