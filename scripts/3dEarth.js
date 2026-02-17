/**
 * 3D Earth with ASCII Overlay - Jinzurei
 * Created: February 2026
 *
 * Features:
 * - Three.js 3D green sphere
 * - ASCII animation overlay from JSON
 * - Canvas-based rendering
 *
 * Dependencies:
 * - Three.js (loaded globally)
 */

'use strict';

// Wait for THREE.js to load
function init3DEarth() {
    try {
        const container = document.getElementById('3dEarth-container');
        if (!container) {
            console.error('3dEarth container not found');
            return;
        }
        // Set styles explicitly
        container.style.position = 'absolute';
        // move the planet slightly more inset from the right edge for balance
        container.style.right = '6vw';
        container.style.zIndex = '5';
        const hero = document.querySelector('.hero');
        const nav = document.querySelector('.main-nav');
        const heroHeight = hero ? hero.getBoundingClientRect().height : window.innerHeight;
        // Initially nav is centered, so no height deduction needed
        const navHeight = nav && nav.classList.contains('morphed') ? nav.getBoundingClientRect().height : 0;
        const availableHeight = Math.max(0, heroHeight - navHeight);
        // slightly reduce planet size so the hero text remains the focal point
        const planetDiameter = Math.floor(availableHeight * 0.72);
        const planetTop = navHeight + Math.max(0, (availableHeight - planetDiameter) / 2);
        container.style.top = `${planetTop}px`;
        container.style.width = `${planetDiameter}px`;
        container.style.height = `${planetDiameter}px`;
        console.log('Container size:', container.clientWidth, container.clientHeight);

        // Three.js scene for sphere
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        let rendererWidth = planetDiameter * 1.2;
        let rendererHeight = planetDiameter * 1.2;
        renderer.setSize(rendererWidth, rendererHeight);
        renderer.setClearColor(0x000000, 0); // Transparent background
        renderer.domElement.style.position = 'absolute';
        renderer.domElement.style.top = '-10%';
        renderer.domElement.style.left = '-10%';
        container.appendChild(renderer.domElement);

        // Green sphere with 3D material
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        // Darker glass look without shiny specular highlights
        const material = new THREE.MeshPhysicalMaterial({
            color: 0x000000,
            metalness: 0.0,
            roughness: 0.12,
            transparent: true,
            opacity: 0.5,
            transmission: 0.6,
            ior: 1.45,
            reflectivity: 0.6,
            clearcoat: 0.0
        });
        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);

        // Add lighting for 3D effect
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);

        camera.position.z = 2;

        // Rotation timing for smooth, slow left-to-right spin
        let lastAnimateTime = 0;
        const rotationSpeed = 0.12; // radians per second (slow)

        const sphereBaseDiameter = 2;
        let lastPixelDiameter = Math.min(container.clientWidth, container.clientHeight);

        const sphereScaleMultiplier = 0.85;

        function updateSphereScale(pixelDiameter) {
            if (container.clientHeight === 0) {
                return;
            }
            const fov = THREE.MathUtils.degToRad(camera.fov);
            const worldHeight = 2 * camera.position.z * Math.tan(fov / 2);
            const worldUnitsPerPixel = worldHeight / rendererHeight;
            const desiredWorldDiameter = pixelDiameter * worldUnitsPerPixel;
            const scale = (desiredWorldDiameter / sphereBaseDiameter) * sphereScaleMultiplier;
            sphere.scale.setScalar(scale);
        }

        // ASCII canvas
        const asciiCanvas = document.createElement('canvas');
        asciiCanvas.width = rendererWidth;
        asciiCanvas.height = rendererHeight;
        asciiCanvas.style.position = 'absolute';
        asciiCanvas.style.top = '-10%';
        asciiCanvas.style.left = '-10%';
        asciiCanvas.style.pointerEvents = 'none';
        container.appendChild(asciiCanvas);

        const ctx = asciiCanvas.getContext('2d');
        const baseFontSize = 10; // Adjust this to resize both sphere and ASCII proportionally (e.g., 12 for larger, 8 for smaller)
        const lineHeight = baseFontSize;
        ctx.font = `${baseFontSize}px monospace`;
        ctx.fillStyle = 'white';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        let charWidth = ctx.measureText('M').width;

        // Load ASCII animation data
        fetch('animations/AsciiEarth02 (1).json')
            .then(response => response.json())
            .then(data => {
                const frames = data.frames;
                let currentFrame = 0;
                const frameRate = data.animation.frameRate || 12;
                const frameInterval = 1000 / frameRate;
                let lastFrameTime = 0;

                function animate(time) {
                    requestAnimationFrame(animate);

                    // update sphere rotation using time delta for smooth, framerate-independent motion
                    if (!lastAnimateTime) lastAnimateTime = time;
                    const deltaSec = (time - lastAnimateTime) / 1000;
                    sphere.rotation.y += rotationSpeed * deltaSec;
                    lastAnimateTime = time;

                    renderer.render(scene, camera);

                    // Render ASCII at specified frame rate
                    if (time - lastFrameTime >= frameInterval) {
                        if (frames[currentFrame] && frames[currentFrame].contentString) {
                            ctx.clearRect(0, 0, asciiCanvas.width, asciiCanvas.height);
                            const content = frames[currentFrame].contentString;
                            const lines = content.split('\n');
                            const totalHeight = lines.length * lineHeight;
                            let minCol = Infinity;
                            let maxCol = -Infinity;
                            let minRow = Infinity;
                            let maxRow = -Infinity;

                            lines.forEach((line, rowIndex) => {
                                const trimmed = line.trim();
                                if (!trimmed) {
                                    return;
                                }
                                const leadingSpaces = line.length - line.trimStart().length;
                                const firstChar = leadingSpaces;
                                const lastChar = leadingSpaces + trimmed.length - 1;
                                minCol = Math.min(minCol, firstChar);
                                maxCol = Math.max(maxCol, lastChar);
                                minRow = Math.min(minRow, rowIndex);
                                maxRow = Math.max(maxRow, rowIndex);
                            });

                            const hasBounds = Number.isFinite(minCol) && Number.isFinite(maxCol);
                            const visibleCols = hasBounds ? (maxCol - minCol + 1) : 0;
                            const visibleRows = hasBounds ? (maxRow - minRow + 1) : 0;
                            const visibleWidth = visibleCols * charWidth;
                            const visibleHeight = visibleRows * lineHeight;

                                const targetDiameter = Math.min(container.clientWidth, container.clientHeight);
                                const scaleX = visibleWidth > 0 ? (targetDiameter / visibleWidth) : 1;
                                const scaleY = visibleHeight > 0 ? (targetDiameter / visibleHeight) : 1;
                                const scale = Math.max(scaleX, scaleY);
                                const drawWidth = visibleWidth * scale;
                                const drawHeight = visibleHeight * scale;
                                const startX = Math.max(0, (asciiCanvas.width - drawWidth) / 2) - (minCol * charWidth * scale);
                                const startY = Math.max(0, (asciiCanvas.height - drawHeight) / 2) - (minRow * lineHeight * scale);

                            lastPixelDiameter = targetDiameter;
                            updateSphereScale(lastPixelDiameter);

                            ctx.save();
                            ctx.translate(startX, startY);
                            ctx.scale(scale, scale);

                            lines.forEach((line, index) => {
                                ctx.fillText(line, 0, index * lineHeight);
                            });

                            ctx.restore();
                        }

                        currentFrame = (currentFrame + 1) % frames.length;
                        lastFrameTime = time;
                    }
                }

                animate(0);
                console.log('3D Earth initialized successfully');
            })
            .catch(error => console.error('Error loading ASCII data:', error));

        // Handle resize
        window.addEventListener('resize', () => {
            const resizedHeroHeight = hero ? hero.getBoundingClientRect().height : window.innerHeight;
            const resizedNavHeight = nav ? nav.getBoundingClientRect().height : 0;
            const resizedAvailableHeight = Math.max(0, resizedHeroHeight - resizedNavHeight);
            const resizedDiameter = Math.floor(resizedAvailableHeight * 0.8);
            const resizedTop = resizedNavHeight + Math.max(0, (resizedAvailableHeight - resizedDiameter) / 2);
            container.style.top = `${resizedTop}px`;
            container.style.width = `${resizedDiameter}px`;
            container.style.height = `${resizedDiameter}px`;

            camera.aspect = 1;
            camera.updateProjectionMatrix();
            rendererWidth = resizedDiameter * 1.2;
            rendererHeight = resizedDiameter * 1.2;
            renderer.setSize(rendererWidth, rendererHeight);
            asciiCanvas.width = rendererWidth;
            asciiCanvas.height = rendererHeight;
            ctx.font = `${baseFontSize}px monospace`;
            ctx.fillStyle = 'white';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            charWidth = ctx.measureText('M').width;
            lastPixelDiameter = Math.min(container.clientWidth, container.clientHeight);
            updateSphereScale(lastPixelDiameter);
        });

    } catch (error) {
        console.error('Error initializing 3D Earth:', error);
    }
}

// Initialize when DOM and THREE.js are ready
function waitForThreeEarth() {
    if (typeof THREE !== 'undefined') {
        window.addEventListener('load', init3DEarth);
    } else {
        setTimeout(waitForThreeEarth, 100);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForThreeEarth);
} else {
    waitForThreeEarth();
}