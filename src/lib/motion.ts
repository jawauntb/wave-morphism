"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/**
 * One shared swell clock for the whole app.
 * Avoids N requestAnimationFrame loops from N useSwellLFO callers.
 */

type SwellSample = { value: number; drift: number; t: number };

const DEFAULT_HZ = 0.14;
const DEFAULT_DRIFT_HZ = 0.03;

let reducedMotion = false;
let raf = 0;
let t0 = 0;
let sample: SwellSample = { value: 0, drift: 0, t: 0 };
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

function ensureClock() {
  if (typeof window === "undefined" || raf) return;
  if (!t0) t0 = performance.now();

  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  reducedMotion = mq.matches;
  const onMq = () => {
    reducedMotion = mq.matches;
    if (reducedMotion) {
      sample = { value: 0, drift: 0, t: sample.t };
      notify();
    }
  };
  mq.addEventListener("change", onMq);

  const tick = (now: number) => {
    const t = (now - t0) / 1000;
    if (!reducedMotion) {
      sample = {
        value: Math.sin(t * DEFAULT_HZ * Math.PI * 2),
        drift: Math.sin(t * DEFAULT_DRIFT_HZ * Math.PI * 2),
        t,
      };
      notify();
    }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
}

function subscribe(cb: () => void) {
  ensureClock();
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getSnapshot(): SwellSample {
  return sample;
}

function getServerSnapshot(): SwellSample {
  return { value: 0, drift: 0, t: 0 };
}

/**
 * Shared swell LFO. hz/driftHz kept for API compat — phase is global so
 * instruments stay locked. Local rate scaling is applied as a phase offset
 * via sin remix when hz differs from default.
 */
export function useSwellLFO(hz = DEFAULT_HZ, driftHz = DEFAULT_DRIFT_HZ) {
  const s = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (hz === DEFAULT_HZ && driftHz === DEFAULT_DRIFT_HZ) {
    return { value: s.value, drift: s.drift };
  }

  // Remap from shared time so custom rates still share one clock
  const value = Math.sin(s.t * hz * Math.PI * 2);
  const drift = Math.sin(s.t * driftHz * Math.PI * 2);
  return { value, drift };
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/**
 * Three verbs. Ban everything else as decoration.
 *   press  → ripple + decay
 *   change → crest / phase shift
 *   commit → hold / pour / discharge
 */
export type MotionVerb = "press" | "change" | "commit" | "idle";

/** Idle amp ≈ 0. If it moves at rest, it's wrong. */
export const IDLE_AMP = 0.02;

/** Idle-calm envelope: near-zero at rest, rises with activity 0–1. */
export function useCalmAmp(activity: number, idle = IDLE_AMP, peak = 1) {
  const target = idle + (peak - idle) * Math.max(0, Math.min(1, activity));
  const ref = useRef(idle);
  const [amp, setAmp] = useState(idle);

  useEffect(() => {
    let rafId = 0;
    const tick = () => {
      ref.current += (target - ref.current) * 0.18;
      if (Math.abs(ref.current - target) > 0.002) {
        setAmp(ref.current);
        rafId = requestAnimationFrame(tick);
      } else {
        ref.current = target;
        setAmp(target);
      }
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [target]);

  return amp;
}

/** Map UI intent → tape kind + intensity. */
export function verbPulse(verb: MotionVerb): { kind: string; intensity: number } {
  if (verb === "press") return { kind: "press", intensity: 0.45 };
  if (verb === "change") return { kind: "phase", intensity: 0.4 };
  if (verb === "commit") return { kind: "keep", intensity: 0.7 };
  return { kind: "ghost", intensity: 0.1 };
}
