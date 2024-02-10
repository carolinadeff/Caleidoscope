<script setup lang="ts">
import { onMounted, ref } from "vue";
import Particle from "./entities/Particle";
import Triangle from "./entities/Triangle";
import { useUpdateAngle } from "./composables/useUpdateAngle";

const myDraw = ref();
const ctx = ref();

const container = ref<HTMLDivElement>();
const { angle, center, updateAngle, callbacks } = useUpdateAngle();
const { onMouseDown, onMouseEnter, onMouseLeave, onMouseMove, onMouseUp } =
  callbacks;

const triangle = new Triangle(ctx, angle, center);
const particles: Particle[] = [];

function redraw() {
  updateAngle();
  const { width, height } = myDraw.value!;
  ctx.value.clearRect(0, 0, width, height);

  triangle.redraw();
  particles.forEach((p) => p.redraw(triangle));
}

function addParticle() {
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
      ></div>
    </div>
    <div class="actions">
      <button @click="addParticle()">+</button>
      <button @click="redraw()">>></button>
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
        transparent 40%,
        white 70%,
        white 100%
      );
      height: 100%;
      width: auto;
      aspect-ratio: 1 / 1;
    }
  }

  .actions {
    position: absolute;
    top: 30px;
    left: 30px;
    width: fit-content;
    height: fit-content;
  }

  canvas {
    height: 100%;
    aspect-ratio: 1 / 1;
  }
}
</style>
