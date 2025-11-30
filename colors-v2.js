// colors-v2.js - Simplified progression array system


// 1) Export stepsCount
export const stepsCount = 13;


//
// Progressions: hue = degree shifts, saturation = relative % of base, lightness = relative % between startL/endL anchors.
// This ensures colors adapt naturally while maintaining consistent endpoints across all hues.

export const defaults = {
  // Lightness anchors (absolute values at endpoints)
  startL: 98,    // Lightest tint at step 50 (absolute %)
  endL: 9.8,     // Darkest shade at step 950 (absolute %)

  // Hue shifts in degrees for specific steps
  // Positive = warmer, negative = cooler
  hueProgression: { 50: -10, 950: -10 },

  // Saturation as % of base saturation (RELATIVE)
  // (e.g., if base=95% and step 50=60%, result is 95% * 60% = 57%)
  saturationProgression: { 50: 60, 950: 90 },

  // Lightness as % of range between anchors (RELATIVE)
  // For tints (< 500): % progress from startL (98%) to baseLightness
  // For shades (> 500): % progress from baseLightness to endL (9.5%)
  // Step 50 always = startL, step 950 always = endL (anchored, no need to specify)
  // Unspecified steps = linear interpolation between control points
  lightnessProgression: { 100: 5, 150: 20, 200: 40 ,400: 85, 600: 8, 850: 75, 900: 90 },
};

// 3) Export color configurations
// All colors use 13 steps (50-950) in OKhsl color space. Base values in degrees/percentages.
// Saturation progression is relative to base; lightness progression is relative to startL/endL anchors.

export const colorConfigs = [
  {
    //500 is above Lc 60 and 600 is >= Lc 70
    name: "red-500",
    baseHue: 20.06,
    baseSaturation: 92.91,
    baseLightness: 57.25,
    hueProgression: { 50: -8, 950: -5 },
    //lightnessProgression: {600:12}, // Lc70 at 600
    
  },
  {
    name: "orange-500",
    baseHue: 55.72,
    baseSaturation: 99.12,
    baseLightness: 71.32,
    hueProgression: { 50: 30, 950: -20 },
    //lightnessProgression: {600:4}, // Lc70 at 700
  },
  {
    name: "yellow-500",
    baseHue: 82.72,
    baseSaturation: 98.95,
    baseLightness: 79.85,
    hueProgression: { 50: 10, 950: -35 },
    //lightnessProgression: {600:4, 850:65, 900:88}, // thats how you can override lightness progression for a specific color
  },
  {
    name: "green-500",
    //Basehue is APCA 45, 
    baseHue: 156.79,
    baseSaturation: 81.95,
    baseLightness: 76.10,
    hueProgression: { 50: 15, 950: 10 },
  },
  {
    name: "teal-500",
    baseHue: 181.55,
    baseSaturation: 98.8,
    baseLightness: 76.09,
    hueProgression: { 50: -5, 950: -5 },
  },
  {
    name: "cyan-500",
    baseHue: 212.74,
    baseSaturation: 100,
    baseLightness: 75.96,
    hueProgression: { 50: -5, 950: 0 },
  },
  {
    name: "blue-500",
    baseHue: 253.75,
    baseSaturation: 100.00,
    baseLightness: 53.2,
    hueProgression: { 50: -5, 950: 5 },
  },
  {
    name: "iris-500",
    baseHue: 283.66,
    baseSaturation: 97.88,
    baseLightness: 49.21,
    hueProgression: { 50: -5, 950: 7 },
  },
  {
    name: "magenta-500",
    baseHue: 335.21,
    baseSaturation: 91.50,
    baseLightness: 58.02,
    hueProgression: { 50: -5, 950: 5 },
  },
  {
    name: "rose-500",
    baseHue: 358.96,
    baseSaturation: 94.88,
    baseLightness: 57.46,
    hueProgression: { 50: -4, 950: -12 },
  },
  {
    name: "slate-500",
    baseHue: 256.10,
    baseSaturation: 19.73,
    baseLightness: 41.96,
    hueProgression: { 50: -10, 950: 0 },
    // Slate: 0% of base saturation = fully desaturated (achromatic) for all tints/shades
    saturationProgression: { 50: 20, 200:50, 800:100, 950: 20 },
  },
  {
    name: "neutral-500",
    baseHue: 0,
    baseSaturation: 0,
    baseLightness: 42.08,
    hueProgression: { 50: 0, 950: 0 },
    // Neutral: 0% of base (which is already 0%) = true grayscale (no color)
    saturationProgression: { 50: 0, 950: 0 },
  }
];
