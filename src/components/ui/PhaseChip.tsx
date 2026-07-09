"use client";

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
    <div className={`flex flex-wrap gap-3 ${className}`} role="group">
      {options.map((opt, i) => {
        const on = selected.has(opt);
        return (
          <Chip
            key={opt}
            label={opt}
            active={on}
            phase={swell + i * 0.55}
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
  const amp = active ? 4.8 : 3.2;
  const path = liquidPill(100, 34, amp, phase);
  const crest = crestLine(100, 34, phase);

  return (
    <button
      type="button"
      aria-pressed={active}
      className={`relative inline-flex min-h-[2.5rem] min-w-[4.5rem] items-center justify-center px-4 py-1.5 t-meta transition-colors duration-wave ${
        active ? "text-ink" : "text-ink-2 hover:text-ink"
      }`}
      onMouseEnter={onGhost}
      onClick={onSelect}
    >
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        viewBox="0 0 100 34"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d={path}
          fill={active ? "rgba(200,115,42,0.2)" : "rgba(44,74,92,0.06)"}
        />
        <path
          d={path}
          fill="none"
          stroke={active ? "rgba(200,115,42,0.85)" : "rgba(21,23,26,0.35)"}
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={crest}
          fill="none"
          stroke={active ? "rgba(200,115,42,0.7)" : "rgba(44,74,92,0.35)"}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <span className="relative z-10">{label}</span>
    </button>
  );
}

function liquidPill(w: number, h: number, amp: number, phase: number) {
  const inset = amp + 0.5;
  const l = inset;
  const r = w - inset;
  const t = inset;
  const b = h - inset;
  const steps = 22;
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const p = i / steps;
    const x = l + (r - l) * p;
    const y =
      t +
      Math.sin(p * Math.PI * 2 * 1.5 + phase) * amp * 0.55 +
      Math.sin(p * Math.PI * 2 * 3.2 - phase) * amp * 0.2;
    d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  }
  for (let i = 1; i <= steps; i++) {
    const p = i / steps;
    const y = t + (b - t) * p;
    const x =
      r +
      Math.sin(p * Math.PI * 2 * 1.5 + phase * 1.3) * amp * 0.7 +
      Math.sin(p * Math.PI * 2 * 2.8 - phase) * amp * 0.25;
    d += ` L ${x} ${y}`;
  }
  for (let i = 1; i <= steps; i++) {
    const p = i / steps;
    const x = r - (r - l) * p;
    const y =
      b +
      Math.sin(p * Math.PI * 2 * 1.5 - phase) * amp * 0.55 +
      Math.sin(p * Math.PI * 2 * 3.2 + phase) * amp * 0.2;
    d += ` L ${x} ${y}`;
  }
  for (let i = 1; i <= steps; i++) {
    const p = i / steps;
    const y = b - (b - t) * p;
    const x =
      l +
      Math.sin(p * Math.PI * 2 * 1.5 - phase * 1.3) * amp * 0.7 +
      Math.sin(p * Math.PI * 2 * 2.8 + phase) * amp * 0.25;
    d += ` L ${x} ${y}`;
  }
  return d + " Z";
}

function crestLine(w: number, h: number, phase: number) {
  const y0 = h * 0.58;
  let d = `M ${w * 0.1} ${y0}`;
  for (let x = w * 0.1; x <= w * 0.9; x += 4) {
    const p = x / w;
    const y =
      y0 +
      Math.sin(p * Math.PI * 2 * 2.5 + phase * 2) * 2.8 +
      Math.sin(p * Math.PI * 2 * 5 - phase) * 1.2;
    d += ` L ${x} ${y}`;
  }
  return d;
}
