"use client";

/**
 * Ten innovative wave-morphism controls —
 * inventions beyond scale ports: calendar, auth, scroll, focus, select, form…
 */

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useTape } from "@/lib/tape";
import { useSwellLFO } from "@/lib/motion";
import { themeCanvasColors, rgba } from "@/lib/colors";

/* ═══════════════════════════════════════════
   1. Tide Calendar
   ═══════════════════════════════════════════ */

function daysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate();
}

/** Lunar-ish tide height 0..1 for day-of-month (deterministic demo). */
function tideHeight(day: number, month: number) {
  const phase = (day + month * 2.1) * 0.21;
  return 0.35 + 0.35 * Math.sin(phase) + 0.15 * Math.sin(phase * 2.3);
}

export function TideCalendar({
  year = new Date().getFullYear(),
  month = new Date().getMonth(),
  range,
  onRangeChange,
  className = "",
}: {
  year?: number;
  month?: number;
  range?: [number, number] | null;
  onRangeChange?: (r: [number, number] | null) => void;
  className?: string;
}) {
  const { pulse } = useTape();
  const { value: swell } = useSwellLFO(0.1, 0.03);
  const [internal, setInternal] = useState<[number, number] | null>(null);
  const sel = range !== undefined ? range : internal;
  const setSel = (r: [number, number] | null) => {
    if (onRangeChange) onRangeChange(r);
    else setInternal(r);
  };
  const drag = useRef<"a" | "b" | null>(null);
  const n = daysInMonth(year, month);
  const w = 360;
  const h = 140;
  const pad = 16;

  const xOf = (day: number) => pad + ((day - 1) / Math.max(1, n - 1)) * (w - pad * 2);
  const yOf = (day: number) => {
    const t = tideHeight(day, month);
    return h * 0.75 - t * h * 0.45 + swell * 2;
  };

  let swellPath = `M ${xOf(1)} ${yOf(1)}`;
  for (let d = 2; d <= n; d++) swellPath += ` L ${xOf(d)} ${yOf(d)}`;

  const dayFromX = (clientX: number, el: Element) => {
    const r = el.getBoundingClientRect();
    const t = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    return Math.round(1 + t * (n - 1));
  };

  const inRange = (d: number) => {
    if (!sel) return false;
    const [a, b] = sel[0] <= sel[1] ? sel : [sel[1], sel[0]];
    return d >= a && d <= b;
  };

  const monthName = new Date(year, month).toLocaleString("en", { month: "long" });

  return (
    <div className={`select-none ${className}`}>
      <p className="mb-2 t-eyebrow text-sea">
        {monthName} {year} · drag crests to range
      </p>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-auto w-full touch-none"
        role="group"
        aria-label="tide calendar"
        onPointerDown={(e) => {
          const day = dayFromX(e.clientX, e.currentTarget);
          drag.current = "b";
          setSel([day, day]);
          e.currentTarget.setPointerCapture(e.pointerId);
          pulse("ripple", 0.35);
        }}
        onPointerMove={(e) => {
          if (!drag.current || !sel) return;
          const day = dayFromX(e.clientX, e.currentTarget);
          setSel([sel[0], day]);
        }}
        onPointerUp={() => {
          drag.current = null;
          pulse("release", 0.3);
        }}
      >
        <rect width={w} height={h} fill="rgba(var(--deep-rgb), 0.25)" />
        {/* high/low marks */}
        {Array.from({ length: n }, (_, i) => {
          const d = i + 1;
          const x = xOf(d);
          const y = yOf(d);
          const high = tideHeight(d, month) > 0.65;
          const low = tideHeight(d, month) < 0.4;
          return (
            <g key={d}>
              <line
                x1={x}
                y1={y}
                x2={x}
                y2={h * 0.82}
                stroke={
                  inRange(d)
                    ? "rgba(var(--candle-rgb), 0.45)"
                    : "rgba(var(--sea-rgb), 0.15)"
                }
                strokeWidth={1}
              />
              <circle
                cx={x}
                cy={y}
                r={inRange(d) ? 4.5 : high || low ? 3.5 : 2.5}
                fill={
                  inRange(d)
                    ? "var(--candle)"
                    : high
                      ? "var(--crest)"
                      : low
                        ? "var(--sea)"
                        : "rgba(var(--ink-rgb), 0.25)"
                }
              />
              {(d === 1 || d % 5 === 0 || d === n) && (
                <text
                  x={x}
                  y={h - 8}
                  textAnchor="middle"
                  fill="var(--ink-2)"
                  fontSize={9}
                  fontFamily="var(--font-text)"
                >
                  {d}
                </text>
              )}
            </g>
          );
        })}
        <path
          d={swellPath}
          fill="none"
          stroke="rgba(var(--crest-rgb), 0.85)"
          strokeWidth={1.75}
          strokeLinecap="round"
        />
        {sel ? (
          <rect
            x={Math.min(xOf(sel[0]), xOf(sel[1]))}
            y={8}
            width={Math.abs(xOf(sel[1]) - xOf(sel[0]))}
            height={h - 28}
            fill="rgba(var(--candle-rgb), 0.08)"
            stroke="rgba(var(--candle-rgb), 0.35)"
            strokeWidth={1}
          />
        ) : null}
      </svg>
      <p className="mt-2 t-meta text-ink-2">
        {sel
          ? `range · day ${Math.min(sel[0], sel[1])} → ${Math.max(sel[0], sel[1])}`
          : "drag between crests"}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════
   2. Resonance Match
   ═══════════════════════════════════════════ */

function waveY(x: number, phase: number, freq: number, amp: number, mid: number) {
  return (
    mid +
    Math.sin(x * freq + phase) * amp +
    Math.sin(x * freq * 2.1 - phase * 0.7) * amp * 0.35
  );
}

export function ResonanceMatch({
  onUnlock,
  className = "",
  label = "confirm · phase-lock to submit",
}: {
  onUnlock?: () => void;
  className?: string;
  label?: string;
}) {
  const { pulse } = useTape();
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [phaseA, setPhaseA] = useState(0);
  const [phaseB, setPhaseB] = useState(1.2);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // typing shifts phase; match when strings equal AND phases close
  useEffect(() => {
    setPhaseA((p) => p + a.length * 0.35 + (a.charCodeAt(a.length - 1) || 0) * 0.01);
  }, [a]);
  useEffect(() => {
    setPhaseB((p) => p + b.length * 0.35 + (b.charCodeAt(b.length - 1) || 0) * 0.01);
  }, [b]);

  const match = a.length > 0 && a === b;
  // nudge phases toward lock when strings match
  useEffect(() => {
    if (!match) return;
    const id = window.setInterval(() => {
      setPhaseA((pa) => {
        setPhaseB((pb) => pb + (pa - pb) * 0.12);
        return pa;
      });
    }, 40);
    return () => clearInterval(id);
  }, [match]);

  const locked = match && Math.abs(((phaseA - phaseB + Math.PI) % (Math.PI * 2)) - Math.PI) < 0.25;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const c = themeCanvasColors();
      ctx.fillStyle = rgba(c.deepRgb, 0.9);
      ctx.fillRect(0, 0, w, h);
      const mid = h / 2;
      const amp = h * 0.22;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 2) {
        const y = waveY(x * 0.04, phaseA, 1, amp, mid);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = rgba(c.candleRgb, 0.85);
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.beginPath();
      for (let x = 0; x <= w; x += 2) {
        const y = waveY(x * 0.04, phaseB, 1, amp, mid);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = rgba(c.crestRgb, locked ? 0.95 : 0.55);
      ctx.lineWidth = locked ? 2.2 : 1.4;
      ctx.stroke();
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [phaseA, phaseB, locked]);

  return (
    <div className={`space-y-3 ${className}`}>
      <p className="t-eyebrow text-sea">{label}</p>
      <canvas ref={canvasRef} className="h-24 w-full" />
      <input
        type="password"
        value={a}
        onChange={(e) => setA(e.target.value)}
        placeholder="wave A"
        className="tide-field w-full px-3 py-2 font-mono text-sm text-ink"
        autoComplete="new-password"
      />
      <input
        type="password"
        value={b}
        onChange={(e) => setB(e.target.value)}
        placeholder="wave B · confirm"
        className="tide-field w-full px-3 py-2 font-mono text-sm text-ink"
        autoComplete="new-password"
      />
      <button
        type="button"
        disabled={!locked}
        onClick={() => {
          pulse("ritual", 0.8);
          onUnlock?.();
        }}
        className="w-full py-2.5 t-meta transition-opacity duration-wave disabled:opacity-35"
        style={{
          background: locked ? "rgba(var(--sea-rgb), 0.2)" : "rgba(var(--ink-rgb), 0.06)",
          color: "var(--ink)",
        }}
      >
        {locked ? "phase-locked · submit" : match ? "locking…" : "awaiting resonance"}
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════
   3. Undertow Scroll — re-export core
   ═══════════════════════════════════════════ */

export { UndertowScroll } from "@/components/ui/UndertowScroll";

/* ═══════════════════════════════════════════
   4. Caustic Focus — re-export core
   ═══════════════════════════════════════════ */

export { CausticFocusRoot, CausticFocusDemo } from "@/components/ui/CausticFocus";

/* ═══════════════════════════════════════════
   5. Harmonic Stepper
   ═══════════════════════════════════════════ */

function playPartial(freq: number, gain = 0.08) {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.4);
    window.setTimeout(() => ctx.close(), 500);
  } catch {
    /* noop */
  }
}

export function HarmonicStepper({
  value,
  onChange,
  min = 0,
  max = 8,
  fundamental = 110,
  className = "",
  label = "harmonics",
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  fundamental?: number;
  className?: string;
  label?: string;
}) {
  const { pulse } = useTape();
  const v = Math.max(min, Math.min(max, value));

  const bump = (dir: 1 | -1) => {
    const next = Math.max(min, Math.min(max, v + dir));
    onChange(next);
    pulse("dial", 0.35);
    // stack partials 1..n
    for (let i = 1; i <= Math.max(1, next); i++) {
      window.setTimeout(() => playPartial(fundamental * i, 0.05 / i), i * 30);
    }
  };

  return (
    <div className={`inline-flex flex-col items-center gap-2 ${className}`}>
      <p className="t-eyebrow text-ink-2">{label}</p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => bump(-1)}
          className="h-10 w-10 t-meta text-sea"
          aria-label="decrement"
        >
          −
        </button>
        <svg width={120} height={56} viewBox="0 0 120 56" aria-hidden>
          {Array.from({ length: max }, (_, i) => {
            const on = i < v;
            const y = 48 - i * 5;
            return (
              <path
                key={i}
                d={`M 8 ${y} Q 60 ${y - (on ? 10 + i : 2)} 112 ${y}`}
                fill="none"
                stroke={on ? "var(--candle)" : "rgba(var(--ink-rgb), 0.12)"}
                strokeWidth={on ? 1.5 : 1}
                opacity={on ? 1 - i * 0.06 : 0.5}
              />
            );
          })}
        </svg>
        <button
          type="button"
          onClick={() => bump(1)}
          className="h-10 w-10 t-meta text-sea"
          aria-label="increment"
        >
          +
        </button>
      </div>
      <p className="font-mono text-sm text-ink">
        {v} partial{v === 1 ? "" : "s"} · {fundamental}Hz
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════
   6. Shoal Select
   ═══════════════════════════════════════════ */

type Fish = { id: string; label: string; x: number; y: number; vx: number; vy: number; selected: boolean };

export function ShoalSelect({
  options,
  value,
  onChange,
  height = 240,
  className = "",
}: {
  options: { id: string; label: string }[];
  value: string[];
  onChange: (ids: string[]) => void;
  height?: number;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { pulse } = useTape();
  const fish = useRef<Fish[]>([]);
  const cursor = useRef({ x: 0.5, y: 0.5, active: false });
  const valueRef = useRef(value);
  valueRef.current = value;

  useEffect(() => {
    fish.current = options.map((o, i) => ({
      id: o.id,
      label: o.label,
      x: 0.2 + (i % 5) * 0.15,
      y: 0.25 + Math.floor(i / 5) * 0.2,
      vx: 0,
      vy: 0,
      selected: value.includes(o.id),
    }));
  }, [options]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    for (const f of fish.current) f.selected = value.includes(f.id);
  }, [value]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(wrap.clientWidth * dpr);
      canvas.height = Math.floor(wrap.clientHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      cursor.current = {
        x: (e.clientX - r.left) / r.width,
        y: (e.clientY - r.top) / r.height,
        active: true,
      };
    };
    const onDown = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      let hit: Fish | null = null;
      let best = 0.06;
      for (const f of fish.current) {
        const d = Math.hypot(f.x - px, f.y - py);
        if (d < best) {
          best = d;
          hit = f;
        }
      }
      if (!hit) return;
      const set = new Set(valueRef.current);
      if (set.has(hit.id)) {
        set.delete(hit.id);
        hit.vx += (Math.random() - 0.5) * 0.08;
        hit.vy += (Math.random() - 0.5) * 0.08;
        pulse("abort", 0.3);
      } else {
        set.add(hit.id);
        pulse("keep", 0.45);
      }
      onChange(Array.from(set));
    };
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerdown", onDown);

    let raf = 0;
    const draw = () => {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      const c = themeCanvasColors();
      ctx.fillStyle = rgba(c.deepRgb, 0.88);
      ctx.fillRect(0, 0, w, h);

      const cx = cursor.current.x;
      const cy = cursor.current.y;
      for (const f of fish.current) {
        // school toward cursor if selected or nearby; scatter if not selected after click handled via vx
        if (f.selected && cursor.current.active) {
          f.vx += (cx - f.x) * 0.02;
          f.vy += (cy - f.y) * 0.02;
        } else {
          // mild flocking to center of shoal
          f.vx += (0.5 - f.x) * 0.002;
          f.vy += (0.5 - f.y) * 0.002;
          f.vx += (Math.random() - 0.5) * 0.001;
          f.vy += (Math.random() - 0.5) * 0.001;
        }
        f.vx *= 0.92;
        f.vy *= 0.92;
        f.x = Math.max(0.05, Math.min(0.95, f.x + f.vx));
        f.y = Math.max(0.08, Math.min(0.92, f.y + f.vy));

        const x = f.x * w;
        const y = f.y * h;
        const ang = Math.atan2(f.vy, f.vx || 0.01);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(ang);
        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.lineTo(-8, 5);
        ctx.lineTo(-5, 0);
        ctx.lineTo(-8, -5);
        ctx.closePath();
        ctx.fillStyle = f.selected ? c.candle : rgba(c.crestRgb, 0.75);
        ctx.fill();
        ctx.restore();
        ctx.fillStyle = f.selected ? c.ink : rgba(c.inkRgb, 0.55);
        ctx.font = "10px var(--font-text), monospace";
        ctx.textAlign = "center";
        ctx.fillText(f.label, x, y + 16);
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onDown);
    };
  }, [onChange, pulse]);

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ height }}>
      <div ref={wrapRef} className="absolute inset-0">
        <canvas ref={canvasRef} className="h-full w-full touch-none" />
      </div>
      <p className="pointer-events-none absolute bottom-3 left-4 t-eyebrow text-crest/70">
        shoal · {value.length} selected · tap fish
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════
   7. Barometric Badge
   ═══════════════════════════════════════════ */

export function BarometricBadge({
  count = 0,
  stormAt = 12,
  size = 56,
  className = "",
  onClick,
}: {
  count?: number;
  stormAt?: number;
  size?: number;
  className?: string;
  onClick?: () => void;
}) {
  const { pulse } = useTape();
  const { value: swell, drift } = useSwellLFO(0.18, 0.05);
  const id = useId().replace(/:/g, "");
  const pressure = Math.min(1, count / stormAt);
  const storm = count >= stormAt;
  const mercuryTop = 50 - pressure * 34 + (storm ? swell * 2.5 : swell * 0.8);
  let meniscus = `M 18 ${mercuryTop}`;
  for (let x = 18; x <= 30; x += 1) {
    const p = (x - 18) / 12;
    const y =
      mercuryTop +
      Math.sin(p * Math.PI * 2 + swell * 2) * (1.2 + pressure) +
      Math.sin(p * Math.PI * 4 - drift) * 0.4;
    meniscus += ` L ${x} ${y}`;
  }
  meniscus += ` L 30 52 L 18 52 Z`;

  return (
    <button
      type="button"
      onClick={() => {
        pulse(storm ? "strike" : "ripple", storm ? 0.7 : 0.35);
        onClick?.();
      }}
      className={`relative inline-flex flex-col items-center justify-center ${className}`}
      style={{ width: size * 1.15, height: size * 1.55 }}
      aria-label={`${count} notifications`}
    >
      <svg viewBox="0 0 48 72" width={size * 1.15} height={size * 1.55} aria-hidden>
        <defs>
          <linearGradient id={`baro-glass-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(var(--crest-rgb), 0.35)" />
            <stop offset="50%" stopColor="rgba(var(--deep-rgb), 0.55)" />
            <stop offset="100%" stopColor="rgba(var(--sea-rgb), 0.4)" />
          </linearGradient>
          <linearGradient id={`baro-hg-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor={storm ? "rgba(var(--candle-rgb), 1)" : "rgba(var(--crest-rgb), 0.95)"}
            />
            <stop
              offset="100%"
              stopColor={storm ? "rgba(var(--candle-rgb), 0.7)" : "rgba(var(--sea-rgb), 0.9)"}
            />
          </linearGradient>
          <clipPath id={`baro-clip-${id}`}>
            <rect x={16} y={8} width={16} height={46} rx={8} />
          </clipPath>
        </defs>
        {/* glass bulb + tube */}
        <path
          d={`M 16 12
              Q 16 6 24 6
              Q 32 6 32 12
              L 32 48
              Q 32 58 24 60
              Q 16 58 16 48 Z`}
          fill={`url(#baro-glass-${id})`}
          stroke="rgba(var(--crest-rgb), 0.65)"
          strokeWidth={1.5}
        />
        {/* glass highlight */}
        <path
          d="M 19 10 Q 20 8 21 14 L 21 44"
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        {/* mercury with living meniscus */}
        <g clipPath={`url(#baro-clip-${id})`}>
          <path d={meniscus} fill={`url(#baro-hg-${id})`} />
          <path
            d={meniscus.replace(/ Z$/, "").split(" L 30 52")[0]}
            fill="none"
            stroke="rgba(255,255,255,0.45)"
            strokeWidth={1}
          />
        </g>
        {/* bulb reservoir */}
        <ellipse
          cx={24}
          cy={58}
          rx={11}
          ry={7}
          fill={storm ? "rgba(var(--candle-rgb), 0.85)" : "rgba(var(--sea-rgb), 0.75)"}
          stroke="rgba(var(--crest-rgb), 0.5)"
          strokeWidth={1}
        />
        <ellipse
          cx={21}
          cy={56}
          rx={3}
          ry={2}
          fill="rgba(255,255,255,0.35)"
        />
        {/* storm spray */}
        {storm
          ? Array.from({ length: 7 }, (_, i) => (
              <circle
                key={i}
                cx={24 + Math.sin(i * 1.7 + swell * 4) * (8 + i)}
                cy={10 + ((i * 5 + swell * 6) % 18)}
                r={1.4}
                fill="rgba(var(--candle-rgb), 0.85)"
              />
            ))
          : null}
        {/* tick marks */}
        {[0.25, 0.5, 0.75].map((t) => (
          <line
            key={t}
            x1={33}
            x2={36}
            y1={50 - t * 34}
            y2={50 - t * 34}
            stroke="rgba(var(--ink-rgb), 0.25)"
            strokeWidth={1}
          />
        ))}
      </svg>
      <span
        className={`mt-0.5 font-mono text-[0.7rem] ${
          storm ? "text-candle" : "text-ink"
        }`}
      >
        {storm ? "storm" : count}
      </span>
    </button>
  );
}

/* ═══════════════════════════════════════════
   8. Refraction Split
   ═══════════════════════════════════════════ */

export function RefractionSplit({
  a,
  b,
  value = 0.5,
  onChange,
  height = 220,
  className = "",
}: {
  a: ReactNode;
  b: ReactNode;
  value?: number;
  onChange?: (v: number) => void;
  height?: number;
  className?: string;
}) {
  const { pulse } = useTape();
  const [v, setV] = useState(value);
  const [width, setWidth] = useState(400);
  const split = onChange ? value : v;
  const setSplit = (n: number) => {
    const x = Math.max(0.12, Math.min(0.88, n));
    if (onChange) onChange(x);
    else setV(x);
  };
  const dragging = useRef(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const bend = Math.sin(split * Math.PI) * 28;
  const x0 = split * width;

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      style={{ height }}
      onPointerDown={(e) => {
        dragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        const r = e.currentTarget.getBoundingClientRect();
        setSplit((e.clientX - r.left) / r.width);
        pulse("ripple", 0.3);
      }}
      onPointerMove={(e) => {
        if (!dragging.current) return;
        const r = e.currentTarget.getBoundingClientRect();
        setSplit((e.clientX - r.left) / r.width);
      }}
      onPointerUp={() => {
        dragging.current = false;
      }}
    >
      <div className="absolute inset-0 overflow-hidden bg-paper p-6 text-ink">{a}</div>
      <div
        className="absolute inset-0 overflow-hidden bg-deep p-6 text-on-deep surface-deep"
        style={{
          clipPath: `polygon(${split * 100 + 1.5}% 0%, 100% 0%, 100% 100%, ${split * 100 - 1.5}% 100%)`,
        }}
      >
        {b}
      </div>
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        width={width}
        height={height}
        aria-hidden
      >
        <path
          d={`M ${x0} 0 Q ${x0 + bend} ${height / 2} ${x0} ${height}`}
          fill="none"
          stroke="rgba(var(--crest-rgb), 0.4)"
          strokeWidth={5}
        />
        <path
          d={`M ${x0} 0 Q ${x0 + bend * 0.6} ${height / 2} ${x0} ${height}`}
          fill="none"
          stroke="rgba(var(--candle-rgb), 0.9)"
          strokeWidth={2}
        />
      </svg>
      <p className="pointer-events-none absolute bottom-2 left-3 t-eyebrow text-ink-2">A</p>
      <p className="pointer-events-none absolute bottom-2 right-3 t-eyebrow text-crest">B</p>
    </div>
  );
}

/* ═══════════════════════════════════════════
   9. Echo Form
   ═══════════════════════════════════════════ */

type Echo = { id: number; field: string; value: string; t0: number };

export function EchoForm({
  fields,
  onSubmit,
  className = "",
}: {
  fields: { name: string; label: string; placeholder?: string }[];
  onSubmit?: (data: Record<string, string>) => void;
  className?: string;
}) {
  const { pulse } = useTape();
  const [data, setData] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.name, ""]))
  );
  const [echoes, setEchoes] = useState<Echo[]>([]);
  const idRef = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: Echo[] = fields.map((f) => ({
      id: ++idRef.current,
      field: f.name,
      value: data[f.name] || "·",
      t0: performance.now(),
    }));
    setEchoes((prev) => [...prev, ...next].slice(-24));
    pulse("press", 0.55);
    onSubmit?.(data);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    const draw = (now: number) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const c = themeCanvasColors();
      ctx.fillStyle = rgba(c.deepRgb, 0.5);
      ctx.fillRect(0, 0, w, h);

      const live = echoes.filter((e) => now - e.t0 < 8000);
      for (let i = 0; i < live.length; i++) {
        const e = live[i];
        const age = (now - e.t0) / 8000;
        const mid = h * (0.25 + (i % 5) * 0.12);
        const amp = (1 - age) * 18;
        const hash = e.value.split("").reduce((a, ch) => a + ch.charCodeAt(0), 0);
        ctx.beginPath();
        for (let x = 0; x <= w; x += 3) {
          const y =
            mid +
            Math.sin(x * 0.04 + hash * 0.01 + age * 4) * amp +
            Math.sin(x * 0.09 - age * 2) * amp * 0.4;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = rgba(
          i % 2 === 0 ? c.candleRgb : c.crestRgb,
          (1 - age) * 0.55
        );
        ctx.lineWidth = 1.25;
        ctx.stroke();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [echoes]);

  return (
    <div className={`space-y-4 ${className}`}>
      <form onSubmit={submit} className="space-y-3">
        {fields.map((f) => (
          <label key={f.name} className="block">
            <span className="t-eyebrow text-ink-2">{f.label}</span>
            <input
              name={f.name}
              value={data[f.name]}
              onChange={(e) => setData((d) => ({ ...d, [f.name]: e.target.value }))}
              placeholder={f.placeholder}
              className="tide-field mt-1 w-full px-3 py-2 text-ink"
            />
          </label>
        ))}
        <button
          type="submit"
          className="w-full py-2.5 t-meta"
          style={{ background: "rgba(var(--sea-rgb), 0.18)", color: "var(--ink)" }}
        >
          release wake
        </button>
      </form>
      <canvas ref={canvasRef} className="h-28 w-full" aria-label="echo interference" />
      <p className="t-meta text-ink-2">
        history as interference · {echoes.length} echoes
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Re-export note: EddyMenu lives in ScalePrimitives
   ═══════════════════════════════════════════ */

export { EddyMenu } from "@/components/ui/ScalePrimitives";
