import { MASS_PRESETS } from "./src/mass-presets.js";
import { MorphingMassController } from "./src/morphing-mass-controller.js";

const container = document.querySelector("#mass-canvas");
const cycleVariantButton = document.querySelector("#cycle-variant");
const energizeMassButton = document.querySelector("#energize-mass");
const presetName = document.querySelector("#preset-name");

let presetIndex = 0;

const controller = new MorphingMassController(container, {
  preset: MASS_PRESETS[presetIndex]
});

function updatePresetLabel() {
  presetName.textContent = MASS_PRESETS[presetIndex].name;
}

function applyPreset(index) {
  presetIndex = (index + MASS_PRESETS.length) % MASS_PRESETS.length;
  controller.setPreset(MASS_PRESETS[presetIndex]);
  updatePresetLabel();
}

updatePresetLabel();

cycleVariantButton.addEventListener("click", () => {
  applyPreset(presetIndex + 1);
  controller.setActive(true);
});

energizeMassButton.addEventListener("click", () => {
  controller.setActive(true);
  controller.setEnergy(1);
  window.setTimeout(() => controller.setEnergy(0.18), 420);
});

window.addEventListener("pointermove", (event) => {
  controller.setPointer(event.clientX, event.clientY);
});

window.addEventListener("pointerdown", () => {
  controller.setActive(true);
  controller.setEnergy(0.9);
});

window.addEventListener("pointerup", () => {
  controller.setEnergy(0.3);
});

window.addEventListener("pointerleave", () => {
  controller.setActive(false);
  controller.setEnergy(0.18);
});

window.addEventListener("focus", () => controller.setActive(true));
window.addEventListener("blur", () => controller.setActive(false));

window.addEventListener("beforeunload", () => {
  controller.destroy();
});
