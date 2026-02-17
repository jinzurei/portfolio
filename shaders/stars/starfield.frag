precision highp float;
varying vec2 v_uv;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_seed;
uniform float u_pixelRatio;

// Hash helpers
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123); }
vec2 hash2(vec2 p){ return fract(sin(vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3))))*43758.5453); }

#define S(a,b,t) smoothstep(a,b,t)

float N21(vec2 p) {
    p = fract(p*vec2(233.34, 851.73));
    p += dot(p, p+23.45);
    return fract(p.x * p.y);
}

float DistLine(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p-a;
    vec2 ba = b-a;
    float t = clamp(dot(pa, ba)/ dot(ba, ba), 0., 1.);
    return length(pa - ba*t);
}

float DrawLine(vec2 p, vec2 a, vec2 b) {
    float d = DistLine(p, a, b);
    float m = S(.0025, .00001, d);
    float d2 = length(a-b);
    m *= S(1., .5, d2) + S(.04, .03, abs(d2-.75));
    return m;
}

float ShootingStar(vec2 uv) {    
    vec2 gv = fract(uv)-.5;
    vec2 id = floor(uv);
    
    float h = N21(id);
    
    float line = DrawLine(gv, vec2(0., h), vec2(.125, h));
    float trail = S(.14, .0, gv.x);
	
    return line * trail;
}

// 3D Simplex noise implementation
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    // First corner
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    // Other corners
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    // Permutations
    i = mod289(i);
    vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    // Gradients
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

    // Normalize gradients
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    // Mix final noise value
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

// distance to segment
float lineDist(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa,ba) / dot(ba,ba), 0.0, 1.0);
  return length(pa - ba * h);
}

void main(){
  vec2 uv = v_uv;
  vec2 res = u_resolution;
  float aspect = 1.0;
  if(res.y > 0.0) {
    aspect = res.x / res.y;
  }
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
  float t = u_time;

  vec3 col = vec3(0.0);

  // faint central nebula for depth
  float center = smoothstep(0.7, 0.0, length(p) / 0.9);
  col += vec3(0.01, 0.01, 0.015) * center * 0.6;

  // layered procedural stars
  float starAccum = 0.0;
  for(int layer = 0; layer < 5; layer++){
    float li = float(layer);
    float depthScale = mix(0.8, 3.2, li/4.0);
    float speed = mix(0.03, 0.18, li/4.0);
    float density = mix(28.0, 88.0, li/4.0);

    vec2 gv = p * (density / depthScale);
    vec2 id = floor(gv);
    vec2 f = fract(gv);
    vec2 rnd = hash2(id + floor(t * 0.12 * (1.0 + li)));
    vec2 starPos = rnd - 0.5;

    float ang = t * speed * (li - 2.0) * 0.12;
    mat2 rot = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));
    vec2 local = (f - starPos) * rot;

    float dist = max(abs(local.x), abs(local.y)); // Diamond shape
    float size = 0.006 * (1.0 + (1.0 - li/5.0) * 3.8);
    float intensity = exp(-dist * 1.0 / size);

    // Random glitch effect for some stars
    if (hash(id + vec2(floor(t * 0.05), li)) > 0.9) {
      // Distort the shape with noise
      vec2 distortion = vec2(
        snoise(vec3(local * 8.0, t * 0.5)),
        snoise(vec3(local * 8.0 + 100.0, t * 0.5))
      ) * 0.03;
      vec2 glitchedLocal = local + distortion;
      dist = max(abs(glitchedLocal.x), abs(glitchedLocal.y));
      intensity = exp(-dist * 1.0 / size) * (0.8 + 0.4 * sin(t * 5.0 + hash(id) * 6.28)); // Rapid flicker
    }

    float phase = hash(id) * 6.28318;
    float tw = 0.5 + 0.5 * sin(t * (0.6 + li * 0.4) + phase);
    float alpha = intensity * tw * (0.6 + 0.9 * (1.0 - li/5.0));
    starAccum += alpha;
  }

  starAccum = clamp(starAccum, 0.0, 1.6);
  col += vec3(1.0) * starAccum;

  // shooting stars from Shadertoy ttVXDy
  vec2 uv_ss = v_uv * 2.0 - 1.0;
  uv_ss.x *= u_resolution.x / u_resolution.y;
  
  float t_ss = u_time * 3.0 + 5.0; // Offset to start with shooting stars visible
  
  // Diagonal from top-left to bottom-right
  vec2 rv1 = vec2(uv_ss.x - t_ss, uv_ss.y + t_ss);
  rv1.x *= 1.1;
  float r1 = -0.785398 * 3.0;
  float s1 = sin(r1);
  float c1 = cos(r1);
  mat2 rot1 = mat2(c1, -s1, s1, c1);
  rv1 *= rot1;
  rv1 *= 0.4 * 0.9; // Increased density
  
  // Diagonal from bottom-left to top-right
  vec2 rv2 = uv_ss + t_ss * 1.2;
  rv2.x *= 1.1;
  float r2 = -0.785398;
  float s2 = sin(r2);
  float c2 = cos(r2);
  mat2 rot2 = mat2(c2, -s2, s2, c2);
  rv2 *= rot2;
  rv2 *= 0.4 * 1.1; // Increased density
  
  // Horizontal from left to right
  vec2 rv3 = vec2(uv_ss.x - t_ss * 0.8, uv_ss.y);
  rv3.x *= 1.1;
  float r3 = 0.0; // Horizontal
  float s3 = sin(r3);
  float c3 = cos(r3);
  mat2 rot3 = mat2(c3, -s3, s3, c3);
  rv3 *= rot3;
  rv3 *= 0.4 * 1.0; // Increased density
  
  // Vertical from bottom to top
  vec2 rv4 = vec2(uv_ss.x, uv_ss.y + t_ss * 0.6);
  rv4.x *= 1.1;
  float r4 = 1.5708; // Vertical
  float s4 = sin(r4);
  float c4 = cos(r4);
  mat2 rot4 = mat2(c4, -s4, s4, c4);
  rv4 *= rot4;
  rv4 *= 0.4 * 1.0; // Increased density
  
  // Additional diagonal
  vec2 rv5 = vec2(uv_ss.x + t_ss * 0.9, uv_ss.y - t_ss * 0.9);
  rv5.x *= 1.1;
  float r5 = 0.785398; // 45 degrees
  float s5 = sin(r5);
  float c5 = cos(r5);
  mat2 rot5 = mat2(c5, -s5, s5, c5);
  rv5 *= rot5;
  rv5 *= 0.4 * 1.0; // Increased density
  
  // Another direction
  vec2 rv6 = vec2(uv_ss.x - t_ss * 1.1, uv_ss.y - t_ss * 1.1);
  rv6.x *= 1.1;
  float r6 = -2.356; // 135 degrees
  float s6 = sin(r6);
  float c6 = cos(r6);
  mat2 rot6 = mat2(c6, -s6, s6, c6);
  rv6 *= rot6;
  rv6 *= 0.4 * 1.0; // Increased density
  
  // Scheduled, staggered activations: choose 1..6 fields per interval and stagger their windows
  float interval = 6.0; // seconds per scheduling window
  float phase = mod(u_time, interval);
  float seq = floor(u_time / interval);
  float seed = hash(vec2(seq, 9.0 + u_seed * 137.0));
  int target = int(floor(seed * 6.0)) + 1; // 1..6
  float threshold = float(target) / 6.0;
  float window = interval * 0.18; // each active window length

  // per-field pseudorandom priority and offset
  float p1 = hash(vec2(seq, 1.0));
  float p2 = hash(vec2(seq, 2.0));
  float p3 = hash(vec2(seq, 3.0));
  float p4 = hash(vec2(seq, 4.0));
  float p5 = hash(vec2(seq, 5.0));
  float p6 = hash(vec2(seq, 6.0));

  float off1 = fract(hash(vec2(seq, 11.0)))*interval;
  float off2 = fract(hash(vec2(seq, 12.0)))*interval;
  float off3 = fract(hash(vec2(seq, 13.0)))*interval;
  float off4 = fract(hash(vec2(seq, 14.0)))*interval;
  float off5 = fract(hash(vec2(seq, 15.0)))*interval;
  float off6 = fract(hash(vec2(seq, 16.0)))*interval;

  // selected fields (top `target` approx) and active windows
  float sel1 = step(p1, threshold);
  float sel2 = step(p2, threshold);
  float sel3 = step(p3, threshold);
  float sel4 = step(p4, threshold);
  float sel5 = step(p5, threshold);
  float sel6 = step(p6, threshold);

  // Prevent immediate repetition: compute previous interval selections and suppress them
  float prevSeq = seq - 1.0;
  float prevSeed = hash(vec2(prevSeq, 9.0 + u_seed * 137.0));
  int prevTarget = int(floor(prevSeed * 6.0)) + 1;
  float prevThreshold = float(prevTarget) / 6.0;
  float pp1 = hash(vec2(prevSeq, 1.0));
  float pp2 = hash(vec2(prevSeq, 2.0));
  float pp3 = hash(vec2(prevSeq, 3.0));
  float pp4 = hash(vec2(prevSeq, 4.0));
  float pp5 = hash(vec2(prevSeq, 5.0));
  float pp6 = hash(vec2(prevSeq, 6.0));
  float prevSel1 = step(pp1, prevThreshold);
  float prevSel2 = step(pp2, prevThreshold);
  float prevSel3 = step(pp3, prevThreshold);
  float prevSel4 = step(pp4, prevThreshold);
  float prevSel5 = step(pp5, prevThreshold);
  float prevSel6 = step(pp6, prevThreshold);
  // compute previous-sequence offsets and find its earliest selected field
  float prevOff1 = fract(hash(vec2(prevSeq, 11.0)))*interval;
  float prevOff2 = fract(hash(vec2(prevSeq, 12.0)))*interval;
  float prevOff3 = fract(hash(vec2(prevSeq, 13.0)))*interval;
  float prevOff4 = fract(hash(vec2(prevSeq, 14.0)))*interval;
  float prevOff5 = fract(hash(vec2(prevSeq, 15.0)))*interval;
  float prevOff6 = fract(hash(vec2(prevSeq, 16.0)))*interval;
  float prevFirstOff = 1e6; int prevFirstIdx = -1;
  if(prevSel1 > 0.5 && prevOff1 < prevFirstOff) { prevFirstOff = prevOff1; prevFirstIdx = 1; }
  if(prevSel2 > 0.5 && prevOff2 < prevFirstOff) { prevFirstOff = prevOff2; prevFirstIdx = 2; }
  if(prevSel3 > 0.5 && prevOff3 < prevFirstOff) { prevFirstOff = prevOff3; prevFirstIdx = 3; }
  if(prevSel4 > 0.5 && prevOff4 < prevFirstOff) { prevFirstOff = prevOff4; prevFirstIdx = 4; }
  if(prevSel5 > 0.5 && prevOff5 < prevFirstOff) { prevFirstOff = prevOff5; prevFirstIdx = 5; }
  if(prevSel6 > 0.5 && prevOff6 < prevFirstOff) { prevFirstOff = prevOff6; prevFirstIdx = 6; }

  // soften repetition: make the previous-sequence first-direction less likely
  float repeatBias = 0.35; // how much to reduce chance for repeating first direction (0..1)
  float effTh1 = max(0.0, threshold - (prevFirstIdx==1 ? repeatBias : 0.0));
  float effTh2 = max(0.0, threshold - (prevFirstIdx==2 ? repeatBias : 0.0));
  float effTh3 = max(0.0, threshold - (prevFirstIdx==3 ? repeatBias : 0.0));
  float effTh4 = max(0.0, threshold - (prevFirstIdx==4 ? repeatBias : 0.0));
  float effTh5 = max(0.0, threshold - (prevFirstIdx==5 ? repeatBias : 0.0));
  float effTh6 = max(0.0, threshold - (prevFirstIdx==6 ? repeatBias : 0.0));

  sel1 = step(p1, effTh1) * (1.0 - prevSel1);
  sel2 = step(p2, effTh2) * (1.0 - prevSel2);
  sel3 = step(p3, effTh3) * (1.0 - prevSel3);
  sel4 = step(p4, effTh4) * (1.0 - prevSel4);
  sel5 = step(p5, effTh5) * (1.0 - prevSel5);
  sel6 = step(p6, effTh6) * (1.0 - prevSel6);

  
  float win1 = step(off1, phase) * (1.0 - step(off1 + window, phase));
  float win2 = step(off2, phase) * (1.0 - step(off2 + window, phase));
  float win3 = step(off3, phase) * (1.0 - step(off3 + window, phase));
  float win4 = step(off4, phase) * (1.0 - step(off4 + window, phase));
  float win5 = step(off5, phase) * (1.0 - step(off5 + window, phase));
  float win6 = step(off6, phase) * (1.0 - step(off6 + window, phase));

  float a1 = sel1 * win1;
  float a2 = sel2 * win2;
  float a3 = sel3 * win3;
  float a4 = sel4 * win4;
  float a5 = sel5 * win5;
  float a6 = sel6 * win6;

  // compute approximate movement directions for each field (derivative before rotation)
  vec2 dpre1 = vec2(-1.0, 1.0);
  vec2 dpre2 = vec2(1.2 * 1.1, 1.2);
  vec2 dpre3 = vec2(-0.8 * 1.1, 0.0);
  vec2 dpre4 = vec2(0.0, 0.6);
  vec2 dpre5 = vec2(0.9 * 1.1, -0.9);
  vec2 dpre6 = vec2(-1.1 * 1.1, -1.1);

  vec2 dir1 = normalize(rot1 * dpre1);
  vec2 dir2 = normalize(rot2 * dpre2);
  vec2 dir3 = normalize(rot3 * dpre3);
  vec2 dir4 = normalize(rot4 * dpre4);
  vec2 dir5 = normalize(rot5 * dpre5);
  vec2 dir6 = normalize(rot6 * dpre6);

  // prevent two active fields with nearly the same direction (allow opposite)
  // resolve conflicts where two fields point the same way: keep higher-priority (pX)
  float sameThresh = 0.92; // dot > 0.92 considered same direction
  // if both active and same direction, kill the lower-priority one
  if(a1 > 0.5 && a2 > 0.5 && dot(dir1, dir2) > sameThresh) { if(p1 < p2) a1 = 0.0; else a2 = 0.0; }
  if(a1 > 0.5 && a3 > 0.5 && dot(dir1, dir3) > sameThresh) { if(p1 < p3) a1 = 0.0; else a3 = 0.0; }
  if(a1 > 0.5 && a4 > 0.5 && dot(dir1, dir4) > sameThresh) { if(p1 < p4) a1 = 0.0; else a4 = 0.0; }
  if(a1 > 0.5 && a5 > 0.5 && dot(dir1, dir5) > sameThresh) { if(p1 < p5) a1 = 0.0; else a5 = 0.0; }
  if(a1 > 0.5 && a6 > 0.5 && dot(dir1, dir6) > sameThresh) { if(p1 < p6) a1 = 0.0; else a6 = 0.0; }
  if(a2 > 0.5 && a3 > 0.5 && dot(dir2, dir3) > sameThresh) { if(p2 < p3) a2 = 0.0; else a3 = 0.0; }
  if(a2 > 0.5 && a4 > 0.5 && dot(dir2, dir4) > sameThresh) { if(p2 < p4) a2 = 0.0; else a4 = 0.0; }
  if(a2 > 0.5 && a5 > 0.5 && dot(dir2, dir5) > sameThresh) { if(p2 < p5) a2 = 0.0; else a5 = 0.0; }
  if(a2 > 0.5 && a6 > 0.5 && dot(dir2, dir6) > sameThresh) { if(p2 < p6) a2 = 0.0; else a6 = 0.0; }
  if(a3 > 0.5 && a4 > 0.5 && dot(dir3, dir4) > sameThresh) { if(p3 < p4) a3 = 0.0; else a4 = 0.0; }
  if(a3 > 0.5 && a5 > 0.5 && dot(dir3, dir5) > sameThresh) { if(p3 < p5) a3 = 0.0; else a5 = 0.0; }
  if(a3 > 0.5 && a6 > 0.5 && dot(dir3, dir6) > sameThresh) { if(p3 < p6) a3 = 0.0; else a6 = 0.0; }
  if(a4 > 0.5 && a5 > 0.5 && dot(dir4, dir5) > sameThresh) { if(p4 < p5) a4 = 0.0; else a5 = 0.0; }
  if(a4 > 0.5 && a6 > 0.5 && dot(dir4, dir6) > sameThresh) { if(p4 < p6) a4 = 0.0; else a6 = 0.0; }
  if(a5 > 0.5 && a6 > 0.5 && dot(dir5, dir6) > sameThresh) { if(p5 < p6) a5 = 0.0; else a6 = 0.0; }

  // ensure the first two activations (by their offset times) are not the same direction
  float firstOff = 1e6; int firstIdx = -1;
  float secondOff = 1e6; int secondIdx = -1;
  if(a1 > 0.5) { if(off1 < firstOff) { secondOff = firstOff; secondIdx = firstIdx; firstOff = off1; firstIdx = 1; } else if(off1 < secondOff) { secondOff = off1; secondIdx = 1; } }
  if(a2 > 0.5) { if(off2 < firstOff) { secondOff = firstOff; secondIdx = firstIdx; firstOff = off2; firstIdx = 2; } else if(off2 < secondOff) { secondOff = off2; secondIdx = 2; } }
  if(a3 > 0.5) { if(off3 < firstOff) { secondOff = firstOff; secondIdx = firstIdx; firstOff = off3; firstIdx = 3; } else if(off3 < secondOff) { secondOff = off3; secondIdx = 3; } }
  if(a4 > 0.5) { if(off4 < firstOff) { secondOff = firstOff; secondIdx = firstIdx; firstOff = off4; firstIdx = 4; } else if(off4 < secondOff) { secondOff = off4; secondIdx = 4; } }
  if(a5 > 0.5) { if(off5 < firstOff) { secondOff = firstOff; secondIdx = firstIdx; firstOff = off5; firstIdx = 5; } else if(off5 < secondOff) { secondOff = off5; secondIdx = 5; } }
  if(a6 > 0.5) { if(off6 < firstOff) { secondOff = firstOff; secondIdx = firstIdx; firstOff = off6; firstIdx = 6; } else if(off6 < secondOff) { secondOff = off6; secondIdx = 6; } }
  if(firstIdx > 0 && secondIdx > 0) {
    vec2 dFirst = (firstIdx==1?dir1: firstIdx==2?dir2: firstIdx==3?dir3: firstIdx==4?dir4: firstIdx==5?dir5:dir6);
    vec2 dSecond = (secondIdx==1?dir1: secondIdx==2?dir2: secondIdx==3?dir3: secondIdx==4?dir4: secondIdx==5?dir5:dir6);
    if(dot(dFirst, dSecond) > sameThresh) {
      if(secondIdx==1) a1 = 0.0;
      else if(secondIdx==2) a2 = 0.0;
      else if(secondIdx==3) a3 = 0.0;
      else if(secondIdx==4) a4 = 0.0;
      else if(secondIdx==5) a5 = 0.0;
      else if(secondIdx==6) a6 = 0.0;
    }
  }

  // Avoid repeating the same first-direction as previous sequence
  if(prevFirstIdx > 0 && firstIdx > 0) {
    vec2 dPrevFirst = (prevFirstIdx==1?dir1: prevFirstIdx==2?dir2: prevFirstIdx==3?dir3: prevFirstIdx==4?dir4: prevFirstIdx==5?dir5:dir6);
    vec2 dCurFirst = (firstIdx==1?dir1: firstIdx==2?dir2: firstIdx==3?dir3: firstIdx==4?dir4: firstIdx==5?dir5:dir6);
    if(dot(dPrevFirst, dCurFirst) > sameThresh) {
      // deactivate current-first so next candidate becomes first
      if(firstIdx==1) a1 = 0.0;
      else if(firstIdx==2) a2 = 0.0;
      else if(firstIdx==3) a3 = 0.0;
      else if(firstIdx==4) a4 = 0.0;
      else if(firstIdx==5) a5 = 0.0;
      else if(firstIdx==6) a6 = 0.0;
    }
  }

  // ensure at least one active if none fell into windows
  float sumA = a1 + a2 + a3 + a4 + a5 + a6;
  if(sumA < 0.5) {
    // pick first selected field or fallback to field 1
    if(sel1 > 0.5) a1 = 1.0;
    else if(sel2 > 0.5) a2 = 1.0;
    else if(sel3 > 0.5) a3 = 1.0;
    else if(sel4 > 0.5) a4 = 1.0;
    else if(sel5 > 0.5) a5 = 1.0;
    else if(sel6 > 0.5) a6 = 1.0;
    else a1 = 1.0;
  }

  float star1 = ShootingStar(rv1) * a1;
  float star2 = ShootingStar(rv2) * a2;
  float star3 = ShootingStar(rv3) * a3;
  float star4 = ShootingStar(rv4) * a4;
  float star5 = ShootingStar(rv5) * a5;
  float star6 = ShootingStar(rv6) * a6;

  col += vec3(clamp(star1 + star2 + star3 + star4 + star5 + star6, 0.0, 1.0));

  // tone mapping
  col = 1.0 - exp(-col * 1.35);
  gl_FragColor = vec4(col, clamp(length(col), 0.0, 1.0));
}
