"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSwellLFO } from "@/lib/motion";
import { useTape } from "@/lib/tape";

type Ripple = { x: number; y: number; t0: number; strength: number };

type Props = {
  className?: string;
  height?: number;
};

/**
 * Ripple Field — top-down interference instrument.
 * Every touch is a wavefront; multiple sources interfere.
 * This is the atomic primitive the sea uses under the hood.
 */
export function RippleField({ className = "", height = 320 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const ripples = useRef<Ripple[]>([]);
  const pressed = useRef(new Map<number, { x: number; y: number; last: number }>());
  const { pulse } = useTape();
  const { value: swell } = useSwellLFO(0.12, 0.03);
  const swellRef = useRef(swell);
  swellRef.current = swell;
  const [count, setCount] = useState(0);

  const add = useCallback(
    (x: number, y: number, strength: number, record = true) => {
      ripples.current.push({ x, y, t0: performance.now(), strength });
      if (ripples.current.length > 24) ripples.current.shift();
      setCount(ripples.current.length);
      if (record) pulse("ripple", strength);
    },
    [pulse]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = wrap.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const draw = (now: number) => {
      const rect = wrap.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const s = swellRef.current;

      // dark field
      const g = ctx.createRadialGradient(w * 0.5, h * 0.45, 20, w * 0.5, h * 0.5, Math.max(w, h) * 0.7);
      g.addColorStop(0, "#1a3040");
      g.addColorStop(0.55, "#0c1822");
      g.addColorStop(1, "#060c12");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // ambient grid of standing waves
      ctx.strokeStyle = "rgba(142,182,201,0.06)";
      ctx.lineWidth = 1;
      for (let y = 0; y < h; y += 28) {
        ctx.beginPath();
        for (let x = 0; x <= w; x += 4) {
          const yy =
            y +
            Math.sin(x * 0.02 + now * 0.001 + s) * 3 +
            Math.sin(x * 0.05 - now * 0.0007) * 1.5;
          if (x === 0) ctx.moveTo(x, yy);
          else ctx.lineTo(x, yy);
        }
        ctx.stroke();
      }

      // sample interference field as bright rings + height shading
      const active = ripples.current.filter((r) => now - r.t0 < 2800);
      ripples.current = active;

      // draw each ripple as expanding ring with secondary harmonics
      for (const r of active) {
        const age = (now - r.t0) / 1000;
        const speed = 140;
        const radius = age * speed;
        const decay = Math.exp(-age * 1.1);
        const alpha = decay * r.strength;

        // primary front
        ctx.beginPath();
        ctx.arc(r.x, r.y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(200,230,245,${0.55 * alpha})`;
        ctx.lineWidth = 2.2;
        ctx.stroke();

        // secondary trough
        ctx.beginPath();
        ctx.arc(r.x, r.y, Math.max(0, radius - 14), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(44,74,92,${0.35 * alpha})`;
        ctx.lineWidth = 3;
        ctx.stroke();

        // tertiary
        ctx.beginPath();
        ctx.arc(r.x, r.y, Math.max(0, radius - 28), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(142,182,201,${0.25 * alpha})`;
        ctx.lineWidth = 1.25;
        ctx.stroke();

        // origin glow
        const glow = ctx.createRadialGradient(r.x, r.y, 0, r.x, r.y, 24);
        glow.addColorStop(0, `rgba(200,115,42,${0.35 * decay})`);
        glow.addColorStop(1, "rgba(200,115,42,0)");
        ctx.fillStyle = glow;
        ctx.fillRect(r.x - 24, r.y - 24, 48, 48);
      }

      // interference brightening — sample grid where fronts cross
      if (active.length >= 2) {
        const step = 10;
        for (let y = 0; y < h; y += step) {
          for (let x = 0; x < w; x += step) {
            let sum = 0;
            for (const r of active) {
              const age = (now - r.t0) / 1000;
              const dist = Math.hypot(x - r.x, y - r.y);
              const radius = age * 140;
              const front = dist - radius;
              const env = Math.exp(-(front * front) / 80);
              const decay = Math.exp(-age * 1.1);
              sum += env * decay * r.strength;
            }
            if (sum > 0.85) {
              ctx.fillStyle = `rgba(255,245,220,${Math.min(0.55, (sum - 0.85) * 0.7)})`;
              ctx.fillRect(x, y, step - 1, step - 1);
            }
          }
        }
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  const local = (e: React.PointerEvent) => {
    const rect = wrapRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  return (
    <div
      ref={wrapRef}
      className={`relative overflow-hidden ${className}`}
      style={{ height }}
      data-touch-surface
      onPointerDown={(e) => {
        const p = local(e);
        pressed.current.set(e.pointerId, { ...p, last: performance.now() });
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        add(p.x, p.y, e.pressure > 0 ? 0.5 + e.pressure * 0.5 : 1);
      }}
      onPointerMove={(e) => {
        const track = pressed.current.get(e.pointerId);
        if (!track) return;
        const p = local(e);
        const now = performance.now();
        if (now - track.last > 60) {
          add(p.x, p.y, 0.45);
          track.last = now;
          track.x = p.x;
          track.y = p.y;
        }
      }}
      onPointerUp={(e) => {
        pressed.current.delete(e.pointerId);
      }}
      onPointerCancel={(e) => {
        pressed.current.delete(e.pointerId);
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full cursor-crosshair" />
      <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-between px-4">
        <span className="t-meta text-on-deep/50">
          {count} active · multitouch interferes
        </span>
        <span className="t-meta text-on-deep/40">touch / drag / two fingers</span>
      </div>
    </div>
  );
}
