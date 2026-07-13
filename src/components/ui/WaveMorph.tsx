"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { useSwellLFO } from "@/lib/motion";
import { BasinCaustic } from "@/components/canvas/BasinCaustic";

/** Living sine divider — replaces hairline rules */
export function WaveRule({
  className = "",
  amp = 6,
  freq = 3,
  color = "rgba(44,74,92,0.35)",
}: {
  className?: string;
  amp?: number;
  freq?: number;
  color?: string;
}) {
  const { value: swell } = useSwellLFO(0.12, 0.04);
  const w = 800;
  const h = amp * 2 + 8;
  const mid = h / 2;
  let d = `M 0 ${mid}`;
  for (let x = 0; x <= w; x += 8) {
    const y =
      mid +
      Math.sin((x / w) * Math.PI * 2 * freq + swell * 1.4) * amp +
      Math.sin((x / w) * Math.PI * 2 * freq * 2.3 - swell) * (amp * 0.35);
    d += ` L ${x} ${y}`;
  }

  return (
    <svg
      className={`block w-full ${className}`}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      style={{ height: h }}
      aria-hidden
    >
      <path d={d} fill="none" stroke={color} strokeWidth={1.25} />
    </svg>
  );
}

/** Soft undulating edge for panels */
export function WaveEdge({
  side = "bottom",
  className = "",
  fill = "var(--paper)",
  amp = 14,
}: {
  side?: "top" | "bottom";
  className?: string;
  fill?: string;
  amp?: number;
}) {
  const { value: swell, drift } = useSwellLFO(0.11, 0.035);
  const w = 1200;
  const h = amp * 2 + 8;

  const edgeY = (x: number) =>
    h / 2 +
    Math.sin((x / w) * Math.PI * 2 * 2.2 + swell * 1.2 + drift) * amp +
    Math.sin((x / w) * Math.PI * 2 * 5.1 - swell * 0.8) * (amp * 0.28);

  let d: string;
  if (side === "top") {
    d = `M 0 ${h} `;
    for (let x = 0; x <= w; x += 10) d += `L ${x} ${edgeY(x)} `;
    d += `L ${w} 0 L 0 0 Z`;
  } else {
    d = `M 0 0 `;
    for (let x = 0; x <= w; x += 10) d += `L ${x} ${edgeY(x)} `;
    d += `L ${w} ${h} L 0 ${h} Z`;
  }

  return (
    <svg
      className={`pointer-events-none absolute inset-x-0 ${
        side === "bottom" ? "bottom-0 translate-y-[1px]" : "top-0 -translate-y-[1px]"
      } w-full ${className}`}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      style={{ height: h }}
      aria-hidden
    >
      <path d={d} fill={fill} />
    </svg>
  );
}

/** Container with living wavy border — amplitude large enough to read at any size */
export function MorphShell({
  children,
  className = "",
  pad = true,
  dark = false,
  caustic = false,
  quiet = false,
  density,
}: {
  children: ReactNode;
  className?: string;
  pad?: boolean;
  dark?: boolean;
  /** Quiet WebGL under-basin material. Prefer on chrome basins only. */
  caustic?: boolean;
  /** Lower edge amplitude — docs chrome / dense layouts. Prefer density="quiet". */
  quiet?: boolean;
  /** quiet = product chrome; expressive = hero / showcase. Defaults from `quiet`. */
  density?: "quiet" | "expressive";
}) {
  const id = useId().replace(/:/g, "");
  const calmMode = (density ?? (quiet ? "quiet" : "expressive")) === "quiet";
  const { value: swell, drift } = useSwellLFO(
    calmMode ? 0.09 : 0.13,
    calmMode ? 0.025 : 0.04
  );
  const w = 100;
  const h = 100;
  // Quiet = static geometry + tiny swell. Expressive = restrained breath.
  // Idle amp ≈ 0 on product chrome — if it moves at rest, it's wrong.
  const calm = calmMode ? 0.06 : 0.35;
  const ax =
    (calmMode ? 1.1 : 2.2) +
    swell * (calmMode ? 0.08 : 0.55) * calm +
    Math.abs(drift) * 0.12 * calm;
  const ay =
    (calmMode ? 1.2 : 2.5) +
    drift * (calmMode ? 0.08 : 0.45) * calm +
    Math.abs(swell) * 0.25 * calm;
  const inset = Math.max(ax, ay) + 0.5;

  const borderPath = wavyRect(w, h, inset, ax, ay, swell * 1.4 + drift);
  const fillPath = wavyRect(w, h, inset + 0.15, ax * 0.92, ay * 0.92, swell * 1.4 + drift + 0.2);

  return (
    <div
      className={`relative isolate ${dark ? "surface-deep" : ""} ${className}`}
      data-surface={dark ? "deep" : "paper"}
    >
      <svg
        className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible"
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id={`mg-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop
              offset="0%"
              stopColor={
                dark ? "rgba(var(--deep-rgb), 0.88)" : "rgba(var(--paper-2-rgb), 0.78)"
              }
            />
            <stop
              offset="45%"
              stopColor={
                dark ? "rgba(var(--deep-rgb), 0.82)" : "rgba(var(--paper-rgb), 0.72)"
              }
            />
            <stop
              offset="100%"
              stopColor={
                dark ? "rgba(var(--sea-rgb), 0.55)" : "rgba(var(--haze-rgb), 0.45)"
              }
            />
          </linearGradient>
          <clipPath id={`clip-${id}`}>
            <path d={fillPath} />
          </clipPath>
        </defs>
        <path d={fillPath} fill={`url(#mg-${id})`} />
        <path
          d={borderPath}
          fill="none"
          stroke={
            dark ? "rgba(var(--crest-rgb), 0.55)" : "rgba(var(--sea-rgb), 0.45)"
          }
          strokeWidth={0.55}
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={innerCrest(w, h, inset, swell, drift)}
          fill="none"
          stroke="rgba(var(--candle-rgb), 0.3)"
          strokeWidth={0.35}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {caustic && !dark ? (
        <div
          className="pointer-events-none absolute inset-[6%] z-[1] overflow-hidden opacity-55 mix-blend-soft-light"
          aria-hidden
        >
          <BasinCaustic intensity={0.4} />
        </div>
      ) : null}
      <div className={`relative z-10 ${pad ? "p-8 md:p-10" : ""}`}>
        {children}
      </div>
    </div>
  );
}

function innerCrest(w: number, h: number, inset: number, swell: number, drift: number) {
  const y0 = h * (0.42 + swell * 0.04);
  let d = `M ${inset + 2} ${y0}`;
  for (let x = inset + 2; x <= w - inset - 2; x += 2) {
    const p = x / w;
    const y =
      y0 +
      Math.sin(p * Math.PI * 2 * 2.2 + swell * 2 + drift) * 2.8 +
      Math.sin(p * Math.PI * 2 * 5.5 - drift) * 1.1;
    d += ` L ${x} ${y}`;
  }
  return d;
}

function wavyRect(
  w: number,
  h: number,
  inset: number,
  ax: number,
  ay: number,
  phase: number
) {
  const l = inset;
  const r = w - inset;
  const t = inset;
  const b = h - inset;
  const steps = 32;
  let d = "";

  for (let i = 0; i <= steps; i++) {
    const p = i / steps;
    const x = l + (r - l) * p;
    const y =
      t +
      Math.sin(p * Math.PI * 2 * 2 + phase) * ay +
      Math.sin(p * Math.PI * 2 * 4.5 - phase) * ay * 0.35;
    d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  }
  for (let i = 1; i <= steps; i++) {
    const p = i / steps;
    const y = t + (b - t) * p;
    const x =
      r +
      Math.sin(p * Math.PI * 2 * 2 + phase * 1.3) * ax +
      Math.sin(p * Math.PI * 2 * 3.8 - phase) * ax * 0.3;
    d += ` L ${x} ${y}`;
  }
  for (let i = 1; i <= steps; i++) {
    const p = i / steps;
    const x = r - (r - l) * p;
    const y =
      b +
      Math.sin(p * Math.PI * 2 * 2 - phase) * ay +
      Math.sin(p * Math.PI * 2 * 4.5 + phase) * ay * 0.35;
    d += ` L ${x} ${y}`;
  }
  for (let i = 1; i <= steps; i++) {
    const p = i / steps;
    const y = b - (b - t) * p;
    const x =
      l +
      Math.sin(p * Math.PI * 2 * 2 - phase * 1.3) * ax +
      Math.sin(p * Math.PI * 2 * 3.8 + phase) * ax * 0.3;
    d += ` L ${x} ${y}`;
  }
  return d + " Z";
}

/** Props as a tidal list — not a spreadsheet table */
export function PropTide({
  rows,
}: {
  rows: { name: string; type: string; note: string }[];
}) {
  return (
    <div className="space-y-0">
      {rows.map((row, i) => (
        <div key={row.name}>
          {i > 0 ? <WaveRule amp={4} freq={4} className="my-1" /> : null}
          <div className="grid gap-2 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-baseline">
            <div>
              <span className="font-mono text-sm text-sea">{row.name}</span>
              <span className="ml-3 font-mono text-xs text-ink-2/70">{row.type}</span>
            </div>
            <p className="font-serif italic text-ink-2 sm:text-right">{row.note}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Full Swell LFO instrument — dual traces + breathing field */
export function SwellInstrument() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { value: swell, drift } = useSwellLFO(0.14, 0.03);
  const swellRef = useRef(swell);
  const driftRef = useRef(drift);
  swellRef.current = swell;
  driftRef.current = drift;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    const history: { s: number; d: number }[] = [];

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

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const s = swellRef.current;
      const d = driftRef.current;
      history.push({ s, d });
      if (history.length > Math.floor(w)) history.shift();

      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#1a3040");
      g.addColorStop(0.5, "#0c1822");
      g.addColorStop(1, "#081018");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      const glow = ctx.createRadialGradient(
        w * 0.5,
        h * 0.42,
        8,
        w * 0.5,
        h * 0.42,
        100 + s * 45
      );
      glow.addColorStop(0, `rgba(142,182,201,${0.32 + s * 0.14})`);
      glow.addColorStop(0.45, `rgba(200,115,42,${0.1 + Math.abs(d) * 0.08})`);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      const orbR = 32 + s * 16;
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.4, orbR, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(142,182,201,${0.4 + s * 0.28})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(242,238,230,${0.5 + s * 0.35})`;
      ctx.lineWidth = 1.75;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.4, orbR + 14 + d * 8, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(200,115,42,${0.4 + Math.abs(d) * 0.3})`;
      ctx.lineWidth = 1.25;
      ctx.stroke();

      // caustic rings
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(
          w * 0.5,
          h * 0.4,
          orbR + 28 + i * 18 + s * 6,
          0,
          Math.PI * 2
        );
        ctx.strokeStyle = `rgba(142,182,201,${0.12 - i * 0.03})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      const drawTrace = (
        key: "s" | "d",
        color: string,
        yBase: number,
        amp: number
      ) => {
        if (history.length < 2) return;
        ctx.beginPath();
        history.forEach((pt, i) => {
          const x = (i / Math.max(1, history.length - 1)) * w;
          const y = yBase - pt[key] * amp;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.6;
        ctx.stroke();
      };

      drawTrace("s", "rgba(142,182,201,0.95)", h * 0.78, h * 0.13);
      drawTrace("d", "rgba(200,115,42,0.8)", h * 0.78, h * 0.09);

      ctx.strokeStyle = "rgba(242,238,230,0.14)";
      ctx.beginPath();
      ctx.moveTo(0, h * 0.78);
      ctx.lineTo(w, h * 0.78);
      ctx.stroke();

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="relative overflow-hidden">
      <canvas ref={canvasRef} className="h-64 w-full md:h-72" />
      <div className="pointer-events-none absolute inset-x-0 bottom-3 flex flex-wrap justify-center gap-x-6 gap-y-1 px-3">
        <span className="t-meta text-crest">swell {swell.toFixed(2)}</span>
        <span className="t-meta text-candle">drift {drift.toFixed(2)}</span>
        <span className="t-meta text-on-deep/50">0.14 Hz · shared phase</span>
      </div>
    </div>
  );
}
