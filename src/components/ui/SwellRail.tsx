"use client";

import { useId, useRef } from "react";
import { useTape } from "@/lib/tape";
import { useSwellLFO } from "@/lib/motion";

/**
 * Canonical 0–1 control. Replaces native <input type="range">.
 * A swell rail with a crest thumb — values as geometry, not a spreadsheet column.
 */
export function SwellRail({
  value,
  onChange,
  label,
  className = "",
  min = 0,
  max = 1,
}: {
  value: number;
  onChange: (v: number) => void;
  label?: string;
  className?: string;
  min?: number;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const clipId = useId().replace(/:/g, "");
  const { pulse } = useTape();
  const { value: swell } = useSwellLFO(0.16, 0.035);
  const span = max - min || 1;
  const t = Math.max(0, Math.min(1, (value - min) / span));

  const setFromClientX = (clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const next = min + Math.max(0, Math.min(1, (clientX - r.left) / r.width)) * span;
    onChange(next);
  };

  const w = 200;
  const h = 36;
  const crestY = h * 0.55 + swell * 2;
  let wave = `M 0 ${crestY}`;
  for (let x = 0; x <= w; x += 4) {
    const p = x / w;
    const y =
      crestY +
      Math.sin(p * Math.PI * 2 * 2.2 + swell * 2) * (3 + t * 4) +
      Math.sin(p * Math.PI * 2 * 5 - swell) * 1.4;
    wave += ` L ${x} ${y}`;
  }

  return (
    <div className={`w-full ${className}`}>
      {label ? (
        <p className="mb-2 t-eyebrow text-ink-2">
          {label}
          <span className="ml-2 text-candle">{Math.round(t * 100)}</span>
        </p>
      ) : null}
      <div
        ref={ref}
        role="slider"
        aria-label={label}
        aria-valuemin={Math.round(min * 100)}
        aria-valuemax={Math.round(max * 100)}
        aria-valuenow={Math.round(value * 100)}
        tabIndex={0}
        className="relative h-10 cursor-ew-resize touch-none select-none"
        onPointerDown={(e) => {
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          setFromClientX(e.clientX);
          pulse("ripple", 0.25);
        }}
        onPointerMove={(e) => {
          if (!dragging.current) return;
          setFromClientX(e.clientX);
        }}
        onPointerUp={() => {
          if (!dragging.current) return;
          dragging.current = false;
          pulse("release", 0.3);
        }}
        onKeyDown={(e) => {
          const step = span * 0.05;
          if (e.key === "ArrowRight" || e.key === "ArrowUp") {
            e.preventDefault();
            onChange(Math.min(max, value + step));
          }
          if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
            e.preventDefault();
            onChange(Math.max(min, value - step));
          }
          if (e.key === "Home") {
            e.preventDefault();
            onChange(min);
          }
          if (e.key === "End") {
            e.preventDefault();
            onChange(max);
          }
        }}
      >
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox={`0 0 ${w} ${h}`}
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d={`${wave} L ${w} ${h} L 0 ${h} Z`}
            fill="rgba(var(--sea-rgb), 0.12)"
          />
          <path
            d={wave}
            fill="none"
            stroke="rgba(var(--sea-rgb), 0.45)"
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
          />
          <defs>
            <clipPath id={`swell-wet-${clipId}`}>
              <rect x={0} y={0} width={t * w} height={h} />
            </clipPath>
          </defs>
          <path
            d={`${wave} L ${w} ${h} L 0 ${h} Z`}
            fill="rgba(var(--haze-rgb), 0.35)"
            clipPath={`url(#swell-wet-${clipId})`}
          />
          <path
            d={wave}
            fill="none"
            stroke="var(--candle)"
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
            clipPath={`url(#swell-wet-${clipId})`}
          />
        </svg>
        <span
          className="pointer-events-none absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-candle shadow-[0_0_0_3px_rgba(var(--candle-rgb),0.2)]"
          style={{ left: `${t * 100}%` }}
          aria-hidden
        />
      </div>
    </div>
  );
}
