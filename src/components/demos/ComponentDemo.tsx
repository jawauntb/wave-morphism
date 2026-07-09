"use client";

import { useState } from "react";
import { SeaSurface } from "@/components/canvas/SeaSurface";
import { WaterText } from "@/components/ui/WaterText";
import { WaveButton } from "@/components/ui/WaveButton";
import { PhaseChip } from "@/components/ui/PhaseChip";
import { RotaryDial } from "@/components/ui/RotaryDial";
import { ConcernPolygon, SigilMark } from "@/components/ui/ConcernPolygon";
import { WaveInput, HoldDischarge, CalmDecay } from "@/components/ui/WaveInput";
import {
  DrawerWake,
  Oscilloscope,
  ProgressWake,
} from "@/components/ui/Surfaces";
import { useTape } from "@/lib/tape";
import { TapeStrip } from "@/components/canvas/TapeStrip";
import { SwellInstrument } from "@/components/ui/WaveMorph";

const AXES = ["prayer", "body", "work", "memory", "future", "love", "friend", "risk"];

export function ComponentDemo({ slug }: { slug: string }) {
  const [chip, setChip] = useState("sine");
  const [amp, setAmp] = useState(0.6);
  const [freq, setFreq] = useState(0.35);
  const [values, setValues] = useState([0.7, 0.4, 0.55, 0.75, 0.3, 0.6, 0.5, 0.35]);
  const [drawer, setDrawer] = useState(false);
  const [progress, setProgress] = useState<number | null>(0.45);
  const [msg, setMsg] = useState("the room is quiet.");
  const [stress, setStress] = useState(0.4);
  const { pulse, pulses } = useTape();

  switch (slug) {
    case "ripple-field":
    case "sea-surface":
      return <SeaSurface height={260} label="pointer → ripple → decay" />;
    case "swell-lfo":
      return <SwellInstrument />;
    case "tape":
      return (
        <div className="space-y-4 p-6">
          <div className="flex flex-wrap gap-2">
            {["keep", "ripple", "phase", "calm"].map((k) => (
              <WaveButton key={k} onClick={() => pulse(k, 0.6)}>
                pulse {k}
              </WaveButton>
            ))}
          </div>
          <p className="t-meta text-ink-2">{pulses.length} pulses in buffer</p>
          <TapeStrip height={56} />
        </div>
      );
    case "water-text":
      return (
        <div className="p-10">
          <WaterText as="p" className="t-display" radius={150}>
            move across these words
          </WaterText>
        </div>
      );
    case "wave-button":
      return (
        <div className="flex flex-wrap items-center justify-center gap-5 py-10">
          <WaveButton register="oceanic">oceanic</WaveButton>
          <WaveButton register="devotional" ritual>
            ritual
          </WaveButton>
          <WaveButton>operational</WaveButton>
        </div>
      );
    case "phase-chip":
      return (
        <div className="px-4 py-8 md:px-8">
          <PhaseChip
            options={["sine", "triangle", "square", "saw"]}
            value={chip}
            onChange={(v) => setChip(v as string)}
          />
        </div>
      );
    case "rotary-dial":
      return (
        <div className="flex justify-center p-8">
          <RotaryDial
            value={amp}
            onChange={setAmp}
            secondary={freq}
            onSecondaryChange={setFreq}
            rings={2}
            label="helm"
          />
        </div>
      );
    case "concern-polygon":
      return (
        <div className="flex justify-center p-6">
          <ConcernPolygon axes={AXES} values={values} onChange={setValues} />
        </div>
      );
    case "sigil-mark":
      return (
        <div className="flex flex-col items-center gap-3 p-10">
          <SigilMark values={values} size={96} playable />
          <p className="t-meta text-ink-2">playable sigil</p>
        </div>
      );
    case "wave-input":
      return (
        <div className="space-y-4 p-8">
          <WaveInput mode="ask" onSubmit={(v) => setMsg(`heard: ${v}`)} />
          <p className="font-serif italic text-ink-2">{msg}</p>
        </div>
      );
    case "hold-discharge":
      return (
        <div className="flex flex-col items-center gap-4 p-10">
          <HoldDischarge onDischarge={() => setMsg("discharged.")}>
            hold for lightning
          </HoldDischarge>
          <p className="t-meta text-ink-2">{msg}</p>
        </div>
      );
    case "calm-decay":
      return (
        <div className="flex flex-col items-center gap-4 p-10">
          <CalmDecay onCalm={() => setMsg("still.")}>still the sea</CalmDecay>
          <p className="t-meta text-ink-2">{msg}</p>
        </div>
      );
    case "drawer-wake":
      return (
        <div className="p-8">
          <WaveButton register="oceanic" onClick={() => setDrawer(true)}>
            open drawer
          </WaveButton>
          <DrawerWake open={drawer} onClose={() => setDrawer(false)} title="region">
            <p className="font-serif italic text-ink-2">
              a tide-entry panel. escape to dismiss. content can shape-wrap a sigil.
            </p>
            <SigilMark values={values} size={72} className="mt-6" />
          </DrawerWake>
        </div>
      );
    case "oscilloscope":
      return (
        <div className="space-y-3 p-6">
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={stress}
            onChange={(e) => setStress(Number(e.target.value))}
            className="w-full accent-candle"
          />
          <Oscilloscope stress={stress} height={180} />
        </div>
      );
    case "progress-wake":
      return (
        <div className="space-y-4 p-8">
          <div className="flex flex-wrap gap-2">
            <WaveButton onClick={() => setProgress(null)}>pending</WaveButton>
            <WaveButton onClick={() => setProgress(0.33)}>33%</WaveButton>
            <WaveButton onClick={() => setProgress(1)}>done</WaveButton>
          </div>
          <ProgressWake value={progress} variant="ekg" />
          <ProgressWake value={progress} variant="fill" />
        </div>
      );
    default:
      return <div className="p-8 t-meta text-ink-2">demo for {slug}</div>;
  }
}
