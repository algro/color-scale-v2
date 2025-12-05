# Color Scale Generator

This project generates 13-step color scales (from light tints to dark shades) for design systems. Each color starts as a base definition in the **OKhsl color space** (hue in degrees, saturation and lightness as percentages) because it provides perceptually uniform saturation across all hues—meaning 90% saturation looks equally vibrant whether it's blue, red, or yellow. We then convert each color to **OKLCH** (a related color space better suited for smooth lightness interpolation) to generate the 13 steps by progressively adjusting lightness and chroma values using customizable progression curves. Finally, each generated color is converted to hex format for use in CSS.

## Quick Start

```bash
npm install
npm run build  # Generates color-scale-v2.json and starts server at localhost:8000
```

See [README-BUILD.md](README-BUILD.md) for detailed documentation.

