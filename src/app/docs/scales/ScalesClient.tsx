"use client";

import Link from "next/link";
import { useState } from "react";
import { DocsShell, PageHeader } from "@/components/layout/Chrome";
import { ScaleField, type ScaleDemoId } from "@/components/canvas/ScaleField";
import { MorphShell, WaveRule } from "@/components/ui/WaveMorph";
import { PhaseChip } from "@/components/ui/PhaseChip";
import { waterScales, scaleBands, type WaterScale } from "@/data/scales";

const phaseColor: Record<string, string> = {
  liquid: "text-sea",
  solid: "text-[#5a7a9a]",
  vapor: "text-ink-2",
  mixed: "text-candle",
};

/** Known docs slugs for scale → component links */
const COMPONENT_SLUGS: Record<string, string> = {
  "RippleField (single)": "ripple-field",
  "RippleField multitouch": "ripple-field",
  "WaveButton crest": "wave-button",
  HoldDischarge: "hold-discharge",
  "CalmDecay (inverse)": "calm-decay",
  "CalmDecay (as freeze)": "calm-decay",
  CalmDecay: "calm-decay",
  MorphShell: "sea-surface",
  DrawerWake: "drawer-wake",
  "content-island": "sea-surface",
  ProgressWake: "progress-wake",
  Tape: "tape",
  "Tape (as rain on strip)": "tape",
  "Tape (winter palette)": "tape",
  "Tape pulse (as steam mark)": "tape",
  "SeaSurface (calm)": "sea-surface",
  SeaSurface: "sea-surface",
  AmbientField: "sea-surface",
  PhaseChip: "phase-chip",
  WaveEdge: "sea-surface",
  WaveRule: "swell-lfo",
  SwellLFO: "swell-lfo",
  RotaryDial: "rotary-dial",
  Oscilloscope: "oscilloscope",
  "StormSurface (calm end)": "storm-surface",
  StormSurface: "storm-surface",
  WindRose: "wind-rose",
  DropletMark: "droplet-mark",
  RainField: "rain-field",
  PourSustain: "pour-sustain",
  PoolWell: "pool-well",
  EddyMenu: "eddy-menu",
  LakeBasin: "lake-basin",
  TideLine: "tide-line",
  CrestMeter: "crest-meter",
  FetchHorizon: "fetch-horizon",
  CloudVeil: "cloud-veil",
  SnowSettle: "snow-settle",
  IceLattice: "ice-lattice",
  SteamPlume: "steam-plume",
  SquallWarning: "squall-warning",
};

function ScaleCard({ scale, active, onSelect }: { scale: WaterScale; active: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left transition-transform duration-wave ${
        active ? "-translate-y-0.5" : "opacity-85 hover:opacity-100"
      }`}
    >
      <MorphShell className="h-full" pad={false}>
        <div className="p-4">
          <div className="flex items-baseline justify-between gap-2">
            <p className="t-eyebrow text-ink-2">{scale.order.toFixed(2)}</p>
            <p className={`t-eyebrow ${phaseColor[scale.phase]}`}>{scale.phase}</p>
          </div>
          <h3 className="mt-1 font-serif text-xl italic">{scale.name}</h3>
          <p className="mt-1 text-sm text-ink-2">{scale.epithet}</p>
        </div>
      </MorphShell>
    </button>
  );
}

export default function ScalesClient() {
  const [active, setActive] = useState<ScaleDemoId>("droplet");
  const [band, setBand] = useState("all");
  const current = waterScales.find((s) => s.id === active) ?? waterScales[0];

  const visible =
    band === "all"
      ? waterScales
      : waterScales.filter((s) => {
          const b = scaleBands.find((bandRow) => bandRow.id === band);
          return b ? (b.ids as readonly string[]).includes(s.id) : true;
        });

  return (
    <DocsShell>
      <PageHeader
        eyebrow="foundations"
        title="water scales"
        dek="Wave-morphism is not only ocean. Design for water at every scale and phase — bead to storm, liquid to ice to vapor."
      />

      <div className="prose-docs mb-8">
        <p>
          A button can be a <em>droplet</em>. A delete can be a <em>waterfall</em>. A
          dashboard can be a <em>lake</em>. A lock can be <em>ice</em>. Feedback can be{" "}
          <em>steam</em>. Weather is a register, not a skin.
        </p>
      </div>

      <PhaseChip
        options={["all", "micro", "meso", "macro"]}
        value={band}
        onChange={(v) => setBand(typeof v === "string" ? v : v[0] ?? "all")}
      />

      <div className="mt-8 overflow-hidden rounded-sm">
        <ScaleField scale={active} height={280} />
      </div>

      <MorphShell className="mt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <p className={`t-eyebrow ${phaseColor[current.phase]}`}>
              {current.phase} · scale {current.order.toFixed(2)}
            </p>
            <h2 className="mt-1 font-serif text-3xl italic font-light">{current.name}</h2>
            <p className="mt-1 text-ink-2">{current.epithet}</p>
          </div>
          <p className="max-w-sm font-mono text-xs text-ink-2">
            amp {current.tokens.amp} · decay {current.tokens.decay}
          </p>
        </div>
        <WaveRule className="my-5" amp={4} freq={4} />
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="t-eyebrow text-candle">physics</p>
            <p className="mt-2 text-ink-2">{current.physics}</p>
            <p className="t-eyebrow text-candle mt-5">motion</p>
            <p className="mt-2 text-ink-2">{current.motion}</p>
          </div>
          <div>
            <p className="t-eyebrow text-candle">ui job</p>
            <p className="mt-2 text-ink-2">{current.uiJob}</p>
            <p className="t-eyebrow text-candle mt-5">replaces</p>
            <p className="mt-2 font-mono text-sm text-ink-2">
              {current.replaces.join(" · ")}
            </p>
          </div>
        </div>
        {(current.components.length > 0 || current.proposed.length > 0) && (
          <>
            <WaveRule className="my-5" amp={3.5} freq={5} />
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {current.components.map((c) => {
                const slug = COMPONENT_SLUGS[c];
                return slug ? (
                  <Link
                    key={c}
                    href={`/docs/components/${slug}`}
                    className="t-meta text-sea hover:text-candle"
                  >
                    {c}
                  </Link>
                ) : (
                  <span key={c} className="t-meta text-sea">
                    {c}
                  </span>
                );
              })}
              {current.proposed.map((p) => (
                <span key={p} className="t-meta text-ink-2/70">
                  {p} <em className="not-italic opacity-60">(proposed)</em>
                </span>
              ))}
            </div>
          </>
        )}
      </MorphShell>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((s) => (
            <ScaleCard
              key={s.id}
              scale={s}
              active={s.id === active}
              onSelect={() => setActive(s.id as ScaleDemoId)}
            />
          ))}
      </div>

      <WaveRule className="my-12" amp={6} freq={3} />

      <div className="prose-docs">
        <h2>bands</h2>
        <p>Three bands keep the atlas navigable without flattening the physics.</p>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {scaleBands.map((b) => (
          <MorphShell key={b.id}>
            <p className="t-eyebrow text-candle">{b.label}</p>
            <p className="mt-2 font-serif text-xl italic">{b.range}</p>
            <p className="mt-3 font-mono text-xs text-ink-2">
              {b.ids.join(" · ")}
            </p>
          </MorphShell>
        ))}
      </div>

      <div className="prose-docs mt-12">
        <h2>phase is a register</h2>
        <p>
          Liquid is the default grammar. Solid (ice, snow) means lock, hush, accumulate.
          Vapor (steam, clouds) means ephemeral feedback and soft occlusion. Mixed
          (storm) is peak intensity that must always be able to calm.
        </p>
      </div>
    </DocsShell>
  );
}
