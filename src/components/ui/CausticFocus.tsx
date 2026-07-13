"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { themeCanvasColors, rgba } from "@/lib/colors";
import { usePrefersReducedMotion } from "@/lib/motion";

/**
 * Focus as a caustic pool — core focus system.
 * Canvas pool when motion is allowed; CSS crest-focus fallback otherwise.
 * Prefer wrapping form regions, not the whole app (perf).
 */
export function CausticFocusRoot({
  children,
  contained = true,
  className = "",
}: {
  children: ReactNode;
  contained?: boolean;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const target = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
  const wakes = useRef<{ x: number; y: number; t0: number }[]>([]);
  const smooth = useRef({ x: 0, y: 0, w: 40, h: 24 });
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const isFocusable = (el: HTMLElement) => {
      const tag = el.tagName;
      if (/^(INPUT|TEXTAREA|BUTTON|SELECT|A)$/.test(tag)) return true;
      if (el.isContentEditable) return true;
      return el.tabIndex >= 0;
    };

    const place = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      const origin = contained ? root.getBoundingClientRect() : { left: 0, top: 0 };
      if (target.current) {
        wakes.current.push({
          x: target.current.x + target.current.w / 2,
          y: target.current.y + target.current.h / 2,
          t0: performance.now(),
        });
        if (wakes.current.length > 6) wakes.current.shift();
      }
      target.current = {
        x: r.left - origin.left,
        y: r.top - origin.top,
        w: r.width,
        h: r.height,
      };
    };

    const onFocusIn = (e: FocusEvent) => {
      const el = e.target as HTMLElement | null;
      if (!el || !root.contains(el) || !isFocusable(el)) return;
      place(el);
    };

    root.addEventListener("focusin", onFocusIn);
    return () => root.removeEventListener("focusin", onFocusIn);
  }, [contained]);

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = contained ? root.clientWidth : window.innerWidth;
      const h = contained ? root.clientHeight : window.innerHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(root);
    window.addEventListener("resize", resize);

    let raf = 0;
    const t0 = performance.now();
    const draw = (now: number) => {
      const t = (now - t0) / 1000;
      const w = contained ? root.clientWidth : window.innerWidth;
      const h = contained ? root.clientHeight : window.innerHeight;
      ctx.clearRect(0, 0, w, h);
      const c = themeCanvasColors();
      const tgt = target.current;
      if (tgt) {
        smooth.current.x += (tgt.x - smooth.current.x) * 0.22;
        smooth.current.y += (tgt.y - smooth.current.y) * 0.22;
        smooth.current.w += (tgt.w - smooth.current.w) * 0.22;
        smooth.current.h += (tgt.h - smooth.current.h) * 0.22;
        const s = smooth.current;
        const cx = s.x + s.w / 2;
        const cy = s.y + s.h / 2;
        const rx = s.w / 2 + 14;
        const ry = s.h / 2 + 12;

        const pool = ctx.createRadialGradient(cx, cy, 2, cx, cy, Math.max(rx, ry) * 1.6);
        pool.addColorStop(0, rgba(c.crestRgb, 0.45));
        pool.addColorStop(0.45, rgba(c.candleRgb, 0.22));
        pool.addColorStop(1, rgba(c.seaRgb, 0));
        ctx.fillStyle = pool;
        ctx.fillRect(cx - rx * 2, cy - ry * 2, rx * 4, ry * 4);

        ctx.beginPath();
        const steps = 48;
        for (let i = 0; i <= steps; i++) {
          const p = (i / steps) * Math.PI * 2;
          const wobble =
            Math.sin(p * 3 + t * 2.4) * 3.5 + Math.sin(p * 5 - t * 1.6) * 1.8;
          const x = cx + Math.cos(p) * (rx + wobble);
          const y = cy + Math.sin(p) * (ry + wobble * 0.7);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = rgba(c.candleRgb, 0.85);
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.strokeStyle = rgba(c.crestRgb, 0.55);
        ctx.lineWidth = 1;
        ctx.stroke();

        for (let i = 0; i < 10; i++) {
          const a = t * 1.8 + i * 0.55;
          const px = cx + Math.cos(a) * rx * (0.55 + (i % 3) * 0.15);
          const py = cy + Math.sin(a * 1.15) * ry * (0.55 + (i % 3) * 0.12);
          const g = ctx.createRadialGradient(px, py, 0, px, py, 5);
          g.addColorStop(0, rgba(c.candleRgb, 0.7));
          g.addColorStop(1, rgba(c.candleRgb, 0));
          ctx.fillStyle = g;
          ctx.fillRect(px - 5, py - 5, 10, 10);
        }
      }

      wakes.current = wakes.current.filter((wk) => now - wk.t0 < 1100);
      for (const wk of wakes.current) {
        const age = (now - wk.t0) / 1000;
        for (let ring = 0; ring < 2; ring++) {
          ctx.beginPath();
          ctx.arc(wk.x, wk.y, age * (55 + ring * 18), 0, Math.PI * 2);
          ctx.strokeStyle = rgba(c.seaRgb, (1 - age / 1.1) * (0.5 - ring * 0.15));
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [contained, reduced]);

  return (
    <div
      ref={rootRef}
      className={`caustic-scope relative ${contained ? "overflow-hidden" : ""} ${className}`}
      data-focus-mode={reduced ? "crest" : "caustic"}
    >
      <div className="relative z-10">{children}</div>
      {!reduced ? (
        <canvas
          ref={canvasRef}
          aria-hidden
          className={
            contained
              ? "pointer-events-none absolute inset-0 z-20 h-full w-full"
              : "pointer-events-none fixed inset-0 z-[60]"
          }
        />
      ) : null}
    </div>
  );
}

export function CausticFocusDemo({ className = "" }: { className?: string }) {
  return (
    <CausticFocusRoot contained>
      <div className={`space-y-3 p-6 ${className}`}>
        <p className="t-eyebrow text-sea">click or tab · caustic pools on focus</p>
        <input
          className="caustic-field tide-field w-full px-3 py-2.5 font-serif italic text-ink"
          placeholder="field one"
        />
        <input
          className="caustic-field tide-field w-full px-3 py-2.5 font-serif italic text-ink"
          placeholder="field two"
        />
        <button type="button" className="caustic-field tide-field px-4 py-2 t-meta text-ink">
          commit
        </button>
        <p className="t-meta text-ink-2/70">
          reduced motion → crest underline · otherwise living pool
        </p>
      </div>
    </CausticFocusRoot>
  );
}
