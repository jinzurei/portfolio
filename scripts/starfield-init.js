// Minimal WebGL initializer to load shaders from /shaders/stars/ and run the starfield shader.
(function(){
  const vertPath = 'shaders/stars/starfield.vert';
  const fragPath = 'shaders/stars/starfield.frag';

  function createCanvas() {
    const c = document.createElement('canvas');
    c.id = 'starfield-webgl-canvas';
    const section = document.getElementById('home');
    if (section) {
      section.style.position = 'relative';
      c.style.position = 'absolute';
      c.style.inset = '0';
      c.style.width = '100%';
      c.style.height = '100%';
      c.style.pointerEvents = 'none';
      c.style.zIndex = '1';
      section.appendChild(c);
    } else {
      c.style.position = 'fixed';
      c.style.inset = '0';
      c.style.width = '100%';
      c.style.height = '100%';
      c.style.pointerEvents = 'none';
      c.style.zIndex = '50';
      document.body.appendChild(c);
    }
    return c;
  }

  function compile(gl, type, src) {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if(!gl.getShaderParameter(sh, gl.COMPILE_STATUS)){
      console.error('Shader compile error:', gl.getShaderInfoLog(sh));
      gl.deleteShader(sh);
      return null;
    }
    return sh;
  }

  function createProgram(gl, vsSrc, fsSrc){
    const vs = compile(gl, gl.VERTEX_SHADER, vsSrc);
    const fs = compile(gl, gl.FRAGMENT_SHADER, fsSrc);
    if(!vs || !fs) return null;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.bindAttribLocation(prog, 0, 'a_position');
    gl.linkProgram(prog);
    if(!gl.getProgramParameter(prog, gl.LINK_STATUS)){
      console.error('Program link error:', gl.getProgramInfoLog(prog));
      return null;
    }
    return prog;
  }

  async function loadText(path){
    const r = await fetch(path);
    if(!r.ok) throw new Error('Failed to load '+path);
    return r.text();
  }

  async function init(){
    try{
      const [vsSrc, fsSrc] = await Promise.all([loadText(vertPath), loadText(fragPath)]);
      const canvas = createCanvas();
      const section = document.getElementById('home');
      const gl = canvas.getContext('webgl', { antialias: true, alpha: true });
      if(!gl) return console.warn('WebGL not supported');

      const prog = createProgram(gl, vsSrc, fsSrc);
      if(!prog) return;

      const posLoc = 0; // bound earlier
      const u_resolution = gl.getUniformLocation(prog, 'u_resolution');
      const u_time = gl.getUniformLocation(prog, 'u_time');
      const u_seed = gl.getUniformLocation(prog, 'u_seed');
      const u_pixelRatio = gl.getUniformLocation(prog, 'u_pixelRatio');

      // full-screen triangle (3 vertices)
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      const verts = new Float32Array([-1, -1, 3, -1, -1, 3]);
      gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

      function resize(){
        const DPR = Math.max(1, window.devicePixelRatio || 1);
        const rect = section ? section.getBoundingClientRect() : { width: innerWidth, height: innerHeight };
        const cssW = rect.width || innerWidth;
        const cssH = rect.height || innerHeight;
        canvas.width = Math.round(cssW * DPR);
        canvas.height = Math.round(cssH * DPR);
        canvas.style.width = cssW + 'px';
        canvas.style.height = cssH + 'px';
        gl.viewport(0,0, canvas.width, canvas.height);
        if(u_resolution) gl.uniform2f(u_resolution, cssW, cssH);
        if(u_pixelRatio) gl.uniform1f(u_pixelRatio, DPR);
      }

      // Bind program early so resize() can safely set uniforms
      gl.useProgram(prog);
      // per-load randomness so scheduling isn't identical on each reload
      const randomSeed = Math.random();
      if(u_seed) gl.uniform1f(u_seed, randomSeed);
      window.addEventListener('resize', resize, { passive: true });
      resize();
      
      // Ensure proper sizing after layout
      setTimeout(resize, 100);

      gl.useProgram(prog);
      // --- Scheduler debug mirror (logs selections/directions to browser console) ---
      const DEBUG_SCHEDULER = true;
      function fract(x){ return x - Math.floor(x); }
      function hash2d(x,y){ return fract(Math.sin(x * 127.1 + y * 311.7) * 43758.5453123); }
      function rotate2(vx, vy, ang){ const c = Math.cos(ang), s = Math.sin(ang); return [c*vx - s*vy, s*vx + c*vy]; }
      function normalize2(vx, vy){ const l = Math.hypot(vx, vy); return l > 0 ? [vx / l, vy / l] : [0,0]; }
      let lastLoggedSeq = -1;
      let lastActiveKey = '';
      function computeAndLogScheduler(t){
        if(!DEBUG_SCHEDULER) return;
        const interval = 6.0;
        const phase = t % interval;
        const seq = Math.floor(t / interval);
        if(seq === lastLoggedSeq) return; // log once per sequence
        lastLoggedSeq = seq;

        const seed = hash2d(seq, 9.0 + (randomSeed * 137.0));
        const target = Math.floor(seed * 6.0) + 1; // 1..6
        const threshold = target / 6.0;
        const p = [1,2,3,4,5,6].map(i => hash2d(seq, i));
        const off = [11,12,13,14,15,16].map(i => fract(hash2d(seq, i)) * interval);
        const prevSeq = seq - 1;
        const prevSeed = hash2d(prevSeq, 9.0 + (randomSeed * 137.0));
        const prevTarget = Math.floor(prevSeed * 6.0) + 1;
        const prevThreshold = prevTarget / 6.0;
        const pp = [1,2,3,4,5,6].map(i => hash2d(prevSeq, i));

        const sel = p.map(v => v <= threshold ? 1 : 0);
        const prevSel = pp.map(v => v <= prevThreshold ? 1 : 0);
        for(let i=0;i<6;i++) sel[i] = sel[i] * (1 - prevSel[i]);

        const windowLen = interval * 0.18;
        const win = off.map(o => (phase >= o && phase < o + windowLen) ? 1 : 0);
        const a = sel.map((s,i) => s * win[i]);

        // directions (match shader dpre + rotation angles)
        const dpre = [[-1.0,1.0],[1.2*1.1,1.2],[-0.8*1.1,0.0],[0.0,0.6],[0.9*1.1,-0.9],[-1.1*1.1,-1.1]];
        const angles = [-0.785398*3.0, -0.785398, 0.0, 1.5708, 0.785398, -2.356];
        const dirs = dpre.map((v,i)=> normalize2(...rotate2(v[0], v[1], angles[i])));

        // resolve same-direction conflicts (keep higher-priority p)
        const sameThresh = 0.92;
        const aResolved = a.slice();
        for(let i=0;i<6;i++){
          for(let j=i+1;j<6;j++){
            if(aResolved[i] > 0.5 && aResolved[j] > 0.5){
              const dot = dirs[i][0]*dirs[j][0] + dirs[i][1]*dirs[j][1];
              if(dot > sameThresh){
                if(p[i] < p[j]) aResolved[i] = 0; else aResolved[j] = 0;
              }
            }
          }
        }

        // ensure first two activations are not same direction
        let pairs = [];
        for(let i=0;i<6;i++) if(aResolved[i] > 0.5) pairs.push({i, off: off[i]});
        pairs.sort((A,B)=>A.off - B.off);
        if(pairs.length >= 2){
          const i0 = pairs[0].i, i1 = pairs[1].i;
          const dot01 = dirs[i0][0]*dirs[i1][0] + dirs[i0][1]*dirs[i1][1];
          if(dot01 > sameThresh){ aResolved[i1] = 0; }
        }

        const active = aResolved.map((v,i)=> v>0.5 ? i+1 : null).filter(x=>x);

        const activeKey = active.join(',');
        if(activeKey !== lastActiveKey){
          lastActiveKey = activeKey;
          const dirAngles = dirs.map(d=> Math.atan2(d[1], d[0]) * 180 / Math.PI);
          console.log('[StarSched] seq=%d target=%d sel=%o off=%o active=%o dirs(deg)=%o p=%o', seq, target, sel, off.map(x=>x.toFixed(2)), active, dirAngles.map(a=>a.toFixed(1)), p.map(v=>v.toFixed(3)) );
        }
      }

      // (program already bound above)
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.enableVertexAttribArray(posLoc);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

      let start = performance.now();
      function frame(now){
        const t = (now - start) / 1000;
        // log scheduler once per interval (to browser console)
        try{ computeAndLogScheduler(t); }catch(e){ console.warn('Scheduler debug error', e); }
        if(u_time) gl.uniform1f(u_time, t);

        // clear to transparent
        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.drawArrays(gl.TRIANGLES, 0, 3);
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }catch(err){
      console.error('Starfield init error:', err);
    }
  }

  // Defer init until DOM ready
  if(document.readyState === 'complete' || document.readyState === 'interactive') init(); else document.addEventListener('DOMContentLoaded', init);
})();
