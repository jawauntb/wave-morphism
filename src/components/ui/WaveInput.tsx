"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useTape } from "@/lib/tape";
import { useSwellLFO } from "@/lib/motion";

type InputProps = {
  placeholder?: string;
  mode?: "ask" | "compose" | "tide";
  onSubmit?: (value: string) => void;
  className?: string;
};

export function WaveInput({
  placeholder = "ask the room…",
  mode = "ask",
  onSubmit,
  className = "",
}: InputProps) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const { pulse } = useTape();
  const { value: swell } = useSwellLFO(0.18);
  const amp = focused ? 0.7 + swell * 0.15 : 0.25;
  const path = wavePath(400, 32, amp, swell * 10);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    pulse(mode, 0.6);
    onSubmit?.(value.trim());
    setValue("");
  };

  return (
    <form onSubmit={submit} className={`relative ${className}`}>
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-8 overflow-hidden"
        aria-hidden
      >
        <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 400 32">
          <path d={path} fill="rgba(44,74,92,0.12)" />
        </svg>
      </div>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => {
          setFocused(true);
          pulse("focus", 0.2);
        }}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className="wave-input relative z-10 w-full border-b border-rule bg-transparent py-3 pr-16 t-body text-ink outline-none placeholder:text-ink-2/50 focus:border-sea"
      />
      <button
        type="submit"
        className="absolute right-0 top-1/2 z-10 -translate-y-1/2 t-meta text-sea hover:text-candle"
      >
        {mode === "compose" ? "compose →" : "send →"}
      </button>
    </form>
  );
}

function wavePath(w: number, h: number, amp: number, t: number) {
  let d = `M 0 ${h}`;
  for (let x = 0; x <= w; x += 8) {
    const y = h * 0.55 + Math.sin(x * 0.04 + t * 0.002) * amp * 10;
    d += ` L ${x} ${y}`;
  }
  d += ` L ${w} ${h} Z`;
  return d;
}

type HoldProps = {
  thresholdMs?: number;
  onDischarge: () => void;
  children: ReactNode;
  className?: string;
};

export function HoldDischarge({
  thresholdMs = 800,
  onDischarge,
  children,
  className = "",
}: HoldProps) {
  const { pulse } = useTape();
  const [charge, setCharge] = useState(0);
  const holding = useRef(false);
  const start = useRef(0);
  const raf = useRef(0);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const tick = () => {
    if (!holding.current) return;
    const p = Math.min(1, (performance.now() - start.current) / thresholdMs);
    setCharge(p);
    if (p < 1) raf.current = requestAnimationFrame(tick);
    else pulse("charged", 0.7);
  };

  const crest = chargePath(100, 40, charge);

  return (
    <button
      type="button"
      className={`relative inline-flex min-h-[2.75rem] items-center overflow-visible px-5 py-3 t-meta text-sea ${className}`}
      onPointerDown={() => {
        holding.current = true;
        start.current = performance.now();
        pulse("hold", 0.3);
        raf.current = requestAnimationFrame(tick);
      }}
      onPointerUp={() => {
        const ready = charge >= 0.98;
        holding.current = false;
        cancelAnimationFrame(raf.current);
        if (ready) {
          pulse("discharge", 1);
          onDischarge();
        } else pulse("abort", 0.2);
        setCharge(0);
      }}
      onPointerLeave={() => {
        if (!holding.current) return;
        holding.current = false;
        cancelAnimationFrame(raf.current);
        setCharge(0);
      }}
    >
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 100 40"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d={crest}
          fill={`rgba(44,74,92,${0.08 + charge * 0.25})`}
          stroke="rgba(44,74,92,0.55)"
          strokeWidth={1.1}
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={`M 0 40 L 0 ${40 - charge * 28} Q ${50 * charge} ${8 - charge * 6} ${100 * charge} ${40 - charge * 20} L ${100 * charge} 40 Z`}
          fill="rgba(142,182,201,0.35)"
        />
      </svg>
      <span className="relative z-10">{children}</span>
    </button>
  );
}

function chargePath(w: number, h: number, charge: number) {
  const amp = 1.5 + charge * 3;
  const phase = charge * 4;
  const inset = 2;
  let d = "";
  const steps = 16;
  for (let i = 0; i <= steps; i++) {
    const p = i / steps;
    const x = inset + (w - inset * 2) * p;
    const y = inset + Math.sin(p * Math.PI * 2 + phase) * amp * 0.4;
    d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  }
  for (let i = 1; i <= steps; i++) {
    const p = i / steps;
    const y = inset + (h - inset * 2) * p;
    const x = w - inset + Math.sin(p * Math.PI * 2 + phase) * amp * 0.5;
    d += ` L ${x} ${y}`;
  }
  for (let i = 1; i <= steps; i++) {
    const p = i / steps;
    const x = w - inset - (w - inset * 2) * p;
    const y = h - inset + Math.sin(p * Math.PI * 2 - phase) * amp * 0.4;
    d += ` L ${x} ${y}`;
  }
  for (let i = 1; i <= steps; i++) {
    const p = i / steps;
    const y = h - inset - (h - inset * 2) * p;
    const x = inset + Math.sin(p * Math.PI * 2 - phase) * amp * 0.5;
    d += ` L ${x} ${y}`;
  }
  return d + " Z";
}

type CalmProps = {
  durationMs?: number;
  onCalm: () => void;
  children: ReactNode;
  className?: string;
};

export function CalmDecay({
  durationMs = 2000,
  onCalm,
  children,
  className = "",
}: CalmProps) {
  const { pulse } = useTape();
  const [running, setRunning] = useState(false);
  const [p, setP] = useState(0);

  useEffect(() => {
    if (!running) return;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const next = Math.min(1, (now - t0) / durationMs);
      setP(next);
      if (next < 1) raf = requestAnimationFrame(tick);
      else {
        setRunning(false);
        setP(0);
        onCalm();
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, durationMs, onCalm]);

  const remain = running ? 1 - p : 1;
  const path = chargePath(100, 36, running ? remain * 0.6 : 0.15);

  return (
    <button
      type="button"
      disabled={running}
      className={`relative inline-flex min-h-[2.5rem] items-center px-5 py-2.5 t-meta text-ink-2 disabled:opacity-80 ${className}`}
      onClick={() => {
        pulse("calm", 0.55);
        setRunning(true);
      }}
    >
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 100 36"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d={path}
          fill="rgba(21,23,26,0.03)"
          stroke="rgba(21,23,26,0.28)"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
        {running ? (
          <path
            d={`M 4 30 Q ${50 * remain} ${30 - remain * 10} ${96 * remain} 30`}
            fill="none"
            stroke="rgba(44,74,92,0.7)"
            strokeWidth={1.5}
          />
        ) : null}
      </svg>
      <span className="relative z-10">
        {running ? `stilling… ${Math.round(remain * 100)}%` : children}
      </span>
    </button>
  );
}
