// scale-v2.js - Simplified progression array system for color scale generation

import { okhslToOKLCH, oklchToOKhsl } from './okhsl.js';

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
 * @param {Array} options.hueProgression - [{ tint shifts }, { shade shifts }]
 * @param {Array} options.saturationProgression - [{ tint % of base }, { shade % of base }] (RELATIVE)
 * @param {Array} options.lightnessProgression - [{ tint % of range }, { shade % of range }] (RELATIVE)
 * @returns {Array} Array of 13 color objects {L, C, H} in OKLCH space
 */
export function generateScale({
  baseHue,
  baseSaturation,
  baseLightness,
  startL = 98,
  endL = 9.5,
  hueProgression,
  saturationProgression,
  lightnessProgression
}) {
  // Convert base color to OKLCH
  const baseOKLCH = okhslToOKLCH(baseHue / 360, baseSaturation / 100, baseLightness / 100);
  const baseL = baseOKLCH.L;
  const baseC = baseOKLCH.C;
  const baseH = baseOKLCH.H;

  // Parse progression arrays
  const [tintHueShifts, shadeHueShifts] = hueProgression || [[0], [0]];
  const [tintSaturationPercents, shadeSaturationPercents] = saturationProgression || [[100], [100]];
  const [tintLightnessPercents, shadeLightnessPercents] = lightnessProgression || [[{}], [{}]];

  // Build complete control point maps (tints + base + shades)
  const hueControls = {
    ...mapValuesToSteps(tintHueShifts, TINT_STEPS),
    500: 0, // Base has no hue shift
    ...mapValuesToSteps(shadeHueShifts, SHADE_STEPS)
  };

  // Saturation: convert relative percentages to absolute values
  // (e.g., if baseSaturation=95% and progression says 10%, result is 95% * 10% = 9.5%)
  const tintSatControls = mapValuesToSteps(tintSaturationPercents, TINT_STEPS);
  const shadeSatControls = mapValuesToSteps(shadeSaturationPercents, SHADE_STEPS);

  const satControls = {
    // Convert relative % to absolute saturation values
    ...Object.fromEntries(
      Object.entries(tintSatControls).map(([step, percent]) => [step, baseSaturation * (percent / 100)])
    ),
    500: baseSaturation, // Base is always 100% of itself
    ...Object.fromEntries(
      Object.entries(shadeSatControls).map(([step, percent]) => [step, baseSaturation * (percent / 100)])
    )
  };

  // Lightness: convert relative percentages to absolute values
  // For tints: % progress from startL to baseLightness
  // For shades: % progress from baseLightness to endL
  const tintLightControls = mapValuesToSteps(tintLightnessPercents, TINT_STEPS);
  const shadeLightControls = mapValuesToSteps(shadeLightnessPercents, SHADE_STEPS);

  const tintRange = baseLightness - startL;
  const shadeRange = endL - baseLightness;

  const lightControls = {
    50: startL, // Always anchor to startL
    // Convert tint relative % to absolute lightness
    ...Object.fromEntries(
      Object.entries(tintLightControls).map(([step, percent]) => [
        step,
        startL + (percent / 100) * tintRange
      ])
    ),
    500: baseLightness, // Base is always exact
    // Convert shade relative % to absolute lightness
    ...Object.fromEntries(
      Object.entries(shadeLightControls).map(([step, percent]) => [
        step,
        baseLightness + (percent / 100) * shadeRange
      ])
    ),
    950: endL // Always anchor to endL
  };

  // Generate scale by interpolating OKhsl values for each step
  const scale = [];

  for (let i = 0; i < STEPS.length; i++) {
    const step = STEPS[i];

    // Interpolate OKhsl values for this step
    const hueShift = interpolateValue(step, hueControls);
    const H = wrapHue(baseHue + hueShift);
    const S = interpolateValue(step, satControls) / 100;
    const L = interpolateValue(step, lightControls) / 100;

    // Convert OKhsl to OKLCH
    const oklch = okhslToOKLCH(H / 360, S, L);
    scale.push(oklch);
  }

  return scale;
}
