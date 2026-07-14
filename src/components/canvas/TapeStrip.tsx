"use client";

import { useEffect, useRef } from "react";
import { useTape } from "@/lib/tape";

type Props = {
  className?: string;
  height?: number;
};

export function TapeStrip({ className = "", height = 44 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { pulses } = useTape();
  const pulsesRef = useRef(pulses);
  pulsesRef.current = pulses;

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

    const baseline = () => {
      const rect = canvas.getBoundingClientRect();
      return rect.height * 0.55;
    };

    const draw = (now: number) => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = "rgba(21,23,26,0.12)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, baseline());
      ctx.lineTo(w, baseline());
      ctx.stroke();

      const speed = 42; // px/s
      ctx.beginPath();
      let started = false;
      for (let x = 0; x <= w; x += 2) {
        const t = now / 1000 - (w - x) / speed;
        let y = baseline();
        y += Math.sin(t * 2.2) * 1.2;
        for (const p of pulsesRef.current) {
          const age = (now - p.at) / 1000;
          const px = w - age * speed * 18;
          const dist = x - px;
          if (Math.abs(dist) < 40) {
            const spike =
              Math.exp(-Math.pow(dist / 6, 2)) * p.intensity * 16 -
              Math.exp(-Math.pow((dist - 10) / 5, 2)) * p.intensity * 8;
            y -= spike;
          }
        }
        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "rgba(44,74,92,0.85)";
      ctx.lineWidth = 1.25;
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
    <div
      className={`border-t border-rule bg-paper ${className}`}
      style={{ height }}
      aria-hidden
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
