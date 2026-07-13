"use client";

import { useCallback, useEffect, useRef } from "react";
import { useSwellLFO } from "@/lib/motion";
import { useTape } from "@/lib/tape";

type Ripple = { x: number; y: number; t0: number; strength: number };

type Props = {
  className?: string;
  intensity?: number;
  height?: number;
  showFoam?: boolean;
  label?: string;
};

const VERT = `
  attribute vec2 a_pos;
  varying vec2 vUv;
  void main() {
    vUv = a_pos * 0.5 + 0.5;
    gl_Position = vec4(a_pos, 0.0, 1.0);
  }
`;

const FRAG = `
  precision highp float;
  uniform float uTime;
  uniform vec2 uRes;
  uniform float uSwell;
  uniform vec4 uRipples[12];
  uniform int uRippleCount;
  varying vec2 vUv;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * vnoise(p);
      p *= 2.07;
      a *= 0.52;
    }
    return v;
  }

  void main() {
    vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
    float t = uTime;

    float rippleHi = 0.0;
    for (int i = 0; i < 12; i++) {
      if (i >= uRippleCount) break;
      vec4 r = uRipples[i];
      vec2 dp = uv - r.xy;
      float dist = length(dp);
      float age = r.z;
      if (age > 2.6) continue;
      float front = dist - age * 0.32;
      float env = exp(-(front * front) / 0.0030);
      float falloff = 1.0 / (1.0 + dist * 3.5);
      float temporal = max(0.0, 1.0 - age / 2.6);
      rippleHi += r.w * env * falloff * temporal;
    }

    vec2 flow = vec2(
      sin(uv.y * 8.0 + t * 0.40) * 0.018,
      sin(uv.x * 6.0 + t * 0.30) * 0.012
    );
    vec2 wuv = uv + flow + vec2(0.0, uSwell * 0.012);
    wuv += rippleHi * 0.012;

    vec3 azure    = vec3(0.50, 0.69, 0.81);
    vec3 cerulean = vec3(0.24, 0.48, 0.69);
    vec3 ultram   = vec3(0.15, 0.32, 0.55);
    vec3 prussian = vec3(0.07, 0.15, 0.30);

    vec3 color = mix(azure, cerulean, smoothstep(0.05, 0.42, wuv.y));
    color = mix(color, ultram, smoothstep(0.42, 0.78, wuv.y));
    color = mix(color, prussian, smoothstep(0.78, 1.0, wuv.y));

    vec2 nuv = wuv * vec2(uRes.x / max(uRes.y, 1.0), 1.0) * 3.4 + vec2(t * 0.05, t * 0.03);
    float n = fbm(nuv);
    float c1 = sin((wuv.x + n * 0.18) * 22.0 + t * 0.55)
             * sin((wuv.y + n * 0.14) * 14.0 - t * 0.38);
    float c2 = sin(wuv.x * 9.0 - t * 0.30 + n * 1.2)
             * sin(wuv.y * 6.5 + t * 0.22 - n * 1.0);
    float c3 = sin((wuv.x + wuv.y + n * 0.4) * 13.0 + t * 0.33);
    float caustic = c1 * 0.40 + c2 * 0.55 + c3 * 0.30;
    caustic = smoothstep(0.55, 1.10, caustic);

    float surfMask = 1.0 - smoothstep(0.05, 0.6, wuv.y);
    float audioBoost = 0.11 + clamp(uSwell, -1.0, 1.0) * 0.065;
    color += caustic * audioBoost * mix(vec3(1.0), vec3(0.70, 0.90, 1.00), wuv.y) * surfMask;
    color += rippleHi * 0.55 * vec3(0.70, 0.92, 1.00);

    float wash = sin(wuv.x * 1.8 + t * 0.12) * sin(wuv.y * 2.6 - t * 0.07);
    color += wash * 0.025 * vec3(0.85, 0.92, 1.0);

    float haze = smoothstep(0.0, 0.10, wuv.y) * (1.0 - smoothstep(0.10, 0.30, wuv.y));
    color = mix(color, vec3(0.80, 0.88, 0.93), haze * 0.30);

    float topFade = smoothstep(0.0, 0.02, wuv.y);
    color = mix(vec3(0.949, 0.933, 0.902), color, topFade);

    gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
  }
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.warn(gl.getShaderInfoLog(s));
    gl.deleteShader(s);
    return null;
  }
  return s;
}

/**
 * Canonical dual-layer sea: WebGL depth/caustics under 2D foam + ripples.
 * Ported from objet d'art Sea — the water-as-template reference.
 */
export function SeaSurface({
  className = "",
  intensity = 0.85,
  height = 280,
  showFoam = true,
  label,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const glRef = useRef<HTMLCanvasElement>(null);
  const foamRef = useRef<HTMLCanvasElement>(null);
  const ripples = useRef<Ripple[]>([]);
  const pointer = useRef<{ x: number; y: number; down: boolean } | null>(null);
  const lastEmit = useRef(0);
  const { value: swell, drift } = useSwellLFO(0.14, 0.03);
  const swellRef = useRef(swell);
  const driftRef = useRef(drift);
  const { pulse } = useTape();
  swellRef.current = swell;
  driftRef.current = drift;

  const addRipple = useCallback(
    (x: number, y: number, strength: number, record = true) => {
      ripples.current.push({
        x,
        y,
        t0: performance.now(),
        strength: strength * intensity,
      });
      if (ripples.current.length > 12) ripples.current.shift();
      if (record) pulse("ripple", strength * intensity);
    },
    [intensity, pulse]
  );

  useEffect(() => {
    const wrap = wrapRef.current;
    const water = glRef.current;
    const lines = foamRef.current;
    if (!wrap || !water || !lines) return;
    const lctx = lines.getContext("2d");
    if (!lctx) return;

    const gl =
      (water.getContext("webgl", {
        antialias: false,
        premultipliedAlpha: false,
      }) as WebGLRenderingContext | null) ||
      (water.getContext("experimental-webgl" as "webgl", {
        antialias: false,
        premultipliedAlpha: false,
      } as WebGLContextAttributes) as WebGLRenderingContext | null);

    let glProg: WebGLProgram | null = null;
    let uTime: WebGLUniformLocation | null = null;
    let uRes: WebGLUniformLocation | null = null;
    let uSwell: WebGLUniformLocation | null = null;
    let uRipples: WebGLUniformLocation | null = null;
    let uRippleCount: WebGLUniformLocation | null = null;

    if (gl) {
      const vs = compile(gl, gl.VERTEX_SHADER, VERT);
      const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
      if (vs && fs) {
        const p = gl.createProgram();
        if (p) {
          gl.attachShader(p, vs);
          gl.attachShader(p, fs);
          gl.linkProgram(p);
          if (gl.getProgramParameter(p, gl.LINK_STATUS)) {
            glProg = p;
            uTime = gl.getUniformLocation(p, "uTime");
            uRes = gl.getUniformLocation(p, "uRes");
            uSwell = gl.getUniformLocation(p, "uSwell");
            uRipples = gl.getUniformLocation(p, "uRipples");
            uRippleCount = gl.getUniformLocation(p, "uRippleCount");
            const buf = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buf);
            gl.bufferData(
              gl.ARRAY_BUFFER,
              new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
              gl.STATIC_DRAW
            );
            const loc = gl.getAttribLocation(p, "a_pos");
            gl.enableVertexAttribArray(loc);
            gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
            gl.useProgram(p);
          }
        }
      }
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      water.width = Math.floor(w * dpr);
      water.height = Math.floor(h * dpr);
      lines.width = Math.floor(w * dpr);
      lines.height = Math.floor(h * dpr);
      lctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (gl) gl.viewport(0, 0, water.width, water.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const t0 = performance.now();
    let raf = 0;

    const draw = (now: number) => {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      const s = swellRef.current;
      const d = driftRef.current;
      const t = (now - t0) / 1000;

      // prune
      ripples.current = ripples.current.filter((r) => now - r.t0 < 2600);

      // WebGL pass
      if (gl && glProg) {
        gl.useProgram(glProg);
        gl.uniform1f(uTime, t);
        gl.uniform2f(uRes, w, h);
        gl.uniform1f(uSwell, s);
        const arr = new Float32Array(48);
        const count = Math.min(12, ripples.current.length);
        for (let i = 0; i < count; i++) {
          const r = ripples.current[i];
          arr[i * 4] = r.x / w;
          arr[i * 4 + 1] = r.y / h;
          arr[i * 4 + 2] = (now - r.t0) / 1000;
          arr[i * 4 + 3] = r.strength;
        }
        gl.uniform4fv(uRipples, arr);
        gl.uniform1i(uRippleCount, count);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      } else {
        // 2D fallback depth
        const g = lctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, "#8eb6c9");
        g.addColorStop(0.4, "#3d6f8a");
        g.addColorStop(1, "#0c1c28");
        lctx.fillStyle = g;
        lctx.fillRect(0, 0, w, h);
      }

      // 2D foam / swell lines
      lctx.clearRect(0, 0, w, h);
      if (showFoam) {
        for (let i = 0; i < 5; i++) {
          lctx.beginPath();
          const baseY = h * (0.42 + i * 0.1) + s * 5;
          for (let x = 0; x <= w; x += 3) {
            let y =
              baseY +
              Math.sin(x * 0.012 + t * 1.8 + i * 2 + d) * (9 + i * 2.5) +
              Math.sin(x * 0.033 + t * 1.1) * 4;
            for (const r of ripples.current) {
              const age = (now - r.t0) / 1000;
              const dist = Math.hypot(x - r.x, (y - r.y) * 0.55);
              const radius = age * 160;
              const ring = Math.exp(-Math.pow((dist - radius) / 22, 2));
              const decay = Math.exp(-age * 1.5);
              y += ring * decay * r.strength * 16;
            }
            if (x === 0) lctx.moveTo(x, y);
            else lctx.lineTo(x, y);
          }
          lctx.strokeStyle = `rgba(242,238,230,${0.42 - i * 0.06})`;
          lctx.lineWidth = i === 0 ? 1.75 : 1.2;
          lctx.stroke();
        }

        // foam dabs at crests
        for (let i = 0; i < 3; i++) {
          const baseY = h * (0.5 + i * 0.08) + s * 4;
          for (let x = 20; x < w; x += 28) {
            const crest =
              Math.sin(x * 0.012 + t * 1.8 + i * 2) *
              Math.sin(x * 0.033 + t * 1.1);
            if (crest > 0.65) {
              lctx.beginPath();
              lctx.arc(x, baseY + crest * 6, 1.6, 0, Math.PI * 2);
              lctx.fillStyle = `rgba(242,238,230,${0.35 + crest * 0.25})`;
              lctx.fill();
            }
          }
        }
      }

      // moon glint
      const gx = w * (0.72 + d * 0.02);
      const gy = h * 0.18;
      const glint = lctx.createRadialGradient(gx, gy, 0, gx, gy, 70);
      glint.addColorStop(0, "rgba(255,255,255,0.28)");
      glint.addColorStop(1, "rgba(255,255,255,0)");
      lctx.fillStyle = glint;
      lctx.fillRect(gx - 70, gy - 40, 140, 80);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [showFoam]);

  const local = (e: React.PointerEvent) => {
    const rect = wrapRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  return (
    <div
      ref={wrapRef}
      className={`relative overflow-hidden ${className}`}
      style={{ height }}
      data-touch-surface
      onPointerDown={(e) => {
        const p = local(e);
        pointer.current = { ...p, down: true };
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        addRipple(p.x, p.y, 1);
      }}
      onPointerMove={(e) => {
        const p = local(e);
        const now = performance.now();
        if (pointer.current?.down) {
          if (now - lastEmit.current > 70) {
            addRipple(p.x, p.y, 0.5);
            lastEmit.current = now;
          }
        } else if (now - lastEmit.current > 200) {
          addRipple(p.x, p.y, 0.18, false);
          lastEmit.current = now;
        }
      }}
      onPointerUp={() => {
        pointer.current = null;
      }}
      onPointerCancel={() => {
        pointer.current = null;
      }}
    >
      <canvas ref={glRef} className="absolute inset-0 h-full w-full" />
      <canvas
        ref={foamRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
      {label ? (
        <span className="pointer-events-none absolute left-4 top-4 z-10 t-eyebrow text-on-deep/80">
          {label}
        </span>
      ) : null}
      <span className="pointer-events-none absolute bottom-3 right-4 z-10 t-meta text-on-deep/40">
        webgl caustics · touch for ripples
      </span>
    </div>
  );
}
