# Portfolio Website

A modern, interactive portfolio website featuring custom WebGL shader animations and glassmorphism design.

## 🚀 Features

### Visual Effects
- **Custom WebGL Shaders** - Real-time animated topographic contour background using Three.js
- **Glassmorphism UI** - Frosted glass design with backdrop-filter effects
- **RGB Glitch Effects** - Dynamic chromatic aberration animations
- **Smooth Animations** - CSS transforms and Intersection Observer API for scroll-triggered effects

### Interactive Components
- **Flip Cards** - 3D perspective transforms for project and artwork displays
- **Modal System** - Detailed project information with dynamic content
- **Contact Form** - Integrated form with validation
- **GitHub Integration** - Live contribution activity graph
- **Social Media Widgets** - Twitter/X timeline integration

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
   - Option A: Open `index.html` directly in your browser
   - Option B: Use a local server (recommended):
     ```bash
     # Python 3
     python -m http.server 8000
     
     # Node.js (with http-server)
     npx http-server
     ```
   - Navigate to `http://localhost:8000`

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

3. **Styling** - Customize colors in `portfolio.css`:
   - Primary color: `#007bff`
   - Glass backgrounds: `rgba(0, 0, 0, 0.7)`
   - Text colors: Modify color variables

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

See [CREDITS.md](CREDITS.md) for complete attribution.

## ⚠️ Usage Terms

You are free to fork and use this portfolio as a template, but you **MUST**:
- ✅ Credit Jinzurei (@jinzurei) as the original creator
- ✅ Credit all third-party contributors (see CREDITS.md)
- ✅ Include proper attribution in your fork
- ✅ Maintain the MIT License

## 📧 Contact

- **GitHub**: [@jinzurei](https://github.com/jinzurei)
- **Twitter/X**: [@jinzurei](https://twitter.com/jinzurei)

---

⭐ If you found this helpful, please consider giving it a star!

**Last Updated**: October 11, 2025