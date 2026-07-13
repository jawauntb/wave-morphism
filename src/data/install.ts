/**
 * shadcn-style semantic bridge — migrate without renaming your brain.
 * Applied alongside wave tokens in applyThemeVars / :root.
 */

export const SEMANTIC_BRIDGE = {
  background: "--paper",
  foreground: "--ink",
  card: "--paper-2",
  "card-foreground": "--ink",
  primary: "--candle",
  "primary-foreground": "--on-deep",
  secondary: "--sea",
  "secondary-foreground": "--on-deep",
  muted: "--paper-2",
  "muted-foreground": "--ink-2",
  accent: "--haze",
  "accent-foreground": "--ink",
  destructive: "--closed",
  border: "--rule",
  input: "--rule",
  ring: "--sea",
} as const;

/** Core files to copy for a minimal install (beat glass on shipability). */
export const CORE_INSTALL_FILES = [
  { path: "src/app/globals.css", note: "tokens + crest-focus + tide-field + surface-deep" },
  { path: "src/data/themes.ts", note: "theme defs + applyThemeVars (+ semantic bridge)" },
  { path: "src/lib/theme.tsx", note: "ThemeProvider" },
  { path: "src/lib/motion.ts", note: "shared swell LFO" },
  { path: "src/lib/tape.tsx", note: "TapeProvider + pulse API" },
  { path: "src/components/ui/WaveButton.tsx", note: "press / navigate" },
  { path: "src/components/ui/WaveMorph.tsx", note: "MorphShell quiet + WaveRule" },
  { path: "src/components/ui/SwellRail.tsx", note: "canonical 0–1 (no native range)" },
] as const;

export const CORE_INSTALL_NEXT = [
  { path: "src/components/ui/PhaseChip.tsx", note: "discrete choice" },
  { path: "src/components/ui/WaveInput.tsx", note: "compose / ask" },
  { path: "src/components/ui/CausticFocus.tsx", note: "focus pool for forms" },
  { path: "src/components/ui/UndertowScroll.tsx", note: "long-scroll / chaptered reading" },
  { path: "src/lib/wake.tsx", note: "announce() = tape + SteamPlume" },
  { path: "src/components/canvas/BasinCaustic.tsx", note: "optional — one basin material" },
  { path: "src/lib/atmosphere.tsx", note: "optional — css ambient default" },
] as const;
