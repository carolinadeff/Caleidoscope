import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";

const app = createApp(App);
const vueInst = app.mount("#app");

export const useVueInst = () => {
  return vueInst;
};
