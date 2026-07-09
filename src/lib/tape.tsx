"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type TapePulse = {
  id: number;
  kind: string;
  intensity: number;
  at: number;
};

type TapeApi = {
  pulses: TapePulse[];
  pulse: (kind: string, intensity?: number) => void;
};

const TapeContext = createContext<TapeApi | null>(null);

export function TapeProvider({ children }: { children: ReactNode }) {
  const [pulses, setPulses] = useState<TapePulse[]>([]);
  const idRef = useRef(0);

  const pulse = useCallback((kind: string, intensity = 0.55) => {
    const next: TapePulse = {
      id: ++idRef.current,
      kind,
      intensity: Math.max(0.08, Math.min(1, intensity)),
      at: Date.now(),
    };
    setPulses((prev) => [...prev.slice(-48), next]);
  }, []);

  const value = useMemo(() => ({ pulses, pulse }), [pulses, pulse]);

  return <TapeContext.Provider value={value}>{children}</TapeContext.Provider>;
}

export function useTape() {
  const ctx = useContext(TapeContext);
  if (!ctx) throw new Error("useTape must be used within TapeProvider");
  return ctx;
}
