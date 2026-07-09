"use client";

import { useMemo, useState } from "react";
import { useTape } from "@/lib/tape";
import { useSwellLFO } from "@/lib/motion";

type Props = {
  options: string[];
  value: string | string[];
  onChange: (v: string | string[]) => void;
  multiple?: boolean;
  className?: string;
};

/**
 * Phase Chip — a continuous sine rail with crest nodes.
 * Selection is a standing-wave peak, not a bordered box.
 */
export function PhaseChip({
  options,
  value,
  onChange,
  multiple = false,
  className = "",
}: Props) {
  const { pulse } = useTape();
  const { value: swell, drift } = useSwellLFO(0.16, 0.045);
  const [hover, setHover] = useState<number | null>(null);
  const selected = useMemo(() => {
    const set = new Set(Array.isArray(value) ? value : [value]);
    return options.map((o) => set.has(o));
  }, [options, value]);

  const n = options.length;
  const w = Math.max(320, n * 110);
  const h = 96;
  const padX = 36;
  const midY = 42;
  const amp = 16 + swell * 5;

  const nodeX = (i: number) => padX + (i / Math.max(1, n - 1)) * (w - padX * 2);

  // continuous rail through all nodes
  const rail = useMemo(() => {
    let d = "";
    for (let x = 0; x <= w; x += 3) {
      const t = x / w;
      // base swell
      let y =
        midY +
        Math.sin(t * Math.PI * 2 * 2.2 + swell * 1.8 + drift) * amp * 0.55 +
        Math.sin(t * Math.PI * 2 * 5.5 - drift) * amp * 0.18;
      // lift toward active / hovered nodes
      for (let i = 0; i < n; i++) {
        const nx = nodeX(i);
        const dist = Math.abs(x - nx);
        const influence = Math.exp(-Math.pow(dist / 42, 2));
        const lift =
          (selected[i] ? 1 : 0) * 14 +
          (hover === i ? 8 : 0) +
          (selected[i] ? swell * 3 : 0);
        y -= influence * lift;
      }
      d += x === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    }
    return d;
  }, [w, n, amp, swell, drift, selected, hover]); // eslint-disable-line react-hooks/exhaustive-deps

  const foam = useMemo(() => {
    let d = "";
    for (let x = 0; x <= w; x += 4) {
      const t = x / w;
      const y =
        midY +
        10 +
        Math.sin(t * Math.PI * 2 * 2.2 + swell * 1.8 + drift + 0.4) * amp * 0.35 +
        Math.sin(t * Math.PI * 2 * 4.2 - swell) * 3;
      d += x === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    }
    return d;
  }, [w, amp, swell, drift, midY]);

  const pick = (i: number) => {
    const opt = options[i];
    pulse("phase", 0.55);
    if (multiple) {
      const next = new Set(Array.isArray(value) ? value : [value]);
      if (next.has(opt)) next.delete(opt);
      else next.add(opt);
      onChange(Array.from(next));
    } else {
      onChange(opt);
    }
  };

  return (
    <div className={`relative w-full select-none ${className}`} role="group">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-auto w-full"
        style={{ minHeight: 96 }}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* depth wash */}
        <defs>
          <linearGradient id="phase-wash" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(142,182,201,0.12)" />
            <stop offset="100%" stopColor="rgba(44,74,92,0.04)" />
          </linearGradient>
        </defs>
        <rect width={w} height={h} fill="url(#phase-wash)" rx="0" />

        {/* foam under-rail */}
        <path
          d={foam}
          fill="none"
          stroke="rgba(44,74,92,0.18)"
          strokeWidth={1}
          strokeDasharray="3 5"
        />

        {/* main phase rail */}
        <path
          d={rail}
          fill="none"
          stroke="rgba(44,74,92,0.75)"
          strokeWidth={2.25}
          strokeLinecap="round"
        />

        {/* nodes + hit targets */}
        {options.map((opt, i) => {
          const x = nodeX(i);
          const active = selected[i];
          const isHover = hover === i;
          // sample rail y at node (approx)
          const t = x / w;
          let y =
            midY +
            Math.sin(t * Math.PI * 2 * 2.2 + swell * 1.8 + drift) * amp * 0.55;
          y -= (active ? 14 : 0) + (isHover ? 8 : 0) + (active ? swell * 3 : 0);
          const r = active ? 9 : isHover ? 7 : 5;

          return (
            <g key={opt}>
              {/* standing-wave rings when active */}
              {active ? (
                <>
                  <circle
                    cx={x}
                    cy={y}
                    r={18 + swell * 3}
                    fill="none"
                    stroke="rgba(200,115,42,0.35)"
                    strokeWidth={1}
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r={26 + Math.abs(drift) * 4}
                    fill="none"
                    stroke="rgba(200,115,42,0.18)"
                    strokeWidth={1}
                  />
                </>
              ) : null}

              {/* crest node */}
              <circle
                cx={x}
                cy={y}
                r={r}
                fill={active ? "#C8732A" : isHover ? "#2C4A5C" : "var(--paper)"}
                stroke={active ? "#C8732A" : "#2C4A5C"}
                strokeWidth={1.75}
              />

              {/* label */}
              <text
                x={x}
                y={h - 14}
                textAnchor="middle"
                className="fill-ink"
                style={{
                  fontSize: 11,
                  fontFamily: "var(--font-text)",
                  letterSpacing: "0.04em",
                  fill: active ? "#C8732A" : isHover ? "#15171A" : "#3A3D42",
                }}
              >
                {opt}
              </text>

              {/* invisible hit target */}
              <rect
                x={x - 40}
                y={0}
                width={80}
                height={h}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => {
                  setHover(i);
                  pulse("ghost", 0.12);
                }}
                onMouseLeave={() => setHover(null)}
                onClick={() => pick(i)}
                role="button"
                aria-pressed={active}
                aria-label={opt}
              />
            </g>
          );
        })}
      </svg>
      <p className="mt-1 text-center t-meta text-ink-2/70">
        phase rail · crest = selected · hover lifts the node
      </p>
    </div>
  );
}
