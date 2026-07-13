"use client";

import { useEffect, useRef } from "react";
import { useSwellLFO } from "@/lib/motion";

export type ScaleDemoId =
  | "droplet"
  | "rain"
  | "sink"
  | "pool"
  | "river"
  | "lake"
  | "beach"
  | "waves"
  | "ocean"
  | "clouds"
  | "snow"
  | "ice"
  | "steam"
  | "storm";

type Props = {
  scale: ScaleDemoId;
  height?: number;
  className?: string;
};

/**
 * Living vignette for each water scale — not a full instrument,
 * but enough physics that the scale reads as itself.
 */
export function ScaleField({ scale, height = 220, className = "" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const { value: swell } = useSwellLFO(0.12, 0.03);
  const swellRef = useRef(swell);
  swellRef.current = swell;
  const scaleRef = useRef(scale);
  scaleRef.current = scale;

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

    type Drop = { x: number; y: number; vy: number; life: number; born: number; r: number };
    type Rip = { x: number; y: number; t0: number };
    const drops: Drop[] = [];
    const rips: Rip[] = [];
    const flakes: { x: number; y: number; vx: number; vy: number; s: number }[] = [];
    let pour = 0;
    let pointer: { x: number; y: number; down: boolean } = { x: 0.5, y: 0.5, down: false };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
        down: pointer.down,
      };
    };
    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
        down: true,
      };
      rips.push({ x: pointer.x * rect.width, y: pointer.y * rect.height, t0: performance.now() });
      if (rips.length > 12) rips.shift();
      const id = scaleRef.current;
      if (id === "droplet" || id === "pool" || id === "lake" || id === "waves" || id === "ocean") {
        drops.push({
          x: pointer.x * rect.width,
          y: pointer.y * rect.height,
          vy: 0,
          life: 1.2,
          born: performance.now(),
          r: 4 + Math.random() * 4,
        });
      }
      if (id === "sink") pour = Math.min(1, pour + 0.15);
    };
    const onUp = () => {
      pointer.down = false;
    };
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);

    // seed flakes / rain
    for (let i = 0; i < 40; i++) {
      flakes.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.15,
        vy: 0.2 + Math.random() * 0.5,
        s: 1 + Math.random() * 2,
      });
    }

    const t0 = performance.now();
    let raf = 0;
    let lastSpawn = 0;

    const draw = (now: number) => {
      const t = reduced ? 0 : (now - t0) / 1000;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const s = swellRef.current;
      const id = scaleRef.current;

      // base by phase family
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      if (id === "ice" || id === "snow") {
        bg.addColorStop(0, "#e8eef4");
        bg.addColorStop(1, "#c5d4e0");
      } else if (id === "steam" || id === "clouds") {
        bg.addColorStop(0, "#d8e0e6");
        bg.addColorStop(1, "#b8c8d4");
      } else if (id === "storm") {
        bg.addColorStop(0, "#4a5560");
        bg.addColorStop(0.35, "#2a3848");
        bg.addColorStop(1, "#0e2540");
      } else if (id === "ocean" || id === "lake" || id === "waves") {
        bg.addColorStop(0, "#dce8ee");
        bg.addColorStop(0.35, "#4a7a9a");
        bg.addColorStop(1, "#0e2540");
      } else if (id === "beach") {
        bg.addColorStop(0, "#e8e0d0");
        bg.addColorStop(0.45, "#c8b898");
        bg.addColorStop(0.55, "#5a8aaa");
        bg.addColorStop(1, "#1a4060");
      } else if (id === "river") {
        bg.addColorStop(0, "#c8d4c0");
        bg.addColorStop(0.3, "#6a9aaa");
        bg.addColorStop(0.7, "#3a6a80");
        bg.addColorStop(1, "#1a3848");
      } else {
        bg.addColorStop(0, "#e4ebe8");
        bg.addColorStop(1, "#c5d4dc");
      }
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // spawn rain/snow
      if (!reduced && (id === "rain" || id === "snow" || id === "storm") && now - lastSpawn > (id === "storm" ? 40 : 80)) {
        lastSpawn = now;
        flakes.push({
          x: Math.random(),
          y: -0.05,
          vx: id === "storm" ? 0.4 + Math.random() * 0.5 : (Math.random() - 0.5) * 0.1,
          vy: id === "snow" ? 0.08 + Math.random() * 0.12 : 0.4 + Math.random() * 0.6,
          s: id === "snow" ? 1.5 + Math.random() * 2 : 1,
        });
        if (flakes.length > 80) flakes.shift();
      }

      // ── per-scale draw ──
      if (id === "droplet") {
        // meniscus pool + single beads
        const cy = h * 0.62;
        ctx.beginPath();
        ctx.ellipse(w * 0.5, cy, w * 0.28, h * 0.08, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(44,74,92,0.35)";
        ctx.fill();
        ctx.strokeStyle = "rgba(44,74,92,0.5)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        for (const d of drops) {
          const age = (now - d.born) / 1000;
          if (age > d.life) continue;
          const a = 1 - age / d.life;
          const r = d.r * (1 + age * 0.3);
          const grad = ctx.createRadialGradient(d.x - r * 0.3, d.y - r * 0.3, 0, d.x, d.y, r);
          grad.addColorStop(0, `rgba(200,220,240,${0.9 * a})`);
          grad.addColorStop(0.7, `rgba(80,140,180,${0.7 * a})`);
          grad.addColorStop(1, `rgba(44,74,92,${0.2 * a})`);
          ctx.beginPath();
          ctx.ellipse(d.x, d.y + age * 8, r * 0.85, r, 0, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }
        // impact rings
        for (const r of rips) {
          const age = (now - r.t0) / 1000;
          if (age > 1.2) continue;
          ctx.beginPath();
          ctx.arc(r.x, r.y, age * 50, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(44,74,92,${(1 - age / 1.2) * 0.5})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      } else if (id === "rain" || id === "snow" || id === "storm") {
        for (const f of flakes) {
          if (!reduced) {
            f.x += f.vx * 0.016;
            f.y += f.vy * 0.016;
            if (f.y > 1.1) {
              f.y = -0.05;
              f.x = Math.random();
            }
            if (f.x < -0.1) f.x = 1.1;
            if (f.x > 1.1) f.x = -0.1;
          }
          const x = f.x * w;
          const y = f.y * h;
          if (id === "snow") {
            ctx.fillStyle = "rgba(255,255,255,0.85)";
            ctx.beginPath();
            ctx.arc(x, y, f.s, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.strokeStyle = id === "storm" ? "rgba(200,220,240,0.55)" : "rgba(80,120,160,0.55)";
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + f.vx * 20, y + f.s * 10);
            ctx.stroke();
            if (f.y > 0.85 && Math.random() < 0.02) {
              rips.push({ x, y: h * 0.88, t0: now });
            }
          }
        }
        // wet ground
        ctx.fillStyle =
          id === "snow" ? "rgba(255,255,255,0.35)" : "rgba(30,50,70,0.25)";
        ctx.fillRect(0, h * 0.88, w, h * 0.12);
        for (const r of rips) {
          const age = (now - r.t0) / 1000;
          if (age > 0.8) continue;
          ctx.beginPath();
          ctx.ellipse(r.x, r.y, age * 18, age * 6, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(200,220,240,${(1 - age / 0.8) * 0.4})`;
          ctx.stroke();
        }
        if (id === "storm") {
          // foam line
          ctx.beginPath();
          for (let x = 0; x <= w; x += 6) {
            const y =
              h * 0.55 +
              Math.sin(x * 0.02 + t * 3) * (12 + s * 8) +
              Math.sin(x * 0.05 - t * 2) * 6;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.strokeStyle = "rgba(244,248,255,0.55)";
          ctx.lineWidth = 1.5;
          ctx.stroke();
          if (!reduced && Math.random() < 0.008) {
            ctx.fillStyle = "rgba(255,255,255,0.45)";
            ctx.fillRect(0, 0, w, h);
          }
        }
      } else if (id === "sink") {
        // basin + pour
        if (pointer.down) pour = Math.min(1, pour + 0.012);
        else pour = Math.max(0, pour - 0.004);
        const brim = h * 0.35;
        const level = brim + (1 - pour) * h * 0.4;
        ctx.fillStyle = "rgba(40,70,95,0.55)";
        ctx.fillRect(w * 0.25, level, w * 0.5, h - level);
        ctx.strokeStyle = "rgba(44,74,92,0.6)";
        ctx.strokeRect(w * 0.25, brim, w * 0.5, h - brim - 10);
        // cascade when over brim
        if (pour > 0.85) {
          const cascade = (pour - 0.85) / 0.15;
          ctx.fillStyle = `rgba(100,160,200,${0.5 + cascade * 0.4})`;
          ctx.fillRect(w * 0.48, brim, w * 0.04, h * 0.5 * cascade);
          for (let i = 0; i < 8; i++) {
            ctx.fillStyle = `rgba(180,210,230,${0.4 * cascade})`;
            ctx.fillRect(
              w * 0.46 + Math.sin(t * 8 + i) * 8,
              brim + h * 0.3 * cascade + i * 8,
              3,
              6
            );
          }
        }
        // faucet drip
        ctx.fillStyle = "rgba(120,170,200,0.8)";
        ctx.fillRect(w * 0.49, h * 0.08, w * 0.02, h * 0.12);
        const dripY = h * 0.2 + ((t * 80) % (level - h * 0.2));
        ctx.beginPath();
        ctx.ellipse(w * 0.5, dripY, 4, 6, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (id === "pool") {
        const cx = w * 0.5;
        const cy = h * 0.52;
        const rx = w * 0.38;
        const ry = h * 0.28;
        const seiche = s * 3;
        ctx.beginPath();
        ctx.ellipse(cx, cy + seiche, rx, ry, 0, 0, Math.PI * 2);
        const pool = ctx.createRadialGradient(cx, cy - 20, 0, cx, cy, rx);
        pool.addColorStop(0, "rgba(140,190,210,0.55)");
        pool.addColorStop(0.7, "rgba(44,74,92,0.5)");
        pool.addColorStop(1, "rgba(20,40,55,0.7)");
        ctx.fillStyle = pool;
        ctx.fill();
        // reflection shimmer
        ctx.strokeStyle = "rgba(255,255,255,0.25)";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 10 + seiche, rx * 0.5, ry * 0.2, 0, 0, Math.PI * 2);
        ctx.stroke();
        // meniscus
        ctx.strokeStyle = "rgba(44,74,92,0.45)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy + seiche, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
        for (const r of rips) {
          const age = (now - r.t0) / 1000;
          if (age > 2) continue;
          ctx.beginPath();
          ctx.ellipse(r.x, r.y, age * 40, age * 18, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255,255,255,${(1 - age / 2) * 0.4})`;
          ctx.stroke();
        }
      } else if (id === "river") {
        // banks
        ctx.fillStyle = "rgba(90,110,70,0.45)";
        ctx.fillRect(0, 0, w * 0.18, h);
        ctx.fillRect(w * 0.82, 0, w * 0.18, h);
        // current lines
        for (let i = 0; i < 7; i++) {
          ctx.beginPath();
          const baseX = w * (0.22 + i * 0.09);
          for (let y = 0; y <= h; y += 4) {
            const x =
              baseX +
              Math.sin(y * 0.03 + t * 1.5 + i) * 8 +
              Math.sin(y * 0.01 - t + i) * 4;
            if (y === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.strokeStyle = `rgba(200,230,240,${0.2 + (i % 3) * 0.1})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
        // eddy
        const ex = w * 0.7;
        const ey = h * 0.45;
        ctx.strokeStyle = "rgba(255,200,120,0.45)";
        for (let r = 8; r < 36; r += 8) {
          ctx.beginPath();
          ctx.arc(ex, ey, r, t + r * 0.1, t + r * 0.1 + Math.PI * 1.4);
          ctx.stroke();
        }
      } else if (id === "lake" || id === "ocean" || id === "waves") {
        const seaTop = id === "ocean" ? h * 0.28 : h * 0.4;
        if (id === "ocean" || id === "lake") {
          // sky
          const sky = ctx.createLinearGradient(0, 0, 0, seaTop);
          sky.addColorStop(0, id === "ocean" ? "#c5d4e0" : "#dde6ea");
          sky.addColorStop(1, "#8eb6c9");
          ctx.fillStyle = sky;
          ctx.fillRect(0, 0, w, seaTop);
        }
        const layers = id === "waves" ? 4 : id === "ocean" ? 5 : 3;
        for (let i = 0; i < layers; i++) {
          const baseY = seaTop + i * (h - seaTop) * 0.12;
          const amp = (6 + i * 4) * (id === "waves" ? 1.2 : 0.8) + s * 4;
          const speed = 0.6 + i * 0.15;
          ctx.beginPath();
          for (let x = 0; x <= w; x += 4) {
            const y =
              baseY +
              Math.sin(x * 0.012 + t * speed + i) * amp +
              Math.sin(x * 0.03 - t * speed * 0.7) * amp * 0.4;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.lineTo(w, h);
          ctx.lineTo(0, h);
          ctx.closePath();
          ctx.fillStyle =
            i === 0
              ? `rgba(100,160,190,${0.35})`
              : `rgba(30,70,100,${0.15 + i * 0.08})`;
          ctx.fill();
          if (i === 0) {
            ctx.beginPath();
            for (let x = 0; x <= w; x += 4) {
              const y =
                baseY +
                Math.sin(x * 0.012 + t * speed) * amp +
                Math.sin(x * 0.03 - t * speed * 0.7) * amp * 0.4;
              if (x === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.strokeStyle = "rgba(244,248,255,0.55)";
            ctx.lineWidth = 1.4;
            ctx.stroke();
          }
        }
        for (const r of rips) {
          const age = (now - r.t0) / 1000;
          if (age > 2) continue;
          ctx.beginPath();
          ctx.ellipse(r.x, r.y, age * 55, age * 22, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255,255,255,${(1 - age / 2) * 0.45})`;
          ctx.stroke();
        }
      } else if (id === "beach") {
        const tide = 0.5 + s * 0.04 + Math.sin(t * 0.4) * 0.06;
        const lineY = h * tide;
        // dry sand
        ctx.fillStyle = "#d4c4a0";
        ctx.fillRect(0, 0, w, lineY);
        // wet sand stain
        const wet = ctx.createLinearGradient(0, lineY - 30, 0, lineY + 20);
        wet.addColorStop(0, "rgba(180,160,120,0)");
        wet.addColorStop(0.5, "rgba(140,120,90,0.45)");
        wet.addColorStop(1, "rgba(90,130,150,0.3)");
        ctx.fillStyle = wet;
        ctx.fillRect(0, lineY - 30, w, 50);
        // water
        ctx.fillStyle = "rgba(60,120,160,0.7)";
        ctx.fillRect(0, lineY, w, h - lineY);
        // foam lace
        ctx.beginPath();
        for (let x = 0; x <= w; x += 3) {
          const y =
            lineY +
            Math.sin(x * 0.08 + t * 2) * 4 +
            Math.sin(x * 0.2 - t * 3) * 2;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = "rgba(255,255,255,0.75)";
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (id === "clouds") {
        for (let i = 0; i < 5; i++) {
          const cx = ((t * 12 + i * 80) % (w + 120)) - 60;
          const cy = h * (0.25 + (i % 3) * 0.15);
          const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 70 + i * 10);
          grd.addColorStop(0, "rgba(255,255,255,0.55)");
          grd.addColorStop(1, "rgba(255,255,255,0)");
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.ellipse(cx, cy, 80 + i * 12, 28 + i * 4, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        // break to blue
        ctx.fillStyle = "rgba(100,160,200,0.25)";
        ctx.fillRect(0, h * 0.7, w, h * 0.3);
      } else if (id === "ice") {
        // lattice
        ctx.strokeStyle = "rgba(100,150,190,0.35)";
        ctx.lineWidth = 1;
        for (let x = 0; x < w; x += 28) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x + h * 0.3, h);
          ctx.stroke();
        }
        for (let y = 0; y < h; y += 24) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y + 8);
          ctx.stroke();
        }
        // crack on press
        if (rips.length) {
          const r = rips[rips.length - 1];
          const age = (now - r.t0) / 1000;
          if (age < 2) {
            ctx.strokeStyle = `rgba(40,80,120,${0.7 * (1 - age / 2)})`;
            ctx.lineWidth = 1.5;
            for (let i = 0; i < 5; i++) {
              const a = (i / 5) * Math.PI * 2 + age;
              ctx.beginPath();
              ctx.moveTo(r.x, r.y);
              ctx.lineTo(r.x + Math.cos(a) * age * 80, r.y + Math.sin(a) * age * 60);
              ctx.stroke();
            }
          }
        }
        // frost sheen
        ctx.fillStyle = "rgba(255,255,255,0.15)";
        ctx.fillRect(0, 0, w, h);
      } else if (id === "steam") {
        for (let i = 0; i < 12; i++) {
          const life = ((t * 0.4 + i * 0.15) % 1);
          const x = w * 0.5 + Math.sin(t + i) * 30 * life;
          const y = h * 0.85 - life * h * 0.7;
          const r = 10 + life * 40;
          const grd = ctx.createRadialGradient(x, y, 0, x, y, r);
          grd.addColorStop(0, `rgba(255,255,255,${0.35 * (1 - life)})`);
          grd.addColorStop(1, "rgba(255,255,255,0)");
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
        // heat source
        ctx.fillStyle = "rgba(200,115,42,0.5)";
        ctx.beginPath();
        ctx.ellipse(w * 0.5, h * 0.88, 24, 8, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      mq.removeEventListener("change", onMq);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className={`relative overflow-hidden ${className}`}
      style={{ height }}
    >
      <canvas ref={canvasRef} className="h-full w-full touch-none" />
    </div>
  );
}
