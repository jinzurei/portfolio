# Portfolio Website

A modern, interactive portfolio website featuring custom WebGL shader animations and glassmorphism design.

## 🚀 Features

### Visual Effects
- **Custom WebGL Shaders** - Real-time animated topographic contour background using Three.js
- **Glassmorphism UI** - Frosted glass design with backdrop-filter effects
- **RGB Glitch Effects** - Dynamic chromatic aberration animations
- **Smooth Animations** - CSS transforms and Intersection Observer API for scroll-triggered effects

Detailed visual/features:
- Animated topographic contour background with adjustable parameters (levels, thickness, speed, zoom).
- Two GLSL animation variants supported:
   1. Embedded shader (primary): shader sources embedded and driven by `scripts/background.js` — implements RGB-separated contour bands, gradient tinting, glitch bursts, and runtime uniform control.
   2. External shader files (alternate): `shaders/contour.vert` and `shaders/contour.frag` — an external fragment/vertex pair that produces anti-aliased contour lines optimized for overlay and transparency.
- Graceful degradation: checks for `OES_standard_derivatives` and falls back or reduces effects on unsupported devices.
- Accessibility-aware motion: honors `prefers-reduced-motion` and exposes a visible/keyboard-accessible UI with focus-visible styles.

### Interactive Components
- **Flip Cards** - 3D perspective transforms for project and artwork displays
- **Modal System** - Detailed project information with dynamic content
- **Contact Form** - Integrated form with validation
- **GitHub Integration** - Live contribution activity graph
- **Social Media Widgets** - Twitter/X timeline integration

More interactive details:
- Flip cards are keyboard focusable and toggle via `Enter`/`Space`; they include `aria-label` and `role="listitem"` for screen readers.
- Modals trap focus while open and restore focus on close; images and extended content include descriptive `alt` text.

### Technical Highlights
- **Performance Optimized** - Efficient animation loops and rendering
- **Fully Responsive** - Mobile-first design with CSS Grid layouts
- **Cross-Browser Compatible** - Works on Chrome, Firefox, Safari, and Edge
- **Vanilla JavaScript** - No framework dependencies (except Three.js for graphics)

## 🛠️ Technologies

- **HTML5** - Semantic markup
- **CSS3** - Grid, Flexbox, Glassmorphism, Animations
- **JavaScript ES6+** - Modern vanilla JavaScript
- **Three.js** - WebGL shader rendering
- **GLSL** - Custom vertex and fragment shaders
- **Intersection Observer API** - Scroll animations

### Detailed tech notes

- **Three.js (v0.158.0)**: used for scene setup, camera, renderer, and shader material bootstrapping. Custom GLSL shaders live in the `/shaders` directory and are compiled at runtime by the `background.js` module.
- **GLSL (vertex + fragment)**: custom shaders implement 3D simplex noise, contour banding, and RGB glitch effects. Shaders are loaded and passed uniforms (time, resolution, mouse) from `background.js`.
 - **GLSL (vertex + fragment)**: custom shaders and animation wiring are original work by **Jinzurei**. Shaders implement 3D simplex noise, contour banding, and RGB glitch effects; they are stored in `/shaders` and are compiled/controlled at runtime by `scripts/background.js` which handles uniforms, render loop, and graceful degradation.
- **Accessibility tooling**: focus-visible polyfill (CSS-based focus styles), ARIA roles and labels on interactive components, skip-to-main-content link, and reduced-motion support via `prefers-reduced-motion` media query.
- **Assets**: Images and media are stored in `/photos`. Large assets are WebP where possible for compression; also included a fallback mechanism for older browsers.
- **Development tooling**: This project uses simple dev workflow (no bundler). Recommended tools for contributors:
   - EditorConfig for consistent indentation
   - Prettier (optional) for formatting
   - ESLint (optional) with the `eslint:recommended` rules if you add a build step

These detailed notes are intended to help contributors understand where to find shader code, asset locations, and accessibility considerations.

## 📁 Project Structure

```
portfolio/
├── index.html              # Main HTML file
├── styles/
│   └── portfolio.css       # All styling (glassmorphism, animations, responsive)
├── scripts/
│   └── background.js       # Three.js WebGL shader implementation
├── photos/                 # Images and videos
├── shaders/               # GLSL shader files (archived)
├── CREDITS.md             # Attribution and licensing
├── LICENSE                # MIT License
└── README.md              # This file
```
Correct structure (actual files present):

```
portfolio/
├── index.html
├── styles/portfolio.css
├── scripts/background.js
├── photos/ (webp and fallback images)
├── shaders/contour.vert
├── shaders/contour.frag
├── CREDITS.md
├── LICENSE
└── README.md
```

## 🎨 Design Features

### Glassmorphism
The portfolio uses modern glassmorphism design principles with:
- Semi-transparent backgrounds (`rgba(0, 0, 0, 0.7)`)
- Backdrop blur filters for frosted glass effect
- Subtle borders for depth
- Layered visual hierarchy

### Shader Background
Custom GLSL shaders create an animated topographic visualization:
- 3D simplex noise for organic movement
- 20 contour elevation levels
- White to cyan gradient
- Random glitch bursts with RGB color separation

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, or Edge)
- Local web server (optional, but recommended for best performance)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jinzurei/Portfolio.git
   cd Portfolio
   ```

2. **Open in browser**
    - Option A: Open `index.html` directly in your browser (double-click the file or use your editor's preview)
    - Option B: Use a local server (recommended):
       ```bash
       # Python 3
       python -m http.server 8000
     
       # Node.js (with http-server)
       npx http-server
       ```
    - Option C (Windows PowerShell quick preview):
       ```powershell
       Start-Process msedge -ArgumentList "--new-window", "file:///$PWD/index.html"
       ```
    - Navigate to `http://localhost:8000` (if using a server)

### Customization

1. **Personal Information** - Edit `index.html`:
   - Update name, bio, and contact info
   - Replace social media links
   - Update GitHub username in contribution graph URL

2. **Projects** - Modify the projects array in `index.html`:
   ```javascript
   const projects = [
       {
           title: "Your Project",
           description: "Project description",
           tech: ["Tech1", "Tech2"],
           features: ["Feature 1", "Feature 2"]
       }
   ];
   ```

3. **Styling** - Customize colors in `styles/portfolio.css`:
   - Primary color: `#007bff`
   - Glass backgrounds: `rgba(0, 0, 0, 0.7)`
   - Text colors: Modify color tokens near the top of the file

4. **Images** - Replace files in `photos/` folder:
   - Profile picture: `profile.webp`
   - Background video: `backgroundbydancristianpaduret.mp4`
   - Project/artwork images

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Credits

### Created By
**Jinzurei** ([@jinzurei](https://github.com/jinzurei))

### Third-Party Assets
- **Background Video**: Dan Cristian Pădureț ([Pexels](https://www.pexels.com/video/white-in-spreading-in-different-direction-3051490/))
- **Three.js**: v0.158.0 ([threejs.org](https://threejs.org/))
- **GitHub Charts**: ghchart.rshah.org

**Note:** The GLSL shader code and the JavaScript that drives the WebGL animation (uniforms, render loop, shader compilation) are original work by **Jinzurei** and are included in this repository.

See [CREDITS.md](CREDITS.md) for complete attribution.

## Usage & Licensing

This project is licensed under the **MIT License** (see `LICENSE`). The MIT License does not legally require attribution, but attribution and credit to third-party authors is appreciated. Recommended guidelines when reusing this project:

- Keep the `LICENSE` file in your distribution
- Retain or adapt `CREDITS.md` to acknowledge third-party assets you include
- If you redistribute the background video or any third-party media, follow the asset's original license and attribution rules

## 📧 Contact

- **GitHub**: [@jinzurei](https://github.com/jinzurei)
- **Twitter/X**: [@jinzurei](https://twitter.com/jinzurei)

---

⭐ If you found this helpful, please consider giving it a star!

**Last Updated**: October 20, 2025
 