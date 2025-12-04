// scale-v2.js - Simplified progression array system for color scale generation

import Color from 'colorjs.io';

/**
 * Note: At extreme lightness values (very dark < 10% or very light > 95%) 
 * with high saturation, colors may be outside sRGB gamut and will be clipped
 * during hex conversion. This causes minor drift (typically 1-3%) in the final
 * OKhsl values compared to the progression values. This is an unavoidable 
 * limitation of the sRGB color space.
 */

/**
 * All 13 steps in the color scale
 */
const STEPS = [50, 100, 150, 200, 300, 400, 500, 600, 700, 800, 850, 900, 950];

/**
 * Available tint steps (before base 500)
 */
const TINT_STEPS = [50, 100, 150, 200, 300, 400];

/**
 * Available shade steps (after base 500)
 */
const SHADE_STEPS = [600, 700, 800, 850, 900, 950];

/**
 * Map progression values to specific steps
 * 
 * Uses explicit object notation: { 50: 98, 200: 90 }
 * 
 * @param {Object} values - Progression values as object { step: value }
 * @param {Array} availableSteps - Available step positions (for validation)
 * @returns {Object} - Mapping of step -> value
 */
function mapValuesToSteps(values, availableSteps) {
  if (!values || typeof values !== 'object') return {};

  // Object notation: { 50: 98, 200: 90 }
  // Validate that all keys are valid steps
  const mapping = {};
  for (const [step, value] of Object.entries(values)) {
    const stepNum = Number(step);
    if (availableSteps.includes(stepNum)) {
      mapping[stepNum] = value;
    } else {
      console.warn(`Invalid step ${step} for available steps ${availableSteps.join(', ')}`);
    }
  }
  return mapping;
}

/**
 * Simple linear interpolation between control points
 * 
 * @param {number} step - Current step to interpolate
 * @param {Object} controlPoints - Mapping of step -> value (includes base at 500)
 * @returns {number} - Interpolated value
 */
function interpolateValue(step, controlPoints) {
  // If we have an exact control point, return it
  if (controlPoints[step] !== undefined) {
    return controlPoints[step];
  }

  // Get sorted control point steps
  const steps = Object.keys(controlPoints).map(Number).sort((a, b) => a - b);

  // Find surrounding control points
  let beforeIdx = -1;
  let afterIdx = -1;

  for (let i = 0; i < steps.length - 1; i++) {
    if (step >= steps[i] && step <= steps[i + 1]) {
      beforeIdx = i;
      afterIdx = i + 1;
      break;
    }
  }

  // If no surrounding points found, return closest value
  if (beforeIdx === -1) {
    return step < steps[0] ? controlPoints[steps[0]] : controlPoints[steps[steps.length - 1]];
  }

  // Linear interpolation between the two points
  const t = (step - steps[beforeIdx]) / (steps[afterIdx] - steps[beforeIdx]);
  const valueBefore = controlPoints[steps[beforeIdx]];
  const valueAfter = controlPoints[steps[afterIdx]];

  return valueBefore + (valueAfter - valueBefore) * t;
}

/**
 * Wrap hue to 0-360 range
 */
function wrapHue(hue) {
  hue = hue % 360;
  if (hue < 0) hue += 360;
  return hue;
}

/**
 * Generate a color scale using explicit control points
 * 
 * Simple strategy: Merge tint + base + shade control points, then linearly
 * interpolate OKhsl values for all steps, convert to OKLCH.
 * 
 * @param {Object} options - Configuration object
 * @param {number} options.baseHue - Base hue in degrees (0-360)
 * @param {number} options.baseSaturation - Base saturation in percentage (0-100)
 * @param {number} options.baseLightness - Base lightness in percentage (0-100)
 * @param {number} options.startL - Starting lightness at step 50 (absolute %)
 * @param {number} options.endL - Ending lightness at step 950 (absolute %)
 * @param {Object} options.hueProgression - { step: shift } - Hue shifts in degrees for specific steps
 * @param {Object} options.saturationProgression - { step: percent } - Saturation as % of base (RELATIVE)
 * @param {Object} options.lightnessProgression - { step: percent } - Lightness as % of range (RELATIVE)
 * @returns {Array} Array of 13 color objects {L, C, H} in OKLCH space
 */
export function generateScale({
  baseHue,
  baseSaturation,
  baseLightness,
  startL = 98,
  endL = 9.5,
  hueProgression = {},
  saturationProgression = {},
  lightnessProgression = {}
}) {
  // Convert base color from OKhsl to OKLCH using Color.js
  const baseColor = new Color("okhsl", [baseHue, baseSaturation / 100, baseLightness / 100]);
  const baseOklch = baseColor.to("oklch");
  const baseL = baseOklch.coords[0] * 100;  // Convert 0-1 to 0-100
  const baseC = baseOklch.coords[1];
  const baseH = baseOklch.coords[2];

  // Build complete control point maps (tints + base + shades)
  const hueControls = {
    ...mapValuesToSteps(hueProgression, STEPS),
    500: 0, // Base has no hue shift (can be overridden)
  };

  // Saturation: convert relative percentages to absolute values
  // (e.g., if baseSaturation=95% and progression says 60%, result is 95% * 60% = 57%)
  const satProgression = mapValuesToSteps(saturationProgression, STEPS);
  const satControls = {
    // Convert relative % to absolute saturation values
    ...Object.fromEntries(
      Object.entries(satProgression).map(([step, percent]) => [step, baseSaturation * (percent / 100)])
    ),
    500: baseSaturation, // Base is always 100% of itself
  };

  // Lightness: convert relative percentages to absolute values
  // For tints (< 500): % progress from startL to baseLightness
  // For shades (> 500): % progress from baseLightness to endL
  const lightProgression = mapValuesToSteps(lightnessProgression, STEPS);

  const tintRange = baseLightness - startL;
  const shadeRange = endL - baseLightness;

  const lightControls = {
    50: startL, // Always anchor to startL
    500: baseLightness, // Base is always exact
    950: endL // Always anchor to endL
  };

  // Convert relative % to absolute lightness for each step
  for (const [step, percent] of Object.entries(lightProgression)) {
    const stepNum = Number(step);
    if (stepNum < 500) {
      // Tint: interpolate from startL to baseLightness
      lightControls[stepNum] = startL + (percent / 100) * tintRange;
    } else if (stepNum > 500) {
      // Shade: interpolate from baseLightness to endL
      lightControls[stepNum] = baseLightness + (percent / 100) * shadeRange;
    }
  }

  // Generate scale by interpolating OKhsl values for each step
  const scale = [];

  for (let i = 0; i < STEPS.length; i++) {
    const step = STEPS[i];

    // Interpolate OKhsl values for this step
    const hueShift = interpolateValue(step, hueControls);
    const H = wrapHue(baseHue + hueShift);
    const S = interpolateValue(step, satControls) / 100;
    const L = interpolateValue(step, lightControls) / 100;

    // Convert OKhsl to OKLCH using Color.js
    const color = new Color("okhsl", [H, S, L]);
    const oklch = color.to("oklch");
    scale.push({
      L: oklch.coords[0] * 100,  // Convert 0-1 to 0-100
      C: oklch.coords[1],
      H: oklch.coords[2] ?? 0    // Hue is undefined for achromatic colors
    });
  }

  return scale;
}
