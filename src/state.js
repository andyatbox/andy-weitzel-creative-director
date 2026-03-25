// Global mutable state shared by the Three.js animation loop and event handlers.
// This lives outside of React so it can be updated every frame without
// triggering re-renders.
const state = {
  targetX: 0, targetY: 0,
  currentCamX: 0, currentCamY: 0,
  targetMouseX: 0, targetMouseY: 0, mouseX: 0, mouseY: 0,
  isZoomed: false,
  currentZoom: 1.5, targetZoomVal: 1.5, animatedZoom: 1.5,
  effectIntensity: 1.0, targetEffectIntensity: 1.0,
  targetLetterRotation: 0,
  isPointerDragging: false,
  currentActiveCol: 1,
  lastInputTime: 0,
  preZoomTargetX: 0, preZoomTargetY: 0,
  W: typeof window !== 'undefined' ? window.innerWidth : 1000,
  H: typeof window !== 'undefined' ? window.innerHeight : 1000,
  cellW: 0, cellH: 0,
  isTouchDevice: typeof window !== 'undefined' && (('ontouchstart' in window) || (navigator.maxTouchPoints > 0)),
  downX: 0, downY: 0,
  velY: 0,
}

export default state
