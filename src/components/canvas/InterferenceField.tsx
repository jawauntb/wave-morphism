"use client";

import { useEffect, useRef, useState } from "react";
import { useTape } from "@/lib/tape";

type Source = { nx: number; ny: number };

type Props = {
  height?: number;
  className?: string;
  maxSources?: number;
  label?: string;
};

/**
 * Standing-wave interference field (Plasma Zone 4).
 * Drag sources; tap empty space to add up to maxSources.
 * Constructive peaks read as white — the field IS the control.
 */
export function InterferenceField({
  height = 280,
  className = "",
  maxSources = 3,
  label = "drag sources · tap to add",
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { pulse } = useTape();
  const [count, setCount] = useState(2);
  const state = useRef<{
    sources: Source[];
    dragIdx: number;
    grabDx: number;
    grabDy: number;
  }>({
    sources: [
      { nx: 0.32, ny: 0.48 },
      { nx: 0.68, ny: 0.52 },
    ],
    dragIdx: -1,
    grabDx: 0,
    grabDy: 0,
  });

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = mq.matches;
    const onMq = () => {
      reduced = mq.matches;
    };
    mq.addEventListener("change", onMq);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const k = 0.045;
    const omega = 2.2;
    const CELL = 12;

    const sourceAt = (px: number, py: number, w: number, h: number) => {
      const sources = state.current.sources;
      for (let i = 0; i < sources.length; i++) {
        const sx = sources[i].nx * w;
        const sy = sources[i].ny * h;
        if (Math.hypot(px - sx, py - sy) < 28) return i;
      }
      return -1;
    };

    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const w = rect.width;
      const h = rect.height;
      const st = state.current;
      const idx = sourceAt(px, py, w, h);
      if (idx >= 0) {
        st.dragIdx = idx;
        st.grabDx = px - st.sources[idx].nx * w;
        st.grabDy = py - st.sources[idx].ny * h;
        canvas.setPointerCapture?.(e.pointerId);
        pulse("ripple", 0.4);
        return;
      }
      if (st.sources.length < maxSources) {
        st.sources.push({ nx: px / w, ny: py / h });
        setCount(st.sources.length);
        pulse("sigil", 0.55);
      }
    };
    const onMove = (e: PointerEvent) => {
      const st = state.current;
      if (st.dragIdx < 0) return;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      st.sources[st.dragIdx] = {
        nx: Math.max(0.04, Math.min(0.96, (px - st.grabDx) / w)),
        ny: Math.max(0.06, Math.min(0.94, (py - st.grabDy) / h)),
      };
    };
    const onUp = () => {
      state.current.dragIdx = -1;
    };

    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    const sampleRamp = (v: number): [number, number, number] => {
      const u = (v + 1) * 0.5;
      const stops: Array<{ at: number; c: [number, number, number] }> = [
        { at: 0.0, c: [6, 10, 46] },
        { at: 0.35, c: [40, 110, 200] },
        { at: 0.55, c: [80, 220, 230] },
        { at: 0.78, c: [255, 178, 70] },
        { at: 1.0, c: [255, 250, 240] },
      ];
      for (let i = 0; i < stops.length - 1; i++) {
        const a = stops[i];
        const b = stops[i + 1];
        if (u <= b.at) {
          const t = (u - a.at) / Math.max(1e-6, b.at - a.at);
          return [
            a.c[0] + (b.c[0] - a.c[0]) * t,
            a.c[1] + (b.c[1] - a.c[1]) * t,
            a.c[2] + (b.c[2] - a.c[2]) * t,
          ];
        }
      }
      return stops[stops.length - 1].c;
    };

    const t0 = performance.now();
    let raf = 0;
    const draw = (now: number) => {
      const t = reduced ? 0 : (now - t0) / 1000;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w <= 0 || h <= 0) {
        raf = requestAnimationFrame(draw);
        return;
      }
      ctx.fillStyle = "rgba(2, 4, 22, 1)";
      ctx.fillRect(0, 0, w, h);

      const sources = state.current.sources;
      const phase = -t * omega;
      const cols = Math.ceil(w / CELL);
      const rows = Math.ceil(h / CELL);
      for (let yy = 0; yy < rows; yy++) {
        for (let xx = 0; xx < cols; xx++) {
          const cx = xx * CELL + CELL * 0.5;
          const cy = yy * CELL + CELL * 0.5;
          let amp = 0;
          for (let i = 0; i < sources.length; i++) {
            const sx = sources[i].nx * w;
            const sy = sources[i].ny * h;
            const r = Math.hypot(cx - sx, cy - sy);
            const att = 1 / Math.sqrt(1 + r * 0.012);
            amp += Math.sin(r * k + phase) * att;
          }
          const norm = sources.length > 0 ? amp / sources.length : 0;
          const [r0, g0, b0] = sampleRamp(Math.max(-1, Math.min(1, norm)));
          ctx.fillStyle = `rgb(${r0 | 0}, ${g0 | 0}, ${b0 | 0})`;
          ctx.fillRect(xx * CELL, yy * CELL, CELL + 1, CELL + 1);
        }
      }

      for (let i = 0; i < sources.length; i++) {
        const sx = sources[i].nx * w;
        const sy = sources[i].ny * h;
        const halo = ctx.createRadialGradient(sx, sy, 0, sx, sy, 28);
        halo.addColorStop(0, "rgba(255, 250, 230, 0.55)");
        halo.addColorStop(1, "rgba(255, 250, 230, 0)");
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(sx, sy, 28, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255, 252, 245, 0.95)";
        ctx.beginPath();
        ctx.arc(sx, sy, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.7)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(sx - 10, sy);
        ctx.lineTo(sx + 10, sy);
        ctx.moveTo(sx, sy - 10);
        ctx.lineTo(sx, sy + 10);
        ctx.stroke();
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      mq.removeEventListener("change", onMq);
    };
  }, [maxSources, pulse]);

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ height }}>
      <div ref={wrapRef} className="absolute inset-0">
        <canvas ref={canvasRef} className="h-full w-full touch-none" />
      </div>
      <p className="pointer-events-none absolute bottom-3 left-4 t-eyebrow text-on-deep/55">
        {label} · {count}/{maxSources}
      </p>
    </div>
  );
}
