import { DocsShell, PageHeader } from "@/components/layout/Chrome";

export const metadata = { title: "Tokens" };

const tokens = [
  { name: "--paper", value: "#F2EEE6", role: "page background — warm vellum" },
  { name: "--paper-2", value: "#E8E2D5", role: "panels, demo stages" },
  { name: "--ink", value: "#15171A", role: "primary text" },
  { name: "--ink-2", value: "#3A3D42", role: "secondary text" },
  { name: "--rule", value: "rgba(21,23,26,0.18)", role: "hairlines" },
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
        dek="Tidewater vellum. Two accents only — candle and sea. No purple gradients, no glow-on-text, no drop shadows on UI."
      />
      <div className="space-y-3">
        {tokens.map((t) => (
          <div
            key={t.name}
            className="flex flex-wrap items-center gap-4 border border-rule px-4 py-3"
          >
            <span
              className="h-10 w-10 shrink-0 border border-rule"
              style={{
                background: t.value.startsWith("#") ? t.value : "var(--paper-2)",
              }}
            />
            <div className="min-w-0 flex-1">
              <p className="font-mono text-sm">{t.name}</p>
              <p className="t-meta text-ink-2">{t.role}</p>
            </div>
            <code className="font-mono text-xs text-ink-2">{t.value}</code>
          </div>
        ))}
      </div>
    </DocsShell>
  );
}
