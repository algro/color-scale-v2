// colors.js

import { generatePerceptuallyUniformScale } from "./scale-v1.js";

// 1) Export stepsCount (odd integer, e.g. 11, 13, 15…)
export const stepsCount = 13;

// Calculate startS and endS based on baseSaturation using percentage-based approach
function calculateSaturationRange(baseSaturation) {
  // startS = 10% of baseSaturation
  const startS = baseSaturation * 0.10;

  // endS = 25% of baseSaturation
  const endS = baseSaturation * 0.25;

  return {
    startS: Math.max(0.05, startS), // Ensures startS is at least 0.05
    endS: Math.min(0.25, endS) // Ensures endS is at most 0.25
  };
}

export const defaults = {
  // Lightness endpoints (absolute OKLCH lightness percentage 0-100)
  startL: 98,    // Lightest tint at step 50
  endL: 19.5,    // Darkest shade at step 950
  // Saturation endpoints (will be auto-derived from baseSaturation)
  startS: null,
  endS: null,

  // Default piecewise curves - can be overridden per color
  // Syntax: ["easingType:rate", step, "easingType:rate", step, ...]
  // Rate is optional (defaults to 1.0), allows partial progression that cascades, ideally the sum or rate in tint progression is 1, same in shades

  // 

  // Separate curves for tints and shades for true symmetry
  // Tint curves: progression from step 50 to step 500
  // Use easeOutSine for asymmetric distribution like in neutrals overrides
  /*tintLightnessCurve: ["linear:0.12", 150, "easeInOutSine:0.78", 400, "linear:0.1", 500],
  tintSaturationCurve: ["linear:0.12", 150, "easeInOutSine:0.78", 400, "linear:0.1", 500],*/
  tintLightnessCurve: ["easeInSine:0.4", 200, "easeOutSine:0.6", 500],
  tintSaturationCurve: ["easeInSine:0.4", 200, "easeOutSine:0.6", 500],
  tintHueCurve: ["linear", 500],

  /*tintLightnessCurve: ["linear:0.12", 150, "easeInOutSine:0.88", 500],
  tintSaturationCurve: ["linear:0.12", 150, "easeInOutSine:0.88", 500],
  tintHueCurve: ["linear", 500],*/

  // Shade curves: progression from step 500 to step 950
  shadeLightnessCurve: ["easeInSine:0.6", 800, "linear:0.4", 950],
  shadeSaturationCurve: ["easeInSine:0.6", 800, "linear:0.4", 950],
  shadeHueCurve: ["linear", 950],

  // Legacy support - these will be ignored if separate curves are provided
  lightnessCurve: null,
  saturationCurve: null,
  hueCurve: null,

  // Note: Uses OKhsl color space for perceptually uniform saturation across all hues.
  // Separate tint/shade curves ensure true symmetry around step 500.
};

// Export the calculation function for use in app.js
export { calculateSaturationRange };

// 3) Export your array of colorConfigs using OKhsl values
// REQUIRED UNITS (no other formats accepted):
//   baseHue:        degrees (0-360°)
//   baseSaturation: percentage (0-100)
//   baseLightness:  percentage (0-100)
// Using OKhsl color space https://bottosson.github.io/misc/colorpicker
export const colorConfigs = [
  {
    name: "red-500",
    baseHue: 23.5,
    baseSaturation: 90,
    baseLightness: 57,
    startHueShift: -8.0,
    endHueShift: -5,
    // Example: Custom saturation curve for red with rates
    // saturationCurve: ["easeOutQuad:0.4", 300, "linear:0.3", 500, "linear", 700, "easeInCubic:0.5"]
  },
  {
    name: "orange-500",
    baseHue: 49.1,
    baseSaturation: 94,
    baseLightness: 67,
    startHueShift: 26,
    endHueShift: -20
  },
  {
    name: "amber-500",
    baseHue: 72.4,
    baseSaturation: 99,
    baseLightness: 74,
    startHueShift: 20,
    endHueShift: -25
  },
  {
    name: "yellow-500",
    baseHue: 82.8,
    baseSaturation: 99,
    baseLightness: 80,
    startHueShift: 15,
    endHueShift: -30
  },
  {
    name: "olive-500",
    baseHue: 107.6,
    baseSaturation: 90,
    baseLightness: 75,
    startHueShift: 0,
    endHueShift: -5
  },
  {
    name: "lime-500",
    baseHue: 124.2,
    baseSaturation: 85,
    baseLightness: 73,
    startHueShift: -10,
    endHueShift: 5
  },
  {
    name: "green-500",
    baseHue: 150.3,
    baseSaturation: 92,
    baseLightness: 65,
    startHueShift: -10,
    endHueShift: 12
  },
  {
    name: "emerald-500",
    baseHue: 160.2,
    baseSaturation: 93,
    baseLightness: 65,
    startHueShift: 0,
    endHueShift: 12
  },
  {
    name: "teal-500",
    baseHue: 182.5,
    baseSaturation: 94,
    baseLightness: 65,
    startHueShift: -5,
    endHueShift: 5.0
  },
  {
    name: "cyan-500",
    baseHue: 217.9,
    baseSaturation: 96,
    baseLightness: 66,
    startHueShift: -5,
    endHueShift: -2
  },
  {
    name: "sky-500",
    baseHue: 240.4,
    baseSaturation: 97,
    baseLightness: 64,
    startHueShift: -5,
    endHueShift: 0
  },
  {
    name: "blue-500",
    baseHue: 259.2,
    baseSaturation: 95,
    baseLightness: 58,
    startHueShift: -5,
    endHueShift: 5
  },
  {
    name: "indigo-500",
    baseHue: 273.1,
    baseSaturation: 94,
    baseLightness: 52,
    startHueShift: -5,
    endHueShift: 0
  },
  {
    name: "iris-500",
    baseHue: 283.6,
    baseSaturation: 97.9,
    baseLightness: 49.2,
    startHueShift: -5,
    endHueShift: 7
  },
  {
    name: "violet-500",
    baseHue: 293.9,
    baseSaturation: 96,
    baseLightness: 53,
    startHueShift: -5.0,
    endHueShift: 5.0
  },
  {
    name: "purple-500",
    baseHue: 305.4,
    baseSaturation: 97,
    baseLightness: 55,
    startHueShift: 4.5,
    endHueShift: -1.2
  },
  {
    name: "fuchsia-500",
    baseHue: 322.2,
    baseSaturation: 92,
    baseLightness: 56,
    startHueShift: -2.5,
    endHueShift: 3.5
  },
  {
    name: "pink-500",
    baseHue: 351.0,
    baseSaturation: 91,
    baseLightness: 57,
    startHueShift: -5,
    endHueShift: 3
  },
  {
    name: "rose-500",
    baseHue: 16.8,
    baseSaturation: 90,
    baseLightness: 57,
    startHueShift: -4.0,
    endHueShift: -12
  },
  {
    name: "sand-500",
    baseHue: 25.3,
    startL: 98.2,
    endL: 20,
    baseSaturation: 37.7,
    baseLightness: 45,
    startHueShift: 10.0,
    endHueShift: -20.0,
    startS: 2,  // Low saturation at step 50
    endS: 4     // Low saturation at step 950
  },
  {
    name: "slate-500",
    baseHue: 256.8,
    startL: 98.2,
    endL: 21.5,
    baseSaturation: 20,
    baseLightness: 42,
    startHueShift: -8.0,
    endHueShift: 8.0,
    startS: 2,  // Low saturation at step 50
    endS: 4
  },
  {
    name: "grey-500",
    baseHue: 265.6,
    startL: 98.2,
    endL: 21.5,
    baseSaturation: 13.4,
    baseLightness: 42,
    startHueShift: -10,
    endHueShift: -5,
    startS: 2,  // Very low saturation at step 50
    endS: 2
  },
  {
    name: "zinc-500",
    baseHue: 285.9,
    startL: 98.2,
    endL: 21.5,
    baseSaturation: 6.7,
    baseLightness: 42,
    startHueShift: 0.0,
    endHueShift: 0.0,
    startS: 2,  // Very low saturation at step 50
    endS: 2
  },
  {
    name: "neutral-500",
    baseHue: 89.9,
    startL: 98.2,
    endL: 21.5,
    baseSaturation: 0,
    baseLightness: 42,
    startHueShift: 0.0,
    endHueShift: 0.0,
    startS: 0,  // No saturation (pure grayscale)
    endS: 0     // No saturation (pure grayscale)

    /*The neutral override creates a more compressed light end of the scale by:
    Starting with a much slower progression (7% vs 15%)
    This keeps the very light tints (50, 100, 150) much closer together in lightness
    The result is a more subtle, refined progression in the lightest shades, which is particularly important for neutral colors that are often used for backgrounds and subtle UI elements */
  }
];

