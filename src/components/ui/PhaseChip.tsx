"use client";

import { useId } from "react";
import { useTape } from "@/lib/tape";
import { useSwellLFO } from "@/lib/motion";

type Props = {
  options: string[];
  value: string | string[];
  onChange: (v: string | string[]) => void;
  multiple?: boolean;
  className?: string;
};

export function PhaseChip({
  options,
  value,
  onChange,
  multiple = false,
  className = "",
}: Props) {
  const { pulse } = useTape();
  const selected = new Set(Array.isArray(value) ? value : [value]);
  const { value: swell } = useSwellLFO(0.15, 0.04);

  return (
    <div className={`flex flex-wrap gap-2 ${className}`} role="group">
      {options.map((opt, i) => {
        const on = selected.has(opt);
        return (
          <Chip
            key={opt}
            label={opt}
            active={on}
            phase={swell + i * 0.4}
            onGhost={() => pulse("ghost", 0.15)}
            onSelect={() => {
              pulse("phase", 0.4);
              if (multiple) {
                const next = new Set(selected);
                if (next.has(opt)) next.delete(opt);
                else next.add(opt);
                onChange(Array.from(next));
              } else {
                onChange(opt);
              }
            }}
          />
        );
      })}
    </div>
  );
}

function Chip({
  label,
  active,
  phase,
  onGhost,
  onSelect,
}: {
  label: string;
  active: boolean;
  phase: number;
  onGhost: () => void;
  onSelect: () => void;
}) {
  const id = useId().replace(/:/g, "");
  const amp = active ? 2.4 : 1.2;
  const path = pillWave(90, 30, amp, phase);

  return (
    <button
      type="button"
      aria-pressed={active}
      className={`relative inline-flex min-h-[2.25rem] items-center px-4 py-1.5 t-meta transition-colors duration-wave ${
        active ? "text-ink" : "text-ink-2 hover:text-ink"
      }`}
      onMouseEnter={onGhost}
      onClick={onSelect}
    >
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 90 30"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d={path}
          fill={active ? "rgba(200,115,42,0.18)" : "transparent"}
          stroke={active ? "rgba(200,115,42,0.75)" : "rgba(21,23,26,0.2)"}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
          id={id}
        />
      </svg>
      <span className="relative z-10">{label}</span>
    </button>
  );
}

function pillWave(w: number, h: number, amp: number, phase: number) {
  const inset = 2;
  const l = inset;
  const r = w - inset;
  const t = inset;
  const b = h - inset;
  const steps = 14;
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const p = i / steps;
    const x = l + (r - l) * p;
    const y = t + Math.sin(p * Math.PI * 2 + phase) * (amp * 0.4);
    d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  }
  for (let i = 1; i <= steps; i++) {
    const p = i / steps;
    const y = t + (b - t) * p;
    const x = r + Math.sin(p * Math.PI * 2 + phase * 1.15) * (amp * 0.5);
    d += ` L ${x} ${y}`;
  }
  for (let i = 1; i <= steps; i++) {
    const p = i / steps;
    const x = r - (r - l) * p;
    const y = b + Math.sin(p * Math.PI * 2 - phase) * (amp * 0.4);
    d += ` L ${x} ${y}`;
  }
  for (let i = 1; i <= steps; i++) {
    const p = i / steps;
    const y = b - (b - t) * p;
    const x = l + Math.sin(p * Math.PI * 2 - phase * 1.15) * (amp * 0.5);
    d += ` L ${x} ${y}`;
  }
  return d + " Z";
}
