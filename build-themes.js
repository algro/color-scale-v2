// build-themes.js - Generate theme CSS from theme-tokens.json
import fs from 'fs';

// Load theme tokens (primitives come from color-scale-v2.js module at runtime)
const themeTokens = JSON.parse(fs.readFileSync('./theme-tokens.json', 'utf-8'));

const { aliases, themes, tokens, signals } = themeTokens;

/**
 * Resolve a token value to a CSS value
 * @param {string} value - Token value like "tint-600", "white", "transparent"
 * @param {object} colorMap - Mapping of aliases to actual color families
 * @returns {string} - CSS value like "var(--teal-600)" or "#ffffff"
 */
function resolveValue(value, colorMap) {
  // Check if it's a literal alias
  if (aliases[value]) {
    return aliases[value];
  }
  
  // Check if it's a literal value (rgba, numbers, etc.)
  if (value.startsWith('rgba') || value.startsWith('rgb') || !isNaN(parseFloat(value))) {
    return value;
  }
  
  // Resolve alias to actual color family (tint-600 → teal-600)
  const resolved = colorMap ? resolveAlias(value, colorMap) : value;
  
  return `var(--${resolved})`;
}

/**
 * Resolve alias references to actual color family names
 * e.g., "tint-600" with colorMap {tint: "teal"} → "teal-600"
 */
function resolveAlias(value, colorMap) {
  for (const [alias, actualFamily] of Object.entries(colorMap)) {
    if (value.startsWith(`${alias}-`)) {
      return value.replace(`${alias}-`, `${actualFamily}-`);
    }
  }
  return value;
}

/**
 * Generate CSS for semantic tokens
 */
function generateTokenCSS(mode, colorMap) {
  const modeKey = `standard-${mode}`;
  let css = '';
  
  for (const [tokenName, tokenValues] of Object.entries(tokens)) {
    const value = tokenValues[modeKey];
    
    // Skip if no value defined for this mode
    if (value === undefined || value === null) {
      continue;
    }
    
    css += `    --${tokenName}: ${resolveValue(value, colorMap)};\n`;
  }
  
  return css;
}

/**
 * Generate CSS for signal colors
 */
function generateSignalCSS(mode, colorMap) {
  let css = '\n    /* Signals */\n';
  
  for (const [signalName, signalValues] of Object.entries(signals)) {
    const suffix = mode === 'light' ? '-light' : '-dark';
    
    css += `    --signal-${signalName}: ${resolveValue(signalValues[`base${suffix}`], colorMap)};\n`;
    css += `    --signal-${signalName}-hover: ${resolveValue(signalValues[`hover${suffix}`], colorMap)};\n`;
    css += `    --signal-${signalName}-active: ${resolveValue(signalValues[`active${suffix}`], colorMap)};\n`;
    css += `    --signal-${signalName}-minor-2: ${resolveValue(signalValues[`minor-2${suffix}`], colorMap)};\n`;
    css += `    --signal-${signalName}-minor-1: ${resolveValue(signalValues[`minor-1${suffix}`], colorMap)};\n`;
    css += `    --signal-${signalName}-major-1: ${resolveValue(signalValues[`major-1${suffix}`], colorMap)};\n`;
    css += `    --signal-${signalName}-major-2: ${resolveValue(signalValues[`major-2${suffix}`], colorMap)};\n`;
    css += `    --signal-${signalName}-major-3: ${resolveValue(signalValues[`major-3${suffix}`], colorMap)};\n`;
    css += `    --signal-${signalName}-contrast: ${resolveValue(signalValues[`contrast${suffix}`], colorMap)};\n`;
  }
  
  return css;
}

/**
 * Generate complete CSS for a theme
 */
function generateThemeCSS(themeName, themeConfig) {
  const { mode, colorMap } = themeConfig;
  
  let css = `/* ═══════════════════════════════════════════════════════════
   Theme: ${themeName}
   Mode: ${mode}
   Primitives loaded via color-scale-v2.js module
   ═══════════════════════════════════════════════════════════ */

`;

  // Standard theme tokens (primitives come from JS module)
  css += `:root,\n.ui-standard {\n`;
  css += `    --white: ${aliases.white};\n`;
  css += `    --black: ${aliases.black};\n\n`;
  css += generateTokenCSS(mode, colorMap);
  css += generateSignalCSS(mode, colorMap);
  css += `}\n`;

  return css;
}

/**
 * Main build function
 */
function buildThemes() {
  console.log('🎨 Building themes...\n');
  
  // Create output directory if needed
  if (!fs.existsSync('./themes')) {
    fs.mkdirSync('./themes');
  }

  for (const [themeName, themeConfig] of Object.entries(themes)) {
    const css = generateThemeCSS(themeName, themeConfig);
    const cssFile = `./themes/${themeName}.css`;
    fs.writeFileSync(cssFile, css, 'utf-8');
    console.log(`  ✓ ${cssFile}`);
  }

  console.log(`\n✅ Generated ${Object.keys(themes).length} theme CSS files successfully!\n`);
}

// Run
buildThemes();
