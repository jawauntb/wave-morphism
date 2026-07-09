import { DocsShell, PageHeader } from "@/components/layout/Chrome";
import { axioms, learnings, registers } from "@/data/philosophy";
import { traditionalMap } from "@/data/components";

export const metadata = { title: "Philosophy" };

export default function PhilosophyPage() {
  return (
    <DocsShell>
      <PageHeader
        eyebrow="foundations"
        title="philosophy"
        dek="Wave-morphism is not a skin. It is an interaction grammar distilled from a full instrument site — sea, compass, tide, storm, pulse, pretext, and more."
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

        <h2>registers</h2>
        <div className="not-prose my-6 grid gap-3 sm:grid-cols-3">
          {registers.map((r) => (
            <div key={r.name} className="border border-rule p-4">
              <p className="t-eyebrow text-candle">{r.name}</p>
              <p className="mt-2 font-mono text-sm text-ink-2">
                {r.examples.join(" · ")}
              </p>
            </div>
          ))}
        </div>

        <h2>axioms</h2>
      </div>

      <div className="mt-6 space-y-6">
        {axioms.map((a, i) => (
          <article key={a.id} className="border-t border-rule pt-5">
            <p className="t-eyebrow text-ink-2">{String(i + 1).padStart(2, "0")}</p>
            <h3 className="mt-1 font-serif text-2xl italic">{a.title}</h3>
            <p className="mt-2 max-w-2xl text-ink-2">{a.body}</p>
          </article>
        ))}
      </div>

      <div className="prose-docs mt-14">
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

      <div className="prose-docs mt-14">
        <h2>traditional → wave-morph</h2>
      </div>
      <div className="mt-4 overflow-hidden border border-rule">
        <table className="w-full text-left">
          <tbody>
            {traditionalMap.map((row) => (
              <tr key={row.from} className="border-b border-rule last:border-0">
                <td className="px-4 py-2.5 font-mono text-sm text-ink-2">{row.from}</td>
                <td className="px-4 py-2.5 font-serif italic">{row.to}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DocsShell>
  );
}
