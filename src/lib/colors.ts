/** Read a CSS custom property from :root (for canvas instruments). */
export function cssVar(name: string, fallback = ""): string {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

/** Read an RGB triplet custom property → "r, g, b". */
export function cssRgb(name: string, fallback: string): string {
  return cssVar(name, fallback);
}

export function rgba(rgbTriplet: string, alpha: number): string {
  return `rgba(${rgbTriplet}, ${alpha})`;
}

/** Snapshot of theme colors for a canvas draw loop. Call once per frame or on theme change. */
export function themeCanvasColors() {
  return {
    paper: cssVar("--paper", "#f2eee6"),
    paper2: cssVar("--paper-2", "#e8e2d5"),
    ink: cssVar("--ink", "#15171a"),
    ink2: cssVar("--ink-2", "#3a3d42"),
    candle: cssVar("--candle", "#c8732a"),
    sea: cssVar("--sea", "#2c4a5c"),
    crest: cssVar("--crest", "#8eb6c9"),
    haze: cssVar("--haze", "#8eb6c9"),
    deep: cssVar("--deep", "#0c1822"),
    deep2: cssVar("--deep-2", "#152830"),
    field: cssVar("--field", "#d5e0e4"),
    paperRgb: cssRgb("--paper-rgb", "242, 238, 230"),
    inkRgb: cssRgb("--ink-rgb", "21, 23, 26"),
    candleRgb: cssRgb("--candle-rgb", "200, 115, 42"),
    seaRgb: cssRgb("--sea-rgb", "44, 74, 92"),
    crestRgb: cssRgb("--crest-rgb", "142, 182, 201"),
    hazeRgb: cssRgb("--haze-rgb", "142, 182, 201"),
    deepRgb: cssRgb("--deep-rgb", "12, 24, 34"),
    ambient: [
      cssVar("--ambient-0", "#e4ebe8"),
      cssVar("--ambient-1", "#d5e0e4"),
      cssVar("--ambient-2", "#e8e2d5"),
      cssVar("--ambient-3", "#dce6ea"),
      cssVar("--ambient-4", "#c5d4dc"),
    ] as [string, string, string, string, string],
  };
}

export type ThemeCanvasColors = ReturnType<typeof themeCanvasColors>;
