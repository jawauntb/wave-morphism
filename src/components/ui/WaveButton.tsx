"use client";

import { useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { useTape } from "@/lib/tape";

type Register = "devotional" | "operational" | "oceanic";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  register?: Register;
  ritual?: boolean;
  children: ReactNode;
};

const accents: Record<Register, string> = {
  devotional: "border-candle/50 text-ink hover:bg-candle/10",
  operational: "border-ink/25 text-ink hover:bg-ink/[0.04]",
  oceanic: "border-sea/40 text-sea hover:bg-sea/10",
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
  const id = useRef(0);

  return (
    <button
      ref={ref}
      type="button"
      className={`wave-btn relative overflow-hidden border px-4 py-2.5 t-meta transition-colors duration-wave ${accents[register]} ${className}`}
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
      {ripples.map((r) => (
        <span
          key={r.id}
          className={`pointer-events-none absolute rounded-full bg-sea/25 ${ritual ? "animate-ritual-ripple" : "animate-btn-ripple"}`}
          style={{ left: r.x, top: r.y, width: 8, height: 8, marginLeft: -4, marginTop: -4 }}
        />
      ))}
      <span className="relative z-10">{children}</span>
    </button>
  );
}
