"use client";

import { useTape } from "@/lib/tape";

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

  return (
    <div className={`flex flex-wrap gap-2 ${className}`} role="group">
      {options.map((opt) => {
        const on = selected.has(opt);
        return (
          <button
            key={opt}
            type="button"
            aria-pressed={on}
            className={`phase-chip border px-3 py-1.5 t-meta transition-all duration-wave ${
              on
                ? "border-candle bg-candle/15 text-ink"
                : "border-rule text-ink-2 hover:border-sea/40 hover:text-ink"
            }`}
            onMouseEnter={() => pulse("ghost", 0.15)}
            onClick={() => {
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
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
