"use client";

import { useEffect, useRef, useState } from "react";
import { useSwellLFO } from "@/lib/motion";
import { useTape } from "@/lib/tape";
import { WindRose } from "@/components/ui/WindRose";
import { RotaryDial } from "@/components/ui/RotaryDial";
import { WaveButton } from "@/components/ui/WaveButton";
import { CalmDecay } from "@/components/ui/WaveInput";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  born: number;
};

type Props = {
  height?: number;
  className?: string;
  intensity?: number;
  showControls?: boolean;
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
  uniform float uStorm;
  uniform float uMaelstrom;
  uniform float uFlash;
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
    float s = clamp(uStorm, 0.0, 1.0);
    float m = clamp(uMaelstrom, 0.0, 1.0);
    float seaTop = 0.30;

    vec3 skyCalm  = vec3(0.949, 0.933, 0.902);
    vec3 skyMid   = vec3(0.84, 0.85, 0.86);
    vec3 skyStorm = vec3(0.38, 0.42, 0.50);
    vec3 sky = mix(skyCalm, skyMid, smoothstep(0.0, 0.55, s));
    sky = mix(sky, skyStorm, smoothstep(0.55, 1.0, s));

    float seaV = clamp((uv.y - seaTop) / (1.0 - seaTop), 0.0, 1.0);
    vec3 sea = mix(vec3(0.165, 0.353, 0.549), vec3(0.106, 0.227, 0.392), smoothstep(0.0, 0.5, seaV));
    sea = mix(sea, vec3(0.055, 0.145, 0.251), smoothstep(0.5, 1.0, seaV));

    vec2 vortexCenter = vec2(0.5, 0.65);
    vec2 toCenter = uv - vortexCenter;
    float r = length(toCenter);
    float ang = atan(toCenter.y, toCenter.x);
    float vortexBowl = smoothstep(0.35, 0.0, r) * m;
    float spiralAng = ang + (1.0 / (r + 0.08)) * (0.4 + s * 0.7) - t * (0.4 + s * 0.6);

    vec2 nuv = vec2(uv.x, seaV) * vec2(uRes.x / max(uRes.y, 1.0), 1.0) * (3.0 + s * 1.6)
             + vec2(t * (0.05 + s * 0.15), t * (0.03 + s * 0.10));
    vec2 spiralUv = vec2(spiralAng, r * (4.0 + s * 4.0));
    nuv = mix(nuv, spiralUv * 1.8, m);
    float n = fbm(nuv);

    float c1 = sin((uv.x + n * 0.20) * 18.0 + t * (0.4 + s * 0.8))
             * sin((seaV + n * 0.16) * 12.0 - t * (0.30 + s * 0.5));
    float c2 = sin(uv.x * 7.0 - t * (0.25 + s * 0.4) + n * 1.4)
             * sin(seaV * 5.5 + t * (0.20 + s * 0.3) - n * 1.0);
    float cSpiral = sin(spiralAng * 8.0 + t * 1.2) * sin(r * 30.0 - t * 1.6);
    float caustic = smoothstep(0.4, 1.2, c1 * 0.45 + c2 * 0.40 + cSpiral * m * 0.7);
    float surfMask = 1.0 - smoothstep(0.05, 0.7, seaV);
    sea += caustic * (0.09 + s * 0.18) * mix(vec3(0.75, 0.88, 0.98), vec3(0.92, 0.96, 1.0), s) * surfMask;
    sea *= mix(1.0, 0.84, s);
    sea *= 1.0 - vortexBowl * 0.55;

    float edge = smoothstep(seaTop - 0.005, seaTop + 0.005, uv.y);
    vec3 color = mix(sky, sea, edge);
    color += vec3(uFlash);
    gl_FragColor = vec4(clamp(color, 0.0, 1.5), 1.0);
  }
`;

/**
 * Storm surface — sea at peak intensity.
 * Dual canvas: WebGL storm/maelstrom depth + 2D foam claws, spray, wind streaks.
 * Controls: rotary amp/freq, wind rose, maelstrom toggle, calm decay.
 */
export function StormSurface({
  height = 360,
  className = "",
  intensity = 0.55,
  showControls = true,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const waterRef = useRef<HTMLCanvasElement>(null);
  const foamRef = useRef<HTMLCanvasElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const { pulse } = useTape();
  const { value: swell } = useSwellLFO(0.14, 0.03);

  const [amp, setAmp] = useState(intensity);
  const [freq, setFreq] = useState(0.45);
  const [wind, setWind] = useState(0);
  const [maelstrom, setMaelstrom] = useState(false);

  const ampRef = useRef(amp);
  const freqRef = useRef(freq);
  const windRef = useRef(wind);
  const maelTarget = useRef(0);
  const maelCur = useRef(0);
  const stormCur = useRef(intensity);
  const calmUntil = useRef(0);
  const particles = useRef<Particle[]>([]);
  const lastLightning = useRef(0);
  ampRef.current = amp;
  freqRef.current = freq;
  windRef.current = wind;
  maelTarget.current = maelstrom ? 1 : 0;

  useEffect(() => {
    const wrap = wrapRef.current;
    const water = waterRef.current;
    const foam = foamRef.current;
    if (!wrap || !water || !foam) return;

    const gl =
      (water.getContext("webgl", { antialias: false, premultipliedAlpha: false }) ||
        water.getContext("experimental-webgl" as "webgl", {
          antialias: false,
          premultipliedAlpha: false,
        } as WebGLContextAttributes)) as WebGLRenderingContext | null;
    const fctx = foam.getContext("2d");
    if (!fctx) return;

    let prog: WebGLProgram | null = null;
    let uTime: WebGLUniformLocation | null = null;
    let uRes: WebGLUniformLocation | null = null;
    let uStorm: WebGLUniformLocation | null = null;
    let uMael: WebGLUniformLocation | null = null;
    let uFlash: WebGLUniformLocation | null = null;

    if (gl) {
      const compile = (type: number, src: string) => {
        const s = gl.createShader(type);
        if (!s) return null;
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
          gl.deleteShader(s);
          return null;
        }
        return s;
      };
      const vs = compile(gl.VERTEX_SHADER, VERT);
      const fs = compile(gl.FRAGMENT_SHADER, FRAG);
      if (vs && fs) {
        const p = gl.createProgram();
        if (p) {
          gl.attachShader(p, vs);
          gl.attachShader(p, fs);
          gl.linkProgram(p);
          if (gl.getProgramParameter(p, gl.LINK_STATUS)) {
            prog = p;
            uTime = gl.getUniformLocation(p, "uTime");
            uRes = gl.getUniformLocation(p, "uRes");
            uStorm = gl.getUniformLocation(p, "uStorm");
            uMael = gl.getUniformLocation(p, "uMaelstrom");
            uFlash = gl.getUniformLocation(p, "uFlash");
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
          }
        }
      }
    }

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = mq.matches;
    const onMq = () => {
      reduced = mq.matches;
    };
    mq.addEventListener("change", onMq);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      for (const c of [water, foam]) {
        c.width = Math.floor(w * dpr);
        c.height = Math.floor(h * dpr);
      }
      if (gl) gl.viewport(0, 0, water.width, water.height);
      fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const emitSpray = (x: number, y: number, n: number, s: number) => {
      for (let i = 0; i < n; i++) {
        particles.current.push({
          x,
          y,
          vx: (Math.random() - 0.5) * (2 + s * 6),
          vy: -Math.random() * (1.5 + s * 4),
          life: 0.6 + Math.random() * 0.8,
          born: performance.now(),
        });
      }
      if (particles.current.length > 280) {
        particles.current.splice(0, particles.current.length - 280);
      }
    };

    const onPointer = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (y < rect.height * 0.28) return;
      emitSpray(x, y, 10 + Math.floor(ampRef.current * 14), ampRef.current);
      pulse("ripple", 0.45 + ampRef.current * 0.4);
    };
    wrap.addEventListener("pointerdown", onPointer);

    const t0 = performance.now();
    let raf = 0;
    let flash = 0;

    const draw = (now: number) => {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      const t = reduced ? 0 : (now - t0) / 1000;

      let calm = 1;
      if (calmUntil.current > now) {
        const left = (calmUntil.current - now) / 2000;
        calm = Math.pow(Math.max(0, left), 3);
      }
      const target = Math.min(1, ampRef.current) * calm;
      stormCur.current += (target - stormCur.current) * 0.1;
      maelCur.current += (maelTarget.current - maelCur.current) * 0.06;
      const s = stormCur.current;
      const ml = maelCur.current;
      const freqMul = 0.6 + freqRef.current * 1.4;

      if (!reduced && s > 0.8 && now - lastLightning.current > 5500) {
        if (Math.random() < 0.018) {
          lastLightning.current = now;
          flash = 0.75;
          const fl = flashRef.current;
          if (fl) {
            fl.style.opacity = "0.55";
            window.setTimeout(() => {
              if (fl) fl.style.opacity = "0";
            }, 90);
          }
          pulse("strike", 0.9);
        }
      }
      flash *= 0.88;

      if (gl && prog) {
        gl.useProgram(prog);
        if (uTime) gl.uniform1f(uTime, t);
        if (uRes) gl.uniform2f(uRes, water.width, water.height);
        if (uStorm) gl.uniform1f(uStorm, s);
        if (uMael) gl.uniform1f(uMael, ml);
        if (uFlash) gl.uniform1f(uFlash, flash);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }

      fctx.clearRect(0, 0, w, h);
      const seaTop = h * 0.3;
      const windSkew = Math.cos(windRef.current) * (4 + s * 10);
      const windPhase = Math.cos(windRef.current);

      // foam layers
      for (let layer = 0; layer < 5; layer++) {
        const baseY = seaTop + h * (0.08 + layer * 0.12);
        const ampPx = (10 + layer * 5) * (0.35 + s * 1.1);
        const speed = (0.55 + layer * 0.18) * freqMul * (windPhase >= 0 ? 1 : -1);
        fctx.beginPath();
        for (let x = 0; x <= w; x += 4) {
          let y =
            baseY +
            Math.sin(x * 0.012 + t * speed + layer) * ampPx +
            Math.sin(x * 0.028 - t * speed * 0.7 + layer * 1.3) * ampPx * 0.45;
          if (ml > 0.01) {
            const cx = w * 0.5;
            const cy = h * 0.62;
            const dx = x - cx;
            const dy = y - cy;
            const r = Math.hypot(dx, dy) + 1;
            const ang = Math.atan2(dy, dx) + ml * (0.8 / (r * 0.01 + 0.2));
            const nr = r * (1 - ml * 0.35);
            y = cy + Math.sin(ang) * nr;
            const xx = cx + Math.cos(ang) * nr + windSkew;
            if (x === 0) fctx.moveTo(xx, y);
            else fctx.lineTo(xx, y);
            continue;
          }
          const xx = x + windSkew;
          if (x === 0) fctx.moveTo(xx, y);
          else fctx.lineTo(xx, y);
        }
        fctx.strokeStyle =
          layer === 0
            ? `rgba(244,248,255,${0.35 + s * 0.35})`
            : `rgba(180,210,230,${0.12 + s * 0.18})`;
        fctx.lineWidth = layer === 0 ? 1.6 : 1.1;
        fctx.stroke();

        // breaking claws on crest layer
        if (layer === 0 && s > 0.35 && !reduced) {
          for (let x = 20; x < w; x += 48) {
            const crest =
              baseY +
              Math.sin(x * 0.012 + t * speed) * ampPx -
              ampPx * 0.85;
            if (Math.sin(x * 0.04 + t * 2) > 0.7) {
              fctx.beginPath();
              fctx.moveTo(x - 6, crest);
              fctx.quadraticCurveTo(x, crest - 8 - s * 10, x + 8, crest + 2);
              fctx.strokeStyle = `rgba(255,255,255,${0.25 + s * 0.4})`;
              fctx.lineWidth = 1.2;
              fctx.stroke();
              if (Math.random() < 0.04 * s) emitSpray(x, crest, 3, s);
            }
          }
        }
      }

      // spray particles
      const cx = w * 0.5;
      const cy = h * 0.62;
      particles.current = particles.current.filter((p) => {
        const age = (now - p.born) / 1000;
        if (age > p.life) return false;
        if (ml > 0.2) {
          const dx = p.x - cx;
          const dy = p.y - cy;
          const r = Math.hypot(dx, dy) + 1;
          p.vx += (-dy / r) * ml * 0.35 - (dx / r) * ml * 0.08;
          p.vy += (dx / r) * ml * 0.35 - (dy / r) * ml * 0.08;
        }
        p.vy += 0.08;
        p.x += p.vx;
        p.y += p.vy;
        const a = (1 - age / p.life) * (0.45 + s * 0.4);
        fctx.fillStyle = `rgba(230,240,255,${a})`;
        fctx.fillRect(p.x, p.y, 1.6, 1.6);
        return true;
      });

      // wind streaks in sky
      if (s > 0.25 && !reduced) {
        fctx.strokeStyle = `rgba(255,255,255,${0.08 + s * 0.12})`;
        fctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
          const y = h * (0.06 + i * 0.04) + Math.sin(t + i) * 4;
          const x0 = ((t * (40 + s * 80) * Math.cos(windRef.current) + i * 90) % (w + 80)) - 40;
          fctx.beginPath();
          fctx.moveTo(x0, y);
          fctx.lineTo(x0 + 30 + s * 40, y + Math.sin(windRef.current) * 6);
          fctx.stroke();
        }
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      wrap.removeEventListener("pointerdown", onPointer);
      mq.removeEventListener("change", onMq);
    };
  }, [pulse]);

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ height }}>
      <div ref={wrapRef} className="absolute inset-0">
        <canvas ref={waterRef} className="absolute inset-0 h-full w-full" />
        <canvas ref={foamRef} className="absolute inset-0 h-full w-full" />
        <div
          ref={flashRef}
          className="pointer-events-none absolute inset-0 bg-white opacity-0 transition-opacity duration-75"
          aria-hidden
        />
      </div>

      {showControls ? (
        <div className="absolute inset-x-0 bottom-0 z-10 flex flex-wrap items-end justify-between gap-4 p-4 surface-deep text-on-deep">
          <div className="flex items-end gap-4">
            <RotaryDial
              value={amp}
              onChange={setAmp}
              secondary={freq}
              onSecondaryChange={setFreq}
              rings={2}
              label="helm"
              size={112}
            />
            <WindRose value={wind} onChange={setWind} size={88} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <WaveButton
              register="oceanic"
              onClick={() => {
                setMaelstrom((v) => !v);
                pulse("ripple", 0.8);
              }}
            >
              {maelstrom ? "release vortex" : "maelstrom"}
            </WaveButton>
            <CalmDecay
              onCalm={() => {
                calmUntil.current = performance.now() + 2000;
                setAmp(0.08);
                setMaelstrom(false);
                pulse("calm", 0.7);
              }}
            >
              still the sea
            </CalmDecay>
          </div>
        </div>
      ) : null}
      <span className="sr-only">
        storm surface · swell {swell.toFixed(2)} · intensity {amp.toFixed(2)}
      </span>
    </div>
  );
}
