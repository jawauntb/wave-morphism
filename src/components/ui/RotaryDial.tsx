"use client";

import { useEffect, useRef, useState } from "react";
import { useTape } from "@/lib/tape";

type Props = {
  value: number;
  onChange: (v: number) => void;
  label?: string;
  rings?: 1 | 2;
  secondary?: number;
  onSecondaryChange?: (v: number) => void;
  className?: string;
  size?: number;
};

export function RotaryDial({
  value,
  onChange,
  label = "swell",
  rings = 1,
  secondary = 0.4,
  onSecondaryChange,
  className = "",
  size = 160,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { pulse } = useTape();
  const dragging = useRef<"outer" | "inner" | null>(null);
  const [live, setLive] = useState(value);
  const [live2, setLive2] = useState(secondary);

  useEffect(() => setLive(value), [value]);
  useEffect(() => setLive2(secondary), [secondary]);

  const angleOf = (v: number) => -Math.PI / 2 + v * Math.PI * 1.7;
  const valueFromEvent = (e: PointerEvent | React.PointerEvent, el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let a = Math.atan2(e.clientY - cy, e.clientX - cx) + Math.PI / 2;
    if (a < 0) a += Math.PI * 2;
    const span = Math.PI * 1.7;
    return Math.max(0, Math.min(1, a / span));
  };

  const ring = (r: number, v: number, color: string, thick: number) => {
    const start = angleOf(0);
    const end = angleOf(v);
    const x0 = size / 2 + Math.cos(start) * r;
    const y0 = size / 2 + Math.sin(start) * r;
    const x1 = size / 2 + Math.cos(end) * r;
    const y1 = size / 2 + Math.sin(end) * r;
    const large = end - start > Math.PI ? 1 : 0;
    return (
      <>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(21,23,26,0.12)"
          strokeWidth={thick}
        />
        <path
          d={`M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`}
          fill="none"
          stroke={color}
          strokeWidth={thick}
          strokeLinecap="round"
        />
        <circle cx={x1} cy={y1} r={thick * 0.9} fill={color} />
      </>
    );
  };

  return (
    <div
      ref={ref}
      className={`relative select-none touch-none ${className}`}
      style={{ width: size, height: size }}
      data-touch-surface
      onPointerDown={(e) => {
        const el = ref.current!;
        const rect = el.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        const dist = Math.hypot(dx, dy);
        const which =
          rings === 2 && dist < size * 0.28 ? "inner" : ("outer" as const);
        dragging.current = which;
        el.setPointerCapture(e.pointerId);
        const v = valueFromEvent(e, el);
        if (which === "outer") {
          setLive(v);
          onChange(v);
        } else {
          setLive2(v);
          onSecondaryChange?.(v);
        }
        pulse("dial", 0.35);
      }}
      onPointerMove={(e) => {
        if (!dragging.current) return;
        const el = ref.current!;
        const v = valueFromEvent(e, el);
        if (dragging.current === "outer") {
          setLive(v);
          onChange(v);
        } else {
          setLive2(v);
          onSecondaryChange?.(v);
        }
      }}
      onPointerUp={() => {
        dragging.current = null;
        pulse("dial-release", 0.25);
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {ring(size * 0.38, live, "#2C4A5C", 8)}
        {rings === 2 ? ring(size * 0.24, live2, "#C8732A", 6) : null}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size * 0.14}
          fill="var(--paper-2)"
          stroke="rgba(21,23,26,0.14)"
        />
        <text
          x={size / 2}
          y={size / 2 - 4}
          textAnchor="middle"
          className="fill-ink"
          style={{ fontSize: 11, fontFamily: "var(--font-text)" }}
        >
          {label}
        </text>
        <text
          x={size / 2}
          y={size / 2 + 12}
          textAnchor="middle"
          className="fill-ink-2"
          style={{ fontSize: 13, fontFamily: "var(--font-numerals)" }}
        >
          {Math.round(live * 100)}
        </text>
      </svg>
    </div>
  );
}
