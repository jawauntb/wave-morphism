"use client";

import { useEffect, useRef } from "react";
import { useSwellLFO } from "@/lib/motion";
import { themeCanvasColors, rgba } from "@/lib/colors";

/**
 * Site-wide ambient field — the page IS wave-morphism, not cream paper
 * with demos on it. Soft depth, drifting caustics, pointer micro-ripples.
 * Kept quiet enough that type stays readable.
 */
export function AmbientField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { value: swell, drift } = useSwellLFO(0.08, 0.025);
  const swellRef = useRef(swell);
  const driftRef = useRef(drift);
  swellRef.current = swell;
  driftRef.current = drift;
  const pointer = useRef<{ x: number; y: number; active: boolean }>({
    x: 0.5,
    y: 0.4,
    active: false,
  });
  const ripples = useRef<{ x: number; y: number; t0: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = mq.matches;
    const onMq = () => {
      reduced = mq.matches;
    };
    mq.addEventListener("change", onMq);

    let raf = 0;
    const t0 = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: PointerEvent) => {
      pointer.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
        active: true,
      };
      const now = performance.now();
      const last = ripples.current[ripples.current.length - 1];
      if (!last || now - last.t0 > 280) {
        ripples.current.push({
          x: e.clientX,
          y: e.clientY,
          t0: now,
        });
        if (ripples.current.length > 6) ripples.current.shift();
      }
    };
    const onLeave = () => {
      pointer.current.active = false;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);

    const draw = (now: number) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const t = (now - t0) / 1000;
      const s = reduced ? 0 : swellRef.current;
      const d = reduced ? 0 : driftRef.current;

      // base atmosphere — theme ambient gradient
      const c = themeCanvasColors();
      const base = ctx.createLinearGradient(0, 0, 0, h);
      base.addColorStop(0, c.ambient[0]);
      base.addColorStop(0.28, c.ambient[1]);
      base.addColorStop(0.55, c.ambient[2]);
      base.addColorStop(0.78, c.ambient[3]);
      base.addColorStop(1, c.ambient[4]);
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, w, h);

      // slow horizon haze band
      const hazeY = h * (0.22 + s * 0.015 + d * 0.01);
      const haze = ctx.createLinearGradient(0, hazeY - 80, 0, hazeY + 120);
      haze.addColorStop(0, rgba(c.hazeRgb, 0));
      haze.addColorStop(0.45, rgba(c.hazeRgb, 0.18));
      haze.addColorStop(1, rgba(c.paperRgb, 0));
      ctx.fillStyle = haze;
      ctx.fillRect(0, hazeY - 80, w, 200);

      // drifting caustic washes (very soft)
      if (!reduced) {
        for (let i = 0; i < 4; i++) {
          const cx =
            w * (0.15 + i * 0.22) +
            Math.sin(t * 0.12 + i * 1.7 + d) * w * 0.06;
          const cy =
            h * (0.35 + (i % 3) * 0.18) +
            Math.cos(t * 0.09 + i * 1.1 + s) * h * 0.04;
          const r = Math.min(w, h) * (0.18 + i * 0.04);
          const blob = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
          blob.addColorStop(
            0,
            i % 2 === 0
              ? rgba(c.hazeRgb, 0.1 + s * 0.03)
              : rgba(c.candleRgb, 0.05 + Math.abs(d) * 0.02)
          );
          blob.addColorStop(1, rgba(c.hazeRgb, 0));
          ctx.fillStyle = blob;
          ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
        }

        // faint swell lines across the field
        ctx.globalAlpha = 0.11;
        for (let i = 0; i < 6; i++) {
          ctx.beginPath();
          const baseY = h * (0.15 + i * 0.14) + s * 8;
          for (let x = 0; x <= w; x += 8) {
            const y =
              baseY +
              Math.sin(x * 0.004 + t * 0.35 + i + d) * (10 + i * 2) +
              Math.sin(x * 0.011 - t * 0.22 + i * 0.5) * 4;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.strokeStyle =
            i % 2 === 0 ? rgba(c.seaRgb, 0.55) : rgba(c.candleRgb, 0.35);
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }

      // pointer micro-ripples
      ripples.current = ripples.current.filter((r) => now - r.t0 < 1800);
      for (const r of ripples.current) {
        const age = (now - r.t0) / 1000;
        const radius = age * 90;
        const alpha = Math.exp(-age * 1.4) * 0.22;
        ctx.beginPath();
        ctx.arc(r.x, r.y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(c.seaRgb, alpha);
        ctx.lineWidth = 1.25;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(r.x, r.y, Math.max(0, radius - 12), 0, Math.PI * 2);
        ctx.strokeStyle = rgba(c.crestRgb, alpha * 0.7);
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // soft vignette so content islands read
      const vig = ctx.createRadialGradient(
        w * 0.5,
        h * 0.4,
        Math.min(w, h) * 0.2,
        w * 0.5,
        h * 0.5,
        Math.max(w, h) * 0.75
      );
      vig.addColorStop(0, rgba(c.paperRgb, 0));
      vig.addColorStop(1, rgba(c.seaRgb, 0.08));
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      mq.removeEventListener("change", onMq);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
}
