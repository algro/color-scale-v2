// app.js
import Color from "https://colorjs.io/dist/color.js";
import { computeContrastDotColor, rgbToOklab, rgbToOkhsl, findFirstContrastyShade } from "./colors-utilities.js";

// Make Color available globally for colors-utilities.js
window.Color = Color;

// Global storage for all color scales
window.allColorScales = [];

// Theme management
let currentTheme = 'slate';

// Display format cycling: hex → oklch → okhsl
window.displayFormat = 'hex';
window.addEventListener("keydown", (e) => {
  if (e.key === "Shift" && !e.repeat) {
    const formats = ['hex', 'oklch', 'okhsl'];
    const currentIndex = formats.indexOf(window.displayFormat);
    window.displayFormat = formats[(currentIndex + 1) % formats.length];
  }
});

/**
 * Create a color scale row from pre-generated hex values
 * @param {string} colorName - e.g., 'red'
 * @param {Array<string>} hexValues - Array of 13 hex color codes
 * @param {Array<number>} steps - Array of 13 step numbers (50, 100, ..., 950)
 * @param {number} rowIndex - Row index for alternating background
 */
function createScaleRow(colorName, hexValues, steps, rowIndex) {
  
  // Store this scale's data globally
  window.allColorScales.push({
    name: `${colorName}-500`,
    hexValues: hexValues,
    steps: steps,
    config: { name: colorName }
  });

  const row = document.createElement("div");
  row.className = "column scale-row";

  const swatchContainer = document.createElement("div");
  swatchContainer.className = "swatch-container";

  // Find the first shade with sufficient contrast against white
  const contrastyShadeIndex = findFirstContrastyShade(hexValues);

  hexValues.forEach((hex, idx) => {
    const sw = document.createElement("div");
    sw.className = "swatch";
    sw.style.backgroundColor = hex;

    const tooltip = document.createElement("div");
    tooltip.className = "tooltip";

    const contrastDot = document.createElement("div");
    contrastDot.className = "contrast-dot";
    contrastDot.style.backgroundColor = computeContrastDotColor(hex);

    sw.appendChild(tooltip);
    sw.appendChild(contrastDot);

    // Add white triangle indicator to the first contrasty shade
    if (idx === contrastyShadeIndex) {
      const indicator = document.createElement("div");
      indicator.className = "contrast-indicator";
      sw.appendChild(indicator);
    }

    sw.addEventListener("mouseenter", () => {
      const stepName = `${colorName}-${steps[idx]}`;
      let colorValue;
      if (window.displayFormat === 'oklch') {
        colorValue = rgbToOklab(hex);
      } else if (window.displayFormat === 'okhsl') {
        colorValue = rgbToOkhsl(hex);
      } else {
        colorValue = hex;
      }
      tooltip.textContent = `${stepName} ${colorValue}`;
    });
    sw.addEventListener("mouseleave", () => {
      tooltip.textContent = "";
    });
    sw.addEventListener("click", async () => {
      const stepName = `${colorName}-${steps[idx]}`;
      let toCopy;
      if (window.displayFormat === 'oklch') {
        toCopy = rgbToOklab(hex);
      } else if (window.displayFormat === 'okhsl') {
        toCopy = rgbToOkhsl(hex);
      } else {
        toCopy = hex;
      }
      await navigator.clipboard.writeText(toCopy);
      
      // Show "Copied!" feedback
      tooltip.textContent = "Copied!";
      setTimeout(() => {
        tooltip.textContent = "";
      }, 1000);
    });

    swatchContainer.appendChild(sw);
  });

  row.appendChild(swatchContainer);

  return row;
}

// Generate the global-colors.css content
function generateGlobalColorsCss() {
  let cssContent = `:root {\n`;

  window.allColorScales.forEach((scale) => {
    const baseName = scale.name.split('-')[0];
    const steps = scale.steps;
    
    scale.hexValues.forEach((hex, index) => {
      const currentLevel = steps[index];
      cssContent += `  --${baseName}-${currentLevel}: ${hex};\n`;
    });
  });

  cssContent += `}\n`;

  const blob = new Blob([cssContent], { type: 'text/css' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  document.head.appendChild(link);
}

// Load colors from JSON and render (v2 only)
async function loadAndRenderColors() {
  try {
    const response = await fetch(`./color-scale-v2.json`);
    const colorData = await response.json();
    
    const scalesContainer = document.querySelector('.scales-container');
    scalesContainer.innerHTML = "";
    window.allColorScales = [];
    
    // Convert JSON to array of hex values for each color
    Object.entries(colorData).forEach(([colorName, shades], index) => {
      // Get steps from the data (all colors use 13 steps)
      const steps = Object.keys(shades).map(Number).sort((a, b) => a - b);
      const hexValues = steps.map(step => shades[step]);
      
      const row = createScaleRow(colorName, hexValues, steps, index);
      scalesContainer.appendChild(row);
    });
    
    // Generate the global-colors.css file
    generateGlobalColorsCss();
        
    console.log(`✅ Colors loaded from color-scale-v2.json`);
  } catch (error) {
    console.error('❌ Error loading colors:', error);
    alert(`Error loading colors. Make sure color-scale-v2.json exists. Run: npm run build`);
  }
}

// Initialize - Load colors from JSON
loadAndRenderColors();

// Format the entire scale data for copying
function formatScaleData() {
  const scaleData = {};
  window.allColorScales.forEach(scale => {
    const colorName = scale.name.split('-')[0];
    scaleData[colorName] = {};
    
    const steps = scale.steps;
    scale.hexValues.forEach((hex, index) => {
      scaleData[colorName][steps[index]] = hex;
    });
  });
  
  return JSON.stringify(scaleData, null, 2);
}

// Initialize copy scale button
document.getElementById('copy-scale-button').addEventListener('click', async () => {
  const scaleData = formatScaleData();
  await navigator.clipboard.writeText(scaleData);
  
  // Show feedback
  const button = document.getElementById('copy-scale-button');
  const originalText = button.textContent;
  button.textContent = 'Copied!';
  setTimeout(() => {
    button.textContent = originalText;
  }, 2000);
});

// Dark mode functions
function initDarkMode() {
  // Check for saved theme preference or default to dark mode
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  // Add click handler for dark mode toggle
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  darkModeToggle.addEventListener('click', toggleDarkMode);
}

function toggleDarkMode() {
  const currentDarkMode = document.documentElement.getAttribute('data-theme');
  const newDarkMode = currentDarkMode === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newDarkMode);
  localStorage.setItem('theme', newDarkMode);
}

// Initialize dark mode
initDarkMode();
