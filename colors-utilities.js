// colors-utilities.js
// Note: Assumes Color is available globally
// - In browser: imported by app.js
// - In Node.js: provided by build.js via globalThis.Color

/**
 * Computes the contrast dot color - prefers white unless it fails WCAG AA (4.5:1)
 * @param {string} hex - Hex color string (e.g., "#ff0000")
 * @returns {string} Either "#ffffff" or "#000000"
 */
export function computeContrastDotColor(hex) {
  const r = parseInt(hex.slice(1,3),16)/255;
  const g = parseInt(hex.slice(3,5),16)/255;
  const b = parseInt(hex.slice(5,7),16)/255;
  const lumVals = [r,g,b].map(c =>
    c <= 0.03928 ? c/12.92 : ((c+0.055)/1.055)**2.4
  );
  const L =
    0.2126 * lumVals[0] +
    0.7152 * lumVals[1] +
    0.0722 * lumVals[2];
  const contrastWhite = (1.0 + 0.05)/(L + 0.05);
  // Always use white unless it fails WCAG AA (4.5:1)
  return contrastWhite >= 4.5 ? "#ffffff" : "#000000";
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
 * Calculates the contrast ratio between a color and white
 * @param {string} hex - Hex color string (e.g., "#ff0000")
 * @returns {number} Contrast ratio
 */
export function getContrastRatioAgainstWhite(hex) {
  const r = parseInt(hex.slice(1,3),16)/255;
  const g = parseInt(hex.slice(3,5),16)/255;
  const b = parseInt(hex.slice(5,7),16)/255;
  const lumVals = [r,g,b].map(c =>
    c <= 0.03928 ? c/12.92 : ((c+0.055)/1.055)**2.4
  );
  const L =
    0.2126 * lumVals[0] +
    0.7152 * lumVals[1] +
    0.0722 * lumVals[2];
  return (1.0 + 0.05)/(L + 0.05);
}

/**
 * Finds the index of the first shade with sufficient contrast against white (4.5:1)
 * @param {Array<string>} hexValues - Array of hex color codes
 * @returns {number} Index of first contrasty shade, or -1 if none found
 */
export function findFirstContrastyShade(hexValues) {
  for (let i = 0; i < hexValues.length; i++) {
    if (getContrastRatioAgainstWhite(hexValues[i]) >= 4.5) {
      return i;
    }
  }
  return -1;
}

 