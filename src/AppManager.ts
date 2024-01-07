import { ComponentPublicInstance, createApp } from "vue";
import App from "./App.vue";

export default class AppManager {
  vueInst: ComponentPublicInstance | undefined;

  constructor() {
    this.init();
  }

  init() {
    const app = createApp(App);
    this.vueInst = app.mount("#app");
  }

  static startApp() {
    new this();
  }
}
