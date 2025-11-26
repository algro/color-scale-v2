// build.js - Generate color-scale JSONs for all versions
import Color from 'colorjs.io';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

// Steps for the color scale (matching the 13-step system)
const steps = [50, 100, 150, 200, 300, 400, 500, 600, 700, 800, 850, 900, 950];

/**
 * Generate color scale JSON from a color config module
 */
async function generateColorScaleForVersion(versionFile) {
  // Extract version name from filename (e.g., "colors-v1.js" -> "v1")
  const versionMatch = versionFile.match(/colors-(v\d+)\.js$/);
  if (!versionMatch) return null;
  
  const version = versionMatch[1];
  
  console.log(`\n🎨 Generating ${version}...`);

  // Dynamically import the matching scale implementation (v2-style)
  const scaleFile = `./scale-${version}.js`;
  const { generateScale } = await import(scaleFile);
  
  // Dynamically import the version file
  const colorModule = await import(`./${versionFile}`);
  const { defaults, colorConfigs } = colorModule;

  const scaleData = {};

  colorConfigs.forEach(config => {
    const {
      name,
      baseHue,
      baseSaturation,
      baseLightness,
      ...overrides
    } = config;

    // V2: Simple progression object system
    // Merge defaults with color-specific overrides for partial customization
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

    // Generate the full scale using appropriate function
    const fullScaleLCH = generateScale(options);
    const fullScaleHex = fullScaleLCH.map(oklchToHex);

    // Extract base color name
    const colorName = name.split('-')[0];
    
    // Build the color object (all 13 steps)
    scaleData[colorName] = {};
    fullScaleHex.forEach((hex, index) => {
      scaleData[colorName][steps[index]] = hex;
    });

    console.log(`  ✓ ${colorName.padEnd(10)} - ${fullScaleHex.length} shades`);
  });

  // Write to version-specific JSON file
  const outputFile = `color-scale-${version}.json`;
  fs.writeFileSync(outputFile, JSON.stringify(scaleData, null, 2), 'utf-8');
  
  console.log(`\n✅ ${outputFile} generated successfully!`);
  console.log(`📦 ${Object.keys(scaleData).length} color scales with ${steps.length} shades each`);
  
  return version;
}

// Main execution
async function buildAllVersions() {
  console.log('🔍 Searching for color version files...\n');
  
  // Find all colors-v*.js files
  const versionFiles = await glob('colors-v*.js', { cwd: __dirname });
  
  if (versionFiles.length === 0) {
    console.error('❌ No version files found! Please create files like colors-v2.js, etc.');
    process.exit(1);
  }
  
  console.log(`Found ${versionFiles.length} version(s): ${versionFiles.join(', ')}\n`);
  
  // Generate JSON for each version
  const generatedVersions = [];
  for (const versionFile of versionFiles) {
    const version = await generateColorScaleForVersion(versionFile);
    if (version) {
      generatedVersions.push(version);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`🎉 All done! Generated ${generatedVersions.length} version(s): ${generatedVersions.join(', ')}`);
  console.log('='.repeat(50) + '\n');
}

buildAllVersions().catch(error => {
  console.error('❌ Build failed:', error);
  process.exit(1);
});
