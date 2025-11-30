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
 * Converts a hex color to OKLCH format string with percentage lightness
 * @param {string} hex - Hex color string (e.g., "#ff0000")
 * @returns {string} OKLCH color string (e.g., "oklch(62.8% 0.257 29.2)")
 */
export function rgbToOklab(hex) {
  // Let Color.js convert hex → "oklch([L01, C04, Hdeg])"
  const [L01, C04, Hdeg] = new Color(hex).to("oklch").coords;
  // Convert L to percentage format for consistency with CSS and design tools
  const Lpct = (L01 * 100).toFixed(1) + '%';
  return `oklch(${Lpct} ${C04.toFixed(3)} ${Hdeg.toFixed(1)})`;
}

/**
 * Converts a hex color to OKhsl format string
 * @param {string} hex - Hex color string (e.g., "#ff0000")
 * @returns {string} OKhsl color string (e.g., "okhsl(29.2, 100%, 62.8%)")
 */
export function rgbToOkhsl(hex) {
  const [H, S01, L01] = new Color(hex).to("okhsl").coords;
  const Spct = (S01 * 100).toFixed(1);
  const Lpct = (L01 * 100).toFixed(1);
  const Hdeg = H.toFixed(1);
  return `okhsl(${Hdeg}, ${Spct}%, ${Lpct}%)`;
}

/**
 * Converts OKLCH coordinates to hex color string
 * @param {Object} param - OKLCH coordinates object
 * @param {number} param.L - Lightness (0-100)
 * @param {number} param.C - Chroma (0-0.4)  
 * @param {number} param.H - Hue in degrees
 * @returns {string} Hex color string (e.g., "#ff0000")
 */
export function oklchToHex({ L, C, H }) {
  return new Color("oklch", [L / 100, C, H])
           .to("srgb")
           .toString({ format: "hex", alpha: false, collapse: false });
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
 * Finds the index of the first shade with sufficient APCA contrast against white
 * @param {Array<string>} hexValues - Array of hex color codes
 * @returns {number} Index of first contrasty shade, or -1 if none found
 */
export function findFirstContrastyShade(hexValues) {
  for (let i = 0; i < hexValues.length; i++) {
    if (getContrastAgainstWhite(hexValues[i]) >= window.CONTRAST_CONFIG.targetLc) {
      return i;
    }
  }
  return -1;
}

 