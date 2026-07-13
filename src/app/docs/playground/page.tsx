"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { DocsShell, PageHeader } from "@/components/layout/Chrome";
import {
  components,
  getCoreComponents,
  type ComponentDoc,
} from "@/data/components";
import { ComponentDemo } from "@/components/demos/ComponentDemo";
import { MorphShell, WaveRule } from "@/components/ui/WaveMorph";
import { PhaseChip } from "@/components/ui/PhaseChip";
import { WaveButton } from "@/components/ui/WaveButton";

const TIER_OPTIONS = ["core kit", "lab", "all"] as const;
const CATEGORIES: { id: ComponentDoc["category"] | "all"; label: string }[] = [
  { id: "all", label: "all kinds" },
  { id: "foundation", label: "foundations" },
  { id: "primitive", label: "primitives" },
  { id: "control", label: "controls" },
  { id: "surface", label: "surfaces" },
  { id: "ritual", label: "ritual" },
  { id: "chrome", label: "chrome" },
];

const DARK_SLUGS = new Set([
  "swell-lfo",
  "oscilloscope",
  "sea-surface",
  "ripple-field",
  "storm-surface",
  "plasma-orb",
  "interference-field",
  "wave-particle-morph",
  "audio-scope",
  "wind-rose",
  "progress-wake",
  "basin-caustic",
]);

/** Mount when near viewport; unmount when far — caps simultaneous WebGL. */
function VisibleDemo({
  children,
  minHeight = 220,
}: {
  children: ReactNode;
  minHeight?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
      },
      { rootMargin: "80px 0px", threshold: 0.01 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ minHeight }}>
      {visible ? (
        children
      ) : (
        <div className="flex h-full min-h-[12rem] items-center justify-center t-meta text-ink-2/50">
          approaching…
        </div>
      )}
    </div>
  );
}

export default function PlaygroundPage() {
  const [tier, setTier] = useState<"core" | "lab" | "all">("core");
  const [filter, setFilter] = useState<ComponentDoc["category"] | "all">("all");
  const [query, setQuery] = useState("");

  const filtered = components.filter((c) => {
    if (tier !== "all" && c.tier !== tier) return false;
    if (filter !== "all" && c.category !== filter) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.slug.includes(q) ||
      c.traditional.toLowerCase().includes(q) ||
      c.summary.toLowerCase().includes(q)
    );
  });

  const tierLabel =
    tier === "core" ? "core kit" : tier === "lab" ? "lab" : "all";
  const filterLabel = CATEGORIES.find((c) => c.id === filter)?.label ?? "all kinds";
  const coreCount = getCoreComponents().length;

  return (
    <DocsShell>
      <PageHeader
        eyebrow="attic"
        title="playground"
        dek={`${coreCount} public surfaces · the rest is lab. Default to the twelve. Demos unmount off-screen.`}
      />

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <PhaseChip
          options={[...TIER_OPTIONS]}
          value={tierLabel}
          onChange={(label) => {
            const v = String(label);
            setTier(v === "core kit" ? "core" : v === "lab" ? "lab" : "all");
          }}
        />
        <p className="t-meta text-ink-2">
          {filtered.length} shown · {components.length} catalogued
        </p>
      </div>

      <div className="mb-8">
        <PhaseChip
          options={CATEGORIES.map((c) => c.label)}
          value={filterLabel}
          onChange={(label) => {
            const next = CATEGORIES.find((c) => c.label === String(label));
            setFilter(next?.id ?? "all");
          }}
        />
      </div>

      <MorphShell className="mb-10" pad={false} quiet>
        <div className="px-5 py-4">
          <label className="t-eyebrow text-ink-2">search</label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="name, slug, or what it replaces…"
            className="tide-field mt-2 w-full bg-transparent font-serif text-xl italic text-ink outline-none placeholder:text-ink-2/40"
          />
          <WaveRule className="mt-3" amp={3} freq={5} />
        </div>
      </MorphShell>

      <nav className="mb-10 flex flex-wrap gap-x-3 gap-y-2" aria-label="jump to component">
        {filtered.map((c) => (
          <a
            key={c.slug}
            href={`#demo-${c.slug}`}
            className="t-meta text-ink-2 transition-colors duration-wave hover:text-candle"
          >
            {c.name}
            {c.tier === "lab" ? (
              <span className="ml-1 text-ink-2/40">·lab</span>
            ) : null}
          </a>
        ))}
      </nav>

      <div className="space-y-12">
        {filtered.map((c) => (
          <section key={c.slug} id={`demo-${c.slug}`} className="scroll-mt-28">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <p className="t-eyebrow text-candle">
                  {c.tier} · {c.category}
                </p>
                <h2 className="font-serif text-2xl italic text-ink">{c.name}</h2>
                <p className="mt-1 max-w-2xl text-sm text-ink-2">{c.summary}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="t-meta text-ink-2/70">replaces {c.traditional}</span>
                <WaveButton
                  href={`/docs/components/${c.slug}`}
                  className="!min-h-[2.5rem] !min-w-0 !px-4 !py-2"
                >
                  docs →
                </WaveButton>
              </div>
            </div>
            <MorphShell
              pad={false}
              dark={DARK_SLUGS.has(c.slug)}
              quiet
              className="overflow-hidden"
            >
              <VisibleDemo minHeight={240}>
                <ComponentDemo slug={c.slug} />
              </VisibleDemo>
            </MorphShell>
          </section>
        ))}
      </div>

      {filtered.length === 0 ? (
        <MorphShell className="mt-8" quiet>
          <p className="font-serif italic text-ink-2">
            no surfaces match — clear the search or widen the phase.
          </p>
          <WaveButton
            className="mt-4"
            onClick={() => {
              setQuery("");
              setFilter("all");
              setTier("core");
            }}
          >
            reset to core kit
          </WaveButton>
        </MorphShell>
      ) : null}

      <WaveRule className="my-12" amp={5} freq={3} />
      <p className="t-meta text-ink-2">
        Ship the <strong className="font-normal text-candle">core kit</strong>. Lab
        instruments stay for research —{" "}
        <Link href="/docs/patterns" className="text-candle hover:underline">
          see patterns
        </Link>{" "}
        for when to use which.
      </p>
    </DocsShell>
  );
}
