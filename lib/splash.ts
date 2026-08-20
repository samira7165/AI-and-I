import confetti from "canvas-confetti";
import { BRAND } from "./brand";

export function splash(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  const origin = {
    x: (r.left + r.width / 2) / window.innerWidth,
    y: (r.top + r.height / 2) / window.innerHeight,
  };

  confetti({
    particleCount: 34,
    spread: 360,
    startVelocity: 22,
    origin,
    colors: [BRAND.logoBlue, BRAND.lightBlue, BRAND.success, "#FFFFFF"],
    shapes: ["circle"],
    scalar: 0.7,
    ticks: 70,
    gravity: 0.35,
    disableForReducedMotion: true,
  });
}
