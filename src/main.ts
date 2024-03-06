import "./style.css";
import AppManager from "./AppManager";
import Constants from "./utils/constants";

document.documentElement.style.setProperty("--bg-color", Constants.BG_COLOR);
document.documentElement.style.setProperty(
  "--bg-color-025",
  Constants.BG_COLOR_025
);
AppManager.startApp();
