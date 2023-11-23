<script setup lang="ts">
import { onMounted, ref } from "vue";
import Particle from "./entities/Particle";
import Triangle from "./entities/Triangle";

const ANGLE_INCR = 1;
const width = "800";
const height = "800";

let angle = 0;
let angleSpeed = 0;

const myDraw = ref();
const ctx = ref();
const isOver = ref(false);

const triangle = new Triangle(ctx, angle);
const particles: Particle[] = [];

function redraw() {
  updateAngle();
  ctx.value.clearRect(0, 0, 800, 800);

  triangle.redraw(angle);
  particles.forEach((p) => p.redraw(triangle));
}

function updateAngle() {
  if (isOver.value) {
    if (angleSpeed < 1) {
      angleSpeed += 0.05;
    } else if (angleSpeed > 1) {
      angleSpeed = 1;
    }
  } else {
    if (angleSpeed >= 0.05) {
      angleSpeed -= 0.05;
    } else if (angleSpeed < 0) {
      angleSpeed = 0;
    }
  }
  const incr = angleSpeed * ANGLE_INCR;
  angle = angle + incr;
  if (angle % 60 === 0) {
    angle = angle + incr;
  }
  if (angle >= 360) {
    angle = 1;
  }

  console.log(incr);
}

function addParticle() {
  const particle = new Particle(ctx, triangle);
  particles.push(particle);
}

onMounted(() => {
  const canvas = myDraw.value;
  if (canvas.getContext) {
    ctx.value = canvas.getContext("2d");

    redraw();
    setInterval(() => {
      redraw();
    }, 30);
  }
});
</script>

<template>
  <div @mouseenter="isOver = true" @mouseleave="isOver = false">
    <canvas ref="myDraw" :width="width" :height="height"></canvas>
    <button @click="addParticle()">+</button>
    <button @click="redraw()">>></button>
  </div>
</template>

<style>
canvas {
  border: 1px solid black;
}
</style>
