import Link from "next/link";
import { DocsShell, PageHeader } from "@/components/layout/Chrome";
import { MorphShell, WaveRule } from "@/components/ui/WaveMorph";
import { getLabComponents } from "@/data/components";

export const metadata = { title: "Lab attic" };

/**
 * Lab attic — instruments off the critical path.
 * Public kit is twelve. Everything here is research.
 */
export default function LabAtticPage() {
  const lab = getLabComponents();

  return (
    <DocsShell>
      <PageHeader
        eyebrow="attic"
        title="lab"
        dek="Research instruments. Beautiful, optional, never on the critical path. Ship the twelve first."
      />

      <MorphShell quiet density="quiet" className="mb-8">
        <p className="t-eyebrow text-candle">policy</p>
        <p className="mt-2 max-w-2xl text-ink-2">
          If a product screen needs something from this list, promote it to the twelve
          with a real job — or keep building with WaveButton, PhaseChip, SwellRail, and
          MorphShell quiet.
        </p>
        <WaveRule className="my-4" amp={3} freq={4} />
        <p className="t-meta text-ink-2">
          {lab.length} instruments ·{" "}
          <Link href="/docs/playground" className="text-candle hover:underline">
            playground
          </Link>{" "}
          ·{" "}
          <Link href="/harbor" className="text-candle hover:underline">
            Harbor
          </Link>
        </p>
      </MorphShell>

      <ul className="columns-1 gap-x-8 sm:columns-2 lg:columns-3">
        {lab.map((c) => (
          <li key={c.slug} className="mb-3 break-inside-avoid">
            <Link
              href={`/docs/components/${c.slug}`}
              className="t-meta text-sea hover:text-candle"
            >
              {c.name}
            </Link>
            <span className="ml-2 text-xs text-ink-2/60">{c.traditional}</span>
          </li>
        ))}
      </ul>
    </DocsShell>
  );
}
