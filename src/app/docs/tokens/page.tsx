import { DocsShell, PageHeader } from "@/components/layout/Chrome";
import { MorphShell, WaveRule } from "@/components/ui/WaveMorph";

export const metadata = { title: "Tokens" };

const tokens = [
  { name: "--paper", value: "#F2EEE6", role: "page background — warm vellum" },
  { name: "--paper-2", value: "#E8E2D5", role: "panels, demo stages" },
  { name: "--ink", value: "#15171A", role: "primary text" },
  { name: "--ink-2", value: "#3A3D42", role: "secondary text" },
  { name: "--rule", value: "rgba(21,23,26,0.18)", role: "hairlines (prefer WaveRule)" },
  { name: "--candle", value: "#C8732A", role: "warm accent / active" },
  { name: "--sea", value: "#2C4A5C", role: "cold accent / focus" },
  { name: "--t", value: "320ms cubic-bezier(.2,.6,.2,1)", role: "motion" },
];

export default function TokensPage() {
  return (
    <DocsShell>
      <PageHeader
        eyebrow="foundations"
        title="tokens"
        dek="Tidewater vellum. Two accents only — candle and sea. Prefer WaveRule over --rule hairlines when the surface should feel alive."
      />
      <div className="space-y-2">
        {tokens.map((t, i) => (
          <div key={t.name}>
            {i > 0 ? <WaveRule amp={3.5} freq={5} color="rgba(44,74,92,0.2)" /> : null}
            <div className="flex flex-wrap items-center gap-4 py-3">
              <span
                className="h-10 w-10 shrink-0"
                style={{
                  background: t.value.startsWith("#") ? t.value : "var(--paper-2)",
                  clipPath:
                    "path('M 4 8 Q 20 0 36 8 Q 44 20 36 32 Q 20 40 4 32 Q -4 20 4 8 Z')",
                  borderRadius: "40% 60% 55% 45% / 45% 40% 60% 55%",
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="font-mono text-sm">{t.name}</p>
                <p className="t-meta text-ink-2">{t.role}</p>
              </div>
              <code className="font-mono text-xs text-ink-2">{t.value}</code>
            </div>
          </div>
        ))}
      </div>

      <MorphShell className="mt-10">
        <p className="t-eyebrow text-candle">chrome grammar</p>
        <p className="mt-3 font-serif italic text-ink-2">
          MorphShell for panels · WaveRule for dividers · PropTide for props · wavy
          pill paths for buttons and chips · tide edges for drawers
        </p>
      </MorphShell>
    </DocsShell>
  );
}
