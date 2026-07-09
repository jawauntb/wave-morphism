"use client";

import { useMemo, useRef, useState } from "react";
import { useTape } from "@/lib/tape";

type Props = {
  axes: string[];
  values: number[];
  onChange: (values: number[]) => void;
  size?: number;
  className?: string;
};

export function ConcernPolygon({
  axes,
  values,
  onChange,
  size = 260,
  className = "",
}: Props) {
  const { pulse } = useTape();
  const dragging = useRef<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.38;

  const points = useMemo(() => {
    return values.map((v, i) => {
      const a = -Math.PI / 2 + (i / axes.length) * Math.PI * 2;
      const r = Math.max(0.08, Math.min(1, v)) * maxR;
      return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, a };
    });
  }, [values, axes.length, cx, cy, maxR]);

  const poly = points.map((p) => `${p.x},${p.y}`).join(" ");

  const project = (clientX: number, clientY: number, index: number, el: SVGSVGElement) => {
    const rect = el.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * size - cx;
    const y = ((clientY - rect.top) / rect.height) * size - cy;
    const a = -Math.PI / 2 + (index / axes.length) * Math.PI * 2;
    const along = x * Math.cos(a) + y * Math.sin(a);
    return Math.max(0, Math.min(1, along / maxR));
  };

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="touch-none"
        data-touch-surface
        onPointerMove={(e) => {
          if (dragging.current == null) return;
          const el = e.currentTarget;
          const next = [...values];
          next[dragging.current] = project(e.clientX, e.clientY, dragging.current, el);
          onChange(next);
        }}
        onPointerUp={() => {
          if (dragging.current != null) pulse("release", 0.5);
          dragging.current = null;
        }}
        onPointerLeave={() => setHover(null)}
      >
        {axes.map((_, i) => {
          const a = -Math.PI / 2 + (i / axes.length) * Math.PI * 2;
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={cx + Math.cos(a) * maxR}
              y2={cy + Math.sin(a) * maxR}
              stroke="rgba(21,23,26,0.14)"
              strokeWidth={1}
            />
          );
        })}
        {[0.33, 0.66, 1].map((t) => (
          <circle
            key={t}
            cx={cx}
            cy={cy}
            r={maxR * t}
            fill="none"
            stroke="rgba(21,23,26,0.1)"
            strokeDasharray={t === 1 ? undefined : "2 4"}
          />
        ))}
        <polygon
          points={poly}
          fill="rgba(200,115,42,0.18)"
          stroke="#C8732A"
          strokeWidth={1.5}
        />
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r={hover === i || dragging.current === i ? 8 : 5}
              fill="#C8732A"
              stroke="var(--paper)"
              strokeWidth={2}
              className="cursor-grab"
              onPointerDown={(e) => {
                dragging.current = i;
                (e.target as Element).setPointerCapture(e.pointerId);
                pulse("vertex", 0.55);
              }}
              onPointerEnter={() => setHover(i)}
            />
            <text
              x={cx + Math.cos(p.a) * (maxR + 18)}
              y={cy + Math.sin(p.a) * (maxR + 18)}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ fontSize: 10, fontFamily: "var(--font-text)" }}
              className="fill-ink-2"
            >
              {axes[i]}
            </text>
          </g>
        ))}
      </svg>
      {hover != null ? (
        <p className="absolute bottom-0 left-0 right-0 text-center t-meta text-ink-2">
          {axes[hover]} · {Math.round(values[hover] * 100)}
        </p>
      ) : null}
    </div>
  );
}

export function SigilMark({
  values,
  size = 48,
  className = "",
  playable = false,
}: {
  values: number[];
  size?: number;
  className?: string;
  playable?: boolean;
}) {
  const { pulse } = useTape();
  const n = values.length || 8;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.38;
  const pts = values.map((v, i) => {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
    const r = Math.max(0.08, v) * maxR;
    return `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`;
  });

  return (
    <button
      type="button"
      disabled={!playable}
      className={`${playable ? "cursor-pointer hover:opacity-90" : "cursor-default"} ${className}`}
      onClick={() => playable && pulse("sigil", 0.8)}
      aria-label={playable ? "play sigil" : "sigil"}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <polygon
          points={pts.join(" ")}
          fill="rgba(44,74,92,0.15)"
          stroke="#2C4A5C"
          strokeWidth={1.25}
        />
      </svg>
    </button>
  );
}
