// colors-v2.js - Simplified progression array system


// 1) Export stepsCount
export const stepsCount = 13;


//
// Progressions: hue = degree shifts, saturation = relative % of base, lightness = relative % between startL/endL anchors.
// This ensures colors adapt naturally while maintaining consistent endpoints across all hues.

export const defaults = {
  // Lightness anchors (absolute values at endpoints)
  startL: 97,    // Lightest tint at step 50 (absolute %)
  endL: 6,     // Darkest shade at step 950 (absolute %)

  // Hue shifts in degrees for specific steps
  // Positive = warmer, negative = cooler
  hueProgression: { 50: -10, 950: 10 },

  // Saturation as % of base saturation (RELATIVE)
  // (e.g., if base=95% and step 50=60%, result is 95% * 60% = 57%)
  saturationProgression: { 50: 75, 950: 90 },

  // Lightness as % of range between anchors (RELATIVE)
  // For tints (< 500): % progress from startL (98%) to baseLightness
  // For shades (> 500): % progress from baseLightness to endL (9.5%)
  // Step 50 always = startL, step 950 always = endL (anchored, no need to specify)
  // Unspecified steps = linear interpolation between control points
  lightnessProgression: { 100: 5, 150: 20, 200: 38 ,400: 86, 600: 10, 850: 75, 900: 92 },
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
  },
  {
    name: "orange-500",
    baseHue: 43.36,
    baseSaturation: 98.61,
    baseLightness: 64.64,
    hueProgression: { 50: 20, 950: -15 },
  },
  {
    name: "amber-500",
    baseHue: 61.38,
    baseSaturation: 99.58,
    baseLightness: 71.00,
    hueProgression: { 50: 20, 950: -25 },
    lightnessProgression: {600: 11}, 
  },
  {
    name: "yellow-500",
    baseHue: 82.72,
    baseSaturation: 98.95,
    baseLightness: 79.85,
    hueProgression: { 50: 10, 950: -25 },
    lightnessProgression: {700: 30}, 
  },
  {
    name: "lime-500",
    baseHue: 128.77,
    baseSaturation: 89.77,
    baseLightness: 78.27,
    hueProgression: { 50: -8, 950: 4},
    lightnessProgression: {700: 30}, 
  },
  {
    // White on 600 is Lc60, on 700 Lc75 ✅  
    name: "green-500",
    baseHue: 154.07,
    baseSaturation: 89.76,
    baseLightness: 65.30,
    hueProgression: { 50: -8, 950: 10 },
  },
  {
     // White on 600 is Lc60, on 700 Lc75 ✅  
    name: "teal-500",
    baseHue: 182.85,
    baseSaturation: 97.10,
    baseLightness: 67.18,
    lightnessProgression: {700: 37}, // darker than others to meet Lc75 on 700
    hueProgression: { 50: -10, 950: 5 },
  },
  {
    // White on 600 is Lc60, on 700 Lc75 ✅ 
    name: "cyan-500",
    baseHue: 217.66,
    baseSaturation: 96.02,
    baseLightness: 66.10,
    hueProgression: { 50: -10, 950: 5},
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
    name: "purple-500",
    baseHue: 309.26,
    baseSaturation: 96.38,
    baseLightness: 55.08,
    hueProgression: { 50: -5, 950: 10 },
  },
  {
    name: "magenta-500",
    baseHue: 335.21,
    baseSaturation: 91.50,
    baseLightness: 58.02,
    hueProgression: { 50: -10, 950: 5 },
  },
  {
    name: "pink-500",
    baseHue: 358.96,
    baseSaturation: 94.88,
    baseLightness: 57.46,
    hueProgression: { 50: -10, 950: 5 },
  },
  {
    name: "haze-500",
    baseHue: 294.00,
    baseSaturation: 27.79,
    baseLightness: 39.03,
    startL: 97.5,
    hueProgression: { 50: 0, 950: 0 },
    saturationProgression: { 50: 50, 950: 80 },
    lightnessProgression: {400: 81}, // to meet Lc30 on black
     
  },
  {
    name: "slate-500",
    baseHue: 256.10,
    baseSaturation: 19.73,
    baseLightness: 41.96,
    startL: 97.5,
    hueProgression: { 50: -10, 950: 0 },
    saturationProgression: { 50: 20, 200:50, 800:100, 950: 20 },
    
  },
  {
    name: "neutral-500",
    baseHue: 0,
    baseSaturation: 0,
    baseLightness: 42.08,
    startL: 97.5,
    hueProgression: { 50: 0, 950: 0 },
    // Neutral: 0% of base (which is already 0%) = true grayscale (no color)
    saturationProgression: { 50: 0, 950: 0 },
    lightnessProgression: {200: 39}, // ensures 400 meets Lc30 on black
    
  }
  
];
