/**
 * WebGL Shader Background - Jinzurei
 * Created: October 2025
 * Last Updated: October 12, 2025
 * 
 * Features:
 * - Real-time WebGL shader rendering with Three.js
 * - Custom GLSL vertex and fragment shaders
 * - 3D simplex noise for topographic contour animation
 * - RGB chromatic aberration glitch effects
 * - Performance-optimized animation loop
 * - Graceful degradation for unsupported browsers
 * 
 * Dependencies:
 * - Three.js v0.158.0 (loaded globally from CDN)
 * 
 * @fileoverview WebGL shader background animation system
 * @author Jinzurei
 */

'use strict';

// Three.js is loaded globally from CDN in index.html
// No ES6 import needed - using window.THREE

// Embedded shaders
const vertexShaderCode = `
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShaderCode = `
uniform float u_time;
uniform vec2 u_resolution;
uniform vec3 u_color;
uniform float u_levels;
uniform float u_thickness;
uniform float u_speed;
uniform float u_zoom;
uniform float u_glitch;
uniform vec2 u_glitchOffset;

varying vec2 vUv;

// 3D Simplex noise implementation
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

void main() {
    // Animated contour topographic map effect with RGB glitch and gradient
    vec2 p = vUv;
    p.x *= u_resolution.x / u_resolution.y;
    p *= u_zoom;
    
    // Create subtle gradient from top to bottom (white to cyan tint)
    vec3 gradientTop = vec3(1.0, 1.0, 1.0); // White at top
    vec3 gradientBottom = vec3(0.7, 0.9, 1.0); // Light cyan at bottom
    vec3 gradientColor = mix(gradientTop, gradientBottom, vUv.y);
    
    // RGB separation glitch effect
    vec2 pR = p + u_glitchOffset * u_glitch * 0.02; // Red channel offset
    vec2 pG = p; // Green channel stays centered
    vec2 pB = p - u_glitchOffset * u_glitch * 0.02; // Blue channel offset opposite

    // Calculate contour lines for each color channel
    vec3 noiseCoordR = vec3(pR, u_time * u_speed);
    vec3 noiseCoordG = vec3(pG, u_time * u_speed);
    vec3 noiseCoordB = vec3(pB, u_time * u_speed);
    
    float nR = snoise(noiseCoordR) * 0.5 + 0.5;
    float nG = snoise(noiseCoordG) * 0.5 + 0.5;
    float nB = snoise(noiseCoordB) * 0.5 + 0.5;

    float qR = nR * u_levels;
    float qG = nG * u_levels;
    float qB = nB * u_levels;
    
    float distToBandR = abs(fract(qR) - 0.5);
    float distToBandG = abs(fract(qG) - 0.5);
    float distToBandB = abs(fract(qB) - 0.5);

    float lineEdge = u_thickness * 0.5;
    float lineMaskR = smoothstep(lineEdge, 0.0, distToBandR);
    float lineMaskG = smoothstep(lineEdge, 0.0, distToBandG);
    float lineMaskB = smoothstep(lineEdge, 0.0, distToBandB);

    // Create RGB separated color channels with gradient tint
    vec3 backgroundColor = vec3(0.0, 0.0, 0.0);
    vec3 finalColor = backgroundColor;
    
    // Mix each color channel separately for RGB glitch effect, using gradient color
    finalColor.r = mix(backgroundColor.r, gradientColor.r * u_color.r * 3.0, lineMaskR);
    finalColor.g = mix(backgroundColor.g, gradientColor.g * u_color.g * 3.0, lineMaskG);
    finalColor.b = mix(backgroundColor.b, gradientColor.b * u_color.b * 3.0, lineMaskB);

    gl_FragColor = vec4(finalColor, 1.0);
}
`;

// Initialize Three.js scene
async function initBackground() {
    try {
        console.log('Initializing background shader...');
        
        const vertexShader = vertexShaderCode;
        const fragmentShader = fragmentShaderCode;
        
        console.log('Shaders loaded successfully');

    // Create renderer with transparency
    const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Enable OES_standard_derivatives extension for fwidth()
    const gl = renderer.getContext();
    const ext = gl.getExtension('OES_standard_derivatives');
    if (!ext) {
        console.warn('OES_standard_derivatives not supported, using fallback');
    } else {
        console.log('OES_standard_derivatives enabled');
    }
    
    // Style canvas
    renderer.domElement.style.position = 'fixed';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.zIndex = '-1';
    renderer.domElement.style.pointerEvents = 'none';
    renderer.domElement.style.opacity = '1'; // Always visible
    renderer.domElement.id = 'shader-background';
    
    console.log('Shader canvas added to DOM with opacity: 1');
    
    document.body.insertBefore(renderer.domElement, document.body.firstChild);

    // Create orthographic camera
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    
    // Create scene
    const scene = new THREE.Scene();

    // Create shader material with uniforms (sensible defaults)
    // Tweak these values to customize the background effect:
    // - u_color: RGB values 0.0-1.0 (e.g., vec3(0.0, 0.75, 1.0) for neon blue)
    // - u_levels: Number of contour bands (higher = more lines, try 8-20)
    // - u_thickness: Line width (0.02-0.1, higher = thicker lines)
    // - u_speed: Animation speed (0.1-0.5 for subtle, 0.5-2.0 for faster)
    // - u_zoom: Pattern scale (1.0-4.0, higher = more zoomed in/detailed)
    const material = new THREE.ShaderMaterial({
        uniforms: {
            u_time: { value: 0.0 },
            u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
            u_color: { value: new THREE.Vector3(1.0, 1.0, 1.0) }, // Pure white - maximum brightness
            u_levels: { value: 20.0 }, // Many contour lines for dense topographic effect
            u_thickness: { value: 0.15 }, // Much thicker, more visible lines
            u_speed: { value: 0.4 }, // Clear wave motion
            u_zoom: { value: 1.5 }, // Zoomed out to see more pattern
            u_glitch: { value: 0.0 }, // Glitch intensity (0-1)
            u_glitchOffset: { value: new THREE.Vector2(0.0, 0.0) } // RGB separation offset
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        transparent: false // No transparency - solid render
    });
    
    // Log shader compilation errors if any
    if (material.program) {
        const program = material.program;
        console.log('Vertex Shader:', gl.getShaderInfoLog(program.vertexShader));
        console.log('Fragment Shader:', gl.getShaderInfoLog(program.fragmentShader));
    }

    // Create full-screen plane
    const geometry = new THREE.PlaneGeometry(2, 2);
    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    // Handle window resize
    function onResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        renderer.setSize(width, height);
        material.uniforms.u_resolution.value.set(width, height);
    }
    
    window.addEventListener('resize', onResize);

    // Animation loop with visual RGB glitch effects
    let lastTime = 0;
    const targetFPS = 60;
    const frameInterval = 1000 / targetFPS;
    let timeAccumulator = 0;
    let speedMultiplier = 1.0;
    let glitchTimer = 0;
    let isGlitching = false;
    let glitchIntensity = 0.0;

    function animate(currentTime) {
        requestAnimationFrame(animate);
        
        const deltaTime = currentTime - lastTime;
        
        if (deltaTime >= frameInterval) {
            lastTime = currentTime - (deltaTime % frameInterval);
            
            // Glitch system: randomly trigger visual glitches with RGB separation
            glitchTimer += deltaTime;
            
            if (!isGlitching && glitchTimer > 2000 + Math.random() * 3000) {
                // Start glitch: 2-5 seconds between glitches
                isGlitching = true;
                speedMultiplier = 8.0 + Math.random() * 12.0; // Speed up 8-20x
                glitchTimer = 0;
            } else if (isGlitching && glitchTimer > 150 + Math.random() * 250) {
                // End glitch: glitch lasts 150-400ms (longer duration)
                isGlitching = false;
                speedMultiplier = 1.0;
                glitchIntensity = 0.0;
                glitchTimer = 0;
            }
            
            if (isGlitching) {
                // Rapid random glitch intensity and direction
                glitchIntensity = 0.5 + Math.random() * 0.5; // 0.5-1.0 intensity
                material.uniforms.u_glitch.value = glitchIntensity;
                
                // Random RGB separation direction
                const angle = Math.random() * Math.PI * 2;
                material.uniforms.u_glitchOffset.value.set(
                    Math.cos(angle) * (1 + Math.random() * 2),
                    Math.sin(angle) * (1 + Math.random() * 2)
                );
            } else {
                material.uniforms.u_glitch.value = 0.0;
            }
            
            // Update time with speed multiplier (slower base speed)
            timeAccumulator += (deltaTime * 0.001) * speedMultiplier * 0.15; // 0.15 = slower base speed
            material.uniforms.u_time.value = timeAccumulator;
            
            // Render scene
            renderer.render(scene, camera);
        }
    }

    animate(0);
    console.log('Background shader initialized successfully!');
    
    } catch (error) {
        console.error('Error initializing background shader:', error);
    }
}

// Initialize when DOM and THREE.js are ready
function waitForThree() {
    if (typeof THREE !== 'undefined') {
        console.log('THREE.js loaded successfully');
        initBackground();
    } else {
        console.log('Waiting for THREE.js to load...');
        setTimeout(waitForThree, 100);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForThree);
} else {
    waitForThree();
}
