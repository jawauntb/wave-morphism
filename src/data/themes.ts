/**
 * Design themes for wave-morphism — each evokes a water scale / phase.
 * Tokens drive CSS variables; RGB triplets drive canvas instruments.
 */

export type ThemeId = "tidewater" | "abyss" | "glacier" | "brine" | "vapor";

export type ThemeDef = {
  id: ThemeId;
  name: string;
  epithet: string;
  /** Water scale this theme evokes */
  scale: string;
  phase: "liquid" | "solid" | "vapor" | "mixed";
  /** Hex / css color tokens */
  paper: string;
  paper2: string;
  ink: string;
  ink2: string;
  candle: string;
  sea: string;
  kept: string;
  open: string;
  closed: string;
  /** Ambient field gradient (top → bottom), 5 stops */
  ambient: [string, string, string, string, string];
  /** Body fallback behind ambient canvas */
  field: string;
  /** Dark instrument wells */
  deep: string;
  deep2: string;
  /** Soft crest / phosphor highlight */
  crest: string;
  haze: string;
  /**
   * Text readable on deep / instrument wells.
   * Always high-luminance — never equal to paper on dark themes.
   */
  onDeep: string;
  onDeep2: string;
  /** RGB for on-deep (canvas + rgba) */
  onDeepRgb: string;
  onDeep2Rgb: string;
  /** RGB triplets for rgba(var(--x-rgb), a) */
  rgb: {
    paper: string;
    paper2: string;
    ink: string;
    ink2: string;
    candle: string;
    sea: string;
    crest: string;
    haze: string;
    deep: string;
    field: string;
  };
};

export const themes: ThemeDef[] = [
  {
    id: "tidewater",
    name: "Tidewater",
    epithet: "warm vellum · candle · sea",
    scale: "beach / lake",
    phase: "liquid",
    paper: "#f2eee6",
    paper2: "#e8e2d5",
    ink: "#15171a",
    ink2: "#3a3d42",
    candle: "#c8732a",
    sea: "#2c4a5c",
    kept: "#6e5a2e",
    open: "#2c4a5c",
    closed: "#7a1f1f",
    ambient: ["#e4ebe8", "#d5e0e4", "#e8e2d5", "#dce6ea", "#c5d4dc"],
    field: "#d5e0e4",
    deep: "#0c1822",
    deep2: "#152830",
    crest: "#8eb6c9",
    haze: "#8eb6c9",
    onDeep: "#f2eee6",
    onDeep2: "#b8cdd8",
    onDeepRgb: "242, 238, 230",
    onDeep2Rgb: "184, 205, 216",
    rgb: {
      paper: "242, 238, 230",
      paper2: "232, 226, 213",
      ink: "21, 23, 26",
      ink2: "58, 61, 66",
      candle: "200, 115, 42",
      sea: "44, 74, 92",
      crest: "142, 182, 201",
      haze: "142, 182, 201",
      deep: "12, 24, 34",
      field: "213, 224, 228",
    },
  },
  {
    id: "abyss",
    name: "Abyss",
    epithet: "open ocean at night · phosphor",
    scale: "ocean / storm",
    phase: "mixed",
    paper: "#0e1620",
    paper2: "#162030",
    ink: "#e8eef4",
    ink2: "#9aafc0",
    candle: "#e8a45c",
    sea: "#5eb0d4",
    kept: "#c4a35a",
    open: "#5eb0d4",
    closed: "#e07070",
    ambient: ["#0a1018", "#0e1824", "#121e2c", "#0c1620", "#081018"],
    field: "#0a1018",
    deep: "#060b12",
    deep2: "#0a1420",
    crest: "#7ed4f0",
    haze: "#3a6a88",
    // paper is dark here — onDeep must stay phosphor, not paper
    onDeep: "#e8eef4",
    onDeep2: "#9aafc0",
    onDeepRgb: "232, 238, 244",
    onDeep2Rgb: "154, 175, 192",
    rgb: {
      paper: "14, 22, 32",
      paper2: "22, 32, 48",
      ink: "232, 238, 244",
      ink2: "154, 175, 192",
      candle: "232, 164, 92",
      sea: "94, 176, 212",
      crest: "126, 212, 240",
      haze: "58, 106, 136",
      deep: "6, 11, 18",
      field: "10, 16, 24",
    },
  },
  {
    id: "glacier",
    name: "Glacier",
    epithet: "ice lattice · hush · thaw",
    scale: "ice / snow",
    phase: "solid",
    paper: "#eef4f8",
    paper2: "#dde8f0",
    ink: "#1a2a38",
    ink2: "#4a6274",
    candle: "#3d8a9a",
    sea: "#2a5a78",
    kept: "#5a7a6a",
    open: "#2a5a78",
    closed: "#8a4a5a",
    ambient: ["#f4f8fb", "#e4eef6", "#d0e0ec", "#c4d6e4", "#b0c8d8"],
    field: "#d8e6f0",
    deep: "#1a3040",
    deep2: "#243848",
    crest: "#a8d4e8",
    haze: "#90b8d0",
    onDeep: "#eef4f8",
    onDeep2: "#a8d4e8",
    onDeepRgb: "238, 244, 248",
    onDeep2Rgb: "168, 212, 232",
    rgb: {
      paper: "238, 244, 248",
      paper2: "221, 232, 240",
      ink: "26, 42, 56",
      ink2: "74, 98, 116",
      candle: "61, 138, 154",
      sea: "42, 90, 120",
      crest: "168, 212, 232",
      haze: "144, 184, 208",
      deep: "26, 48, 64",
      field: "216, 230, 240",
    },
  },
  {
    id: "brine",
    name: "Brine",
    epithet: "salt marsh · kelp · low tide",
    scale: "river / pool",
    phase: "liquid",
    paper: "#ebe6d4",
    paper2: "#ddd4bc",
    ink: "#1e2418",
    ink2: "#4a5240",
    candle: "#b86a28",
    sea: "#3a5c48",
    kept: "#6a5a30",
    open: "#3a5c48",
    closed: "#8a3028",
    ambient: ["#e0e4d0", "#d4dcc4", "#ebe6d4", "#c8d4b8", "#a8b898"],
    field: "#d0d8c0",
    deep: "#1a2818",
    deep2: "#243020",
    crest: "#8aaa78",
    haze: "#7a9a68",
    onDeep: "#ebe6d4",
    onDeep2: "#b8c8a0",
    onDeepRgb: "235, 230, 212",
    onDeep2Rgb: "184, 200, 160",
    rgb: {
      paper: "235, 230, 212",
      paper2: "221, 212, 188",
      ink: "30, 36, 24",
      ink2: "74, 82, 64",
      candle: "184, 106, 40",
      sea: "58, 92, 72",
      crest: "138, 170, 120",
      haze: "122, 154, 104",
      deep: "26, 40, 24",
      field: "208, 216, 192",
    },
  },
  {
    id: "vapor",
    name: "Vapor",
    epithet: "steam · cloud veil · soft occlusion",
    scale: "steam / clouds",
    phase: "vapor",
    paper: "#f0ece8",
    paper2: "#e4ddd8",
    ink: "#2a2428",
    ink2: "#5a5258",
    candle: "#c45a6a",
    sea: "#6a6878",
    kept: "#8a6a5a",
    open: "#6a6878",
    closed: "#8a3a48",
    ambient: ["#e8e4e8", "#ddd8dc", "#f0ece8", "#d4d0d8", "#c4c0cc"],
    field: "#d8d4dc",
    deep: "#2a2430",
    deep2: "#383040",
    crest: "#c8b0b8",
    haze: "#b0a8b4",
    onDeep: "#f0ece8",
    onDeep2: "#c8b8c0",
    onDeepRgb: "240, 236, 232",
    onDeep2Rgb: "200, 184, 192",
    rgb: {
      paper: "240, 236, 232",
      paper2: "228, 221, 216",
      ink: "42, 36, 40",
      ink2: "90, 82, 88",
      candle: "196, 90, 106",
      sea: "106, 104, 120",
      crest: "200, 176, 184",
      haze: "176, 168, 180",
      deep: "42, 36, 48",
      field: "216, 212, 220",
    },
  },
];

export const DEFAULT_THEME: ThemeId = "tidewater";

export function getTheme(id: ThemeId): ThemeDef {
  return themes.find((t) => t.id === id) ?? themes[0];
}

/** Apply theme tokens as CSS custom properties on an element (usually <html>). */
export function applyThemeVars(el: HTMLElement, theme: ThemeDef) {
  const s = el.style;
  s.setProperty("--paper", theme.paper);
  s.setProperty("--paper-2", theme.paper2);
  s.setProperty("--ink", theme.ink);
  s.setProperty("--ink-2", theme.ink2);
  s.setProperty("--candle", theme.candle);
  s.setProperty("--sea", theme.sea);
  s.setProperty("--kept", theme.kept);
  s.setProperty("--open", theme.open);
  s.setProperty("--closed", theme.closed);
  s.setProperty("--field", theme.field);
  s.setProperty("--deep", theme.deep);
  s.setProperty("--deep-2", theme.deep2);
  s.setProperty("--crest", theme.crest);
  s.setProperty("--haze", theme.haze);
  s.setProperty("--on-deep", theme.onDeep);
  s.setProperty("--on-deep-2", theme.onDeep2);
  s.setProperty("--on-deep-rgb", theme.onDeepRgb);
  s.setProperty("--on-deep-2-rgb", theme.onDeep2Rgb);

  s.setProperty("--paper-rgb", theme.rgb.paper);
  s.setProperty("--paper-2-rgb", theme.rgb.paper2);
  s.setProperty("--ink-rgb", theme.rgb.ink);
  s.setProperty("--ink-2-rgb", theme.rgb.ink2);
  s.setProperty("--candle-rgb", theme.rgb.candle);
  s.setProperty("--sea-rgb", theme.rgb.sea);
  s.setProperty("--crest-rgb", theme.rgb.crest);
  s.setProperty("--haze-rgb", theme.rgb.haze);
  s.setProperty("--deep-rgb", theme.rgb.deep);
  s.setProperty("--field-rgb", theme.rgb.field);

  s.setProperty("--rule", `rgba(${theme.rgb.ink}, 0.18)`);
  s.setProperty("--island", `rgba(${theme.rgb.paper}, 0.72)`);
  s.setProperty("--island-2", `rgba(${theme.rgb.paper}, 0.55)`);

  theme.ambient.forEach((c, i) => s.setProperty(`--ambient-${i}`, c));

  // shadcn-style semantic aliases — migrate without renaming your brain
  s.setProperty("--background", theme.paper);
  s.setProperty("--foreground", theme.ink);
  s.setProperty("--card", theme.paper2);
  s.setProperty("--card-foreground", theme.ink);
  s.setProperty("--primary", theme.candle);
  s.setProperty("--primary-foreground", theme.onDeep);
  s.setProperty("--secondary", theme.sea);
  s.setProperty("--secondary-foreground", theme.onDeep);
  s.setProperty("--muted", theme.paper2);
  s.setProperty("--muted-foreground", theme.ink2);
  s.setProperty("--accent", theme.haze);
  s.setProperty("--accent-foreground", theme.ink);
  s.setProperty("--destructive", theme.closed);
  s.setProperty("--border", `rgba(${theme.rgb.ink}, 0.18)`);
  s.setProperty("--input", `rgba(${theme.rgb.ink}, 0.18)`);
  s.setProperty("--ring", theme.sea);

  el.dataset.theme = theme.id;
  el.dataset.themePhase = theme.phase;
  el.dataset.themeTone = theme.id === "abyss" ? "dark" : "light";
}
