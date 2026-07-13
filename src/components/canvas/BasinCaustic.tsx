"use client";

import { useEffect, useRef } from "react";
import { useSwellLFO } from "@/lib/motion";
import { themeCanvasColors, rgba } from "@/lib/colors";

const VERT = `
  attribute vec2 a_pos;
  varying vec2 vUv;
  void main() {
    vUv = a_pos * 0.5 + 0.5;
    gl_Position = vec4(a_pos, 0.0, 1.0);
  }
`;

/** Quiet under-island caustic — the one shared basin material. */
const FRAG = `
  precision mediump float;
  uniform float uTime;
  uniform float uSwell;
  uniform float uDrift;
  uniform vec3 uPaper;
  uniform vec3 uSea;
  uniform vec3 uHaze;
  uniform vec3 uCandle;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p *= 2.05;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime * 0.35;
    vec2 flow = vec2(
      sin(uv.y * 6.0 + t + uDrift) * 0.02,
      cos(uv.x * 5.0 - t * 0.8 + uSwell) * 0.015
    );
    float n = fbm(uv * 3.2 + flow + vec2(t * 0.08, t * 0.05));
    float c1 = sin((uv.x + n * 0.2) * 18.0 + t)
             * sin((uv.y + n * 0.15) * 12.0 - t * 0.7);
    float c2 = sin((uv.x + uv.y) * 10.0 + n * 2.0 - t * 0.5);
    float caustic = smoothstep(0.35, 0.95, c1 * 0.55 + c2 * 0.45);

    vec3 base = mix(uPaper, uHaze, 0.22 + uSwell * 0.04);
    base = mix(base, uSea, 0.08 + uv.y * 0.1);
    vec3 color = base + caustic * 0.12 * mix(uHaze, uCandle, 0.35);
    float vignette = smoothstep(0.0, 0.35, length(uv - 0.5));
    color = mix(color, uSea * 0.35 + uPaper * 0.65, vignette * 0.12);

    gl_FragColor = vec4(color, 0.55);
  }
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    gl.deleteShader(s);
    return null;
  }
  return s;
}

/**
 * Shared basin material — one quiet WebGL caustic under a content island.
 * Policy: ≤1 per viewport region. Pauses when off-screen / reduced-motion.
 * Falls back to a soft 2D wash when GL is unavailable.
 */
export function BasinCaustic({
  className = "",
  intensity = 0.55,
}: {
  className?: string;
  intensity?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { value: swell, drift } = useSwellLFO(0.09, 0.03);
  const swellRef = useRef(swell);
  const driftRef = useRef(drift);
  const visibleRef = useRef(true);
  swellRef.current = swell;
  driftRef.current = drift;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = mq.matches;
    const onMq = () => {
      reduced = mq.matches;
    };
    mq.addEventListener("change", onMq);

    const io = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry?.isIntersecting ?? true;
      },
      { rootMargin: "40px", threshold: 0.01 }
    );
    io.observe(parent);

    const gl =
      (canvas.getContext("webgl", {
        alpha: true,
        premultipliedAlpha: true,
        antialias: false,
      }) as WebGLRenderingContext | null) || null;

    let prog: WebGLProgram | null = null;
    let uTime: WebGLUniformLocation | null = null;
    let uSwell: WebGLUniformLocation | null = null;
    let uDrift: WebGLUniformLocation | null = null;
    let uPaper: WebGLUniformLocation | null = null;
    let uSea: WebGLUniformLocation | null = null;
    let uHaze: WebGLUniformLocation | null = null;
    let uCandle: WebGLUniformLocation | null = null;
    const ctx2d = !gl ? canvas.getContext("2d") : null;

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
            prog = p;
            uTime = gl.getUniformLocation(p, "uTime");
            uSwell = gl.getUniformLocation(p, "uSwell");
            uDrift = gl.getUniformLocation(p, "uDrift");
            uPaper = gl.getUniformLocation(p, "uPaper");
            uSea = gl.getUniformLocation(p, "uSea");
            uHaze = gl.getUniformLocation(p, "uHaze");
            uCandle = gl.getUniformLocation(p, "uCandle");
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
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
          }
        }
      }
    }

    const parseRgb = (triplet: string): [number, number, number] => {
      const [r, g, b] = triplet.split(",").map((x) => Number(x.trim()) / 255);
      return [r || 0, g || 0, b || 0];
    };

    let raf = 0;
    const t0 = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      if (gl) gl.viewport(0, 0, canvas.width, canvas.height);
      if (ctx2d) ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (!visibleRef.current) return;

      const w = parent.clientWidth;
      const h = parent.clientHeight;
      const t = (now - t0) / 1000;
      const s = reduced ? 0 : swellRef.current;
      const d = reduced ? 0 : driftRef.current;
      const c = themeCanvasColors();

      if (gl && prog && !reduced) {
        gl.useProgram(prog);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(uTime, t);
        gl.uniform1f(uSwell, s * intensity);
        gl.uniform1f(uDrift, d);
        const paper = parseRgb(c.paperRgb);
        const sea = parseRgb(c.seaRgb);
        const haze = parseRgb(c.hazeRgb);
        const candle = parseRgb(c.candleRgb);
        gl.uniform3f(uPaper, paper[0], paper[1], paper[2]);
        gl.uniform3f(uSea, sea[0], sea[1], sea[2]);
        gl.uniform3f(uHaze, haze[0], haze[1], haze[2]);
        gl.uniform3f(uCandle, candle[0], candle[1], candle[2]);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      } else if (ctx2d) {
        ctx2d.clearRect(0, 0, w, h);
        const g = ctx2d.createRadialGradient(
          w * 0.45,
          h * 0.35,
          8,
          w * 0.5,
          h * 0.5,
          Math.max(w, h) * 0.7
        );
        g.addColorStop(0, rgba(c.hazeRgb, 0.18 * intensity));
        g.addColorStop(0.55, rgba(c.paperRgb, 0.35));
        g.addColorStop(1, rgba(c.seaRgb, 0.12 * intensity));
        ctx2d.fillStyle = g;
        ctx2d.fillRect(0, 0, w, h);
      }
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      mq.removeEventListener("change", onMq);
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}
