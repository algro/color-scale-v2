// colors-utilities.js
// Note: Assumes Color is available globally
// - In browser: imported by app.js
// - In Node.js: provided by build.js via globalThis.Color

/**
 * Computes the contrast dot color using APCA
 * @param {string} hex - Hex color string (e.g., "#ff0000")
 * @returns {string} Either "#ffffff" or "#000000"
 */
export function computeContrastDotColor(hex) {
  const bg = new Color(hex);
  const white = new Color('#ffffff');
  
  const apcaContrast = Math.abs(bg.contrast(white, window.CONTRAST_CONFIG.method));
  
  // Use white if it meets the target APCA contrast, otherwise use black
  return apcaContrast >= window.CONTRAST_CONFIG.targetLc ? "#ffffff" : "#000000";
}

/**
 * Converts a hex color to OKLCH format string for display
 * @param {string} hex - Hex color string (e.g., "#ff0000")
 * @returns {string} OKLCH color string (e.g., "oklch(62.8% 0.257 29.2)")
 */
export function hexToOklchString(hex) {
  const [L, C, H] = new Color(hex).to("oklch").coords;
  const Lpct = (L * 100).toFixed(1) + '%';
  return `oklch(${Lpct} ${C.toFixed(3)} ${H.toFixed(1)})`;
}

/**
 * Converts a hex color to OKhsl format string for display
 * @param {string} hex - Hex color string (e.g., "#ff0000")
 * @returns {string} OKhsl color string (e.g., "okhsl(29.2, 100%, 62.8%)")
 */
export function hexToOkhslString(hex) {
  const [H, S, L] = new Color(hex).to("okhsl").coords;
  return `okhsl(${H.toFixed(1)}, ${(S * 100).toFixed(1)}%, ${(L * 100).toFixed(1)}%)`;
}

/**
 * Calculates the APCA contrast value between a color and white
 * @param {string} hex - Hex color string (e.g., "#ff0000")
 * @returns {number} APCA contrast value (Lc)
 */
export function getContrastAgainstWhite(hex) {
  const bg = new Color(hex);
  const white = new Color('#ffffff');
  return Math.abs(bg.contrast(white, window.CONTRAST_CONFIG.method));
}

/**
 * Finds the index of the first shade with sufficient APCA contrast (white text on color)
 * @param {Array<string>} hexValues - Array of hex color codes
 * @param {number} targetLc - Target Lc value (default: 60)
 * @returns {number} Index of first contrasty shade, or -1 if none found
 */
export function findFirstContrastyShade(hexValues, targetLc = 60) {
  for (let i = 0; i < hexValues.length; i++) {
    // White text on color background
    const bg = new Color(hexValues[i]);
    const white = new Color('#ffffff');
    const contrast = Math.abs(bg.contrast(white, window.CONTRAST_CONFIG.method));
    if (contrast >= targetLc) {
      return i;
    }
  }
  return -1;
}

/**
 * Finds the index of the first shade where color on white meets Lc75
 * @param {Array<string>} hexValues - Array of hex color codes
 * @returns {number} Index of first shade meeting Lc75, or -1 if none found
 */
export function findFirstLc75Shade(hexValues) {
  for (let i = 0; i < hexValues.length; i++) {
    // Color text on white background
    const color = new Color(hexValues[i]);
    const white = new Color('#ffffff');
    const contrast = Math.abs(white.contrast(color, window.CONTRAST_CONFIG.method));
    if (contrast >= 75) {
      return i;
    }
  }
  return -1;
}

/**
 * Checks which swatches meet each contrast criterion
 * @param {Array<string>} hexValues - Array of hex color codes
 * @returns {Object} Object with arrays of booleans for each contrast type
 */
export function getContrastMasks(hexValues) {
  const white = new Color('#ffffff');
  const black = new Color('#000000');
  
  const masks = {
    'lc60-white': [],  // White on color >= Lc60 (APCA)
    'lc60-black': [],  // Black on color >= Lc60 (APCA)
    'lc70-white': [],  // Color on white >= Lc70 (APCA)
    'lc70-black': [],  // Color on black >= Lc70 (APCA)
    'lc30-white': [],  // Color on white >= Lc30 (APCA)
    'lc30-black': [],  // Color on black >= Lc30 (APCA)
  };
  
  for (let i = 0; i < hexValues.length; i++) {
    const color = new Color(hexValues[i]);
    
    // White on color (color as background, white as text) - APCA
    const whiteOnColor = Math.abs(color.contrast(white, 'APCA'));
    masks['lc60-white'].push(whiteOnColor >= 60);
    
    // Black on color (color as background, black as text) - APCA
    const blackOnColor = Math.abs(color.contrast(black, 'APCA'));
    masks['lc60-black'].push(blackOnColor >= 60);
    
    // Color on white (white as background, color as text) - APCA
    const colorOnWhite = Math.abs(white.contrast(color, 'APCA'));
    masks['lc70-white'].push(colorOnWhite >= 70);
    masks['lc30-white'].push(colorOnWhite >= 30);

    // Color on black (black as background, color as text) - APCA
    const colorOnBlack = Math.abs(black.contrast(color, 'APCA'));
    masks['lc70-black'].push(colorOnBlack >= 70);
    masks['lc30-black'].push(colorOnBlack >= 30);
  }
  
  return masks;
}

 