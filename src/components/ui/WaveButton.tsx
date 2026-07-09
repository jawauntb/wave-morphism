"use client";

import { useId, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { useTape } from "@/lib/tape";
import { useSwellLFO } from "@/lib/motion";

type Register = "devotional" | "operational" | "oceanic";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  register?: Register;
  ritual?: boolean;
  children: ReactNode;
};

const stroke: Record<Register, string> = {
  devotional: "rgba(200,115,42,0.7)",
  operational: "rgba(21,23,26,0.35)",
  oceanic: "rgba(44,74,92,0.65)",
};

const fillHover: Record<Register, string> = {
  devotional: "rgba(200,115,42,0.12)",
  operational: "rgba(21,23,26,0.04)",
  oceanic: "rgba(44,74,92,0.1)",
};

export function WaveButton({
  register = "operational",
  ritual = false,
  children,
  className = "",
  onClick,
  ...rest
}: Props) {
  const { pulse } = useTape();
  const ref = useRef<HTMLButtonElement>(null);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const [hover, setHover] = useState(false);
  const id = useRef(0);
  const svgId = useId().replace(/:/g, "");
  const { value: swell } = useSwellLFO(0.16, 0.05);
  const phase = swell * (ritual ? 1.4 : 0.9) + (hover ? 0.4 : 0);

  const path = pillWave(100, 36, 2.2 + Math.abs(swell) * 1.2, phase);

  return (
    <button
      ref={ref}
      type="button"
      className={`wave-btn relative inline-flex min-h-[2.75rem] items-center justify-center overflow-visible px-5 py-2.5 t-meta text-ink transition-colors duration-wave ${
        register === "oceanic" ? "text-sea" : ""
      } ${className}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={(e) => {
        const el = ref.current;
        if (el) {
          const rect = el.getBoundingClientRect();
          const next = {
            id: ++id.current,
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          };
          setRipples((r) => [...r, next]);
          setTimeout(() => {
            setRipples((r) => r.filter((x) => x.id !== next.id));
          }, ritual ? 900 : 550);
        }
        pulse(ritual ? "ritual" : "press", ritual ? 0.75 : 0.45);
        onClick?.(e);
      }}
      {...rest}
    >
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 100 36"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d={path}
          fill={hover ? fillHover[register] : "transparent"}
          stroke={stroke[register]}
          strokeWidth={1.1}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {ripples.map((r) => (
        <span
          key={r.id}
          className={`pointer-events-none absolute z-0 rounded-full bg-sea/30 ${
            ritual ? "animate-ritual-ripple" : "animate-btn-ripple"
          }`}
          style={{
            left: r.x,
            top: r.y,
            width: 8,
            height: 8,
            marginLeft: -4,
            marginTop: -4,
          }}
        />
      ))}
      <span className="relative z-10" id={svgId}>
        {children}
      </span>
    </button>
  );
}

function pillWave(w: number, h: number, amp: number, phase: number) {
  const inset = 2;
  const l = inset;
  const r = w - inset;
  const t = inset;
  const b = h - inset;
  const steps = 18;
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const p = i / steps;
    const x = l + (r - l) * p;
    const y = t + Math.sin(p * Math.PI * 2 + phase) * (amp * 0.35);
    d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  }
  for (let i = 1; i <= steps; i++) {
    const p = i / steps;
    const y = t + (b - t) * p;
    const x = r + Math.sin(p * Math.PI * 2 + phase * 1.2) * (amp * 0.45);
    d += ` L ${x} ${y}`;
  }
  for (let i = 1; i <= steps; i++) {
    const p = i / steps;
    const x = r - (r - l) * p;
    const y = b + Math.sin(p * Math.PI * 2 - phase) * (amp * 0.35);
    d += ` L ${x} ${y}`;
  }
  for (let i = 1; i <= steps; i++) {
    const p = i / steps;
    const y = b - (b - t) * p;
    const x = l + Math.sin(p * Math.PI * 2 - phase * 1.2) * (amp * 0.45);
    d += ` L ${x} ${y}`;
  }
  return d + " Z";
}
