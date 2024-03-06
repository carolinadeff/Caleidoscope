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
      <div class="lens-container">
        <div class="lens-background"></div>
        <div
          ref="lens"
          class="lens"
          @mouseenter="onMouseEnter"
          @mouseleave="onMouseLeave"
          @mousedown="onMouseDown"
          @mouseup="onMouseUp"
          @mousemove="onMouseMove"
        >
          <button
            class="add-button info"
            :class="{ text: sign.addParticle }"
            :disabled="addDisabled"
            @click="addParticle()"
          >
            <span class="plus-container">+</span>
            <span class="text-container" :class="{ hidden: !sign.addParticle }"
              >Click here to add beed</span
            >
          </button>
          <div :class="{ spun }" class="spin-sign info">Hold And Spin</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.container {
  * {
    font-family: "Varela Round";
    font-size: 22px;
    overflow: hidden;
    white-space: nowrap;
    color: var(--text);
    font-weight: bold;
  }
  position: relative;
  display: flex;
  justify-content: center;
  background: var(--bg-color);

  .info {
    min-width: 80px;
    min-height: 80px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 10px;
    padding: 0 28px;
    border-radius: 50px;
    border: none;
    backdrop-filter: blur(15px);
    background-color: var(--bg-color-025);
    transition: all ease 0.5s;
  }

  .elements-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;

    .lens-container {
      position: relative;
      height: 100%;
      width: auto;
      aspect-ratio: 1 / 1;
    }

    .lens-background {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      -webkit-mask: radial-gradient(
        circle,
        #0000 50px,
        rgba(0, 0, 0, 0.7) 300px
      );
      backdrop-filter: blur(7px);
    }

    .lens {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: radial-gradient(
        transparent 0%,
        transparent 60%,
        var(--bg-color) 71%,
        var(--bg-color) 100%
      );

      height: 100%;
      width: auto;
      aspect-ratio: 1 / 1;

      padding: 50px;
      display: grid;
      grid-template-columns: 1fr;
      grid-template-rows: 80px 1fr 80px;
      flex-direction: column;
      justify-items: center;
      align-items: center;

      .add-button {
        border: none;
        width: min-content;
        justify-self: start;

        &.text {
          width: 300px;
        }

        .plus-container {
          user-select: none;
          font-weight: bolder;
          font-size: 40px;
        }

        .text-container {
          font-size: 20px;
          user-select: none;
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

      .spin-sign {
        width: fit-content;
        height: fit-content;

        user-select: none;
        &.spun {
          opacity: 0;
        }
      }
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
