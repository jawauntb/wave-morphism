"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AtmosphereMode = "off" | "css" | "canvas";

type AtmosphereApi = {
  ambient: AtmosphereMode;
  tapeStrip: boolean;
  setAmbient: (m: AtmosphereMode) => void;
  setTapeStrip: (on: boolean) => void;
  cycleAmbient: () => void;
};

const STORAGE_AMBIENT = "wave-morphism-ambient";
const STORAGE_TAPE = "wave-morphism-tape-strip";

const AtmosphereContext = createContext<AtmosphereApi | null>(null);

const ORDER: AtmosphereMode[] = ["css", "canvas", "off"];

function readAmbient(): AtmosphereMode {
  if (typeof window === "undefined") return "css";
  try {
    const v = window.localStorage.getItem(STORAGE_AMBIENT) as AtmosphereMode | null;
    if (v && ORDER.includes(v)) return v;
  } catch {
    /* noop */
  }
  return "css";
}

function readTape(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const v = window.localStorage.getItem(STORAGE_TAPE);
    if (v === "0") return false;
    if (v === "1") return true;
  } catch {
    /* noop */
  }
  return true;
}

/**
 * Atmosphere is opt-in for canvas cost.
 * Default: CSS gradient field (no rAF canvas) + tape strip on.
 * "canvas" enables AmbientField. "off" is flat field color only.
 */
export function AtmosphereProvider({
  children,
  defaultAmbient = "css",
  defaultTapeStrip = true,
}: {
  children: ReactNode;
  defaultAmbient?: AtmosphereMode;
  defaultTapeStrip?: boolean;
}) {
  const [ambient, setAmbientState] = useState<AtmosphereMode>(defaultAmbient);
  const [tapeStrip, setTapeStripState] = useState(defaultTapeStrip);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setAmbientState(readAmbient());
    setTapeStripState(readTape());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_AMBIENT, ambient);
      window.localStorage.setItem(STORAGE_TAPE, tapeStrip ? "1" : "0");
    } catch {
      /* noop */
    }
    document.documentElement.dataset.atmosphere = ambient;
  }, [ambient, tapeStrip, ready]);

  const setAmbient = useCallback((m: AtmosphereMode) => setAmbientState(m), []);
  const setTapeStrip = useCallback((on: boolean) => setTapeStripState(on), []);
  const cycleAmbient = useCallback(() => {
    setAmbientState((cur) => ORDER[(ORDER.indexOf(cur) + 1) % ORDER.length]);
  }, []);

  const value = useMemo(
    () => ({ ambient, tapeStrip, setAmbient, setTapeStrip, cycleAmbient }),
    [ambient, tapeStrip, setAmbient, setTapeStrip, cycleAmbient]
  );

  return (
    <AtmosphereContext.Provider value={value}>{children}</AtmosphereContext.Provider>
  );
}

export function useAtmosphere() {
  const ctx = useContext(AtmosphereContext);
  if (!ctx) {
    return {
      ambient: "css" as AtmosphereMode,
      tapeStrip: true,
      setAmbient: () => {},
      setTapeStrip: () => {},
      cycleAmbient: () => {},
    };
  }
  return ctx;
}
