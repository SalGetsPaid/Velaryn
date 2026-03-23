export function triggerHaptic(duration = 200) {
  if (typeof window === "undefined") {
    return;
  }

  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(duration);
  }
}