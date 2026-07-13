"use client";

/**
 * Scale primitives — one flagship control per water scale.
 * Theme-aware via CSS vars / themeCanvasColors().
 */

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useTape } from "@/lib/tape";
import { useSwellLFO } from "@/lib/motion";
import { themeCanvasColors, rgba } from "@/lib/colors";
import { SwellRail } from "@/components/ui/SwellRail";
import { MorphShell } from "@/components/ui/WaveMorph";
import { WaveButton } from "@/components/ui/WaveButton";

/* ═══════════════════════════════════════════
   1. DROPLET — DropletMark / BeadCounter
   ═══════════════════════════════════════════ */

function teardropPath(cx: number, cy: number, s: number, tip = -1) {
  // Classic water bead: round body, pointed tip
  const body = s * 0.72;
  const tipY = cy + tip * s * 1.15;
  return [
    `M ${cx} ${tipY}`,
    `C ${cx + body * 0.55} ${tipY + tip * s * 0.35}, ${cx + body} ${cy - tip * body * 0.1}, ${cx + body} ${cy + tip * body * 0.15}`,
    `A ${body} ${body * 0.95} 0 1 1 ${cx - body} ${cy + tip * body * 0.15}`,
    `C ${cx - body} ${cy - tip * body * 0.1}, ${cx - body * 0.55} ${tipY + tip * s * 0.35}, ${cx} ${tipY}`,
    "Z",
  ].join(" ");
}

export function DropletMark({
  count = 0,
  max = 9,
  size = 36,
  className = "",
  onClick,
}: {
  count?: number;
  max?: number;
  size?: number;
  className?: string;
  onClick?: () => void;
}) {
  const { pulse } = useTape();
  const { value: swell } = useSwellLFO(0.2, 0.04);
  const id = useId().replace(/:/g, "");
  const n = Math.min(count, max);
  const overflow = count > max;
  const show = Math.min(n, 6);

  return (
    <button
      type="button"
      onClick={() => {
        pulse("ripple", 0.35);
        onClick?.();
      }}
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size * 1.35, height: size * 1.35 }}
      aria-label={`${count} beads`}
    >
      <svg
        viewBox="0 0 64 64"
        width={size * 1.35}
        height={size * 1.35}
        aria-hidden
      >
        <defs>
          <radialGradient id={`drop-body-${id}`} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="rgba(var(--crest-rgb), 0.95)" />
            <stop offset="45%" stopColor="rgba(var(--sea-rgb), 0.9)" />
            <stop offset="100%" stopColor="rgba(var(--deep-rgb), 0.85)" />
          </radialGradient>
          <radialGradient id={`drop-shine-${id}`} cx="30%" cy="25%" r="40%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.75)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>
        {n === 0 ? (
          <path
            d={teardropPath(32, 34, 9 + swell * 1.2)}
            fill="rgba(var(--sea-rgb), 0.12)"
            stroke="rgba(var(--sea-rgb), 0.4)"
            strokeWidth={1.25}
            strokeDasharray="3 3"
          />
        ) : (
          Array.from({ length: show }, (_, i) => {
            const a =
              -Math.PI / 2 +
              (i / Math.max(1, show)) * Math.PI * 2 +
              swell * 0.08;
            const cluster = show === 1 ? 0 : 11 + show * 0.8;
            const cx = 32 + Math.cos(a) * cluster * (show > 1 ? 0.85 : 0);
            const cy = 34 + Math.sin(a) * cluster * (show > 1 ? 0.7 : 0);
            const s = (show === 1 ? 11 : 7.5 - show * 0.25) + swell * 0.6;
            return (
              <g key={i}>
                <path
                  d={teardropPath(cx, cy + 1.5, s * 1.02)}
                  fill="rgba(var(--deep-rgb), 0.2)"
                  opacity={0.5}
                />
                <path
                  d={teardropPath(cx, cy, s)}
                  fill={`url(#drop-body-${id})`}
                  stroke="rgba(var(--crest-rgb), 0.55)"
                  strokeWidth={0.8}
                />
                <ellipse
                  cx={cx - s * 0.25}
                  cy={cy - s * 0.35}
                  rx={s * 0.28}
                  ry={s * 0.38}
                  fill={`url(#drop-shine-${id})`}
                />
              </g>
            );
          })
        )}
        {/* surface-tension ring */}
        {n > 0 ? (
          <circle
            cx={32}
            cy={34}
            r={14 + show * 1.5 + swell}
            fill="none"
            stroke="rgba(var(--candle-rgb), 0.25)"
            strokeWidth={1}
            strokeDasharray="2 4"
          />
        ) : null}
      </svg>
      {count > 0 ? (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-[0.7rem] font-medium text-on-deep drop-shadow-[0_1px_2px_rgba(12,24,34,0.8)]">
          {overflow ? `${max}+` : count}
        </span>
      ) : null}
    </button>
  );
}

/* ═══════════════════════════════════════════
   2. RAIN — RainField
   ═══════════════════════════════════════════ */

export function RainField({
  height = 200,
  rate = 0.6,
  className = "",
  label = "rain · ambient hits",
}: {
  height?: number;
  rate?: number;
  className?: string;
  label?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const { pulse } = useTape();
  const rateRef = useRef(rate);
  rateRef.current = rate;

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = mq.matches;
    const onMq = () => {
      reduced = mq.matches;
    };
    mq.addEventListener("change", onMq);

    type Drop = { x: number; y: number; vy: number; len: number };
    const drops: Drop[] = [];
    const splashes: { x: number; y: number; t0: number }[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(wrap.clientWidth * dpr);
      canvas.height = Math.floor(wrap.clientHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      splashes.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        t0: performance.now(),
      });
      pulse("ripple", 0.3);
    };
    canvas.addEventListener("pointerdown", onDown);

    let raf = 0;
    let last = performance.now();
    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      const c = themeCanvasColors();

      ctx.fillStyle = rgba(c.deepRgb, 0.92);
      ctx.fillRect(0, 0, w, h);

      if (!reduced && Math.random() < rateRef.current * 0.35) {
        drops.push({
          x: Math.random() * w,
          y: -10,
          vy: 180 + Math.random() * 220,
          len: 6 + Math.random() * 10,
        });
      }

      ctx.strokeStyle = rgba(c.crestRgb, 0.55);
      ctx.lineWidth = 1.1;
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        if (!reduced) d.y += d.vy * dt;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x + 1.5, d.y + d.len);
        ctx.stroke();
        if (d.y > h * 0.88) {
          splashes.push({ x: d.x, y: h * 0.9, t0: now });
          drops.splice(i, 1);
        } else if (d.y > h + 20) drops.splice(i, 1);
      }
      if (drops.length > 120) drops.splice(0, drops.length - 120);

      ctx.fillStyle = rgba(c.seaRgb, 0.35);
      ctx.fillRect(0, h * 0.88, w, h * 0.12);

      for (let i = splashes.length - 1; i >= 0; i--) {
        const s = splashes[i];
        const age = (now - s.t0) / 1000;
        if (age > 0.6) {
          splashes.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.ellipse(s.x, s.y, age * 22, age * 7, 0, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(c.crestRgb, (1 - age / 0.6) * 0.5);
        ctx.stroke();
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      mq.removeEventListener("change", onMq);
    };
  }, [pulse]);

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ height }}>
      <div ref={wrapRef} className="absolute inset-0">
        <canvas ref={canvasRef} className="h-full w-full touch-none" />
      </div>
      <p className="pointer-events-none absolute bottom-3 left-4 t-eyebrow text-crest/70">
        {label}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════
   3. SINK — PourSustain
   ═══════════════════════════════════════════ */

export function PourSustain({
  children,
  onCommit,
  thresholdMs = 1100,
  className = "",
}: {
  children: ReactNode;
  onCommit: () => void;
  thresholdMs?: number;
  className?: string;
}) {
  const { pulse } = useTape();
  const { value: swell } = useSwellLFO(0.22, 0.05);
  const [level, setLevel] = useState(0);
  const [committed, setCommitted] = useState(false);
  const holding = useRef(false);
  const start = useRef(0);
  const raf = useRef(0);

  const tick = useCallback(() => {
    if (!holding.current) return;
    const p = Math.min(1, (performance.now() - start.current) / thresholdMs);
    setLevel(p);
    if (p >= 1) {
      setCommitted(true);
      holding.current = false;
      pulse("discharge", 1);
      onCommit();
      return;
    }
    raf.current = requestAnimationFrame(tick);
  }, [thresholdMs, onCommit, pulse]);

  const onDown = () => {
    if (committed) return;
    holding.current = true;
    start.current = performance.now();
    pulse("hold", 0.4);
    raf.current = requestAnimationFrame(tick);
  };
  const onUp = () => {
    if (committed) return;
    holding.current = false;
    cancelAnimationFrame(raf.current);
    if (level < 1) {
      pulse("abort", 0.25);
      setLevel(0);
    }
  };

  const brim = level > 0.85;
  const cascade = Math.max(0, (level - 0.85) / 0.15);
  const fillY = 52 - level * 40;
  const meniscus = (() => {
    const y = fillY;
    let d = `M 18 ${52} L 18 ${y}`;
    for (let x = 18; x <= 142; x += 4) {
      const p = (x - 18) / 124;
      const wave =
        Math.sin(p * Math.PI * 2 * 2.2 + swell * 3 + level * 4) * (1.8 + level) +
        Math.sin(p * Math.PI * 2 * 5 - swell * 2) * 0.7;
      d += ` L ${x} ${y + wave}`;
    }
    d += ` L 142 ${52} Z`;
    return d;
  })();

  return (
    <button
      type="button"
      className={`relative inline-flex min-h-[4.5rem] min-w-[12rem] flex-col items-center justify-end overflow-visible px-6 pb-4 pt-6 t-meta text-ink ${className}`}
      onPointerDown={onDown}
      onPointerUp={onUp}
      onPointerLeave={onUp}
      onPointerCancel={onUp}
      disabled={committed}
    >
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        viewBox="0 0 160 64"
        preserveAspectRatio="none"
        aria-hidden
      >
        {/* basin silhouette */}
        <path
          d={`M 14 18
              Q 20 ${10 + swell} 80 ${8 + swell * 0.5}
              T 146 18
              L 138 54
              Q 80 62 22 54 Z`}
          fill="rgba(var(--deep-rgb), 0.28)"
          stroke="rgba(var(--sea-rgb), 0.55)"
          strokeWidth={1.5}
        />
        {/* liquid fill with living meniscus */}
        <path d={meniscus} fill="rgba(var(--sea-rgb), 0.62)" />
        <path
          d={meniscus.replace(/ Z$/, "")}
          fill="none"
          stroke="rgba(var(--crest-rgb), 0.85)"
          strokeWidth={1.5}
        />
        {/* brim line */}
        <path
          d={`M 22 14 Q 80 ${12 - swell} 138 14`}
          fill="none"
          stroke="rgba(var(--candle-rgb), 0.55)"
          strokeWidth={1}
          strokeDasharray="5 4"
        />
        {/* cascade spout when past brim */}
        {brim ? (
          <path
            d={`M 74 10
                Q 80 ${10 + cascade * 20} 86 10
                L 84 ${10 + cascade * 36}
                Q 80 ${14 + cascade * 40} 76 ${10 + cascade * 36} Z`}
            fill="rgba(var(--crest-rgb), 0.75)"
          />
        ) : null}
        {committed ? (
          <path
            d={`M 70 8 Q 80 48 90 8`}
            fill="none"
            stroke="rgba(var(--candle-rgb), 0.7)"
            strokeWidth={2}
          />
        ) : null}
      </svg>
      <span className="relative z-10 mix-blend-plus-lighter">
        {committed ? "poured" : brim ? "cascading…" : children}
      </span>
    </button>
  );
}

/* ═══════════════════════════════════════════
   4. POOL — PoolWell
   ═══════════════════════════════════════════ */

export function PoolWell({
  children,
  className = "",
  title,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  const { value: swell } = useSwellLFO(0.1, 0.03);
  const id = useId().replace(/:/g, "");

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ transform: `translateY(${swell * 2}px)` }}
    >
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <radialGradient id={`pool-${id}`} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="rgba(var(--crest-rgb), 0.25)" />
            <stop offset="55%" stopColor="rgba(var(--sea-rgb), 0.2)" />
            <stop offset="100%" stopColor="rgba(var(--paper-rgb), 0.85)" />
          </radialGradient>
        </defs>
        <ellipse
          cx={50}
          cy={52}
          rx={46}
          ry={40}
          fill={`url(#pool-${id})`}
          stroke="rgba(var(--sea-rgb), 0.35)"
          strokeWidth={0.8}
        />
        <ellipse
          cx={50}
          cy={42}
          rx={22}
          ry={8}
          fill="none"
          stroke="rgba(var(--crest-rgb), 0.3)"
          strokeWidth={0.5}
        />
      </svg>
      <div className="relative z-10 px-8 py-10 md:px-12">
        {title ? <p className="mb-3 t-eyebrow text-sea">{title}</p> : null}
        {children}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   5. RIVER — EddyMenu
   ═══════════════════════════════════════════ */

export function EddyMenu({
  items,
  value,
  onChange,
  size = 220,
  className = "",
}: {
  items: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
  size?: number;
  className?: string;
}) {
  const { pulse } = useTape();
  const { value: swell } = useSwellLFO(0.08, 0.02);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      setPhase(((now - t0) / 1000) * 0.22);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const cx = size / 2;
  const cy = size / 2;
  const orbit = size * 0.34;
  const selected = items.find((i) => i.id === value);

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0" aria-hidden>
        <circle
          cx={cx}
          cy={cy}
          r={orbit}
          fill="none"
          stroke="rgba(var(--sea-rgb), 0.22)"
          strokeWidth={1}
          strokeDasharray="4 6"
        />
        <circle
          cx={cx}
          cy={cy}
          r={orbit * 0.42 + swell * 2}
          fill="rgba(var(--deep-rgb), 0.35)"
          stroke="rgba(var(--candle-rgb), 0.35)"
          strokeWidth={1.25}
        />
        {[0, 1].map((i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={18 + i * 14 + swell * 2}
            fill="none"
            stroke="rgba(var(--crest-rgb), 0.18)"
            strokeWidth={1}
            strokeDasharray="5 7"
            transform={`rotate(${(phase * 35 + i * 40) % 360} ${cx} ${cy})`}
          />
        ))}
      </svg>

      {/* Center wake — only the selected label, never overlapping orbit items */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="flex h-14 w-14 flex-col items-center justify-center rounded-full bg-paper/90 shadow-[0_0_0_1px_rgba(var(--candle-rgb),0.45)]">
          <span className="t-eyebrow text-candle">wake</span>
          <span className="font-serif text-sm italic text-ink">
            {selected?.label ?? "—"}
          </span>
        </div>
      </div>

      {items.map((item, i) => {
        const a = phase + (i / items.length) * Math.PI * 2 - Math.PI / 2;
        const active = item.id === value;
        // Active stays on the orbit but highlighted — never pulled to center (that caused overlap)
        const x = cx + Math.cos(a) * orbit;
        const y = cy + Math.sin(a) * orbit;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              onChange(item.id);
              pulse("phase", 0.45);
            }}
            className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 px-2.5 py-1 t-meta transition-all duration-wave ${
              active ? "text-candle" : "text-ink-2 hover:text-ink"
            }`}
            style={{
              left: x,
              top: y,
              background: active
                ? "rgba(var(--paper-rgb), 0.95)"
                : "rgba(var(--paper-rgb), 0.7)",
              boxShadow: active
                ? "0 0 0 1.5px rgba(var(--candle-rgb), 0.7)"
                : "0 0 0 1px rgba(var(--sea-rgb), 0.2)",
              borderRadius: "999px",
              transform: `translate(-50%, -50%) scale(${active ? 1.08 : 1})`,
            }}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════
   6. BEACH — TideLine
   ═══════════════════════════════════════════ */

export function TideLine({
  value,
  onChange,
  labels = ["draft", "review", "publish"],
  className = "",
}: {
  value: number;
  onChange: (v: number) => void;
  labels?: string[];
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { pulse } = useTape();
  const { value: swell } = useSwellLFO(0.14, 0.03);
  const dragging = useRef(false);

  const setFromEvent = (clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const v = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    onChange(v);
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        ref={ref}
        role="slider"
        aria-label={labels.join(" · ")}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value * 100)}
        tabIndex={0}
        className="relative h-16 cursor-ew-resize touch-none select-none overflow-hidden"
        onPointerDown={(e) => {
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          setFromEvent(e.clientX);
          pulse("ripple", 0.3);
        }}
        onPointerMove={(e) => {
          if (!dragging.current) return;
          setFromEvent(e.clientX);
        }}
        onPointerUp={() => {
          dragging.current = false;
          pulse("release", 0.35);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowUp") {
            e.preventDefault();
            onChange(Math.min(1, value + 0.05));
          }
          if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
            e.preventDefault();
            onChange(Math.max(0, value - 0.05));
          }
          if (e.key === "Home") {
            e.preventDefault();
            onChange(0);
          }
          if (e.key === "End") {
            e.preventDefault();
            onChange(1);
          }
        }}
      >
        <div
          className="absolute inset-y-0 left-0"
          style={{
            width: `${value * 100}%`,
            background: "linear-gradient(90deg, rgba(var(--paper-2-rgb),0.9), rgba(var(--haze-rgb),0.35))",
          }}
        />
        <div
          className="absolute inset-y-0 right-0"
          style={{
            width: `${(1 - value) * 100}%`,
            left: `${value * 100}%`,
            background: "rgba(var(--sea-rgb), 0.55)",
          }}
        />
        <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden>
          <path
            d={`M 0 ${32 + swell * 2} Q ${(value * 100) / 2}% ${28 - swell * 3} ${value * 100}% ${30 + swell} T 100% ${34}`}
            fill="none"
            stroke="rgba(var(--crest-rgb), 0.9)"
            strokeWidth={2.5}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-candle"
          style={{ left: `${value * 100}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between">
        {labels.map((l) => (
          <span key={l} className="t-eyebrow text-ink-2">
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   7. WAVES — CrestMeter
   ═══════════════════════════════════════════ */

export function CrestMeter({
  value,
  label = "crest",
  className = "",
}: {
  value: number;
  label?: string;
  className?: string;
}) {
  const { value: swell } = useSwellLFO(0.16, 0.04);
  const v = Math.max(0, Math.min(1, value));
  const w = 200;
  const h = 48;

  let d = `M 0 ${h * 0.7}`;
  for (let x = 0; x <= w; x += 3) {
    const y =
      h * 0.7 -
      Math.sin(x * 0.08 + swell * 2) * (6 + v * 16) -
      Math.sin(x * 0.03 - swell) * (2 + v * 6);
    d += ` L ${x} ${y}`;
  }

  return (
    <div className={`inline-flex flex-col gap-1 ${className}`}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden>
        <path
          d={`${d} L ${w} ${h} L 0 ${h} Z`}
          fill="rgba(var(--sea-rgb), 0.2)"
        />
        <path
          d={d}
          fill="none"
          stroke="var(--candle)"
          strokeWidth={2}
          strokeLinecap="round"
        />
        <line
          x1={0}
          x2={w}
          y1={h * 0.7 - (6 + 16)}
          y2={h * 0.7 - (6 + 16)}
          stroke="rgba(var(--ink-rgb), 0.12)"
          strokeDasharray="3 4"
        />
      </svg>
      <span className="t-eyebrow text-ink-2">
        {label} · {Math.round(v * 100)}%
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════
   8. OCEAN — FetchHorizon
   ═══════════════════════════════════════════ */

export function FetchHorizon({
  height = 120,
  className = "",
  label = "fetch · open horizon",
}: {
  height?: number;
  className?: string;
  label?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const { value: swell } = useSwellLFO(0.1, 0.025);
  const swellRef = useRef(swell);
  swellRef.current = swell;

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

    const t0 = performance.now();
    let raf = 0;
    const draw = (now: number) => {
      const t = (now - t0) / 1000;
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      const s = swellRef.current;
      const c = themeCanvasColors();

      const sky = ctx.createLinearGradient(0, 0, 0, h * 0.45);
      sky.addColorStop(0, c.ambient[0]);
      sky.addColorStop(1, c.haze);
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h * 0.45);

      const sea = ctx.createLinearGradient(0, h * 0.45, 0, h);
      sea.addColorStop(0, c.sea);
      sea.addColorStop(1, c.deep);
      ctx.fillStyle = sea;
      ctx.fillRect(0, h * 0.45, w, h * 0.55);

      ctx.beginPath();
      for (let x = 0; x <= w; x += 4) {
        const y =
          h * 0.45 +
          Math.sin(x * 0.01 + t * 0.5 + s) * (4 + s * 3) +
          Math.sin(x * 0.025 - t * 0.3) * 2;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = rgba(c.crestRgb, 0.7);
      ctx.lineWidth = 1.5;
      ctx.stroke();

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ height }}>
      <div ref={wrapRef} className="absolute inset-0">
        <canvas ref={canvasRef} className="h-full w-full" />
      </div>
      <p className="pointer-events-none absolute bottom-2 left-3 t-eyebrow text-crest/70">
        {label}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════
   9. CLOUDS — CloudVeil
   ═══════════════════════════════════════════ */

export function CloudVeil({
  active = true,
  children,
  className = "",
  label = "gathering…",
}: {
  active?: boolean;
  children?: ReactNode;
  className?: string;
  label?: string;
}) {
  const { value: swell } = useSwellLFO(0.07, 0.02);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {children}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-wave"
        style={{
          opacity: active ? 0.85 : 0,
          background: `
            radial-gradient(ellipse 50% 40% at ${30 + swell * 10}% 40%, rgba(var(--paper-rgb), 0.9), transparent),
            radial-gradient(ellipse 45% 35% at ${70 - swell * 8}% 55%, rgba(var(--haze-rgb), 0.55), transparent),
            radial-gradient(ellipse 60% 50% at 50% 50%, rgba(var(--paper-2-rgb), 0.7), transparent)
          `,
        }}
        aria-hidden={!active}
      />
      {active ? (
        <p className="pointer-events-none absolute inset-x-0 bottom-4 text-center t-meta text-ink-2">
          {label}
        </p>
      ) : null}
    </div>
  );
}

/* ═══════════════════════════════════════════
   10. SNOW — SnowSettle
   ═══════════════════════════════════════════ */

export function SnowSettle({
  count = 0,
  height = 160,
  className = "",
  label = "settling",
}: {
  count?: number;
  height?: number;
  className?: string;
  label?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const countRef = useRef(count);
  countRef.current = count;

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const flakes: { x: number; y: number; vy: number; s: number; settled: boolean }[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(wrap.clientWidth * dpr);
      canvas.height = Math.floor(wrap.clientHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    let raf = 0;
    const draw = () => {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      const c = themeCanvasColors();
      const target = Math.min(80, countRef.current * 3);

      while (flakes.length < target) {
        flakes.push({
          x: Math.random() * w,
          y: -Math.random() * h * 0.3,
          vy: 0.4 + Math.random() * 0.8,
          s: 1 + Math.random() * 2,
          settled: false,
        });
      }
      while (flakes.length > target) flakes.pop();

      ctx.fillStyle = rgba(c.paperRgb, 0.95);
      ctx.fillRect(0, 0, w, h);

      const blanket = Math.min(0.35, flakes.filter((f) => f.settled).length / 80);
      ctx.fillStyle = rgba(c.crestRgb, 0.15 + blanket);
      ctx.fillRect(0, h * (0.75 - blanket * 0.2), w, h);

      for (const f of flakes) {
        if (!f.settled) {
          f.y += f.vy;
          f.x += Math.sin(f.y * 0.05) * 0.4;
          if (f.y >= h * (0.78 - blanket * 0.15)) f.settled = true;
        }
        ctx.fillStyle = rgba(c.inkRgb, f.settled ? 0.15 : 0.45);
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.s, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ height }}>
      <div ref={wrapRef} className="absolute inset-0">
        <canvas ref={canvasRef} className="h-full w-full" />
      </div>
      <p className="pointer-events-none absolute bottom-3 left-4 t-eyebrow text-ink-2">
        {label} · {count}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════
   11. ICE — IceLattice / ThawControl
   ═══════════════════════════════════════════ */

export function IceLattice({
  locked = true,
  onThaw,
  onFreeze,
  children,
  className = "",
}: {
  locked?: boolean;
  onThaw?: () => void;
  onFreeze?: () => void;
  children?: ReactNode;
  className?: string;
}) {
  const { pulse } = useTape();
  const [cracks, setCracks] = useState<{ x: number; y: number; t0: number }[]>([]);
  const [thawing, setThawing] = useState(0);

  useEffect(() => {
    if (locked) {
      setThawing(0);
      return;
    }
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / 1800);
      setThawing(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [locked]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        style={{
          filter: locked ? `saturate(${0.4 + thawing * 0.6})` : undefined,
          opacity: locked ? 0.55 + thawing * 0.45 : 1,
          pointerEvents: locked && thawing < 0.9 ? "none" : undefined,
        }}
      >
        {children}
      </div>
      {locked ? (
        <div
          className="absolute inset-0"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setCracks((c) => [
              ...c.slice(-4),
              { x: e.clientX - rect.left, y: e.clientY - rect.top, t0: performance.now() },
            ]);
            pulse("ripple", 0.4);
          }}
        >
          <svg className="absolute inset-0 h-full w-full" aria-hidden>
            {Array.from({ length: 8 }, (_, i) => (
              <line
                key={i}
                x1={`${i * 14}%`}
                y1="0"
                x2={`${i * 14 + 20}%`}
                y2="100%"
                stroke="rgba(var(--crest-rgb), 0.35)"
                strokeWidth={1}
              />
            ))}
            {cracks.map((c, i) => (
              <g key={i}>
                {[0, 1, 2, 3].map((j) => {
                  const a = (j / 4) * Math.PI * 2;
                  return (
                    <line
                      key={j}
                      x1={c.x}
                      y1={c.y}
                      x2={c.x + Math.cos(a) * 40}
                      y2={c.y + Math.sin(a) * 30}
                      stroke="rgba(var(--sea-rgb), 0.6)"
                      strokeWidth={1.25}
                    />
                  );
                })}
              </g>
            ))}
          </svg>
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
            <button
              type="button"
              className="px-3 py-1.5 t-meta text-sea bg-paper/80"
              onClick={(e) => {
                e.stopPropagation();
                pulse("calm", 0.5);
                onThaw?.();
              }}
            >
              thaw
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="absolute right-3 top-3 t-eyebrow text-ink-2"
          onClick={() => {
            pulse("hold", 0.35);
            onFreeze?.();
          }}
        >
          freeze
        </button>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   12. STEAM — SteamPlume
   ═══════════════════════════════════════════ */

export function SteamPlume({
  message,
  open,
  onGone,
  durationMs = 2200,
  className = "",
}: {
  message: string;
  open: boolean;
  onGone?: () => void;
  durationMs?: number;
  className?: string;
}) {
  const { pulse } = useTape();
  const [life, setLife] = useState(0);
  const shown = useRef(false);

  useEffect(() => {
    if (!open) {
      setLife(0);
      shown.current = false;
      return;
    }
    if (!shown.current) {
      shown.current = true;
      pulse("ripple", 0.4);
    }
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / durationMs);
      setLife(p);
      if (p >= 1) onGone?.();
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [open, durationMs, onGone, pulse]);

  if (!open && life === 0) return null;

  const rise = life * 48;
  const opacity = life < 0.15 ? life / 0.15 : Math.max(0, 1 - (life - 0.15) / 0.85);

  return (
    <div
      className={`pointer-events-none fixed bottom-24 left-1/2 z-50 -translate-x-1/2 ${className}`}
      style={{
        transform: `translate(-50%, ${-rise}px)`,
        opacity,
      }}
      role="status"
    >
      <div className="relative px-5 py-3">
        <div
          className="absolute inset-0 blur-md"
          style={{
            background: `radial-gradient(ellipse at 50% 80%, rgba(var(--paper-rgb), 0.9), transparent 70%)`,
          }}
        />
        <p className="relative font-serif italic text-ink">{message}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   13. LAKE — LakeBasin (depth dive strip)
   ═══════════════════════════════════════════ */

export function LakeBasin({
  depth = 0.35,
  onDepthChange,
  className = "",
  label = "depth",
}: {
  depth?: number;
  onDepthChange?: (d: number) => void;
  className?: string;
  label?: string;
}) {
  const { pulse } = useTape();
  const { value: swell } = useSwellLFO(0.09, 0.02);
  const d = Math.max(0, Math.min(1, depth));

  return (
    <div className={`relative h-40 overflow-hidden ${className}`}>
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg,
            rgba(var(--haze-rgb), 0.5) 0%,
            rgba(var(--sea-rgb), ${0.35 + d * 0.4}) 45%,
            rgba(var(--deep-rgb), ${0.7 + d * 0.3}) 100%)`,
        }}
      />
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden>
        <path
          d={`M 0 ${28 + swell * 3} Q 50% ${22 - swell * 4} 100% ${30 + swell * 2}`}
          fill="none"
          stroke="rgba(var(--crest-rgb), 0.55)"
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <p className="absolute left-4 top-3 t-eyebrow text-crest">
        {label} · {Math.round(d * 100)}m
      </p>
      {onDepthChange ? (
        <div className="absolute inset-x-4 bottom-3">
          <SwellRail
            value={d}
            onChange={(v) => {
              onDepthChange(v);
              pulse("dial", 0.2);
            }}
            label={label}
            className="[&_.t-eyebrow]:sr-only"
          />
        </div>
      ) : null}
    </div>
  );
}

/* ═══════════════════════════════════════════
   14. STORM — SquallWarning
   ═══════════════════════════════════════════ */

export function SquallWarning({
  level = 0.5,
  title = "squall warning",
  body = "intensity rising — still the sea when ready",
  onCalm,
  className = "",
}: {
  level?: number;
  title?: string;
  body?: string;
  onCalm?: () => void;
  className?: string;
}) {
  const { pulse } = useTape();
  const { value: swell } = useSwellLFO(0.2, 0.05);
  const v = Math.max(0, Math.min(1, level));
  const flash = v > 0.75 && Math.abs(swell) > 0.7;

  return (
    <MorphShell className={className} pad={false} dark caustic={false}>
      <div
        className="relative overflow-hidden px-5 py-4"
        style={{
          background: flash
            ? "rgba(var(--paper-rgb), 0.12)"
            : undefined,
        }}
        role="alert"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="t-eyebrow text-candle">{title}</p>
            <p className="mt-1 font-serif italic text-crest">{body}</p>
            <div className="mt-3 h-2 w-44">
              <svg viewBox="0 0 160 8" className="h-full w-full" preserveAspectRatio="none" aria-hidden>
                <path
                  d={`M 0 4 Q 40 ${4 - swell * 2} 80 4 T 160 4`}
                  fill="none"
                  stroke="rgba(var(--deep-rgb), 0.5)"
                  strokeWidth="3"
                />
                <path
                  d={`M 0 4 Q ${(v * 80).toFixed(1)} ${4 - swell * 2} ${(v * 160).toFixed(1)} 4`}
                  fill="none"
                  stroke="var(--candle)"
                  strokeWidth="3"
                />
              </svg>
            </div>
          </div>
          {onCalm ? (
            <WaveButton
              register="oceanic"
              onClick={() => {
                pulse("calm", 0.6);
                onCalm();
              }}
            >
              still the sea
            </WaveButton>
          ) : null}
        </div>
      </div>
    </MorphShell>
  );
}
