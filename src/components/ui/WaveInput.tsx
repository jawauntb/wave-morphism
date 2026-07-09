"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useTape } from "@/lib/tape";
import { useSwellLFO } from "@/lib/motion";

type InputProps = {
  placeholder?: string;
  mode?: "ask" | "compose" | "tide";
  onSubmit?: (value: string) => void;
  className?: string;
};

/**
 * Wave Input — a tide field, not a text box with a decoration.
 * Focus raises the swell; typing adds crest energy; submit sends a wake.
 */
export function WaveInput({
  placeholder = "ask the room…",
  mode = "ask",
  onSubmit,
  className = "",
}: InputProps) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [sent, setSent] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { pulse } = useTape();
  const { value: swell, drift } = useSwellLFO(0.18, 0.05);
  const borderId = useId().replace(/:/g, "");

  const energy = Math.min(1, value.length / 28);
  const tide = (focused ? 0.55 : 0.22) + energy * 0.35 + Math.abs(swell) * 0.12;
  const amp = 5.5 + tide * 6 + (focused ? 2 : 0);
  const phase = swell * 1.8 + drift * 0.6 + energy * 2;
  const shell = liquidShell(200, 72, amp, phase);

  // animated multi-layer tide under the text
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    const ripples: { x: number; born: number; amp: number }[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = (now: number) => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);

      const focusBoost = focused ? 1 : 0.45;
      const e = Math.min(1, value.length / 28);
      const s = swell;
      const d = drift;

      // depth wash
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "rgba(242,238,230,0)");
      g.addColorStop(0.35, `rgba(142,182,201,${0.08 * focusBoost})`);
      g.addColorStop(1, `rgba(44,74,92,${0.18 + e * 0.2 + focusBoost * 0.1})`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // three swell layers
      for (let layer = 0; layer < 3; layer++) {
        const base = h * (0.72 - layer * 0.08 - e * 0.12 - (focused ? 0.06 : 0));
        const layerAmp = (10 + e * 14 + focusBoost * 8) * (1 - layer * 0.22);
        ctx.beginPath();
        for (let x = 0; x <= w; x += 3) {
          const y =
            base +
            Math.sin(x * 0.018 + now * 0.0015 + s * 2 + layer) * layerAmp +
            Math.sin(x * 0.041 - now * 0.0011 + d + layer * 0.5) * (layerAmp * 0.4);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        ctx.fillStyle =
          layer === 0
            ? `rgba(44,74,92,${0.22 + e * 0.15})`
            : layer === 1
              ? `rgba(142,182,201,${0.28 + focusBoost * 0.1})`
              : `rgba(200,115,42,${0.12 + e * 0.1})`;
        ctx.fill();
      }

      // crest line
      ctx.beginPath();
      const crestY = h * (0.55 - e * 0.15 - (focused ? 0.05 : 0));
      for (let x = 0; x <= w; x += 3) {
        const y =
          crestY +
          Math.sin(x * 0.022 + now * 0.002 + s * 2.5) * (8 + e * 10) +
          Math.sin(x * 0.05 - now * 0.0015) * 3;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = focused
        ? `rgba(200,115,42,${0.55 + e * 0.3})`
        : `rgba(44,74,92,${0.35 + e * 0.2})`;
      ctx.lineWidth = 1.75;
      ctx.stroke();

      // typing ripples
      for (const r of ripples) {
        const age = (now - r.born) / 1000;
        if (age > 1.2) continue;
        const rad = age * 50;
        ctx.beginPath();
        ctx.arc(r.x, h * 0.7, rad, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(142,182,201,${(1 - age) * 0.45 * r.amp})`;
        ctx.lineWidth = 1.25;
        ctx.stroke();
      }

      // send flash
      if (sent) {
        ctx.fillStyle = "rgba(200,115,42,0.2)";
        ctx.fillRect(0, 0, w, h);
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    (canvas as HTMLCanvasElement & { __addRipple?: (x: number) => void }).__addRipple = (
      x: number
    ) => {
      ripples.push({ x, born: performance.now(), amp: 1 });
      if (ripples.length > 8) ripples.shift();
    };

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [focused, value, swell, drift, sent]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    pulse(mode, 0.7);
    setSent(true);
    setTimeout(() => setSent(false), 400);
    onSubmit?.(value.trim());
    setValue("");
  };

  return (
    <form onSubmit={submit} className={`relative ${className}`}>
      <div className="relative min-h-[4.5rem] overflow-visible">
        {/* liquid shell */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
          viewBox="0 0 200 72"
          preserveAspectRatio="none"
          aria-hidden
        >
          <defs>
            <linearGradient id={`wi-${borderId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(242,238,230,0.9)" />
              <stop offset="100%" stopColor="rgba(220,230,234,0.95)" />
            </linearGradient>
          </defs>
          <path d={shell} fill={`url(#wi-${borderId})`} />
          <path
            d={shell}
            fill="none"
            stroke={focused ? "#C8732A" : "#2C4A5C"}
            strokeWidth={1.75}
            vectorEffect="non-scaling-stroke"
            opacity={focused ? 0.9 : 0.55}
          />
        </svg>

        {/* living tide canvas */}
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-[6px] h-[calc(100%-12px)] w-[calc(100%-12px)]"
          aria-hidden
        />

        <div className="relative z-10 flex items-center gap-3 px-5 py-4">
          <input
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              const canvas = canvasRef.current as HTMLCanvasElement & {
                __addRipple?: (x: number) => void;
              };
              const rect = canvas?.getBoundingClientRect();
              if (canvas?.__addRipple && rect) {
                const x = 24 + Math.min(rect.width - 48, e.target.value.length * 9);
                canvas.__addRipple(x);
              }
              if (e.target.value.length % 3 === 0) pulse("type", 0.12);
            }}
            onFocus={() => {
              setFocused(true);
              pulse("focus", 0.35);
            }}
            onBlur={() => setFocused(false)}
            placeholder={placeholder}
            className="min-w-0 flex-1 bg-transparent font-serif text-[1.15rem] italic text-ink outline-none placeholder:text-ink-2/45"
          />
          <button
            type="submit"
            className="shrink-0 t-meta transition-colors duration-wave"
            style={{ color: value.trim() ? "#C8732A" : "#2C4A5C" }}
          >
            {mode === "compose" ? "compose ↗" : "send ↗"}
          </button>
        </div>
      </div>
      <p className="mt-2 text-center t-meta text-ink-2/60">
        {focused
          ? energy > 0.3
            ? "tide rising · send to release a wake"
            : "swell raised · type to crest"
          : "focus to raise the tide"}
      </p>
    </form>
  );
}

function liquidShell(w: number, h: number, amp: number, phase: number) {
  const inset = amp * 0.55 + 2;
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
      Math.sin(p * Math.PI * 2 * 1.5 + phase) * amp * 0.45 +
      Math.sin(p * Math.PI * 2 * 3.5 - phase) * amp * 0.18;
    d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  }
  for (let i = 1; i <= steps; i++) {
    const p = i / steps;
    const y = t + (b - t) * p;
    const x =
      r +
      Math.sin(p * Math.PI * 2 * 1.5 + phase * 1.2) * amp * 0.55 +
      Math.sin(p * Math.PI * 2 * 2.8 - phase) * amp * 0.2;
    d += ` L ${x} ${y}`;
  }
  for (let i = 1; i <= steps; i++) {
    const p = i / steps;
    const x = r - (r - l) * p;
    const y =
      b +
      Math.sin(p * Math.PI * 2 * 1.5 - phase) * amp * 0.45 +
      Math.sin(p * Math.PI * 2 * 3.5 + phase) * amp * 0.18;
    d += ` L ${x} ${y}`;
  }
  for (let i = 1; i <= steps; i++) {
    const p = i / steps;
    const y = b - (b - t) * p;
    const x =
      l +
      Math.sin(p * Math.PI * 2 * 1.5 - phase * 1.2) * amp * 0.55 +
      Math.sin(p * Math.PI * 2 * 2.8 + phase) * amp * 0.2;
    d += ` L ${x} ${y}`;
  }
  return d + " Z";
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
