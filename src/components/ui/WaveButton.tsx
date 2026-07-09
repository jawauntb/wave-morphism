"use client";

import {
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { useTape } from "@/lib/tape";
import { useSwellLFO } from "@/lib/motion";

type Register = "devotional" | "operational" | "oceanic";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  register?: Register;
  ritual?: boolean;
  children: ReactNode;
};

const palette: Record<
  Register,
  { stroke: string; fill: string; crest: string; text: string }
> = {
  oceanic: {
    stroke: "#2C4A5C",
    fill: "rgba(44,74,92,0.14)",
    crest: "rgba(142,182,201,0.85)",
    text: "#2C4A5C",
  },
  devotional: {
    stroke: "#C8732A",
    fill: "rgba(200,115,42,0.16)",
    crest: "rgba(200,115,42,0.9)",
    text: "#15171A",
  },
  operational: {
    stroke: "rgba(21,23,26,0.55)",
    fill: "rgba(21,23,26,0.06)",
    crest: "rgba(44,74,92,0.55)",
    text: "#15171A",
  },
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
  const [pressed, setPressed] = useState(false);
  const id = useRef(0);
  const clipId = useId().replace(/:/g, "");
  const { value: swell, drift } = useSwellLFO(0.18, 0.05);
  const colors = palette[register];

  const amp = (ritual ? 5.5 : 4.2) + Math.abs(swell) * 2.2 + (hover ? 1.4 : 0) + (pressed ? 1.8 : 0);
  const phase = swell * 1.6 + drift * 0.5 + (hover ? 0.6 : 0);
  const path = liquidPill(120, 44, amp, phase);
  const crest = crestLine(120, 44, phase, swell);

  return (
    <button
      ref={ref}
      type="button"
      className={`wave-btn relative inline-flex min-h-[3rem] min-w-[7.5rem] items-center justify-center overflow-visible px-6 py-3 t-meta transition-colors duration-wave ${className}`}
      style={{ color: colors.text }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        setPressed(false);
      }}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
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
          }, ritual ? 1000 : 650);
        }
        pulse(ritual ? "ritual" : "press", ritual ? 0.75 : 0.45);
        onClick?.(e);
      }}
      {...rest}
    >
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        viewBox="0 0 120 44"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <clipPath id={`clip-${clipId}`}>
            <path d={path} />
          </clipPath>
        </defs>
        <path d={path} fill={colors.fill} />
        <path
          d={path}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={1.75}
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={crest}
          fill="none"
          stroke={colors.crest}
          strokeWidth={1.25}
          vectorEffect="non-scaling-stroke"
          opacity={0.85}
          clipPath={`url(#clip-${clipId})`}
        />
      </svg>
      {ripples.map((r) => (
        <span
          key={r.id}
          className={`pointer-events-none absolute z-0 rounded-full ${
            ritual ? "animate-ritual-ripple" : "animate-btn-ripple"
          }`}
          style={{
            left: r.x,
            top: r.y,
            width: 10,
            height: 10,
            marginLeft: -5,
            marginTop: -5,
            background: colors.crest,
          }}
        />
      ))}
      <span className="relative z-10">{children}</span>
    </button>
  );
}

/** Obviously undulating pill — amp is ~10% of height so it never reads as a box */
function liquidPill(w: number, h: number, amp: number, phase: number) {
  const inset = amp + 1;
  const l = inset;
  const r = w - inset;
  const t = inset;
  const b = h - inset;
  const steps = 28;
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

function crestLine(w: number, h: number, phase: number, swell: number) {
  const y0 = h * (0.55 + swell * 0.06);
  let d = `M ${w * 0.08} ${y0}`;
  for (let x = w * 0.08; x <= w * 0.92; x += 4) {
    const p = x / w;
    const y =
      y0 +
      Math.sin(p * Math.PI * 2 * 2.5 + phase * 2) * 3.5 +
      Math.sin(p * Math.PI * 2 * 5 - phase) * 1.5;
    d += ` L ${x} ${y}`;
  }
  return d;
}
