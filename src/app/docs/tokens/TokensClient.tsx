"use client";

import { useMemo, useState } from "react";
import { DocsShell, PageHeader } from "@/components/layout/Chrome";
import { MorphShell, WaveRule } from "@/components/ui/WaveMorph";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useTheme } from "@/lib/theme";
import { WaveButton } from "@/components/ui/WaveButton";
import { PhaseChip } from "@/components/ui/PhaseChip";
import { auditThemeContrast } from "@/lib/contrast";
import { SEMANTIC_BRIDGE } from "@/data/install";

const tokenRoles = [
  { name: "--paper", key: "paper" as const, role: "reading surface / islands" },
  { name: "--paper-2", key: "paper2" as const, role: "panels, nested wells" },
  { name: "--ink", key: "ink" as const, role: "primary text on paper" },
  { name: "--ink-2", key: "ink2" as const, role: "secondary text on paper" },
  { name: "--on-deep", key: "onDeep" as const, role: "primary text on deep wells" },
  { name: "--on-deep-2", key: "onDeep2" as const, role: "secondary text on deep wells" },
  { name: "--candle", key: "candle" as const, role: "warm accent / meta & eyebrow on paper" },
  { name: "--sea", key: "sea" as const, role: "cold accent / focus" },
  { name: "--crest", key: "crest" as const, role: "phosphor / foam highlight" },
  { name: "--deep", key: "deep" as const, role: "instrument wells" },
  { name: "--field", key: "field" as const, role: "ambient ground" },
];

export default function TokensClient() {
  const { theme } = useTheme();
  const [chip, setChip] = useState("sine");
  const audit = useMemo(() => auditThemeContrast(theme), [theme]);
  const fails = audit.filter((r) => !r.passAA);

  return (
    <DocsShell>
      <PageHeader
        eyebrow="foundations"
        title="themes & tokens"
        dek="Five water-scale color systems. Same grammar — paper, ink, candle, sea — retuned for beach, abyss, ice, marsh, and vapor. Toggle anytime; preference persists."
      />

      <ThemeToggle variant="full" />

      <WaveRule className="my-10" amp={5} freq={3.5} />

      <MorphShell quiet density="quiet" className="mb-10">
        <p className="t-eyebrow text-candle">contrast audit · {theme.name.toLowerCase()}</p>
        <p className="mt-2 mb-4 max-w-2xl text-ink-2">
          Body and candle-on-paper pairs need ≥4.5:1 (meta/eyebrow). Candle on deep is accent
          (≥3:1).{" "}
          {fails.length === 0 ? (
            <span className="text-sea">All pairs pass AA for their role.</span>
          ) : (
            <span style={{ color: "var(--closed)" }}>{fails.length} pair(s) below AA.</span>
          )}
        </p>
        <ul className="space-y-2">
          {audit.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--rule)] py-2 last:border-0"
            >
              <span className="t-meta text-ink">{row.id}</span>
              <span className="flex items-center gap-3">
                <span
                  className="inline-flex h-5 w-12 overflow-hidden"
                  aria-hidden
                  style={{
                    background: `linear-gradient(90deg, ${row.fg} 50%, ${row.bg} 50%)`,
                    boxShadow: "0 0 0 1px rgba(var(--ink-rgb), 0.15)",
                  }}
                />
                <code className="font-mono text-xs text-ink-2">
                  {row.ratio.toFixed(2)}:1
                </code>
                <span
                  className="t-eyebrow"
                  style={{ color: row.passAA ? "var(--sea)" : "var(--closed)" }}
                >
                  {row.passAA ? (row.role === "accent" ? "AA accent" : "AA") : "fail"}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </MorphShell>

      <div className="prose-docs mb-6">
        <h2>live tokens · {theme.name.toLowerCase()}</h2>
        <p>
          Values below update with the active theme. Components should consume{" "}
          <code>var(--token)</code> or <code>rgba(var(--token-rgb), a)</code> — never
          hard-coded tidewater hex.
        </p>
      </div>

      <div className="space-y-2">
        {tokenRoles.map((t, i) => {
          const value = theme[t.key];
          return (
            <div key={t.name}>
              {i > 0 ? (
                <WaveRule amp={3.5} freq={5} color="rgba(var(--sea-rgb), 0.2)" />
              ) : null}
              <div className="flex flex-wrap items-center gap-4 py-3">
                <span
                  className="h-10 w-10 shrink-0"
                  style={{
                    background: value,
                    clipPath:
                      "path('M 4 8 Q 20 0 36 8 Q 44 20 36 32 Q 20 40 4 32 Q -4 20 4 8 Z')",
                    borderRadius: "40% 60% 55% 45% / 45% 40% 60% 55%",
                    boxShadow: "0 0 0 1px rgba(var(--ink-rgb), 0.12)",
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-sm">{t.name}</p>
                  <p className="t-meta text-ink-2">{t.role}</p>
                </div>
                <code className="font-mono text-xs text-ink-2">{value}</code>
              </div>
            </div>
          );
        })}
      </div>

      <MorphShell quiet density="quiet" className="mt-10">
        <p className="t-eyebrow text-candle">semantic bridge</p>
        <p className="mt-2 mb-4 text-ink-2">
          shadcn-style aliases applied by{" "}
          <code className="font-mono text-sm">applyThemeVars</code> — migrate without
          renaming your brain.
        </p>
        <ul className="columns-2 gap-4 text-sm md:columns-3">
          {Object.entries(SEMANTIC_BRIDGE).map(([k, v]) => (
            <li key={k} className="mb-1 break-inside-avoid font-mono text-xs text-ink-2">
              --{k} → {v}
            </li>
          ))}
        </ul>
      </MorphShell>

      <MorphShell className="mt-10">
        <p className="t-eyebrow text-candle">instrument check</p>
        <p className="mt-2 mb-5 text-ink-2">
          Buttons and chips should retint with the theme — same registers, new water.
        </p>
        <div className="mb-5 flex flex-wrap gap-3">
          <WaveButton register="oceanic">oceanic</WaveButton>
          <WaveButton register="devotional" ritual density="expressive">
            ritual
          </WaveButton>
          <WaveButton>operational</WaveButton>
        </div>
        <PhaseChip
          options={["sine", "triangle", "square", "saw"]}
          value={chip}
          onChange={(v) => setChip(v as string)}
        />
      </MorphShell>

      <MorphShell className="mt-6">
        <p className="t-eyebrow text-candle">chrome grammar</p>
        <p className="mt-3 font-serif italic text-ink-2">
          MorphShell for panels · WaveRule for dividers · PropTide for props · wavy
          pill paths for buttons and chips · tide edges for drawers · ThemeToggle for
          the atlas of color
        </p>
      </MorphShell>
    </DocsShell>
  );
}
