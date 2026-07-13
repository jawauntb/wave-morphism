"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTape } from "@/lib/tape";
import { useSwellLFO } from "@/lib/motion";

type Props = {
  value: number;
  onChange: (radians: number) => void;
  size?: number;
  className?: string;
  label?: string;
};

/**
 * Wind rose — 360° direction control.
 * Drag the arrow; N/E/S/W ticks orient the field.
 * Gust rings + wake trail so turning feels like weather, not a dead dial.
 */
export function WindRose({
  value,
  onChange,
  size = 96,
  className = "",
  label = "wind",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { pulse } = useTape();
  const lastTone = useRef(0);
  const { value: swell } = useSwellLFO(0.14, 0.04);
  const id = useId().replace(/:/g, "");
  const [gusts, setGusts] = useState<{ id: number; a: number; t0: number }[]>([]);
  const gustId = useRef(0);
  const trail = useRef<number[]>([]);

  const setFromEvent = (clientX: number, clientY: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const ang = Math.atan2(clientY - cy, clientX - cx);
    onChange(ang);
    trail.current = [...trail.current.slice(-10), ang];
    const now = performance.now();
    if (now - lastTone.current > 90) {
      lastTone.current = now;
      pulse("ripple", 0.28);
      const gid = ++gustId.current;
      setGusts((g) => [...g.slice(-5), { id: gid, a: ang, t0: now }]);
    }
  };

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const now = performance.now();
      setGusts((g) => g.filter((x) => now - x.t0 < 700));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setFromEvent(e.clientX, e.clientY);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    setFromEvent(e.clientX, e.clientY);
  };

  const r = size / 2;
  const ax = r + Math.cos(value) * (r * 0.62);
  const ay = r + Math.sin(value) * (r * 0.62);
  const deg = ((value * 180) / Math.PI + 360) % 360;
  const now = typeof performance !== "undefined" ? performance.now() : 0;

  // cardinal bearing name
  const bearings = ["E", "NE", "N", "NW", "W", "SW", "S", "SE"];
  const bearing = bearings[Math.round((((deg % 360) + 360) % 360) / 45) % 8];

  return (
    <div className={`inline-flex flex-col items-center gap-2 ${className}`}>
      <div
        ref={ref}
        role="slider"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={360}
        aria-valuenow={Math.round(deg)}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onKeyDown={(e) => {
          const step = (Math.PI * 2) / 16;
          if (e.key === "ArrowRight" || e.key === "ArrowUp") {
            e.preventDefault();
            onChange(value + step);
            pulse("ripple", 0.25);
          } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
            e.preventDefault();
            onChange(value - step);
            pulse("ripple", 0.25);
          }
        }}
        className="relative cursor-crosshair touch-none select-none"
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
          <defs>
            <radialGradient id={`rose-${id}`} cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="rgba(var(--sea-rgb), 0.55)" />
              <stop offset="100%" stopColor="rgba(var(--deep-rgb), 0.92)" />
            </radialGradient>
          </defs>
          <circle
            cx={r}
            cy={r}
            r={r - 2}
            fill={`url(#rose-${id})`}
            stroke="rgba(var(--crest-rgb), 0.5)"
            strokeWidth={1.25}
          />
          {/* swell rings */}
          <circle
            cx={r}
            cy={r}
            r={r * 0.55 + swell * 3}
            fill="none"
            stroke="rgba(var(--crest-rgb), 0.25)"
            strokeWidth={1}
          />
          <circle
            cx={r}
            cy={r}
            r={r * 0.32}
            fill="none"
            stroke="rgba(var(--candle-rgb), 0.2)"
            strokeWidth={1}
            strokeDasharray="3 5"
          />
          {/* trail wake */}
          {trail.current.map((a, i) => {
            const tr = r * (0.35 + i * 0.025);
            return (
              <circle
                key={i}
                cx={r + Math.cos(a) * tr}
                cy={r + Math.sin(a) * tr}
                r={1.5}
                fill={`rgba(var(--candle-rgb), ${0.15 + i * 0.05})`}
              />
            );
          })}
          {/* gust rings on drag */}
          {gusts.map((g) => {
            const age = Math.min(1, (now - g.t0) / 700);
            return (
              <circle
                key={g.id}
                cx={r + Math.cos(g.a) * (r * 0.62)}
                cy={r + Math.sin(g.a) * (r * 0.62)}
                r={4 + age * 18}
                fill="none"
                stroke={`rgba(var(--candle-rgb), ${(1 - age) * 0.7})`}
                strokeWidth={1.5}
              />
            );
          })}
          {(["N", "E", "S", "W"] as const).map((lab, i) => {
            const a = -Math.PI / 2 + (i * Math.PI) / 2;
            const tx = r + Math.cos(a) * (r * 0.78);
            const ty = r + Math.sin(a) * (r * 0.78);
            return (
              <text
                key={lab}
                x={tx}
                y={ty}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="rgba(244,248,255,0.75)"
                fontSize={9}
                fontFamily="var(--font-mono), monospace"
              >
                {lab}
              </text>
            );
          })}
          <line
            x1={r}
            y1={r}
            x2={ax}
            y2={ay}
            stroke="rgba(var(--candle-rgb), 0.95)"
            strokeWidth={2.25}
            strokeLinecap="round"
          />
          <circle cx={ax} cy={ay} r={5} fill="rgba(var(--candle-rgb), 1)" />
          <circle
            cx={ax}
            cy={ay}
            r={8 + Math.abs(swell) * 2}
            fill="none"
            stroke="rgba(var(--candle-rgb), 0.35)"
            strokeWidth={1}
          />
          <circle cx={r} cy={r} r={3.5} fill="rgba(244,248,255,0.9)" />
        </svg>
      </div>
      <span className="t-eyebrow text-crest">
        {label} · {bearing} · {Math.round(deg)}°
      </span>
    </div>
  );
}
