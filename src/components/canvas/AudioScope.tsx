"use client";

import { useEffect, useRef, useState } from "react";
import { useTape } from "@/lib/tape";
import { WaveButton } from "@/components/ui/WaveButton";

type Props = {
  height?: number;
  className?: string;
  bins?: number;
  label?: string;
};

type Distort = { x: number; t0: number; amount: number };

/**
 * Audio scope — Signal-lite.
 * Spectrum + waveform + nautilus spiral driven by a local Web Audio graph
 * (demo oscillator). Tap spectrum bins to tone; drag waveform to distort.
 */
export function AudioScope({
  height = 320,
  className = "",
  bins = 64,
  label = "signal · tap spectrum · drag waveform",
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { pulse } = useTape();
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<{
    ctx: AudioContext;
    analyser: AnalyserNode;
    osc: OscillatorNode;
    lfo: OscillatorNode;
    gain: GainNode;
  } | null>(null);
  const distortions = useRef<Distort[]>([]);
  const fftSmooth = useRef<Float32Array | null>(null);
  const spiralPhase = useRef(0);
  const playingRef = useRef(false);
  playingRef.current = playing;

  const ensureAudio = async () => {
    if (audioRef.current) {
      if (audioRef.current.ctx.state === "suspended") await audioRef.current.ctx.resume();
      return audioRef.current;
    }
    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.7;
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = 110;
    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.14;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 40;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    const gain = ctx.createGain();
    gain.gain.value = 0.0001;
    osc.connect(gain);
    gain.connect(analyser);
    analyser.connect(ctx.destination);
    osc.start();
    lfo.start();
    audioRef.current = { ctx, analyser, osc, lfo, gain };
    return audioRef.current;
  };

  const start = async () => {
    const a = await ensureAudio();
    const t = a.ctx.currentTime;
    a.gain.gain.cancelScheduledValues(t);
    a.gain.gain.exponentialRampToValueAtTime(0.08, t + 0.08);
    setPlaying(true);
    pulse("ripple", 0.5);
  };

  const stop = () => {
    const a = audioRef.current;
    if (!a) return;
    const t = a.ctx.currentTime;
    a.gain.gain.cancelScheduledValues(t);
    a.gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    setPlaying(false);
    pulse("calm", 0.4);
  };

  useEffect(() => {
    return () => {
      const a = audioRef.current;
      if (!a) return;
      try {
        a.osc.stop();
        a.lfo.stop();
        a.ctx.close();
      } catch {
        /* noop */
      }
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;

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
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const DISTORT_LIFE = 1.4;
    let dragging = false;

    const onDown = async (e: PointerEvent) => {
      if (!playingRef.current) await start();
      const a = audioRef.current;
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const w = rect.width;
      const h = rect.height;
      const specBaseline = h * 0.34;
      const waveY = h * 0.62;

      if (py < specBaseline && a) {
        const bin = Math.floor((px / w) * bins);
        const freq = 80 + (bin / bins) * 1200;
        const t = a.ctx.currentTime;
        const o = a.ctx.createOscillator();
        const g = a.ctx.createGain();
        o.frequency.value = freq;
        o.type = "sine";
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.12, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
        o.connect(g);
        g.connect(a.ctx.destination);
        o.start(t);
        o.stop(t + 0.4);
        pulse("ripple", 0.35);
        return;
      }

      if (Math.abs(py - waveY) < 50) {
        dragging = true;
        canvas.setPointerCapture?.(e.pointerId);
        distortions.current.push({ x: px, t0: performance.now(), amount: 28 });
        if (distortions.current.length > 8) distortions.current.shift();
        pulse("ripple", 0.3);
      }
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const last = distortions.current[distortions.current.length - 1];
      if (!last || performance.now() - last.t0 > 80) {
        distortions.current.push({ x: px, t0: performance.now(), amount: 22 });
        if (distortions.current.length > 8) distortions.current.shift();
      }
    };
    const onUp = () => {
      dragging = false;
    };

    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    const STARS = Array.from({ length: 60 }, (_, i) => ({
      sx: ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1,
      sy: ((Math.sin(i * 78.233) * 43758.5453) % 1 + 1) % 1,
      ph: (Math.sin(i * 5.71) * 100) % 6.28,
    }));

    const mix = (c1: [number, number, number], c2: [number, number, number], t: number) =>
      [
        c1[0] + (c2[0] - c1[0]) * t,
        c1[1] + (c2[1] - c1[1]) * t,
        c1[2] + (c2[2] - c1[2]) * t,
      ] as const;

    const t0 = performance.now();
    let raf = 0;
    const draw = (now: number) => {
      const t = (now - t0) / 1000;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      const bg = ctx2d.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, "#0a1322");
      bg.addColorStop(0.5, "#15243a");
      bg.addColorStop(1, "#0a1322");
      ctx2d.fillStyle = bg;
      ctx2d.fillRect(0, 0, w, h);

      ctx2d.fillStyle = "rgba(220, 228, 240, 0.55)";
      for (const s of STARS) {
        const tw = reduced ? 0.55 : 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 1.1 + s.ph));
        ctx2d.globalAlpha = 0.35 * tw;
        ctx2d.fillRect(s.sx * w, s.sy * h, 1.1, 1.1);
      }
      ctx2d.globalAlpha = 1;

      const an = audioRef.current?.analyser;
      const freqBuf = new Uint8Array(an ? an.frequencyBinCount : bins);
      const timeBuf = new Uint8Array(an ? an.fftSize : 256);
      if (an) {
        an.getByteFrequencyData(freqBuf);
        an.getByteTimeDomainData(timeBuf);
      } else {
        for (let i = 0; i < timeBuf.length; i++) {
          timeBuf[i] = 128 + Math.sin(t * 2 + i * 0.08) * 18;
        }
      }

      if (!fftSmooth.current || fftSmooth.current.length !== bins) {
        fftSmooth.current = new Float32Array(bins);
      }
      const smoothed = fftSmooth.current;
      const binCount = freqBuf.length;
      const chunk = Math.max(1, Math.floor(binCount / bins));
      for (let i = 0; i < bins; i++) {
        let sum = 0;
        let count = 0;
        const start = i * chunk;
        const end = Math.min(binCount, start + chunk);
        for (let j = start; j < end; j++) {
          sum += freqBuf[j];
          count++;
        }
        const cur = count > 0 ? sum / count / 255 : 0.08 + 0.04 * Math.sin(t + i);
        smoothed[i] = 0.55 * smoothed[i] + 0.45 * cur;
      }

      const specBaseline = h * 0.34;
      const specMax = Math.min(100, h * 0.22);
      ctx2d.beginPath();
      ctx2d.moveTo(0, specBaseline);
      for (let i = 0; i < bins; i++) {
        const x = (i / (bins - 1)) * w;
        ctx2d.lineTo(x, specBaseline - smoothed[i] * specMax);
      }
      ctx2d.lineTo(w, specBaseline);
      ctx2d.closePath();
      const specFill = ctx2d.createLinearGradient(0, 0, w, 0);
      specFill.addColorStop(0, "rgba(255, 180, 110, 0.18)");
      specFill.addColorStop(1, "rgba(120, 200, 235, 0.18)");
      ctx2d.fillStyle = specFill;
      ctx2d.fill();

      const AMBER: [number, number, number] = [255, 180, 110];
      const CYAN: [number, number, number] = [120, 200, 235];
      ctx2d.lineWidth = 1.4;
      for (let i = 0; i < bins - 1; i++) {
        const x1 = (i / (bins - 1)) * w;
        const x2 = ((i + 1) / (bins - 1)) * w;
        const y1 = specBaseline - smoothed[i] * specMax;
        const y2 = specBaseline - smoothed[i + 1] * specMax;
        const [r, g, b] = mix(AMBER, CYAN, i / (bins - 1));
        ctx2d.strokeStyle = `rgba(${r | 0},${g | 0},${b | 0},0.85)`;
        ctx2d.beginPath();
        ctx2d.moveTo(x1, y1);
        ctx2d.lineTo(x2, y2);
        ctx2d.stroke();
      }

      const waveY = h * 0.62;
      const waveAmp = Math.min(70, h * 0.1);
      distortions.current = distortions.current.filter(
        (d) => (now - d.t0) / 1000 < DISTORT_LIFE
      );
      const distortAt = (px: number) => {
        let acc = 0;
        for (const d of distortions.current) {
          const u = (now - d.t0) / 1000 / DISTORT_LIFE;
          const dx = px - d.x;
          acc += d.amount * (1 - u) * Math.exp(-(dx * dx) / (2 * 80 * 80));
        }
        return acc;
      };

      ctx2d.strokeStyle = "rgba(244, 238, 222, 0.18)";
      ctx2d.lineWidth = 5;
      ctx2d.beginPath();
      for (let i = 0; i < timeBuf.length; i++) {
        const x = (i / (timeBuf.length - 1)) * w;
        const v = (timeBuf[i] - 128) / 128;
        const y = waveY + v * waveAmp + distortAt(x);
        if (i === 0) ctx2d.moveTo(x, y);
        else ctx2d.lineTo(x, y);
      }
      ctx2d.stroke();
      ctx2d.strokeStyle = "rgba(244, 238, 222, 0.85)";
      ctx2d.lineWidth = 1.3;
      ctx2d.beginPath();
      for (let i = 0; i < timeBuf.length; i++) {
        const x = (i / (timeBuf.length - 1)) * w;
        const v = (timeBuf[i] - 128) / 128;
        const y = waveY + v * waveAmp + distortAt(x);
        if (i === 0) ctx2d.moveTo(x, y);
        else ctx2d.lineTo(x, y);
      }
      ctx2d.stroke();

      // nautilus
      const cx = w * 0.5;
      const cy = h * 0.48;
      const turns = 5;
      const thetaMax = turns * Math.PI * 2;
      const b = 0.18;
      const aBase = (Math.min(w, h) * 0.28) / Math.exp(b * thetaMax);
      if (!reduced) spiralPhase.current += 0.012;
      const phase = spiralPhase.current;
      const SAMPLES = 500;
      ctx2d.lineWidth = 1.4;
      ctx2d.lineCap = "round";
      for (let i = 0; i < SAMPLES - 1; i++) {
        const u0 = i / SAMPLES;
        const u1 = (i + 1) / SAMPLES;
        const th0 = u0 * thetaMax + phase;
        const th1 = u1 * thetaMax + phase;
        const sample = timeBuf[Math.floor(u0 * (timeBuf.length - 1))] ?? 128;
        const mod = ((sample - 128) / 128) * Math.min(w, h) * 0.04;
        const r0 = aBase * Math.exp(b * (u0 * thetaMax)) + mod;
        const r1 = aBase * Math.exp(b * (u1 * thetaMax)) + mod * 0.9;
        const [r, g, bl] = mix(AMBER, CYAN, u0);
        ctx2d.strokeStyle = `rgba(${r | 0},${g | 0},${bl | 0},0.55)`;
        ctx2d.beginPath();
        ctx2d.moveTo(cx + Math.cos(th0) * r0, cy + Math.sin(th0) * r0);
        ctx2d.lineTo(cx + Math.cos(th1) * r1, cy + Math.sin(th1) * r1);
        ctx2d.stroke();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bins, pulse]);

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ height }}>
      <div ref={wrapRef} className="absolute inset-0">
        <canvas ref={canvasRef} className="h-full w-full touch-none" />
      </div>
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3">
        <p className="t-eyebrow text-on-deep/55">{label}</p>
        <WaveButton register="oceanic" onClick={() => (playing ? stop() : start())}>
          {playing ? "mute signal" : "open signal"}
        </WaveButton>
      </div>
    </div>
  );
}
