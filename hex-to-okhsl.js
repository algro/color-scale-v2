#!/usr/bin/env node
// hex-to-okhsl.js - Convert hex color to precise OKhsl values
import Color from 'colorjs.io';
import { oklchToOKhsl } from './okhsl.js';

// Get hex from command line argument
const hex = process.argv[2];

if (!hex) {
  console.error('❌ Error: Please provide a hex color value');
  console.log('\nUsage:');
  console.log('  node hex-to-okhsl.js #6D4AFF');
  console.log('  node hex-to-okhsl.js 6D4AFF');
  process.exit(1);
}

// Normalize hex (add # if missing)
const normalizedHex = hex.startsWith('#') ? hex : `#${hex}`;

try {
  // Parse hex to sRGB, then convert to OKLCH
  const color = new Color(normalizedHex);
  const oklch = color.to("oklch");
  let [L, C, H] = oklch.coords;
  
  // Handle achromatic colors (grays) where chroma is 0 or very close to 0
  const isAchromatic = C < 0.0001;
  if (isAchromatic) {
    H = 0;  // Hue is arbitrary for achromatic colors
    C = 0;  // Ensure chroma is exactly 0
  }
  
  // Convert OKLCH to OKhsl using our custom implementation
  const { h, s, l } = oklchToOKhsl(L * 100, C, H);
  
  // For achromatic colors, ensure h and s are 0 (not NaN)
  const hNormalized = isAchromatic ? 0 : h;
  const sNormalized = isAchromatic ? 0 : s;
  
  // Convert to degrees and percentages for display
  const hDegrees = hNormalized * 360;
  const sPercent = sNormalized * 100;
  const lPercent = l * 100;
  
  // Display results
  console.log('\n🎨 Hex to OKhsl Conversion\n');
  console.log(`Input:  ${normalizedHex.toUpperCase()}`);
  console.log(`Output: oklch(${(L * 100).toFixed(2)}% ${C.toFixed(4)} ${H.toFixed(2)}°)`);
  
  if (isAchromatic) {
    console.log('        ⚠️  Achromatic color (gray) - hue and saturation set to 0\n');
  } else {
    console.log('');
  }
  
  console.log('━'.repeat(50));
  console.log('OKhsl Values (0-1 normalized):');
  console.log('━'.repeat(50));
  console.log(`  h: ${hNormalized.toFixed(6)}`);
  console.log(`  s: ${sNormalized.toFixed(6)}`);
  console.log(`  l: ${l.toFixed(6)}\n`);
  
  console.log('━'.repeat(50));
  console.log('OKhsl Values (degrees/percentages):');
  console.log('━'.repeat(50));
  console.log(`  baseHue:        ${hDegrees.toFixed(2)}  // degrees (0-360°)`);
  console.log(`  baseSaturation: ${sPercent.toFixed(2)}  // percentage (0-100)`);
  console.log(`  baseLightness:  ${lPercent.toFixed(2)}  // percentage (0-100)\n`);
  
  console.log('━'.repeat(50));
  console.log('Copy-paste ready config:');
  console.log('━'.repeat(50));
  
  if (isAchromatic) {
    console.log(`{
  name: "gray-500",  // Achromatic color
  baseHue: ${hDegrees.toFixed(2)},
  baseSaturation: ${sPercent.toFixed(2)},
  baseLightness: ${lPercent.toFixed(2)},
  startHueShift: 0,
  endHueShift: 0,
  startS: 0,  // No saturation (pure grayscale)
  endS: 0     // No saturation (pure grayscale)
}\n`);
  } else {
    console.log(`{
  name: "color-500",
  baseHue: ${hDegrees.toFixed(2)},
  baseSaturation: ${sPercent.toFixed(2)},
  baseLightness: ${lPercent.toFixed(2)},
  startHueShift: 0,
  endHueShift: 0
}\n`);
  }

} catch (error) {
  console.error(`❌ Error: Invalid hex color "${hex}"`);
  console.error(`   ${error.message}`);
  process.exit(1);
}

