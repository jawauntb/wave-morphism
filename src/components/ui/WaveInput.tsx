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

  return (
    <button
      type="button"
      className={`relative overflow-hidden border border-sea/40 px-4 py-3 t-meta text-sea ${className}`}
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
      <span
        className="pointer-events-none absolute inset-y-0 left-0 bg-sea/20 transition-[width] duration-75"
        style={{ width: `${charge * 100}%` }}
      />
      <span className="relative z-10">{children}</span>
    </button>
  );
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

  return (
    <button
      type="button"
      disabled={running}
      className={`relative border border-ink/20 px-4 py-2.5 t-meta text-ink-2 disabled:opacity-70 ${className}`}
      onClick={() => {
        pulse("calm", 0.55);
        setRunning(true);
      }}
    >
      <span
        className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left bg-sea"
        style={{ transform: `scaleX(${running ? 1 - p : 0})` }}
      />
      {running ? `stilling… ${Math.round((1 - p) * 100)}%` : children}
    </button>
  );
}
