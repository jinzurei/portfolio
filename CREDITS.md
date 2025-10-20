# Credits & Attribution

## Portfolio Website
Created by **Jinzurei** (GitHub: @jinzurei)

Last updated: October 20, 2025

## Third-Party Assets

### Background Video
**Smoke/Ink Background Video**  
- **Creator**: Dan Cristian Pădureț  
- **Source**: [Pexels](https://www.pexels.com/video/white-in-spreading-in-different-direction-3051490/)  
- **License**: Pexels License (Free to use)

### Libraries & Dependencies

**Three.js**  
- **Version**: v0.158.0  
- **Source**: [three.js](https://threejs.org/)  
- **License**: MIT License  
- **Usage**: WebGL shader rendering and 3D graphics

**GitHub Contribution Graph**  
- **Service**: ghchart.rshah.org  
- **Usage**: Displays GitHub contribution activity as an embedded image

**Twitter Widget**  
- **Source**: Twitter/X Platform  
- **Usage**: Embedded timeline widget for social media updates

## Usage & Licensing

This portfolio is released under the **MIT License**.

### You are free to:
- ✅ Fork this repository
- ✅ Use it as a template for your own portfolio
- ✅ Modify and customize the code
- ✅ Use it for personal or commercial projects

### Requirements:
### Notes on Attribution

The project is provided under the MIT License (see `LICENSE`). While the MIT License does not legally require attribution, the following guidelines are recommended when re-using this project as a template:

- Keep the `LICENSE` file in your project
- Retain or adapt this `CREDITS.md` when redistributing
- If you reuse third-party media (background video, images), follow the original asset license and attribution terms

### How to Credit:
If you reuse this project or parts of it, here is a suggested (but optional) credit snippet you can include in your README or about page. Please retain the specific third-party credits if you reuse those assets.

```
Portfolio template based on work by Jinzurei (@jinzurei)
Original repo: https://github.com/jinzurei/Portfolio

GLSL shaders and WebGL animation: created by Jinzurei (contained in `/shaders` and `scripts/background.js`)
Background smoke/ink B-roll video: Dan Cristian Pădureț (Pexels) — used as a visual layer only
Built with Three.js for WebGL rendering
```

Notes:
- The GLSL shader code and the JavaScript that drives the animation (including uniform wiring and scene composition) are original work by **Jinzurei**.
- The Pexels smoke/ink footage is used as a visual overlay/background only and was not authored by the project owner.

## Technologies Used

- HTML5
- CSS3 (Grid, Flexbox, Glassmorphism)
- JavaScript ES6+
- Three.js (WebGL/GLSL shaders)
- Intersection Observer API

### Detailed technologies & tooling

- **Three.js (v0.158.0)** — used to initialize the WebGL renderer, camera, and shader materials. See `scripts/background.js` for the runtime setup and shader loading.
- **GLSL shaders** — custom vertex and fragment shaders are stored in `/shaders` (e.g., `contour.vert`, `contour.frag`). These implement noise-driven contour bands, color gradients, and occasional glitch bursts.
- **Image assets** — optimized WebP images live in `/photos`. Where necessary, JPEG/PNG fallbacks are included for older browsers.
- **Performance & accessibility** — uses `prefers-reduced-motion` media query, `focus-visible` styles, semantic HTML, and ARIA attributes to meet accessibility targets (WCAG 2.1 AA where practical).
- **Developer tooling (recommended)** — EditorConfig, Prettier, and ESLint are recommended for consistency when contributing. No build step or package manager is required to run the project locally.

## Contact

For questions about usage or licensing:
- GitHub: [@jinzurei](https://github.com/jinzurei)
- Twitter/X: [@jinzurei](https://twitter.com/jinzurei)

---

**Thank you for respecting the work of all contributors! 🙏**
