#!/usr/bin/env node
// hex-to-okhsl.js - Convert hex color to precise OKhsl values
import Color from 'colorjs.io';

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
  
  // Convert OKLCH to OKhsl using Color.js
  const okhslColor = color.to("okhsl");
  let [h, s, l] = okhslColor.coords;
  
  // For achromatic colors, ensure h and s are 0 (not NaN/undefined)
  const hNormalized = isAchromatic ? 0 : (h / 360);
  const sNormalized = isAchromatic ? 0 : s;
  
  // Convert to degrees and percentages for display
  const hDegrees = hNormalized * 360;
  const sPercent = sNormalized * 100;
  const lPercent = l * 100;
  
  // Calculate APCA contrast values
  const white = new Color('#ffffff');
  const black = new Color('#000000');
  
  // APCA: background.contrast(text, "APCA")
  const whiteOnColor = Math.abs(color.contrast(white, "APCA"));  // color bg, white text
  const blackOnColor = Math.abs(color.contrast(black, "APCA"));  // color bg, black text
  const colorOnWhite = Math.abs(white.contrast(color, "APCA"));  // white bg, color text
  const colorOnBlack = Math.abs(black.contrast(color, "APCA"));  // black bg, color text
  
  // Display results
  console.log(`\nInput: ${normalizedHex.toUpperCase()}`);
  console.log('\n------\n');
  console.log(`baseHue: ${hDegrees.toFixed(2)}`);
  console.log(`baseSaturation: ${sPercent.toFixed(2)}`);
  console.log(`baseLightness: ${lPercent.toFixed(2)}`);
  console.log('\n------\n');
  console.log(`White on color: Lc ${whiteOnColor.toFixed(1)}`);
  console.log(`Black on color: Lc ${blackOnColor.toFixed(1)}`);
  console.log(`Color on white: Lc ${colorOnWhite.toFixed(1)}`);
  console.log(`Color on black: Lc ${colorOnBlack.toFixed(1)}`);
  console.log('');

} catch (error) {
  console.error(`❌ Error: Invalid hex color "${hex}"`);
  console.error(`   ${error.message}`);
  process.exit(1);
}
