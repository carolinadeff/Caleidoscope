<script setup lang="ts">
import { onMounted, ref } from "vue";
import Triangle from "./entities/Triangle";
import Particle from "./entities/Particle";

const ANGLE_INCR = 1;
const width = "500";
const height = "500";

let angle = 0;

const myDraw = ref();
const ctx = ref();

const triangle = new Triangle(ctx, angle);

const particles: Particle[] = [];

function redraw() {
  updateAngle();
  ctx.value.clearRect(0, 0, 500, 500);

  triangle.redraw(angle);
  particles.forEach((p) => p.redraw(triangle));
}

function updateAngle() {
  angle = angle >= 360 ? 0 : angle + ANGLE_INCR;
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
    // setInterval(() => {
    //   redraw();
    // }, 30);
  }
});
</script>

<template>
  <div>
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
