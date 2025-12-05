// colors-v2.js - Simplified progression array system


// 1) Export stepsCount
export const stepsCount = 13;


//
// Progressions: hue = degree shifts, saturation = relative % of base, lightness = relative % between startL/endL anchors.
// This ensures colors adapt naturally while maintaining consistent endpoints across all hues.

export const defaults = {
  // Lightness anchors (absolute values at endpoints)
  startL: 98,    // Lightest tint at step 50 (absolute %)
  endL: 8,     // Darkest shade at step 950 (absolute %)

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
  lightnessProgression: { 100: 5, 150: 20, 200: 40 ,400: 85, 600: 10, 850: 75, 900: 90 },
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
    baseHue: 54.70,
    baseSaturation: 98.06,
    baseLightness: 70.05,
    hueProgression: { 50: 30, 950: -20 },
    lightnessProgression: {600: 10}, // darker than others to meet Lc60 target
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
    // White on 600 is Lc60, on 700 Lc75 ✅  
    name: "green-500",
    baseHue: 150.39,
    baseSaturation: 91.86,
    baseLightness: 65.03,
    hueProgression: { 50: 15, 950: 10 },
  },
  {
     // White on 600 is Lc60, on 700 Lc75 ✅  
    name: "teal-500",
    baseHue: 182.85,
    baseSaturation: 97.10,
    baseLightness: 67.18,
    lightnessProgression: {600: 13}, // darker than others to meet Lc60 target
    hueProgression: { 50: -5, 950: -5 },
  },
  {
    // White on 600 is Lc60, on 700 Lc75 ✅ 
    name: "cyan-500",
    baseHue: 217.66,
    baseSaturation: 96.02,
    baseLightness: 66.10,
    //lightnessProgression: {600: 11}, // darker than others to meet Lc60 target
    hueProgression: { 50: -5, 950: 0 },
  },
  {
    name: "blue-500",
    baseHue: 250.41,
    baseSaturation: 93.95,
    baseLightness: 60.67,
    hueProgression: { 50: -5, 950: 5 },
  },
  {
    name: "iris-500",
    baseHue: 283.66,
    baseSaturation: 100.00,
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
    name: "pink-500",
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
    name: "rando-500",
    baseHue: 274.87,
    baseSaturation: 23.64,
    baseLightness: 39.85,
    hueProgression: { 50: -10, 950: 10 },
    // Neutral: 0% of base (which is already 0%) = true grayscale (no color)
    saturationProgression: { 50: 50, 950: 100 },
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
