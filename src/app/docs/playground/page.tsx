"use client";

import { useState } from "react";
import { DocsShell, PageHeader } from "@/components/layout/Chrome";
import { SeaSurface } from "@/components/canvas/SeaSurface";
import { WaterText } from "@/components/ui/WaterText";
import { WaveButton } from "@/components/ui/WaveButton";
import { PhaseChip } from "@/components/ui/PhaseChip";
import { RotaryDial } from "@/components/ui/RotaryDial";
import { ConcernPolygon, SigilMark } from "@/components/ui/ConcernPolygon";
import { WaveInput, HoldDischarge, CalmDecay } from "@/components/ui/WaveInput";
import { Oscilloscope, ProgressWake } from "@/components/ui/Surfaces";

const AXES = ["prayer", "body", "work", "memory", "future", "love", "friend", "risk"];

export default function PlaygroundPage() {
  const [mode, setMode] = useState("wave");
  const [amp, setAmp] = useState(0.55);
  const [freq, setFreq] = useState(0.4);
  const [values, setValues] = useState([0.65, 0.4, 0.5, 0.75, 0.35, 0.6, 0.45, 0.3]);
  const [stress, setStress] = useState(0.3);
  const [note, setNote] = useState("compose freely — everything hits the tape.");

  return (
    <DocsShell>
      <PageHeader
        eyebrow="lab"
        title="playground"
        dek="Compose RippleField energy, polygon state, and ritual controls in one room."
      />

      <SeaSurface height={220} className="mb-8" label="playground sea" />

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="demo-stage p-6 space-y-5">
          <WaterText as="h2" className="t-h2" radius={90}>
            controls
          </WaterText>
          <PhaseChip
            options={["wave", "storm", "calm", "signal"]}
            value={mode}
            onChange={(v) => setMode(v as string)}
          />
          <div className="flex justify-center">
            <RotaryDial
              value={amp}
              onChange={setAmp}
              secondary={freq}
              onSecondaryChange={setFreq}
              rings={2}
              label={mode}
            />
          </div>
          <WaveInput mode="compose" onSubmit={(v) => setNote(v)} />
          <p className="font-serif italic text-ink-2">{note}</p>
          <div className="flex flex-wrap gap-3">
            <HoldDischarge onDischarge={() => setStress(0.95)}>discharge</HoldDischarge>
            <CalmDecay onCalm={() => { setStress(0.1); setAmp(0.2); }}>
              still
            </CalmDecay>
            <WaveButton register="devotional" ritual onClick={() => setValues(AXES.map(() => 0.5))}>
              center polygon
            </WaveButton>
          </div>
        </div>

        <div className="demo-stage p-6 flex flex-col items-center">
          <ConcernPolygon axes={AXES} values={values} onChange={setValues} />
          <SigilMark values={values} size={64} playable className="mt-4" />
          <div className="mt-6 w-full">
            <label className="t-eyebrow text-ink-2">stress {Math.round(stress * 100)}</label>
            <input
              type="range"
              className="mt-2 w-full accent-sea"
              min={0}
              max={1}
              step={0.01}
              value={stress}
              onChange={(e) => setStress(Number(e.target.value))}
            />
            <Oscilloscope className="mt-4" stress={stress} />
            <ProgressWake className="mt-4" value={amp} variant="fill" />
          </div>
        </div>
      </div>
    </DocsShell>
  );
}
