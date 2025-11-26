// colors-v2.js - Simplified progression array system


// 1) Export stepsCount
export const stepsCount = 13;


//
// Progressions: hue = degree shifts, saturation = relative % of base, lightness = relative % between startL/endL anchors.
// This ensures colors adapt naturally while maintaining consistent endpoints across all hues.

export const defaults = {
  // Lightness anchors (absolute values at endpoints)
  startL: 98,    // Lightest tint at step 50 (absolute %)
  endL: 9.5,     // Darkest shade at step 950 (absolute %)

  // Hue shifts: Tints go -10° cooler, shades go -10° cooler
  hueProgression: [{ 50: -10 }, { 950: -10 }],

  // Saturation: Tints fade to 60% of base, shades stay vibrant at 90% of base
  // (e.g., if base=95%, tint 50 → 57%, shade 950 → 85.5%)
  saturationProgression: [{ 50: 60 }, { 950: 90 }],

  // Lightness: RELATIVE % of range between anchors
  // Tint values = % progress from startL (98%) to baseLightness
  // Shade values = % progress from baseLightness to endL (9.5%)
  // Step 50 always = startL, step 950 always = endL (no need to specify)
  // Empty = linear interpolation between anchors
  lightnessProgression: [{ 100: 5, 150: 20, 400: 92 }, { 600: 8, 850: 75, 900: 90 }],
};

// 3) Export color configurations
// All colors use 13 steps (50-950) in OKhsl color space. Base values in degrees/percentages.
// Saturation progression is relative to base; lightness progression is relative to startL/endL anchors.

export const colorConfigs = [
  {
    name: "red-500",
    baseHue: 19.86,
    baseSaturation: 95.66,
    baseLightness: 58.97,
    hueProgression: [{ 50: -8 }, { 950: -5 }],
  },
  {
    name: "orange-500",
    baseHue: 55.72,
    baseSaturation: 99.12,
    baseLightness: 71.32,
    hueProgression: [{ 50: 30 }, { 950: -20 }],
  },
  {
    name: "yellow-500",
    baseHue: 82.72,
    baseSaturation: 98.95,
    baseLightness: 79.85,
    hueProgression: [{ 50: 10 }, { 950: -35 }],
  },
  {
    name: "green-500",
    baseHue: 155.38,
    baseSaturation: 94.24,
    baseLightness: 69.06,
    hueProgression: [{ 50: 15 }, { 950: 12 }],
  },
  {
    name: "teal-500",
    baseHue: 181.77,
    baseSaturation: 100,
    baseLightness: 70.59,
    hueProgression: [{ 50: -5 }, { 950: 5 }],
  },
  {
    name: "sky-500",
    baseHue: 219.96,
    baseSaturation: 100,
    baseLightness: 70.60,
    hueProgression: [{ 50: -5 }, { 950: 0 }],
  },
  {
    name: "blue-500",
    baseHue: 254.09,
    baseSaturation: 100.00,
    baseLightness: 57.28,
    hueProgression: [{ 50: -5 }, { 950: 5 }],
  },
  {
    name: "iris-500",
    baseHue: 283.66,
    baseSaturation: 97.88,
    baseLightness: 49.21,
    hueProgression: [{ 50: -5 }, { 950: 7 }],
  },
  {
    name: "magenta-500",
    baseHue: 323.35,
    baseSaturation: 92.88,
    baseLightness: 56.56,
    hueProgression: [{ 50: -5 }, { 950: 5 }],
  },
  {
    name: "rose-500",
    baseHue: 1.98,
    baseSaturation: 91.74,
    baseLightness: 58.11,
    hueProgression: [{ 50: -4 }, { 950: -12 }],
  },
  {
    name: "slate-500",
    baseHue: 256.10,
    baseSaturation: 19.73,
    baseLightness: 41.96,

    hueProgression: [{ 50: -10 }, { 950: -5 }],
    // Slate: 0% of base saturation = fully desaturated (achromatic) for all tints/shades
    saturationProgression: [{ 50: 0 }, { 950: 0 }],

  },
  {
    name: "neutral-500",
    baseHue: 0,
    baseSaturation: 0,
    baseLightness: 42.08,

    hueProgression: [{ 50: 0 }, { 950: 0 }],
    // Neutral: 0% of base (which is already 0%) = true grayscale (no color)
    saturationProgression: [{ 50: 0 }, { 950: 0 }],

  }
];
