// build.js - Generate color-scale JSONs for all versions
import Color from 'colorjs.io';
// Scale generation functions imported dynamically based on version
import { okhslToOKLCH } from './okhsl.js';
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
 * Normalize color values to 0-1 range
 * Expects: hue in degrees (0-360), saturation/lightness in percentages (0-100)
 */
function normalizeColorValue(value, type) {
  if (value === null || value === undefined) return value;
  
  if (type === 'hue') {
    // Always expect degrees (0-360°)
    return value / 360;
  } else {
    // Always expect percentage (0-100)
    return value / 100;
  }
}

/**
 * Generate color scale JSON from a color config module
 */
async function generateColorScaleForVersion(versionFile) {
  // Extract version name from filename (e.g., "colors-v1.js" -> "v1")
  const versionMatch = versionFile.match(/colors-(v\d+)\.js$/);
  if (!versionMatch) return null;
  
  const version = versionMatch[1];
  
  console.log(`\n🎨 Generating ${version}...`);
  
  // Dynamically import the correct scale version
  const scaleFile = `./scale-${version}.js`;
  const { generatePerceptuallyUniformScale, generateScale } = await import(scaleFile).catch(() => {
    // Fallback to v1 if scale version doesn't exist
    return import('./scale-v1.js');
  });
  
  // Use the appropriate generation function (v2 uses generateScale, v1 uses generatePerceptuallyUniformScale)
  const generateFn = generateScale || generatePerceptuallyUniformScale;
  
  // Dynamically import the version file
  const colorModule = await import(`./${versionFile}`);
  const { defaults, colorConfigs } = colorModule;
  const calculateSaturationRange = colorModule.calculateSaturationRange; // May be undefined for v2
  
  const scaleData = {};
  
  // Determine if this is v2 (progression arrays) or v1 (curves)
  const isV2 = version === 'v2' || generateScale !== undefined;
  
  colorConfigs.forEach(config => {
    const {
      name,
      baseHue: rawBaseHue,
      baseSaturation: rawBaseSaturation,
      baseLightness: rawBaseLightness,
      ...overrides
    } = config;
    
    let options;
    
    if (isV2) {
      // V2: Simple progression array system
      options = {
        baseHue: rawBaseHue,
        baseSaturation: rawBaseSaturation,
        baseLightness: rawBaseLightness,
        startL: overrides.startL ?? defaults.startL,
        endL: overrides.endL ?? defaults.endL,
        hueProgression: overrides.hueProgression ?? defaults.hueProgression,
        saturationProgression: overrides.saturationProgression ?? defaults.saturationProgression,
        lightnessProgression: overrides.lightnessProgression ?? defaults.lightnessProgression,
      };
    } else {
      // V1: Complex curve system (legacy)
      const {
        startHueShift = 0,
        endHueShift = 0,
        startL: cfgStartL,
        endL: cfgEndL,
      } = config;
      
      // Normalize values to 0-1 range
      const baseHue = normalizeColorValue(rawBaseHue, 'hue');
      const baseSaturation = normalizeColorValue(rawBaseSaturation, 'saturation');
      const baseLightness = normalizeColorValue(rawBaseLightness, 'lightness');

      // Convert OKhsl base values to OKLCH coords
      const baseOKLCH = okhslToOKLCH(baseHue, baseSaturation, baseLightness);
      const baseL = baseOKLCH.L;
      const baseC = baseOKLCH.C;
      const baseH = baseOKLCH.H;

      // Auto-derive startS and endS if not explicitly overridden
      let startS, endS;
      if (overrides.startS !== undefined && overrides.endS !== undefined) {
        startS = normalizeColorValue(overrides.startS, 'saturation');
        endS = normalizeColorValue(overrides.endS, 'saturation');
      } else {
        const calculated = calculateSaturationRange(baseSaturation);
        startS = overrides.startS !== undefined 
          ? normalizeColorValue(overrides.startS, 'saturation')
          : calculated.startS;
        endS = overrides.endS !== undefined
          ? normalizeColorValue(overrides.endS, 'saturation')
          : calculated.endS;
      }

      options = {
        baseL,
        baseC,
        baseH,
        startL: cfgStartL ?? defaults.startL,
        endL: cfgEndL ?? defaults.endL,
        startS,
        endS,
        startHueShift,
        endHueShift,
        tintLightnessCurve: overrides.tintLightnessCurve ?? defaults.tintLightnessCurve,
        tintSaturationCurve: overrides.tintSaturationCurve ?? defaults.tintSaturationCurve,
        tintHueCurve: overrides.tintHueCurve ?? defaults.tintHueCurve,
        shadeLightnessCurve: overrides.shadeLightnessCurve ?? defaults.shadeLightnessCurve,
        shadeSaturationCurve: overrides.shadeSaturationCurve ?? defaults.shadeSaturationCurve,
        shadeHueCurve: overrides.shadeHueCurve ?? defaults.shadeHueCurve,
        shadePeakStep: overrides.shadePeakStep,
        shadeBoost: overrides.shadeBoost,
      };
    }

    // Generate the full scale using appropriate function
    const fullScaleLCH = generateFn(options);
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
    console.error('❌ No version files found! Please create files like colors-v1.js, colors-v2.js, etc.');
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
