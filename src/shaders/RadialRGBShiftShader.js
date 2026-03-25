// Custom post-processing shader that adds:
//   - Radial RGB chromatic aberration (colour channels split outward from centre)
//   - Spherize/barrel distortion
// Used by EffectComposer via ShaderPass.
const RadialRGBShiftShader = {
  uniforms: {
    tDiffuse: { value: null },
    amount: { value: 0.03 },
    effectIntensity: { value: 1.0 },
    spherize: { value: -0.4 },
    // --- Mouse proximity RGB shift (non-touch only) ---
    mousePos: { value: null },       // vec2 UV coords (0–1), set from hook
    mouseAmount: { value: 0.0 },     // 0 = disabled (touch), >0 = active
    resolution: { value: null },     // vec2 screen size in px, for pixel-space radius
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float amount;
    uniform float effectIntensity;
    uniform float spherize;
    uniform vec2 mousePos;
    uniform float mouseAmount;
    uniform vec2 resolution;
    varying vec2 vUv;
    void main() {
      vec2 center = vec2(0.5, 0.5);
      vec2 toCenter = vUv - center;
      float dist = length(toCenter);
      vec2 distortedUv = center + toCenter * (1.0 + (spherize * effectIntensity) * (dist * dist));
      vec2 newToCenter = distortedUv - center;
      float newDist = length(newToCenter);
      float activeDist = max(0.0, newDist - 0.25);
      float shift = activeDist * amount * effectIntensity;
      vec2 dir = newDist > 0.0 ? normalize(newToCenter) : vec2(0.0);

      // --- Mouse proximity RGB shift ---
      vec2 toMousePx = (distortedUv - mousePos) * resolution;
      float mouseDist = length(toMousePx);
      float mouseStrength = max(0.0, 1.0 - mouseDist / 300.0) * mouseAmount;
      mouseStrength = mouseStrength * mouseStrength;
      vec2 mouseDir = mouseDist > 0.001 ? normalize(toMousePx / resolution) : vec2(0.0);
      float mShift = mouseStrength * 0.08;

      float cr = texture2D(tDiffuse, distortedUv + dir * shift + mouseDir * mShift).r;
      float cg = texture2D(tDiffuse, distortedUv + mouseDir * (mShift * 0.4)).g;
      float cb = texture2D(tDiffuse, distortedUv - dir * shift - mouseDir * mShift).b;
      float ca = texture2D(tDiffuse, distortedUv).a;
      gl_FragColor = vec4(cr, cg, cb, ca);
    }
  `,
}

export default RadialRGBShiftShader
