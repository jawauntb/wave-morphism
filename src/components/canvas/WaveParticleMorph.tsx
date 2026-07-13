"use client";

import { useEffect, useRef, useState } from "react";
import { useTape } from "@/lib/tape";

type Props = {
  height?: number;
  className?: string;
  /** 0 = pure wave, 1 = pure particles */
  value?: number;
  onChange?: (m: number) => void;
  label?: string;
};

/**
 * Wave/particle duality dial (Plasma Zone 3).
 * One continuous morph: sine field ↔ discrete particles.
 * Drag the center dial or tap the eight phase dots.
 */
export function WaveParticleMorph({
  height = 260,
  className = "",
  value,
  onChange,
  label = "wave ↔ particle",
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { pulse } = useTape();
  const [internal, setInternal] = useState(value ?? 0.35);
  const m = value ?? internal;
  const mRef = useRef(m);
  mRef.current = m;

  const setM = (next: number) => {
    const v = Math.max(0, Math.min(1, next));
    if (onChange) onChange(v);
    else setInternal(v);
  };

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

    const drag = { active: false, grabX: 0, grabM: 0 };
    const ripples: { x: number; t0: number }[] = [];
    const jiggles = new Map<number, number>();

    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const w = rect.width;
      const h = rect.height;
      const dialCx = w * 0.5;
      const dialCy = h * 0.72;
      if (Math.hypot(px - dialCx, py - dialCy) < 40) {
        drag.active = true;
        drag.grabX = px;
        drag.grabM = mRef.current;
        canvas.setPointerCapture?.(e.pointerId);
        return;
      }
      const touchR = 46;
      for (let i = 0; i < 8; i++) {
        const a = Math.PI + (i / 7) * Math.PI;
        const tx = dialCx + Math.cos(a) * touchR;
        const ty = dialCy + Math.sin(a) * touchR;
        if (Math.hypot(px - tx, py - ty) < 16) {
          setM(i / 7);
          pulse("ripple", 0.35);
          return;
        }
      }
      if (Math.abs(py - h * 0.38) < 40) {
        ripples.push({ x: px, t0: performance.now() });
        if (ripples.length > 6) ripples.shift();
        pulse("ripple", 0.3);
      }
    };
    const onMove = (e: PointerEvent) => {
      if (!drag.active) return;
      const rect = canvas.getBoundingClientRect();
      const dx = (e.clientX - rect.left - drag.grabX) / (rect.width * 0.5);
      setM(drag.grabM + dx);
    };
    const onUp = () => {
      drag.active = false;
    };

    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    const hash01 = (k: number) => {
      const v = Math.sin(k * 12.9898) * 43758.5453;
      return v - Math.floor(v);
    };

    const t0 = performance.now();
    let raf = 0;
    const draw = (now: number) => {
      const t = reduced ? 0 : (now - t0) / 1000;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const morph = mRef.current;

      ctx.fillStyle = "rgba(8, 14, 28, 1)";
      ctx.fillRect(0, 0, w, h);

      const axisY = h * 0.38;
      const pad = 36;
      const left = pad;
      const right = w - pad;
      const waveAmp = 28;
      const phase = t * 2.2;

      // continuous wave (fades as morph → particles)
      const waveAlpha = 1 - morph * 0.85;
      if (waveAlpha > 0.05) {
        ctx.beginPath();
        for (let x = left; x <= right; x += 3) {
          const u = (x - left) / (right - left);
          let y = axisY + Math.sin(u * Math.PI * 4 + phase) * waveAmp;
          for (const r of ripples) {
            const age = (now - r.t0) / 1000;
            if (age < 1.2) {
              const dx = x - r.x;
              y += Math.exp(-(dx * dx) / 1800) * Math.sin(age * 14) * 10 * (1 - age / 1.2);
            }
          }
          if (x === left) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(142,182,201,${0.75 * waveAlpha})`;
        ctx.lineWidth = 1.6;
        ctx.stroke();
      }

      // particles
      const PCOUNT = 48;
      if (morph > 0.04) {
        for (let i = 0; i < PCOUNT; i++) {
          const u = (i + 0.5) / PCOUNT;
          const x0 = left + (right - left) * u;
          const waveY = axisY + Math.sin(u * Math.PI * 4 + phase) * waveAmp;
          const jiggle = jiggles.get(i);
          let jy = 0;
          if (jiggle) {
            const age = (now - jiggle) / 1000;
            if (age < 0.5) jy = Math.sin(age * 40) * 6 * (1 - age / 0.5);
            else jiggles.delete(i);
          }
          const scatterY = (hash01(i + 7) - 0.5) * 40 * morph;
          const x = x0 + (hash01(i + 3) - 0.5) * 4 * morph;
          const y = waveY * (1 - morph) + (axisY + scatterY) * morph + jy;
          const a = 0.35 + morph * 0.55;
          ctx.fillStyle = `rgba(255, 200, 120, ${a})`;
          ctx.beginPath();
          ctx.arc(x, y, 2.2 + morph * 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // dial
      const dialCx = w * 0.5;
      const dialCy = h * 0.72;
      const dialR = 28;
      ctx.beginPath();
      ctx.arc(dialCx, dialCy, dialR + 4, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(142,182,201,0.35)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(dialCx, dialCy, dialR, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(20, 32, 48, 0.9)";
      ctx.fill();
      const needle = -Math.PI / 2 + morph * Math.PI * 1.5;
      ctx.beginPath();
      ctx.moveTo(dialCx, dialCy);
      ctx.lineTo(
        dialCx + Math.cos(needle) * (dialR - 6),
        dialCy + Math.sin(needle) * (dialR - 6)
      );
      ctx.strokeStyle = "rgba(200,115,42,0.95)";
      ctx.lineWidth = 2;
      ctx.stroke();

      for (let i = 0; i < 8; i++) {
        const a = Math.PI + (i / 7) * Math.PI;
        const tx = dialCx + Math.cos(a) * 46;
        const ty = dialCy + Math.sin(a) * 46;
        const active = Math.abs(morph - i / 7) < 0.08;
        ctx.beginPath();
        ctx.arc(tx, ty, active ? 4 : 2.5, 0, Math.PI * 2);
        ctx.fillStyle = active ? "rgba(200,115,42,0.95)" : "rgba(142,182,201,0.45)";
        ctx.fill();
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
    // setM is stable enough for this instrument; avoid rebinding the GL loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pulse]);

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ height }}>
      <div ref={wrapRef} className="absolute inset-0">
        <canvas ref={canvasRef} className="h-full w-full touch-none" />
      </div>
      <p className="pointer-events-none absolute left-4 top-3 t-eyebrow text-on-deep/55">
        {label} · {(m * 100).toFixed(0)}% particle
      </p>
    </div>
  );
}
