"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTape } from "@/lib/tape";
import { useSwellLFO } from "@/lib/motion";
import { WaveRule } from "@/components/ui/WaveMorph";

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  side?: "left" | "right";
  title?: string;
  children: ReactNode;
};

export function DrawerWake({
  open,
  onClose,
  side = "right",
  title,
  children,
}: DrawerProps) {
  const { pulse } = useTape();
  const { value: swell } = useSwellLFO(0.12, 0.04);

  useEffect(() => {
    if (open) pulse("drawer", 0.4);
  }, [open, pulse]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const edgePath = tideEdge(40, 800, swell, side);

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-ink/25 transition-opacity duration-wave ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={`fixed top-0 z-50 flex h-full w-[min(100%,400px)] flex-col bg-paper shadow-none transition-transform duration-wave ${
          side === "right" ? "right-0" : "left-0"
        } ${
          open
            ? "translate-x-0"
            : side === "right"
              ? "translate-x-full"
              : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
      >
        <svg
          className={`pointer-events-none absolute top-0 h-full w-10 ${
            side === "right" ? "left-0 -translate-x-[1px]" : "right-0 translate-x-[1px]"
          }`}
          viewBox="0 0 40 800"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path d={edgePath} fill="var(--paper)" />
          <path
            d={edgePath.replace(" Z", "").replace(/M [\d.]+ 0/, (m) => m)}
            fill="none"
            stroke="rgba(44,74,92,0.25)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div className="relative z-10 flex items-center justify-between px-5 py-4">
          <h2 className="t-h2">{title ?? "drawer"}</h2>
          <button type="button" className="t-meta text-ink-2" onClick={onClose}>
            close ←
          </button>
        </div>
        <WaveRule className="relative z-10 px-2" amp={4} freq={3} />
        <div className="relative z-10 flex-1 overflow-y-auto px-5 py-5">{children}</div>
      </aside>
    </>
  );
}

function tideEdge(w: number, h: number, phase: number, side: "left" | "right") {
  const amp = 10 + phase * 3;
  const xAt = (y: number) => {
    const p = y / h;
    const wave =
      Math.sin(p * Math.PI * 2 * 3 + phase) * amp +
      Math.sin(p * Math.PI * 2 * 7 - phase) * (amp * 0.35);
    return side === "right" ? w * 0.55 + wave : w * 0.45 + wave;
  };
  if (side === "right") {
    let d = `M ${w} 0 L ${w} ${h} L ${xAt(h)} ${h} `;
    for (let y = h; y >= 0; y -= 12) d += `L ${xAt(y)} ${y} `;
    return d + " Z";
  }
  let d = `M 0 0 L ${xAt(0)} 0 `;
  for (let y = 0; y <= h; y += 12) d += `L ${xAt(y)} ${y} `;
  d += `L 0 ${h} Z`;
  return d;
}

type ScopeProps = {
  className?: string;
  height?: number;
  stress?: number;
};

export function Oscilloscope({ className = "", height = 180, stress = 0.35 }: ScopeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stressRef = useRef(stress);
  stressRef.current = stress;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const buffers = [
      new Float32Array(320),
      new Float32Array(320),
      new Float32Array(320),
    ];
    const labels = ["hr", "breath", "brain"];
    let i = 0;
    let raf = 0;

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
      const s = stressRef.current;
      const t = now / 1000;

      buffers[0][i] =
        Math.sin(t * (2.4 + s * 5)) * (0.45 + s * 0.5) +
        Math.sin(t * 4.8) * 0.12 * s +
        (Math.random() - 0.5) * s * 0.18;
      buffers[1][i] = Math.sin(t * 0.32) * 0.6 + Math.sin(t * 0.9) * 0.08;
      buffers[2][i] =
        Math.sin(t * (9 + s * 8)) * (0.22 + s * 0.45) +
        Math.sin(t * 17) * 0.08 * s;
      i = (i + 1) % buffers[0].length;

      // phosphor fade
      ctx.fillStyle = "rgba(8,14,20,0.22)";
      ctx.fillRect(0, 0, w, h);

      // grid
      ctx.strokeStyle = "rgba(142,182,201,0.08)";
      ctx.lineWidth = 1;
      for (let gy = 0; gy < h; gy += h / 6) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(w, gy);
        ctx.stroke();
      }
      for (let gx = 0; gx < w; gx += w / 8) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, h);
        ctx.stroke();
      }

      const colors = ["#C8732A", "#6ec8b8", "#8eb6c9"];
      buffers.forEach((buf, bi) => {
        const y0 = (h / 4) * (bi + 1);
        // glow pass
        ctx.beginPath();
        for (let x = 0; x < buf.length; x++) {
          const sample = buf[(i + x) % buf.length];
          const px = (x / buf.length) * w;
          const py = y0 - sample * (h * 0.13);
          if (x === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = colors[bi];
        ctx.lineWidth = 3.5;
        ctx.globalAlpha = 0.18;
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.lineWidth = 1.4;
        ctx.stroke();

        ctx.fillStyle = colors[bi];
        ctx.font = "10px var(--font-text), monospace";
        ctx.fillText(labels[bi], 8, y0 - h * 0.1);
      });

      // scan beam
      const beamX = ((now / 16) % w);
      const beam = ctx.createLinearGradient(beamX - 20, 0, beamX + 4, 0);
      beam.addColorStop(0, "rgba(255,255,255,0)");
      beam.addColorStop(1, "rgba(255,255,255,0.08)");
      ctx.fillStyle = beam;
      ctx.fillRect(beamX - 20, 0, 24, h);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full ${className}`}
      style={{ height }}
      aria-label="oscilloscope"
    />
  );
}

type ProgressProps = {
  value: number | null;
  variant?: "ekg" | "fill";
  className?: string;
};

export function ProgressWake({
  value,
  variant = "ekg",
  className = "",
}: ProgressProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { value: swell } = useSwellLFO(0.2);
  const [shimmer, setShimmer] = useState(0);

  useEffect(() => {
    if (value != null) return;
    let raf = 0;
    const tick = (now: number) => {
      setShimmer((Math.sin(now / 400) + 1) / 2);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  useEffect(() => {
    if (variant !== "ekg") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const draw = (now: number) => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);

      // depth wash
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, "rgba(12,20,28,0.0)");
      bg.addColorStop(1, "rgba(12,20,28,0.35)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const progress = value ?? 0.35 + shimmer * 0.35;
      const end = w * Math.max(0.04, Math.min(1, progress));

      // wake fill under the trace
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= end; x += 2) {
        const beat = Math.exp(-Math.pow(((x / 36) % 1) - 0.18, 2) * 90) * 14;
        const y =
          h * 0.62 -
          beat -
          Math.sin(x * 0.07 + now * 0.004) * 2.5 -
          Math.sin(x * 0.02 + now * 0.001) * 1.5;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(end, h);
      ctx.closePath();
      const wake = ctx.createLinearGradient(0, 0, 0, h);
      wake.addColorStop(0, "rgba(142,182,201,0.35)");
      wake.addColorStop(1, "rgba(44,74,92,0.08)");
      ctx.fillStyle = wake;
      ctx.fill();

      // crest line
      ctx.beginPath();
      for (let x = 0; x <= end; x += 2) {
        const beat = Math.exp(-Math.pow(((x / 36) % 1) - 0.18, 2) * 90) * 14;
        const y =
          h * 0.62 -
          beat -
          Math.sin(x * 0.07 + now * 0.004) * 2.5 -
          Math.sin(x * 0.02 + now * 0.001) * 1.5;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = value == null ? "#C8732A" : "#8eb6c9";
      ctx.lineWidth = 2;
      ctx.stroke();

      // leading tip glow
      const tipX = end;
      const tipBeat = Math.exp(-Math.pow(((tipX / 36) % 1) - 0.18, 2) * 90) * 14;
      const tipY =
        h * 0.62 -
        tipBeat -
        Math.sin(tipX * 0.07 + now * 0.004) * 2.5;
      const tip = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, 16);
      tip.addColorStop(0, "rgba(255,230,180,0.55)");
      tip.addColorStop(1, "rgba(255,230,180,0)");
      ctx.fillStyle = tip;
      ctx.fillRect(tipX - 16, tipY - 16, 32, 32);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [variant, value, shimmer]);

  if (variant === "fill") {
    const p = value ?? 0.4 + shimmer * 0.25 + swell * 0.05;
    return (
      <div className={`relative h-4 overflow-hidden bg-[#0c141c] ${className}`}>
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-candle via-sea to-[#8eb6c9] transition-[width] duration-wave"
          style={{ width: `${Math.max(4, Math.min(100, p * 100))}%` }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255,255,255,0.08) 8px, rgba(255,255,255,0.08) 9px)",
            transform: `translateX(${shimmer * 12}px)`,
          }}
        />
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className={`h-14 w-full ${className}`}
      aria-label="progress wake"
    />
  );
}

export function CodeBlock({ code }: { code: string }) {
  const { pulse } = useTape();
  const [copied, setCopied] = useState(false);

  return (
    <div className="relative overflow-hidden bg-[#0c141c]">
      <button
        type="button"
        className="absolute right-3 top-3 z-10 t-meta text-paper/60 hover:text-paper"
        onClick={async () => {
          await navigator.clipboard.writeText(code);
          setCopied(true);
          pulse("copy", 0.35);
          setTimeout(() => setCopied(false), 1200);
        }}
      >
        {copied ? "copied" : "copy"}
      </button>
      <pre className="overflow-x-auto p-5 text-[13px] leading-relaxed text-[#d7e0e6]">
        <code className="font-mono">{code}</code>
      </pre>
    </div>
  );
}
