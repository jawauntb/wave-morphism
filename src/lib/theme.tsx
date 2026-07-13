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
import {
  applyThemeVars,
  DEFAULT_THEME,
  getTheme,
  themes,
  type ThemeDef,
  type ThemeId,
} from "@/data/themes";

const STORAGE_KEY = "wave-morphism-theme";

type ThemeApi = {
  theme: ThemeDef;
  themeId: ThemeId;
  themes: ThemeDef[];
  setTheme: (id: ThemeId) => void;
  cycleTheme: () => void;
};

const ThemeContext = createContext<ThemeApi | null>(null);

function readStored(): ThemeId {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY) as ThemeId | null;
    if (v && themes.some((t) => t.id === v)) return v;
  } catch {
    /* noop */
  }
  return DEFAULT_THEME;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>(DEFAULT_THEME);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = readStored();
    setThemeId(id);
    applyThemeVars(document.documentElement, getTheme(id));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const theme = getTheme(themeId);
    applyThemeVars(document.documentElement, theme);
    try {
      window.localStorage.setItem(STORAGE_KEY, themeId);
    } catch {
      /* noop */
    }
  }, [themeId, ready]);

  const setTheme = useCallback((id: ThemeId) => {
    setThemeId(id);
  }, []);

  const cycleTheme = useCallback(() => {
    setThemeId((cur) => {
      const i = themes.findIndex((t) => t.id === cur);
      return themes[(i + 1) % themes.length].id;
    });
  }, []);

  const value = useMemo<ThemeApi>(
    () => ({
      theme: getTheme(themeId),
      themeId,
      themes,
      setTheme,
      cycleTheme,
    }),
    [themeId, setTheme, cycleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

/** Safe for canvas loops — returns tidewater defaults outside provider. */
export function useThemeOptional(): ThemeApi {
  const ctx = useContext(ThemeContext);
  if (ctx) return ctx;
  const theme = getTheme(DEFAULT_THEME);
  return {
    theme,
    themeId: DEFAULT_THEME,
    themes,
    setTheme: () => {},
    cycleTheme: () => {},
  };
}
