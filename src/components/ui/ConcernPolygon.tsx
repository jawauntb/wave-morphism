"use client";

import { useId, useMemo, useRef, useState } from "react";
import { useTape } from "@/lib/tape";
import { useSwellLFO } from "@/lib/motion";

type Props = {
  axes: string[];
  values: number[];
  onChange: (values: number[]) => void;
  size?: number;
  className?: string;
};

/**
 * Concern field as a liquid blob — cardinal spline through axis crests,
 * breathing with the shared swell. Not a straight-edged radar chart.
 */
export function ConcernPolygon({
  axes,
  values,
  onChange,
  size = 280,
  className = "",
}: Props) {
  const { pulse } = useTape();
  const { value: swell, drift } = useSwellLFO(0.14, 0.04);
  const dragging = useRef<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const gradId = useId().replace(/:/g, "");
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.36;

  const points = useMemo(() => {
    return values.map((v, i) => {
      const a = -Math.PI / 2 + (i / axes.length) * Math.PI * 2;
      // swell gently modulates radius so the blob breathes
      const breathe = 1 + swell * 0.04 + Math.sin(a * 2 + drift) * 0.02;
      const r = Math.max(0.1, Math.min(1, v)) * maxR * breathe;
      return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, a, r };
    });
  }, [values, axes.length, cx, cy, maxR, swell, drift]);

  const blobPath = useMemo(() => cardinalLoop(points, 0.35), [points]);
  const foamPath = useMemo(() => {
    // slightly larger offset foam ring
    const foamPts = points.map((p) => {
      const grow = 1.08 + swell * 0.03;
      return {
        x: cx + (p.x - cx) * grow,
        y: cy + (p.y - cy) * grow,
      };
    });
    return cardinalLoop(foamPts, 0.4);
  }, [points, cx, cy, swell]);

  const project = (
    clientX: number,
    clientY: number,
    index: number,
    el: SVGSVGElement
  ) => {
    const rect = el.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * size - cx;
    const y = ((clientY - rect.top) / rect.height) * size - cy;
    const a = -Math.PI / 2 + (index / axes.length) * Math.PI * 2;
    const along = x * Math.cos(a) + y * Math.sin(a);
    return Math.max(0, Math.min(1, along / maxR));
  };

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size + 28 }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="touch-none overflow-visible"
        data-touch-surface
        onPointerMove={(e) => {
          if (dragging.current == null) return;
          const el = e.currentTarget;
          const next = [...values];
          next[dragging.current] = project(
            e.clientX,
            e.clientY,
            dragging.current,
            el
          );
          onChange(next);
        }}
        onPointerUp={() => {
          if (dragging.current != null) pulse("release", 0.5);
          dragging.current = null;
        }}
        onPointerLeave={() => setHover(null)}
      >
        <defs>
          <radialGradient id={`blob-${gradId}`} cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="rgba(200,115,42,0.35)" />
            <stop offset="55%" stopColor="rgba(200,115,42,0.16)" />
            <stop offset="100%" stopColor="rgba(44,74,92,0.08)" />
          </radialGradient>
        </defs>

        {/* tidal rings — dashed sine-warped circles */}
        {[0.35, 0.65, 1].map((t, ri) => (
          <path
            key={t}
            d={waveRing(cx, cy, maxR * t, swell + ri * 0.7, drift)}
            fill="none"
            stroke="rgba(44,74,92,0.14)"
            strokeWidth={1}
            strokeDasharray={ri === 2 ? undefined : "3 6"}
          />
        ))}

        {/* soft axis rays */}
        {axes.map((_, i) => {
          const a = -Math.PI / 2 + (i / axes.length) * Math.PI * 2;
          const x2 = cx + Math.cos(a) * maxR;
          const y2 = cy + Math.sin(a) * maxR;
          return (
            <path
              key={i}
              d={waveRay(cx, cy, x2, y2, swell + i * 0.3)}
              fill="none"
              stroke="rgba(21,23,26,0.12)"
              strokeWidth={1}
            />
          );
        })}

        {/* foam outline */}
        <path
          d={foamPath}
          fill="none"
          stroke="rgba(142,182,201,0.45)"
          strokeWidth={1.25}
          strokeDasharray="4 5"
        />

        {/* liquid blob */}
        <path
          d={blobPath}
          fill={`url(#blob-${gradId})`}
          stroke="#C8732A"
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* crest nodes */}
        {points.map((p, i) => {
          const active = hover === i || dragging.current === i;
          return (
            <g key={i}>
              {active ? (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={16 + swell * 2}
                  fill="none"
                  stroke="rgba(200,115,42,0.35)"
                  strokeWidth={1}
                />
              ) : null}
              <circle
                cx={p.x}
                cy={p.y}
                r={active ? 9 : 6}
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
                x={cx + Math.cos(p.a) * (maxR + 22)}
                y={cy + Math.sin(p.a) * (maxR + 22)}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{
                  fontSize: 10,
                  fontFamily: "var(--font-text)",
                  letterSpacing: "0.03em",
                  fill: active ? "#C8732A" : "#3A3D42",
                }}
              >
                {axes[i]}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="mt-1 text-center t-meta text-ink-2">
        {hover != null
          ? `${axes[hover]} · ${Math.round(values[hover] * 100)}`
          : "liquid field · drag a crest"}
      </p>
    </div>
  );
}

/** Closed cardinal spline through points */
function cardinalLoop(
  pts: { x: number; y: number }[],
  tension = 0.35
) {
  if (pts.length < 2) return "";
  const n = pts.length;
  const get = (i: number) => pts[(i + n) % n];
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < n; i++) {
    const p0 = get(i - 1);
    const p1 = get(i);
    const p2 = get(i + 1);
    const p3 = get(i + 2);
    const c1x = p1.x + ((p2.x - p0.x) * tension) / 6;
    const c1y = p1.y + ((p2.y - p0.y) * tension) / 6;
    const c2x = p2.x - ((p3.x - p1.x) * tension) / 6;
    const c2y = p2.y - ((p3.y - p1.y) * tension) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d + " Z";
}

function waveRing(
  cx: number,
  cy: number,
  r: number,
  phase: number,
  drift: number
) {
  const steps = 64;
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const wobble =
      Math.sin(t * 3 + phase) * (r * 0.035) +
      Math.sin(t * 5 - drift) * (r * 0.02);
    const x = cx + Math.cos(t - Math.PI / 2) * (r + wobble);
    const y = cy + Math.sin(t - Math.PI / 2) * (r + wobble);
    d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  }
  return d + " Z";
}

function waveRay(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  phase: number
) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const bend = Math.sin(phase) * 4;
  return `M ${x1} ${y1} Q ${mx + nx * bend} ${my + ny * bend} ${x2} ${y2}`;
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
  const { value: swell } = useSwellLFO(0.14, 0.03);
  const n = values.length || 8;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.38;
  const pts = values.map((v, i) => {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
    const r = Math.max(0.1, v) * maxR * (1 + swell * 0.05);
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
  });
  const path = cardinalLoop(pts, 0.4);

  return (
    <button
      type="button"
      disabled={!playable}
      className={`${playable ? "cursor-pointer hover:opacity-90" : "cursor-default"} ${className}`}
      onClick={() => playable && pulse("sigil", 0.8)}
      aria-label={playable ? "play sigil" : "sigil"}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <path
          d={path}
          fill="rgba(44,74,92,0.18)"
          stroke="#2C4A5C"
          strokeWidth={1.5}
        />
      </svg>
    </button>
  );
}
