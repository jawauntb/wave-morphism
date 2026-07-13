"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MorphShell, WaveRule } from "@/components/ui/WaveMorph";
import { WaveButton } from "@/components/ui/WaveButton";
import { PhaseChip } from "@/components/ui/PhaseChip";
import { WaveInput, HoldDischarge, CalmDecay } from "@/components/ui/WaveInput";
import { DrawerWake } from "@/components/ui/Surfaces";
import { CausticFocusRoot } from "@/components/ui/CausticFocus";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { AtmosphereToggle } from "@/components/ui/AtmosphereToggle";
import { WaterText } from "@/components/ui/WaterText";
import { useWake } from "@/lib/wake";

type Note = {
  id: string;
  title: string;
  body: string;
  phase: string;
};

const SEED: Note[] = [
  {
    id: "n1",
    title: "harbor brief",
    body: "Ship the twelve. Leave the museum in the attic. If a stranger can build a screen in twenty minutes, we win.",
    phase: "live",
  },
  {
    id: "n2",
    title: "idle amp",
    body: "If it moves at rest, it's wrong. Press, change, commit — three verbs only.",
    phase: "review",
  },
  {
    id: "n3",
    title: "empty tide",
    body: "Draft notes wait here. Compose one line the room remembers.",
    phase: "draft",
  },
];

/**
 * Harbor — the reference product.
 * Built only from the twelve. No playground chrome. Blind-test against glass.
 */
export default function HarborPage() {
  const { announce, pulse, Wake } = useWake();
  const [notes, setNotes] = useState(SEED);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState("n1");
  const [drawer, setDrawer] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");

  const rows = useMemo(() => {
    if (filter === "all") return notes;
    return notes.filter((n) => n.phase === filter);
  }, [filter, notes]);

  const active = notes.find((n) => n.id === selected) ?? notes[0];

  const compose = (line: string) => {
    const id = `n${Date.now()}`;
    const next: Note = {
      id,
      title: draftTitle.trim() || line.slice(0, 28) || "untitled",
      body: line,
      phase: "draft",
    };
    setNotes((prev) => [next, ...prev]);
    setSelected(id);
    setDraftTitle("");
    announce("keep", `kept · ${next.title}`, 0.7);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] pb-28">
      <div className="mx-auto max-w-site px-pad-x pt-10 md:pt-14">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="t-eyebrow text-candle">reference app</p>
            <WaterText as="h1" className="t-display mt-2" radius={140} strength={10}>
              harbor
            </WaterText>
            <p className="mt-4 max-w-md t-body text-ink-2">
              Notes from the twelve — no lab, no demos. Calm at rest. Alive on press,
              change, commit.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ThemeToggle />
            <AtmosphereToggle />
            <Link href="/docs/proof" className="t-meta text-sea hover:text-candle">
              proof →
            </Link>
          </div>
        </div>

        <PhaseChip
          className="mb-8"
          options={["all", "draft", "review", "live"]}
          value={filter}
          onChange={(v) => {
            setFilter(String(v));
            pulse("phase", 0.35);
          }}
        />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          <MorphShell quiet density="quiet" pad={false}>
            <div className="px-5 py-4">
              <p className="t-eyebrow text-candle">notes</p>
              <h2 className="mt-1 font-serif text-2xl italic">basin</h2>
            </div>
            {rows.length === 0 ? (
              <div className="px-5 py-14 text-center">
                <p className="font-serif text-xl italic text-ink-2">empty tide</p>
                <p className="mt-2 t-meta text-ink-2/70">
                  no notes in this phase · compose below or show all
                </p>
                <WaveButton
                  className="mt-6"
                  density="quiet"
                  onClick={() => {
                    setFilter("all");
                    announce("ripple", "showing all phases", 0.35);
                  }}
                >
                  show all
                </WaveButton>
              </div>
            ) : (
              <ul>
                {rows.map((row, i) => (
                  <li key={row.id}>
                    {i > 0 ? (
                      <WaveRule amp={2} freq={6} color="rgba(var(--sea-rgb), 0.18)" />
                    ) : null}
                    <button
                      type="button"
                      className={`flex w-full items-baseline justify-between gap-4 px-5 py-3.5 text-left transition-colors duration-wave ${
                        selected === row.id
                          ? "bg-candle/10 text-ink"
                          : "text-ink-2 hover:bg-sea/[0.05] hover:text-ink"
                      }`}
                      onClick={() => {
                        setSelected(row.id);
                        pulse("ghost", 0.12);
                      }}
                    >
                      <span className="font-serif text-lg italic">{row.title}</span>
                      <span className="t-meta shrink-0 text-candle">{row.phase}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </MorphShell>

          <CausticFocusRoot contained>
            <MorphShell quiet density="quiet">
              <p className="t-eyebrow text-sea">detail</p>
              <h2 className="mt-1 font-serif text-3xl italic">{active?.title ?? "—"}</h2>
              <WaveRule className="my-4" amp={3} freq={4} />
              <p className="max-w-prose font-serif text-lg leading-relaxed text-ink-2">
                {active?.body}
              </p>

              <div className="mt-8 space-y-4">
                <label className="block">
                  <span className="t-eyebrow text-ink-2">title</span>
                  <input
                    className="tide-field caustic-field mt-1 w-full px-1 py-2 font-serif text-lg italic text-ink"
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    placeholder="optional title for next note"
                  />
                </label>
                <WaveInput
                  mode="compose"
                  placeholder="compose · one line the room remembers"
                  onSubmit={compose}
                />
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <WaveButton
                  density="quiet"
                  register="oceanic"
                  onClick={() => {
                    if (!active) return;
                    setNotes((prev) =>
                      prev.map((n) =>
                        n.id === active.id ? { ...n, phase: "live" } : n
                      )
                    );
                    announce("keep", `live · ${active.title}`, 0.65);
                  }}
                >
                  publish
                </WaveButton>
                <WaveButton density="quiet" onClick={() => setDrawer(true)}>
                  open region
                </WaveButton>
                <CalmDecay
                  onCalm={() => {
                    setFilter("all");
                    announce("calm", "filters stilled.", 0.45);
                  }}
                >
                  still filters
                </CalmDecay>
                <HoldDischarge
                  onDischarge={() => {
                    if (!active) return;
                    setNotes((prev) => prev.filter((n) => n.id !== active.id));
                    setSelected(notes.find((n) => n.id !== active.id)?.id ?? "");
                    announce("discharge", `sunk · ${active.title}`, 0.85);
                  }}
                >
                  hold to sink
                </HoldDischarge>
              </div>
            </MorphShell>
          </CausticFocusRoot>
        </div>

        <p className="mt-10 t-meta text-ink-2/70">
          Built from the twelve only ·{" "}
          <Link href="/docs/installation" className="text-candle hover:underline">
            install
          </Link>{" "}
          ·{" "}
          <Link href="/docs/proof" className="text-candle hover:underline">
            glass vs wave
          </Link>
        </p>
      </div>

      <DrawerWake open={drawer} onClose={() => setDrawer(false)} title={active?.title}>
        <p className="font-serif italic text-ink-2">{active?.body}</p>
        <WaveButton className="mt-6" density="quiet" onClick={() => setDrawer(false)}>
          close
        </WaveButton>
      </DrawerWake>

      <Wake />
    </div>
  );
}
