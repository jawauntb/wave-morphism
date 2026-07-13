"use client";

import Link from "next/link";
import { DocsShell, PageHeader } from "@/components/layout/Chrome";
import { MorphShell, WaveRule } from "@/components/ui/WaveMorph";
import { UndertowScroll } from "@/components/ui/UndertowScroll";
import { WaveButton } from "@/components/ui/WaveButton";
import { useWake } from "@/lib/wake";

const CHAPTERS = [
  {
    id: "surface",
    title: "surface",
    body: "Reading begins at the meniscus. Titles float; bodies wait below. Undertow is the long-scroll pattern — depth rail instead of dual scrollbars.",
  },
  {
    id: "thermocline",
    title: "thermocline",
    body: "Pressure shifts sections as you dive. Each chapter anchors a marker on the rail. Prefer this for docs, journals, and chaptered product copy.",
  },
  {
    id: "abyss",
    title: "abyss",
    body: "At depth the wash cools. Native overflow chrome stays hidden (.undertow-scroll). Keyboard focus stays on the region; Escape is for drawers, not scroll.",
  },
  {
    id: "return",
    title: "return",
    body: "Surfacing is just scrolling up. No sticky dual rails. One job: feel depth while reading.",
  },
];

/**
 * Undertow recipe — the long-scroll pattern as product UI.
 */
export default function UndertowRecipePage() {
  const { announce, Wake } = useWake();

  return (
    <DocsShell>
      <PageHeader
        eyebrow="recipe"
        title="undertow"
        dek="Long scroll as diving — depth rail, pressure-shifted sections, no dual scrollbars. The thesis pattern for chaptered reading."
      />

      <MorphShell quiet density="quiet" className="mb-8">
        <p className="t-eyebrow text-candle">policy</p>
        <p className="mt-2 max-w-2xl text-ink-2">
          Use UndertowScroll for any long, chaptered surface. Hide native scrollbars.
          Keep one depth rail. Do not nest a second overflow with visible chrome.
        </p>
        <WaveRule className="my-5" amp={3} freq={4} />
        <UndertowScroll sections={CHAPTERS} height={420} />
        <div className="mt-6 flex flex-wrap gap-3">
          <WaveButton
            density="quiet"
            register="oceanic"
            onClick={() => announce("ripple", "depth held on the tape.", 0.45)}
          >
            pulse depth
          </WaveButton>
          <WaveButton href="/docs/components/undertow-scroll" density="quiet">
            component docs
          </WaveButton>
        </div>
      </MorphShell>

      <p className="t-meta text-ink-2">
        <Link href="/docs/settings" className="text-candle hover:underline">
          settings
        </Link>{" "}
        ·{" "}
        <Link href="/docs/auth" className="text-candle hover:underline">
          auth
        </Link>{" "}
        ·{" "}
        <Link href="/docs/list-detail" className="text-candle hover:underline">
          list + detail
        </Link>
      </p>

      <Wake />
    </DocsShell>
  );
}
