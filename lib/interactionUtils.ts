export function triggerHaptic(durationMs = 120) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(durationMs);
  }
}

export function animateHammerStrike(element: HTMLElement | null) {
  if (!element) return;

  element.animate(
    [
      { transform: "rotate(-12deg) scale(1)" },
      { transform: "rotate(18deg) scale(1.08)" },
      { transform: "rotate(-8deg) scale(1.04)" },
      { transform: "rotate(0deg) scale(1)" },
    ],
    { duration: 600, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" }
  );
}
