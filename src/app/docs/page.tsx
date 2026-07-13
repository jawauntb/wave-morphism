import Link from "next/link";
import { DocsShell, PageHeader } from "@/components/layout/Chrome";
import { MorphShell } from "@/components/ui/WaveMorph";
import { getCoreComponents } from "@/data/components";

export default function DocsIndex() {
  const twelve = getCoreComponents();

  return (
    <DocsShell>
      <PageHeader
        eyebrow="docs"
        title="start here"
        dek="Install the twelve. Steal Harbor. Read proof if you need receipts. Lab stays in the attic."
      />
      <MorphShell quiet density="quiet">
        <ol className="space-y-4 t-body text-ink-2">
          <li>
            <Link href="/docs/installation" className="text-candle hover:underline">
              1. Install
            </Link>{" "}
            — eight files or <code className="font-mono text-sm">npm run wave -- core</code>
          </li>
          <li>
            <Link href="/harbor" className="text-candle hover:underline">
              2. Harbor
            </Link>{" "}
            — reference product from the twelve only
          </li>
          <li>
            <Link href="/docs/proof" className="text-candle hover:underline">
              3. Proof
            </Link>{" "}
            — glass vs wave scoreboard
          </li>
          <li>
            <Link href="/docs/patterns" className="text-candle hover:underline">
              4. Patterns
            </Link>{" "}
            — three verbs · one of each
          </li>
        </ol>
        <p className="mt-8 t-meta text-ink-2">
          Twelve:{" "}
          {twelve.map((c, i) => (
            <span key={c.slug}>
              {i > 0 ? " · " : null}
              <Link href={`/docs/components/${c.slug}`} className="text-sea hover:text-candle">
                {c.name}
              </Link>
            </span>
          ))}
        </p>
      </MorphShell>
    </DocsShell>
  );
}
