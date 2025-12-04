# APCA Contrast Analyzer

Dev tool to analyze APCA contrast levels across all color scales and quickly identify which steps meet accessibility targets.

## Usage

1. Start the dev server:
   ```bash
   npm run build
   ```

2. Open the analyzer:
   ```
   http://localhost:8000/contrast-analyzer.html
   ```

## What it Shows

For each color, the tool shows **3 key steps**:

### Lc 60 (UI/Content Text)
- **White or black text ON colored background**
- For red, blue, iris, magenta, rose → white text
- For orange, yellow, green, teal, cyan, slate, neutral → black text

### Lc 75 (Body Text)
- **Colored text ON white background**
- **Colored text ON black background**

## APCA Targets

- **Lc 60**: Minimum for UI/content text (labels, buttons, short text)
- **Lc 75**: Minimum for body text at 14px

## Color Coding

- 🔴 **Red** - Below target (insufficient contrast)
- 🟡 **Yellow** - Close to Lc 60 target (±5)
- 🔵 **Blue** - Close to Lc 75 target (±5)
- 🟢 **Green** - Above target (good contrast)

## Summary Section

At the top of each color group, you'll see:
- **Lc 60**: Which step to use for white/black text on colored backgrounds
- **Lc 75 on white**: Which step to use for colored text on white backgrounds
- **Lc 75 on black**: Which step to use for colored text on black backgrounds

Each shows the actual Lc value and difference from target.

### Priority Logic

**Step 500 (base color) is always prioritized** when it meets the criteria:
- If step 500 has Lc ≥ 60, it's used for Lc 60 target (marked with ★)
- If step 500 has Lc ≥ 75, it's used for Lc 75 target (marked with ★)
- Otherwise, the closest step to the target is used

This ensures your base color is used whenever possible for accessibility targets.

## Workflow for Tweaking Colors

1. **Adjust base color** in `colors-v2.js` (hue, saturation, lightness)
2. **Run build**: `npm run build`
3. **Check analyzer**: Open `contrast-analyzer.html`
4. **Review targets**: See which steps meet Lc 60/75 requirements
5. **Adjust progressions** if needed (lightnessProgression, saturationProgression)
6. **Repeat** until you get the desired contrast distribution

This eliminates manual APCA calculations and makes it easy to ensure your color scales meet accessibility requirements!

