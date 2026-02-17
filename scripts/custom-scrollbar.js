// Universal overlay custom scrollbar with WebGL animated thumb
(function(){
    const MIN_THUMB = 36; // px minimal thumb height

    function createScrollbar() {
        const scrollbar = document.createElement('div');
        scrollbar.className = 'custom-scrollbar';

        const track = document.createElement('div');
        track.className = 'track';

        const thumb = document.createElement('div');
        thumb.className = 'thumb';

        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 200;
        thumb.appendChild(canvas);

        track.appendChild(thumb);
        scrollbar.appendChild(track);
        document.body.appendChild(scrollbar);

        return {scrollbar, track, thumb, canvas};
    }

    // Simple WebGL helper using the same contour shader as background
    function initGL(canvas) {
        const gl = canvas.getContext('webgl');
        if (!gl) return null;

        // Enable standard derivatives for fwidth() if available
        gl.getExtension('OES_standard_derivatives');

        const vs = `attribute vec2 a_pos; varying vec2 vUv; void main(){ vUv = a_pos * 0.5 + 0.5; gl_Position = vec4(a_pos,0.0,1.0); }`;

        const fs = `#extension GL_OES_standard_derivatives : enable
        precision mediump float;
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

        // 3D Simplex noise
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
            vec2 p = vUv;
            p.x *= u_resolution.x / u_resolution.y;
            p *= u_zoom;

            // gradient tint
            vec3 gradientTop = vec3(1.0, 1.0, 1.0);
            vec3 gradientBottom = vec3(0.7, 0.9, 1.0);
            vec3 gradientColor = mix(gradientTop, gradientBottom, vUv.y);

            // glitch offsets for RGB
            vec2 pR = p + u_glitchOffset * u_glitch * 0.02;
            vec2 pG = p;
            vec2 pB = p - u_glitchOffset * u_glitch * 0.02;

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

            vec3 backgroundColor = vec3(0.0);
            vec3 finalColor = backgroundColor;
            finalColor.r = mix(backgroundColor.r, gradientColor.r * u_color.r * 3.0, lineMaskR);
            finalColor.g = mix(backgroundColor.g, gradientColor.g * u_color.g * 3.0, lineMaskG);
            finalColor.b = mix(backgroundColor.b, gradientColor.b * u_color.b * 3.0, lineMaskB);

            gl_FragColor = vec4(finalColor, 1.0);
        }
        `;

        function compile(src, type){
            const s = gl.createShader(type);
            gl.shaderSource(s, src);
            gl.compileShader(s);
            if(!gl.getShaderParameter(s, gl.COMPILE_STATUS)){
                console.warn(gl.getShaderInfoLog(s));
                return null;
            }
            return s;
        }

        const vShader = compile(vs, gl.VERTEX_SHADER);
        const fShader = compile(fs, gl.FRAGMENT_SHADER);
        const prog = gl.createProgram();
        gl.attachShader(prog, vShader);
        gl.attachShader(prog, fShader);
        gl.linkProgram(prog);
        if(!gl.getProgramParameter(prog, gl.LINK_STATUS)){
            console.warn(gl.getProgramInfoLog(prog));
            return null;
        }

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

        return {
            gl,
            prog,
            buffer,
            attrs:{a_pos: gl.getAttribLocation(prog, 'a_pos')},
            uniforms:{
                u_time: gl.getUniformLocation(prog,'u_time'),
                u_resolution: gl.getUniformLocation(prog,'u_resolution'),
                u_color: gl.getUniformLocation(prog,'u_color'),
                u_levels: gl.getUniformLocation(prog,'u_levels'),
                u_thickness: gl.getUniformLocation(prog,'u_thickness'),
                u_speed: gl.getUniformLocation(prog,'u_speed'),
                u_zoom: gl.getUniformLocation(prog,'u_zoom'),
                u_glitch: gl.getUniformLocation(prog,'u_glitch'),
                u_glitchOffset: gl.getUniformLocation(prog,'u_glitchOffset')
            }
        };
    }

    // Main
    const {scrollbar, track, thumb, canvas} = createScrollbar();
    const glInfo = initGL(canvas);

    let ticking = false;
    function updateThumb() {
        const vh = window.innerHeight;
        const docH = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
        const trackRect = track.getBoundingClientRect();
        const trackH = trackRect.height;
        const thumbH = Math.max(MIN_THUMB, (vh / docH) * trackH);
        thumb.style.height = thumbH + 'px';
        const maxScroll = docH - vh;
        const scrollTop = window.scrollY || window.pageYOffset;
        const ratio = maxScroll > 0 ? (scrollTop / maxScroll) : 0;
        const top = ratio * (trackH - thumbH);
        thumb.style.top = top + 'px';
        // resize canvas to thumb size for crispness
        const dpr = Math.max(1, window.devicePixelRatio || 1);
        const w = Math.max(10, thumb.clientWidth) * dpr;
        const h = Math.max(10, thumb.clientHeight) * dpr;
        if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w; canvas.height = h;
            canvas.style.width = thumb.clientWidth + 'px';
            canvas.style.height = thumb.clientHeight + 'px';
            if(glInfo) {
                glInfo.gl.viewport(0,0,canvas.width, canvas.height);
            }
        }
    }

    updateThumb();
    window.addEventListener('resize', () => { updateThumb(); });
    window.addEventListener('scroll', () => { if(!ticking){ requestAnimationFrame(()=>{ updateThumb(); ticking=false; }); ticking=true; } });

    // Dragging
    let dragging = false, dragStartY = 0, startScroll = 0;
    thumb.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        dragging = true;
        dragStartY = e.clientY;
        startScroll = window.scrollY || window.pageYOffset;
        document.body.style.userSelect = 'none';
        thumb.setPointerCapture(e.pointerId);
    });
    document.addEventListener('pointermove', (e) => {
        if(!dragging) return;
        const trackRect = track.getBoundingClientRect();
        const thumbH = thumb.clientHeight;
        const maxTop = trackRect.height - thumbH;
        const delta = e.clientY - dragStartY;
        const desiredTop = Math.min(maxTop, Math.max(0, (parseFloat(thumb.style.top || 0)) + delta));
        const ratio = desiredTop / maxTop;
        const docH = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
        const vh = window.innerHeight;
        const maxScroll = docH - vh;
        window.scrollTo({top: ratio * maxScroll});
        dragStartY = e.clientY; // update for smooth continuous dragging
    });
    document.addEventListener('pointerup', (e) => {
        if(dragging){ dragging = false; document.body.style.userSelect = ''; }
    });

    // WebGL render loop only while hovered
    let raf = null;
    let start = performance.now();
    let hoverAmount = 0.0;

    function render() {
        if(!glInfo) return;
        const {gl, prog, buffer, attrs, uniforms} = glInfo;
        gl.viewport(0,0,canvas.width, canvas.height);
        gl.clearColor(0,0,0,0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(prog);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.enableVertexAttribArray(attrs.a_pos);
        gl.vertexAttribPointer(attrs.a_pos, 2, gl.FLOAT, false, 0, 0);
        const t = (performance.now() - start) / 1000;

        // Match background shader defaults for visual parity
        gl.uniform1f(uniforms.u_time, t);
        gl.uniform2f(uniforms.u_resolution, canvas.width, canvas.height);
        gl.uniform3f(uniforms.u_color, 1.0, 1.0, 1.0);
        gl.uniform1f(uniforms.u_levels, 20.0);
        gl.uniform1f(uniforms.u_thickness, 0.15);
        gl.uniform1f(uniforms.u_speed, 0.4);
        gl.uniform1f(uniforms.u_zoom, 1.5);

        // Use hoverAmount to drive subtle glitch; offset rotates slowly
        gl.uniform1f(uniforms.u_glitch, hoverAmount * 1.0);
        const angle = t * 0.6;
        const ox = Math.cos(angle) * 1.0;
        const oy = Math.sin(angle) * 1.0;
        gl.uniform2f(uniforms.u_glitchOffset, ox, oy);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        raf = requestAnimationFrame(render);
    }

    let hoverActive = false;
    thumb.addEventListener('mouseenter', () => {
        hoverActive = true;
        // enable pointer events for scrollbar container while hovering
        scrollbar.style.pointerEvents = 'auto';
        // ramp up hoverAmount
        let t0 = performance.now();
        (function rampUp(){
            const dt = (performance.now()-t0)/200;
            hoverAmount = Math.min(1, hoverAmount + 0.08);
            if(hoverAmount < 1) requestAnimationFrame(rampUp);
        })();
        if(glInfo && raf === null) { start = performance.now(); render(); }
    });

    thumb.addEventListener('mouseleave', () => {
        hoverActive = false;
        scrollbar.style.pointerEvents = 'none';
        // ramp down hoverAmount and stop loop when near 0
        (function rampDown(){
            hoverAmount = Math.max(0, hoverAmount - 0.06);
            if(hoverAmount > 0.01){ requestAnimationFrame(rampDown); }
            else { hoverAmount = 0; if(raf){ cancelAnimationFrame(raf); raf = null; } }
        })();
    });

    // Make track clicks jump to position
    track.addEventListener('click', (e) => {
        if(e.target === thumb) return;
        const rect = track.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const thumbH = thumb.clientHeight;
        const maxTop = rect.height - thumbH;
        const desiredTop = Math.min(maxTop, Math.max(0, y - thumbH/2));
        const ratio = desiredTop / maxTop;
        const docH = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
        const vh = window.innerHeight;
        const maxScroll = docH - vh;
        window.scrollTo({top: ratio * maxScroll, behavior: 'smooth'});
    });

    // Initial update after DOM ready
    document.addEventListener('DOMContentLoaded', updateThumb);
    // In case script runs after DOMContentLoaded
    setTimeout(updateThumb, 120);
})();
