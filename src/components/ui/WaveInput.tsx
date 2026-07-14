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

/**
 * Hold Discharge — a storm cell you charge by holding.
 * Rising crest fills the field; release past threshold fires lightning.
 */
export function HoldDischarge({
  thresholdMs = 900,
  onDischarge,
  children,
  className = "",
}: HoldProps) {
  const { pulse } = useTape();
  const { value: swell } = useSwellLFO(0.2, 0.05);
  const [charge, setCharge] = useState(0);
  const [flash, setFlash] = useState(0);
  const [holdingUi, setHoldingUi] = useState(false);
  const [bolts, setBolts] = useState<{ id: number; path: string }[]>([]);
  const holding = useRef(false);
  const start = useRef(0);
  const raf = useRef(0);
  const boltId = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chargeRef = useRef(0);
  const flashRef = useRef(0);
  chargeRef.current = charge;
  flashRef.current = flash;

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let frame = 0;

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
      const c = chargeRef.current;
      const f = flashRef.current;
      ctx.clearRect(0, 0, w, h);

      // storm depth
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, `rgba(12,20,28,${0.15 + c * 0.55})`);
      g.addColorStop(0.5, `rgba(30,50,70,${0.2 + c * 0.4})`);
      g.addColorStop(1, `rgba(8,14,20,${0.35 + c * 0.5})`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // rising tide / charge crest
      const waterTop = h * (1 - c * 0.78);
      ctx.beginPath();
      for (let x = 0; x <= w; x += 3) {
        const y =
          waterTop +
          Math.sin(x * 0.04 + now * 0.004 + c * 6) * (4 + c * 10) +
          Math.sin(x * 0.09 - now * 0.003) * (2 + c * 4);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      const water = ctx.createLinearGradient(0, waterTop, 0, h);
      water.addColorStop(0, `rgba(142,182,201,${0.35 + c * 0.4})`);
      water.addColorStop(0.5, `rgba(44,74,92,${0.45 + c * 0.35})`);
      water.addColorStop(1, `rgba(200,115,42,${0.25 + c * 0.45})`);
      ctx.fillStyle = water;
      ctx.fill();

      // crest highlight
      ctx.beginPath();
      for (let x = 0; x <= w; x += 3) {
        const y =
          waterTop +
          Math.sin(x * 0.04 + now * 0.004 + c * 6) * (4 + c * 10);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle =
        c > 0.95
          ? `rgba(255,220,160,${0.7 + Math.sin(now * 0.02) * 0.3})`
          : `rgba(242,238,230,${0.35 + c * 0.45})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // charge arcs when near full
      if (c > 0.55) {
        for (let i = 0; i < 3; i++) {
          const ax = w * (0.2 + i * 0.3);
          ctx.beginPath();
          ctx.moveTo(ax, waterTop + 8);
          let px = ax;
          let py = waterTop + 8;
          for (let s = 0; s < 5; s++) {
            px += (Math.random() - 0.5) * 18;
            py -= h * 0.08 * c;
            ctx.lineTo(px, py);
          }
          ctx.strokeStyle = `rgba(200,220,255,${(c - 0.55) * 0.9})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // discharge flash
      if (f > 0) {
        ctx.fillStyle = `rgba(255,245,220,${f * 0.55})`;
        ctx.fillRect(0, 0, w, h);
      }

      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
    };
  }, []);

  const tick = () => {
    if (!holding.current) return;
    const p = Math.min(1, (performance.now() - start.current) / thresholdMs);
    setCharge(p);
    if (p < 1) raf.current = requestAnimationFrame(tick);
    else pulse("charged", 0.85);
  };

  const fireLightning = () => {
    const paths = Array.from({ length: 3 }, (_, i) => {
      let d = `M ${30 + i * 50} 8`;
      let x = 30 + i * 50;
      let y = 8;
      for (let s = 0; s < 7; s++) {
        x += (Math.random() - 0.5) * 28;
        y += 10 + Math.random() * 8;
        d += ` L ${x} ${y}`;
      }
      return { id: ++boltId.current, path: d };
    });
    setBolts(paths);
    setFlash(1);
    const t0 = performance.now();
    const fade = (now: number) => {
      const p = 1 - (now - t0) / 500;
      setFlash(Math.max(0, p));
      if (p > 0) requestAnimationFrame(fade);
      else setBolts([]);
    };
    requestAnimationFrame(fade);
  };

  const beginHold = () => {
    if (holding.current) return;
    holding.current = true;
    setHoldingUi(true);
    start.current = performance.now();
    pulse("hold", 0.4);
    raf.current = requestAnimationFrame(tick);
  };

  const endHold = () => {
    if (!holding.current) return;
    const ready = chargeRef.current >= 0.97;
    holding.current = false;
    setHoldingUi(false);
    cancelAnimationFrame(raf.current);
    if (ready) {
      pulse("discharge", 1);
      fireLightning();
      onDischarge();
    } else {
      pulse("abort", 0.25);
    }
    setCharge(0);
  };

  const cancelHold = () => {
    if (!holding.current && chargeRef.current === 0) return;
    holding.current = false;
    setHoldingUi(false);
    cancelAnimationFrame(raf.current);
    setCharge(0);
  };

  const isHoldKey = (key: string) => key === " " || key === "Enter";

  const amp = 4 + charge * 5 + Math.abs(swell) * 1.5;
  const shell = liquidShell(200, 100, amp, swell * 2 + charge * 4);

  return (
    <button
      type="button"
      className={`relative block w-full max-w-md overflow-visible select-none touch-none ${className}`}
      style={{ minHeight: 140 }}
      aria-keyshortcuts="Space Enter"
      onPointerDown={(e) => {
        e.preventDefault();
        beginHold();
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      }}
      onPointerUp={() => endHold()}
      onPointerCancel={() => cancelHold()}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          cancelHold();
          return;
        }
        if (!isHoldKey(e.key) || e.repeat) return;
        e.preventDefault();
        beginHold();
      }}
      onKeyUp={(e) => {
        if (!isHoldKey(e.key)) return;
        e.preventDefault();
        endHold();
      }}
      onBlur={() => cancelHold()}
    >
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        viewBox="0 0 200 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path d={shell} fill="rgba(12,20,28,0.92)" />
        <path
          d={shell}
          fill="none"
          stroke={
            charge > 0.95
              ? "rgba(255,220,160,0.95)"
              : charge > 0.4
                ? "rgba(142,182,201,0.8)"
                : "rgba(44,74,92,0.65)"
          }
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
        />
        {bolts.map((b) => (
          <path
            key={b.id}
            d={b.path}
            fill="none"
            stroke="rgba(255,245,210,0.95)"
            strokeWidth={1.75}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>

      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-[8px] h-[calc(100%-16px)] w-[calc(100%-16px)]"
        aria-hidden
      />

      <span className="relative z-10 flex h-full min-h-[140px] flex-col items-center justify-center gap-2 px-6 py-8">
        <span
          className="t-meta tracking-wide"
          style={{
            color:
              charge > 0.95
                ? "#FFE8B0"
                : charge > 0.3
                  ? "#E8F0F4"
                  : "#8eb6c9",
          }}
        >
          {children}
        </span>
        <span className="font-mono text-[11px] tabular-nums text-on-deep/70">
          {holdingUi || charge > 0
            ? charge >= 0.97
              ? "release to strike"
              : `charging ${Math.round(charge * 100)}%`
            : "press & hold · space/enter"}
        </span>
      </span>
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
