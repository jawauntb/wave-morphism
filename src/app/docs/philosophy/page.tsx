import { DocsShell, PageHeader } from "@/components/layout/Chrome";
import { axioms, learnings, registers } from "@/data/philosophy";
import { traditionalMap } from "@/data/components";
import { MorphShell, WaveRule } from "@/components/ui/WaveMorph";

export const metadata = { title: "Philosophy" };

export default function PhilosophyPage() {
  return (
    <DocsShell>
      <PageHeader
        eyebrow="foundations"
        title="philosophy"
        dek="Wave-morphism is not a skin. It is an interaction grammar — and the chrome itself must undulate, not just the demos."
      />

      <div className="prose-docs">
        <h2>the thesis</h2>
        <p>
          The water is the template for all modalities. Touch should mean tone. Dwell
          should mean glow. State should be hearable, not described. Reading is the
          payoff; everything before it should be felt.
        </p>
        <p>
          A second constraint: three registers — <em>devotional</em>,{" "}
          <em>operational</em>, <em>oceanic</em> — held at once. A surface is on-brand
          when at least two are present and none dominates.
        </p>
        <p>
          The failure mode is a normal docs site with wave <em>concepts</em>. True
          wave-morphism means borders breathe, dividers are sine rules, props arrive as
          tides, and tables dissolve into wakes.
        </p>
        <p>
          And the water is not only ocean. See{" "}
          <a href="/docs/scales">water scales</a> — droplet through storm, including ice,
          steam, rain, and cloud — each with a UI job.
        </p>

        <h2>registers</h2>
      </div>
      <div className="my-6 grid gap-4 sm:grid-cols-3">
        {registers.map((r) => (
          <MorphShell key={r.name}>
            <p className="t-eyebrow text-candle">{r.name}</p>
            <p className="mt-2 font-mono text-sm text-ink-2">
              {r.examples.join(" · ")}
            </p>
          </MorphShell>
        ))}
      </div>

      <div className="prose-docs">
        <h2>axioms</h2>
      </div>

      <div className="mt-6 space-y-2">
        {axioms.map((a, i) => (
          <div key={a.id}>
            {i > 0 ? <WaveRule amp={4} freq={4} className="my-2" /> : null}
            <article className="py-4">
              <p className="t-eyebrow text-ink-2">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-1 font-serif text-2xl italic">{a.title}</h3>
              <p className="mt-2 max-w-2xl text-ink-2">{a.body}</p>
            </article>
          </div>
        ))}
      </div>

      <WaveRule className="my-10" amp={6} freq={3} />

      <div className="prose-docs">
        <h2>learnings from the field</h2>
      </div>
      <div className="mt-4 space-y-4">
        {learnings.map((l) => (
          <div key={l.source} className="border-l-2 border-sea/40 pl-4">
            <p className="t-meta text-sea">{l.source}</p>
            <p className="text-ink-2">{l.lesson}</p>
          </div>
        ))}
      </div>

      <WaveRule className="my-10" amp={5} freq={3.5} />

      <div className="prose-docs">
        <h2>traditional → wave-morph</h2>
      </div>
      <div className="mt-4">
        {traditionalMap.map((row) => (
          <div key={row.from}>
            <div className="tide-map-row">
              <span className="font-mono text-sm text-ink-2">{row.from}</span>
              <span className="font-serif italic">{row.to}</span>
            </div>
            <WaveRule amp={3.5} freq={5} color="rgba(44,74,92,0.22)" />
          </div>
        ))}
      </div>
    </DocsShell>
  );
}
