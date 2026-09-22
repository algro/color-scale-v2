// build.js - Generate color-scale-v2.json from color configurations
import Color from 'colorjs.io';
import fs from 'fs';
import { generateScale, SCALE_STEPS } from './scale-v2.js';
import { defaults, colorConfigs } from './colors-v2.js';

// Make Color available globally for Node.js environment
globalThis.Color = Color;

/**
 * Converts OKLCH coordinates to hex color string
 */
function oklchToHex({ L, C, H }) {
  return new Color("oklch", [L / 100, C, H])
           .to("srgb")
           .toString({ format: "hex", alpha: false, collapse: false });
}

const steps = SCALE_STEPS;

/**
 * Generate color scale JSON from color configurations
 */
function generateColorScale() {
  console.log('🎨 Generating color scale...\n');

  const scaleData = {};

  colorConfigs.forEach(config => {
    const {
      name,
      baseHue,
      baseSaturation,
      baseLightness,
      ...overrides
    } = config;

    // Merge defaults with color-specific overrides
    const options = {
      baseHue,
      baseSaturation,
      baseLightness,
      startL: overrides.startL ?? defaults.startL,
      endL: overrides.endL ?? defaults.endL,
      hueProgression: { ...defaults.hueProgression, ...overrides.hueProgression },
      saturationProgression: { ...defaults.saturationProgression, ...overrides.saturationProgression },
      lightnessProgression: { ...defaults.lightnessProgression, ...overrides.lightnessProgression },
    };

    // Generate the full scale
    const fullScaleLCH = generateScale(options);
    const fullScaleHex = fullScaleLCH.map(oklchToHex);

    // Extract base color name
    const colorName = name.split('-')[0];
    
    // Build the color object (all steps)
    scaleData[colorName] = {};
    fullScaleHex.forEach((hex, index) => {
      scaleData[colorName][steps[index]] = hex;
    });

    console.log(`  ✓ ${colorName.padEnd(10)} - ${fullScaleHex.length} shades`);
  });

  // Write to JSON file
  const jsonFile = 'color-scale-v2.json';
  fs.writeFileSync(jsonFile, JSON.stringify(scaleData, null, 2), 'utf-8');
  
  // Write to JS file (external module format)
  const jsFile = 'color-scale-v2.js';
  const jsContent = `// color-scale-v2.js
const COLOR_SCALE = ${JSON.stringify(scaleData, null, 2)};
`;
  fs.writeFileSync(jsFile, jsContent, 'utf-8');
  
  console.log(`\n✅ ${jsonFile} generated successfully!`);
  console.log(`✅ ${jsFile} generated successfully!`);
  console.log(`📦 ${Object.keys(scaleData).length} color scales with ${steps.length} shades each\n`);
}

// Main execution
generateColorScale();
