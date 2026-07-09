import { DocsShell, PageHeader } from "@/components/layout/Chrome";
import { WaterText } from "@/components/ui/WaterText";
import { MorphShell } from "@/components/ui/WaveMorph";

export const metadata = { title: "Typography" };

export default function TypographyPage() {
  return (
    <DocsShell>
      <PageHeader
        eyebrow="foundations"
        title="typography"
        dek="Serif for meaning, mono for operation. Type moves — breath, cursor repulsion, phase offset across a line."
      />

      <div className="space-y-6">
        <MorphShell>
          <p className="mb-3 t-eyebrow text-ink-2">t-display · water text</p>
          <WaterText as="p" className="t-display" radius={140}>
            a candle facing the sea
          </WaterText>
        </MorphShell>
        <MorphShell>
          <p className="mb-3 t-eyebrow text-ink-2">t-h2</p>
          <p className="t-h2">calibrate concern · route the atlas</p>
        </MorphShell>
        <MorphShell>
          <p className="mb-3 t-eyebrow text-ink-2">t-body</p>
          <p className="t-body max-w-xl text-ink-2">
            Words displace from the cursor with quadratic falloff and lerp home. Static
            type is a missed modality.
          </p>
        </MorphShell>
        <MorphShell>
          <p className="mb-3 t-eyebrow text-ink-2">t-meta / t-eyebrow</p>
          <p className="t-meta">handle the objects · wake the sea · keep this reading</p>
        </MorphShell>
      </div>

      <div className="prose-docs mt-12">
        <h2>rules</h2>
        <ul>
          <li>Lowercase headlines, or display serif italic — never Title Case marketing.</li>
          <li>No sans-serif. The serif/mono tension is the brand.</li>
          <li>Respect <code>prefers-reduced-motion</code> — freeze breath, keep meaning.</li>
        </ul>
      </div>
    </DocsShell>
  );
}
