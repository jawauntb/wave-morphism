"use client";

import { useCallback, useEffect, useRef } from "react";
import { useSwellLFO } from "@/lib/motion";
import { useTape } from "@/lib/tape";

type Ripple = { x: number; y: number; amp: number; born: number };

type Props = {
  className?: string;
  intensity?: number;
  height?: number;
  showFoam?: boolean;
  label?: string;
};

export function SeaSurface({
  className = "",
  intensity = 0.85,
  height = 280,
  showFoam = true,
  label,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ripples = useRef<Ripple[]>([]);
  const pointer = useRef<{ x: number; y: number; down: boolean } | null>(null);
  const lastHover = useRef(0);
  const { value: swell, drift } = useSwellLFO(0.14, 0.03);
  const swellRef = useRef(swell);
  const driftRef = useRef(drift);
  const { pulse } = useTape();
  swellRef.current = swell;
  driftRef.current = drift;

  const addRipple = useCallback(
    (x: number, y: number, amp: number, record = true) => {
      ripples.current.push({ x, y, amp: amp * intensity, born: performance.now() });
      if (ripples.current.length > 12) ripples.current.shift();
      if (record) pulse("ripple", amp * intensity);
    },
    [intensity, pulse]
  );

  useEffect(() => {
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
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = (now: number) => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const s = swellRef.current;
      const d = driftRef.current;

      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#8eb6c9");
      g.addColorStop(0.35, "#3d6f8a");
      g.addColorStop(0.7, "#1e3f55");
      g.addColorStop(1, "#0c1c28");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // caustic-ish bands
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        const baseY = h * (0.25 + i * 0.12);
        for (let x = 0; x <= w; x += 4) {
          const y =
            baseY +
            Math.sin(x * 0.018 + now * 0.0012 + i + s * 0.8) * (6 + i * 2) +
            Math.sin(x * 0.041 - now * 0.0007 + d) * (3 + i) +
            rippleDisplace(ripples.current, x, baseY, now);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(200, 230, 245, ${0.08 + i * 0.03 + s * 0.02})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      if (showFoam) {
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          const baseY = h * (0.55 + i * 0.1) + s * 4;
          for (let x = 0; x <= w; x += 3) {
            const y =
              baseY +
              Math.sin(x * 0.012 + now * 0.0018 + i * 2) * (10 + i * 3) +
              Math.sin(x * 0.033 + now * 0.0011) * 5 +
              rippleDisplace(ripples.current, x, baseY, now) * 1.4;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.strokeStyle = `rgba(242, 238, 230, ${0.35 - i * 0.08})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      // moon glint
      const gx = w * (0.72 + d * 0.02);
      const gy = h * 0.22;
      const glint = ctx.createRadialGradient(gx, gy, 0, gx, gy, 80);
      glint.addColorStop(0, "rgba(255,255,255,0.22)");
      glint.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = glint;
      ctx.fillRect(gx - 80, gy - 40, 160, 80);

      // paper fade at top
      const fade = ctx.createLinearGradient(0, 0, 0, 48);
      fade.addColorStop(0, "rgba(242,238,230,0.55)");
      fade.addColorStop(1, "rgba(242,238,230,0)");
      ctx.fillStyle = fade;
      ctx.fillRect(0, 0, w, 48);

      ripples.current = ripples.current.filter((r) => now - r.born < 2200);
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [showFoam]);

  const local = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ height }}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full touch-none cursor-crosshair"
        data-touch-surface
        onPointerDown={(e) => {
          const p = local(e);
          pointer.current = { ...p, down: true };
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
          addRipple(p.x, p.y, 1);
        }}
        onPointerMove={(e) => {
          const p = local(e);
          const now = performance.now();
          if (pointer.current?.down) {
            if (now - lastHover.current > 80) {
              addRipple(p.x, p.y, 0.45);
              lastHover.current = now;
            }
          } else if (now - lastHover.current > 220) {
            addRipple(p.x, p.y, 0.18, false);
            lastHover.current = now;
          }
        }}
        onPointerUp={() => {
          pointer.current = null;
        }}
        onPointerCancel={() => {
          pointer.current = null;
        }}
      />
      {label ? (
        <span className="pointer-events-none absolute left-4 top-4 t-eyebrow text-paper/80">
          {label}
        </span>
      ) : null}
    </div>
  );
}

function rippleDisplace(ripples: Ripple[], x: number, y: number, now: number) {
  let d = 0;
  for (const r of ripples) {
    const age = (now - r.born) / 1000;
    const dist = Math.hypot(x - r.x, y - y * 0 + (y - r.y) * 0.35);
    const radius = age * 180;
    const ring = Math.exp(-Math.pow((dist - radius) / 28, 2));
    const decay = Math.exp(-age * 1.6);
    d += ring * decay * r.amp * 18;
  }
  return d;
}
