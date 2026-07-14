/**
 * Contrast helpers — beat neumorphism on readability.
 * WCAG-ish relative luminance against theme tokens.
 */

function parseHex(hex: string): [number, number, number] {
  const h = hex.replace("#", "").trim();
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const n = parseInt(full.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function parseRgbTriplet(triplet: string): [number, number, number] {
  const [r, g, b] = triplet.split(",").map((x) => Number(x.trim()));
  return [r || 0, g || 0, b || 0];
}

function channel(c: number) {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(rgb: [number, number, number]) {
  const [r, g, b] = rgb.map(channel);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: [number, number, number], b: [number, number, number]) {
  const L1 = relativeLuminance(a);
  const L2 = relativeLuminance(b);
  const light = Math.max(L1, L2);
  const dark = Math.min(L1, L2);
  return (light + 0.05) / (dark + 0.05);
}

export type ContrastRole = "body" | "accent";

export type ContrastPair = {
  id: string;
  fg: string;
  bg: string;
  role: ContrastRole;
  ratio: number;
  /** AA for body (4.5) or large/accent (3.0) */
  passAA: boolean;
  passAAA: boolean;
};

export function auditThemeContrast(theme: {
  ink: string;
  ink2: string;
  paper: string;
  paper2: string;
  onDeep: string;
  onDeep2: string;
  deep: string;
  candle: string;
  sea: string;
}): ContrastPair[] {
  const pairs: { id: string; fg: string; bg: string; role: ContrastRole }[] = [
    { id: "ink on paper", fg: theme.ink, bg: theme.paper, role: "body" },
    { id: "ink-2 on paper", fg: theme.ink2, bg: theme.paper, role: "body" },
    { id: "ink on paper-2", fg: theme.ink, bg: theme.paper2, role: "body" },
    { id: "on-deep on deep", fg: theme.onDeep, bg: theme.deep, role: "body" },
    { id: "on-deep-2 on deep", fg: theme.onDeep2, bg: theme.deep, role: "body" },
    { id: "sea on paper", fg: theme.sea, bg: theme.paper, role: "body" },
    // candle is used for meta/eyebrow on paper — audit as normal text (4.5:1)
    { id: "candle on paper", fg: theme.candle, bg: theme.paper, role: "body" },
    { id: "candle on paper-2", fg: theme.candle, bg: theme.paper2, role: "body" },
    { id: "candle on deep", fg: theme.candle, bg: theme.deep, role: "accent" },
  ];

  return pairs.map((p) => {
    const ratio = contrastRatio(parseHex(p.fg), parseHex(p.bg));
    const aa = p.role === "accent" ? 3 : 4.5;
    const aaa = p.role === "accent" ? 4.5 : 7;
    return {
      ...p,
      ratio,
      passAA: ratio >= aa,
      passAAA: ratio >= aaa,
    };
  });
}

export function contrastFromCssVars(): ContrastPair[] | null {
  if (typeof window === "undefined") return null;
  const s = getComputedStyle(document.documentElement);
  const get = (n: string, fb: string) => s.getPropertyValue(n).trim() || fb;
  return auditThemeContrast({
    ink: get("--ink", "#15171a"),
    ink2: get("--ink-2", "#3a3d42"),
    paper: get("--paper", "#f2eee6"),
    paper2: get("--paper-2", "#e8e2d5"),
    onDeep: get("--on-deep", "#f2eee6"),
    onDeep2: get("--on-deep-2", "#b8cdd8"),
    deep: get("--deep", "#0c1822"),
    candle: get("--candle", "#95551f"),
    sea: get("--sea", "#2c4a5c"),
  });
}

export { parseHex, parseRgbTriplet };
