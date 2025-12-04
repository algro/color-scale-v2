# Build System Documentation

This document describes the build system for the color-scale project.

## Overview

The build system automatically generates `color-scale.json` from the color configurations defined in `colors.js`, using the same algorithm that powers the browser-based color scale generator.

## Architecture

### Files

**Generation (Build Time):**
- **`colors.js`** - Color configurations (source of truth, build-time only)
- **`scale.js`** - Scale generation algorithms (build-time only)
- **`build.js`** - Main build script that generates JSON from colors.js
- **Color.js v0.6+** - Provides OKhsl color space conversions

**Runtime (Browser):**
- **`color-scale.json`** - Pre-generated color data (loaded by browser)
- **`app.js`** - Loads JSON and displays colors (no generation logic)
- **`colors-utilities.js`** - Display utilities (hex to oklch conversion, contrast)
- **`index.html`** - Main page

### How It Works

```
Edit colors.js → npm run build → Generates color-scale.json → Browser loads JSON
```

**Key Benefit:** The browser doesn't need to generate colors - it just loads pre-computed values from JSON. This makes the page load faster and keeps generation logic separate from display logic.

## Available Commands

### `npm run build` - Build and Start Server
```bash
npm run build
```

**What it does:**
1. Stops any existing server on port 8000
2. Generates `color-scale.json` from color configurations  
3. Starts a local development server on `http://localhost:8000`

**Use when:** Every time you want to work on or view your colors.

### `npm run hex` - Convert Hex to OKhsl
```bash
npm run hex 6D4AFF
npm run hex "#FA3751"
```

**What it does:**
- Converts any hex color to precise OKhsl values with 4 decimal places
- Shows values in both normalized (0-1) and intuitive (degrees/percentages) formats
- Provides copy-paste ready configuration for your color files

**Output example:**
```
🎨 Hex to OKhsl Conversion

Input:  #6D4AFF
Output: oklch(56.19% 0.2512 283.66°)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OKhsl Values (degrees/percentages):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  baseHue:        283.6582  // degrees (0-360°)
  baseSaturation: 97.8775   // percentage (0-100)
  baseLightness:  49.2058   // percentage (0-100)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Copy-paste ready config:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  name: "color-500",
  baseHue: 283.6582,
  baseSaturation: 97.8775,
  baseLightness: 49.2058,
  startHueShift: 0,
  endHueShift: 0
}
```

**Use when:** 
- You have a specific hex color you want to match exactly
- You need precise OKhsl values to avoid rounding errors
- Converting colors from other tools or design systems

## Build Process Flow

```
┌─────────────────────────────────────────────────────────────┐
│                       npm run build                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
          ┌───────────────────────┐
          │  Stop old server      │
          │  (port 8000)          │
          └───────────┬───────────┘
                      │
                      ▼
          ┌───────────────────────┐
          │   node build.js       │
          └───────────┬───────────┘
                      │
                      ▼
        ┌─────────────────────────────┐
        │  Load configurations from:  │
        │  • colors.js                │
        │  • scale.js                 │
        │  • colors-utilities.js      │
        │  Import Color.js library    │
        │  Make Color globally avail. │
        └─────────────┬───────────────┘
                      │
                      ▼
        ┌─────────────────────────────┐
        │  For each color (24 total): │
        │  1. Convert OKhsl → OKLCH   │
        │  2. Generate 13-step scale  │
        │  3. Convert OKLCH → Hex     │
        └─────────────┬───────────────┘
                      │
                      ▼
        ┌─────────────────────────────┐
        │  Write color-scale.json     │
        │  Format: {                  │
        │    "colorName": {           │
        │      "50": "#hex",          │
        │      "100": "#hex",         │
        │      ...                    │
        │    }                        │
        │  }                          │
        └─────────────┬───────────────┘
                      │
                      ▼
        ┌─────────────────────────────┐
        │  Start server               │
        │  (python3 -m http.server)   │
        │  http://localhost:8000      │
        └─────────────────────────────┘
```

## Color Generation Algorithm

### 1. Input Configuration (OKhsl Space)

Each color is defined in OKhsl color space with intuitive units:

```javascript
{
  name: "red-500",
  baseHue: 23.5,            // degrees (0-360°)
  baseSaturation: 90,       // percentage (0-100)
  baseLightness: 57,        // percentage (0-100)
  startHueShift: 0,         // degrees
  endHueShift: 0            // degrees
}
```

**Note:** The build system automatically normalizes these values to 0-1 internally. You can use either format (degrees/percentages or 0-1), and the system will auto-detect based on the value range.

### 2. Color Space Conversion

```
OKhsl (input) → OKLCH (generation) → Hex (output)
```

**Why?**
- OKhsl provides perceptually uniform saturation across all hues
- OKLCH is better for lightness/chroma interpolation
- Hex is the standard output format for CSS

### 3. Scale Generation (13 Steps)

Steps: `[50, 100, 150, 200, 300, 400, 500, 600, 700, 800, 850, 900, 950]`

For each step:
- **Tints (50-500)**: Lighter colors using tint curves
- **Base (500)**: Original color unchanged
- **Shades (500-950)**: Darker colors using shade curves

### 4. Curve System

The project uses **piecewise easing curves** for smooth color transitions:

**Default Tint Curves (50 → 500):**
```javascript
tintLightnessCurve: ["easeInSine:0.4", 200, "easeOutSine:0.6", 500]
tintSaturationCurve: ["easeInSine:0.4", 200, "easeOutSine:0.6", 500]
tintHueCurve: ["linear", 500]
```

**Default Shade Curves (500 → 950):**
```javascript
shadeLightnessCurve: ["easeInSine:0.6", 800, "linear:0.4", 950]
shadeSaturationCurve: ["easeInSine:0.6", 800, "linear:0.4", 950]
shadeHueCurve: ["linear", 950]
```

**Curve Syntax:**
- `"easeType:rate"` - Easing function with optional rate (default: 1.0)
- Numbers represent step boundaries
- Rates allow partial progression (useful for non-linear distribution)

**Available Easing Functions:**
- Linear: `linear`
- Sine: `easeInSine`, `easeOutSine`, `easeInOutSine`
- Quad: `easeInQuad`, `easeOutQuad`, `easeInOutQuad`
- Cubic: `easeInCubic`, `easeOutCubic`, `easeInOutCubic`
- Quart: `easeInQuart`, `easeOutQuart`, `easeInOutQuart`
- Quint: `easeInQuint`, `easeOutQuint`, `easeInOutQuint`
- Expo: `easeInExpo`, `easeOutExpo`, `easeInOutExpo`

## Modifying Colors

### Adding a New Color

#### Method 1: Using the Color Picker
1. Go to https://bottosson.github.io/misc/colorpicker/ and select OKHSL mode
2. Pick your color and note the H, S, L values
3. Open `colors-v2.js`
4. Add new configuration to `colorConfigs` array:
```javascript
{
  name: "mint-500",
  baseHue: 162,           // from picker (degrees)
  baseSaturation: 70,     // from picker (percentage)
  baseLightness: 65,      // from picker (percentage)
  startHueShift: 0,
  endHueShift: 0
}
```
5. Stop the server (Ctrl+C) and run `npm run build`
6. Refresh your browser to see the new color

#### Method 2: Using Hex Converter (Most Precise)
1. Get your target hex color (e.g., from design tools)
2. Run: `npm run hex YOUR_HEX_COLOR`
3. Copy the generated config directly into `colorConfigs`
4. Run `npm run build` to generate the scale

### Customizing a Color's Curves

Override curves for specific colors:

```javascript
{
  name: "blue-500",
  baseHue: 259,           // degrees
  baseSaturation: 95,     // percentage
  baseLightness: 58,      // percentage
  startHueShift: 0,
  endHueShift: 0,
  // Custom curves
  tintLightnessCurve: ["easeOutQuad", 500],
  shadeLightnessCurve: ["easeInCubic", 950]
}
```

### Adjusting Saturation Range

The system auto-calculates saturation endpoints:
- `startS` (step 50) = 10% of `baseSaturation`
- `endS` (step 950) = 25% of `baseSaturation`

Override manually if needed:
```javascript
{
  name: "custom-500",
  // ... other properties
  startS: 0.05,  // Manual override
  endS: 0.30     // Manual override
}
```

## Output Format

### color-scale.json

```json
{
  "red": {
    "50": "#fff4f4",
    "100": "#ffecec",
    "150": "#ffd4d4",
    "200": "#feb4b4",
    "300": "#f68182",
    "400": "#ee565b",
    "500": "#ec4148",
    "600": "#d83f46",
    "700": "#a8343a",
    "800": "#6c2326",
    "850": "#531b1e",
    "900": "#3c1315",
    "950": "#260b0d"
  },
  "orange": { ... },
  ...
}
```

## Browser vs Build Comparison

### Browser (index.html + app.js)
- **Loads** pre-generated `color-scale.json`
- **Displays** visual color swatches
- **No generation logic** - just rendering
- Fast page load (no computation needed)
- "Copy scale" button → clipboard

### Build System (build.js)
- **Reads** configuration from `colors.js`
- **Uses** `scale.js` and `okhsl.js` for generation
- **Generates** colors using OKLCH/OKhsl algorithms
- **Writes** to `color-scale.json` file
- All generation happens at build time, not runtime

## Troubleshooting

### Colors Look Different Between Browser and Build

**Cause:** Minor differences in Color.js library behavior between browser and Node.js environments.

**Solution:** The differences are minimal (1-2 RGB values). If consistency is critical:
1. Use the browser's "Copy scale" button as the source of truth
2. Manually paste into `color-scale.json`

### Build Script Fails

**Check:**
1. `npm install` has been run
2. All dependencies are installed (`colorjs.io`, etc.)
3. Node.js version is recent (v14+)

**Common fixes:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Clear npm cache
npm cache clean --force
npm install
```

### Server Won't Start

**The build command automatically stops any existing server on port 8000.** If you still have issues:

**Check:**
1. Python 3 is installed: `python3 --version`
2. You have permission to bind to port 8000

**Manual server stop (if needed):**
```bash
lsof -ti:8000 | xargs kill -9
```

**Alternative servers:**
If you prefer a different server, edit `package.json` and change the server command:
```json
"build": "lsof -ti:8000 | xargs kill -9 2>/dev/null || true && node build.js && npx http-server -p 8000"
```

## Development Workflow

### Simple workflow when updating colors:

1. **Start working:**
   ```bash
   npm run build
   ```
   Opens server on `http://localhost:8000`

2. **Make changes:**
   - Edit `colors.js` (single source of truth)
   - Stop server (Ctrl+C)
   - Run `npm run build` again
   - Refresh browser (Cmd+R or Ctrl+R)

3. **When done:**
   - Stop server with `Ctrl+C`
   - Commit changes:
   ```bash
   git add colors.js color-scale.json
   git commit -m "Update color configurations"
   ```

### Quick Iteration Tip:

Keep the browser open and refresh it after each build to see your color changes immediately.

## Technical Notes

### Color Space: OKhsl

OKhsl is used because it provides **perceptually uniform saturation** across all hues. Traditional HSL fails this test - 100% saturation in blue looks much more saturated than 100% saturation in yellow.

The project uses Color.js v0.6.0+ which provides native OKhsl support based on [Björn Ottosson's algorithm](https://bottosson.github.io/posts/colorpicker/#okhsl).

### Why 13 Steps?

The 13-step system provides:
- Fine-grained control in critical ranges (50-200, 800-950)
- Compatibility with design systems like Tailwind CSS
- Balanced distribution of light/dark variants

### Step Distribution

```
50  ───┐
100    ├─ Very light tints (fine spacing)
150 ───┘
200 ───┐
300    ├─ Light-medium range
400 ───┘
500 ───── Base color (reference point)
600 ───┐
700    ├─ Dark-medium range
800 ───┘
850 ───┐
900    ├─ Very dark shades (fine spacing)
950 ───┘
```

## Future Enhancements

Potential improvements to consider:

- [ ] Add CLI arguments for custom output paths
- [ ] Support for CSS variables output format
- [ ] Validation to ensure colors meet WCAG contrast ratios
- [ ] Watch mode for auto-regeneration on file changes
- [ ] Visual diff tool to compare generated vs. current colors
- [ ] Export to other formats (SCSS, Less, Tailwind config)

---

**Last Updated:** November 2025

