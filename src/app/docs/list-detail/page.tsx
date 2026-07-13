"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DocsShell, PageHeader } from "@/components/layout/Chrome";
import { MorphShell, WaveRule } from "@/components/ui/WaveMorph";
import { WaveButton } from "@/components/ui/WaveButton";
import { PhaseChip } from "@/components/ui/PhaseChip";
import { DrawerWake } from "@/components/ui/Surfaces";
import { useWake } from "@/lib/wake";

type Row = {
  id: string;
  title: string;
  phase: string;
  note: string;
};

const ROWS: Row[] = [
  { id: "r1", title: "harbor sync", phase: "live", note: "nightly crest · 02:00" },
  { id: "r2", title: "kelp index", phase: "review", note: "awaiting still" },
  { id: "r3", title: "fog ledger", phase: "draft", note: "untitled basin" },
  { id: "r4", title: "undertow log", phase: "live", note: "depth 42m" },
  { id: "r5", title: "steam receipt", phase: "archive", note: "discharged" },
];

/**
 * List + detail recipe — glass-comparable density with WaveRule hairlines.
 */
export default function ListDetailRecipePage() {
  const { announce, pulse, Wake } = useWake();
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<string>("r1");
  const [drawer, setDrawer] = useState(false);

  const rows = useMemo(() => {
    if (filter === "all") return ROWS;
    return ROWS.filter((r) => r.phase === filter);
  }, [filter]);

  const active = ROWS.find((r) => r.id === selected) ?? ROWS[0];

  return (
    <DocsShell>
      <PageHeader
        eyebrow="recipe"
        title="list + detail"
        dek="Tables without spreadsheet chrome — PhaseChip filter, WaveRule rows, quiet MorphShell detail. Keep pulses the tape; copy rides steam."
      />

      <PhaseChip
        className="mb-8"
        options={["all", "draft", "review", "live", "archive"]}
        value={filter}
        onChange={(v) => {
          setFilter(String(v));
          pulse("phase", 0.35);
        }}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <MorphShell quiet density="quiet" pad={false}>
          <div className="px-5 py-4">
            <p className="t-eyebrow text-candle">basin</p>
            <h2 className="mt-1 font-serif text-2xl italic">sessions</h2>
          </div>
          <ul>
            {rows.map((row, i) => (
              <li key={row.id}>
                {i > 0 ? (
                  <WaveRule amp={2} freq={6} color="rgba(var(--sea-rgb), 0.2)" />
                ) : null}
                <button
                  type="button"
                  className={`flex w-full items-baseline justify-between gap-4 px-5 py-3.5 text-left transition-colors duration-wave ${
                    selected === row.id
                      ? "bg-candle/10 text-ink"
                      : "text-ink-2 hover:bg-sea/[0.06] hover:text-ink"
                  }`}
                  onClick={() => {
                    setSelected(row.id);
                    pulse("ghost", 0.15);
                  }}
                >
                  <span className="font-serif text-lg italic">{row.title}</span>
                  <span className="t-meta shrink-0 text-candle">{row.phase}</span>
                </button>
              </li>
            ))}
            {rows.length === 0 ? (
              <li className="px-5 py-10 text-center">
                <p className="font-serif italic text-ink-2">
                  empty tide · no sessions in this phase
                </p>
                <WaveButton
                  className="mt-4"
                  density="quiet"
                  onClick={() => {
                    setFilter("all");
                    announce("ripple", "showing all phases", 0.4);
                  }}
                >
                  show all
                </WaveButton>
              </li>
            ) : null}
          </ul>
        </MorphShell>

        <MorphShell quiet density="quiet">
          <p className="t-eyebrow text-sea">detail</p>
          <h2 className="mt-1 font-serif text-3xl italic">{active.title}</h2>
          <WaveRule className="my-4" amp={3} freq={4} />
          <dl className="space-y-3 t-meta">
            <div className="flex justify-between gap-4">
              <dt className="text-ink-2">phase</dt>
              <dd className="text-candle">{active.phase}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-2">note</dt>
              <dd className="text-ink">{active.note}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-2">id</dt>
              <dd className="font-mono text-xs text-ink-2">{active.id}</dd>
            </div>
          </dl>
          <div className="mt-8 flex flex-wrap gap-2">
            <WaveButton density="quiet" register="oceanic" onClick={() => setDrawer(true)}>
              open region
            </WaveButton>
            <WaveButton
              density="quiet"
              onClick={() => announce("keep", `kept · ${active.title}`, 0.5)}
            >
              keep
            </WaveButton>
          </div>
          <p className="mt-8 t-meta text-ink-2/70">
            <Link href="/docs/auth" className="text-candle hover:underline">
              auth
            </Link>{" "}
            ·{" "}
            <Link href="/docs/undertow" className="text-candle hover:underline">
              undertow
            </Link>{" "}
            ·{" "}
            <Link href="/docs/patterns" className="text-candle hover:underline">
              patterns
            </Link>
          </p>
        </MorphShell>
      </div>

      <DrawerWake open={drawer} onClose={() => setDrawer(false)} title={active.title}>
        <p className="font-serif italic text-ink-2">
          Overflow detail lives in a drawer wake — Escape or backdrop to dismiss. No
          modal card.
        </p>
        <p className="mt-4 t-meta text-ink-2">{active.note}</p>
        <WaveButton className="mt-6" density="quiet" onClick={() => setDrawer(false)}>
          close
        </WaveButton>
      </DrawerWake>

      <Wake />
    </DocsShell>
  );
}
