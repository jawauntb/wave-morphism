"use client";

import { useState } from "react";
import { SeaSurface } from "@/components/canvas/SeaSurface";
import { RippleField } from "@/components/canvas/RippleField";
import { StormSurface } from "@/components/canvas/StormSurface";
import { PlasmaOrb } from "@/components/canvas/PlasmaOrb";
import { InterferenceField } from "@/components/canvas/InterferenceField";
import { WaveParticleMorph } from "@/components/canvas/WaveParticleMorph";
import { AudioScope } from "@/components/canvas/AudioScope";
import { WaterText } from "@/components/ui/WaterText";
import { WaveButton } from "@/components/ui/WaveButton";
import { SwellRail } from "@/components/ui/SwellRail";
import { PhaseChip } from "@/components/ui/PhaseChip";
import { RotaryDial } from "@/components/ui/RotaryDial";
import { WindRose } from "@/components/ui/WindRose";
import { ConcernPolygon, SigilMark } from "@/components/ui/ConcernPolygon";
import { WaveInput, HoldDischarge, CalmDecay } from "@/components/ui/WaveInput";
import {
  DrawerWake,
  Oscilloscope,
  ProgressWake,
} from "@/components/ui/Surfaces";
import {
  DropletMark,
  RainField,
  PourSustain,
  PoolWell,
  EddyMenu,
  LakeBasin,
  TideLine,
  CrestMeter,
  FetchHorizon,
  CloudVeil,
  SnowSettle,
  IceLattice,
  SteamPlume,
  SquallWarning,
} from "@/components/ui/ScalePrimitives";
import {
  TideCalendar,
  ResonanceMatch,
  UndertowScroll,
  CausticFocusDemo,
  HarmonicStepper,
  ShoalSelect,
  BarometricBadge,
  RefractionSplit,
  EchoForm,
} from "@/components/ui/Innovations";
import { useTape } from "@/lib/tape";
import { TapeStrip } from "@/components/canvas/TapeStrip";
import { MorphShell, SwellInstrument, WaveRule } from "@/components/ui/WaveMorph";
import { BasinCaustic } from "@/components/canvas/BasinCaustic";

const AXES = ["prayer", "body", "work", "memory", "future", "love", "friend", "risk"];
const EDDY_ITEMS = [
  { id: "drift", label: "drift" },
  { id: "channel", label: "channel" },
  { id: "eddy", label: "eddy" },
  { id: "rapids", label: "rapids" },
];
const SHOAL = [
  { id: "prayer", label: "prayer" },
  { id: "body", label: "body" },
  { id: "work", label: "work" },
  { id: "memory", label: "memory" },
  { id: "future", label: "future" },
  { id: "love", label: "love" },
];
const UNDERTOW = [
  {
    id: "surface",
    title: "surface",
    body: "Light still reaches. The first pressure line is barely a whisper.",
  },
  {
    id: "thermocline",
    title: "thermocline",
    body: "Temperature breaks. Type cools. The rail marks another fathom.",
  },
  {
    id: "abyss",
    title: "abyss",
    body: "Only the depth reading remains. Scroll is dive; markers are pressure.",
  },
];
const ECHO_FIELDS = [
  { name: "ask", label: "ask", placeholder: "what does the room hear?" },
  { name: "keep", label: "keep", placeholder: "a word to pin" },
];

export function ComponentDemo({ slug }: { slug: string }) {
  const [chip, setChip] = useState("sine");
  const [amp, setAmp] = useState(0.6);
  const [freq, setFreq] = useState(0.35);
  const [values, setValues] = useState([0.7, 0.4, 0.55, 0.75, 0.3, 0.6, 0.5, 0.35]);
  const [drawer, setDrawer] = useState(false);
  const [progress, setProgress] = useState<number | null>(0.45);
  const [msg, setMsg] = useState("the room is quiet.");
  const [stress, setStress] = useState(0.4);
  const [wind, setWind] = useState(0);
  const [morph, setMorph] = useState(0.35);
  const [palette, setPalette] = useState<"candle" | "sea" | "flame" | "electric" | "aurora">(
    "electric"
  );
  const [beads, setBeads] = useState(3);
  const [eddy, setEddy] = useState("channel");
  const [tide, setTide] = useState(0.45);
  const [depth, setDepth] = useState(0.4);
  const [locked, setLocked] = useState(true);
  const [steam, setSteam] = useState(false);
  const [squall, setSquall] = useState(0.65);
  const [veil, setVeil] = useState(true);
  const [snow, setSnow] = useState(8);
  const [harmonics, setHarmonics] = useState(3);
  const [shoal, setShoal] = useState<string[]>(["work", "memory"]);
  const [baro, setBaro] = useState(4);
  const [split, setSplit] = useState(0.5);
  const [tideRange, setTideRange] = useState<[number, number] | null>([4, 12]);
  const { pulse, pulses } = useTape();

  switch (slug) {
    case "ripple-field":
      return <RippleField height={300} />;
    case "sea-surface":
      return (
        <SeaSurface
          height={300}
          label="webgl caustics · dual canvas · touch ripples"
        />
      );
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
        <div className="space-y-4 px-6 py-10 md:px-10">
          <WaveInput mode="ask" onSubmit={(v) => setMsg(`heard: ${v}`)} />
          <p className="text-center font-serif italic text-ink-2">{msg}</p>
        </div>
      );
    case "hold-discharge":
      return (
        <div className="flex flex-col items-center gap-4 px-6 py-10">
          <HoldDischarge onDischarge={() => setMsg("struck — the room flashes.")}>
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
          <SwellRail label="stress" value={stress} onChange={setStress} />
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
    case "wind-rose":
      return (
        <div className="surface-deep flex flex-col items-center gap-4 bg-deep p-10">
          <WindRose value={wind} onChange={setWind} size={140} />
          <p className="t-meta text-crest">drag · gust rings write to the tape</p>
        </div>
      );
    case "storm-surface":
      return <StormSurface height={340} intensity={0.55} showControls />;
    case "plasma-orb":
      return (
        <div className="surface-deep flex flex-col items-center gap-6 bg-deep py-12">
          <PlasmaOrb size={200} palette={palette} flicker={0.5} />
          <PhaseChip
            options={["candle", "sea", "flame", "electric", "aurora"]}
            value={palette}
            onChange={(v) => setPalette(v as typeof palette)}
          />
        </div>
      );
    case "interference-field":
      return <InterferenceField height={300} />;
    case "wave-particle-morph":
      return <WaveParticleMorph height={280} value={morph} onChange={setMorph} />;
    case "audio-scope":
      return <AudioScope height={340} />;
    case "droplet-mark":
      return (
        <div className="flex flex-col items-center gap-4 p-10">
          <DropletMark count={beads} onClick={() => setBeads((b) => b + 1)} size={56} />
          <div className="flex gap-2">
            <WaveButton onClick={() => setBeads((b) => Math.max(0, b - 1))}>−</WaveButton>
            <WaveButton onClick={() => setBeads((b) => b + 1)}>+</WaveButton>
            <WaveButton onClick={() => setBeads(0)}>clear</WaveButton>
          </div>
        </div>
      );
    case "rain-field":
      return <RainField height={280} rate={0.7} />;
    case "pour-sustain":
      return (
        <div className="flex flex-col items-center gap-4 p-10">
          <PourSustain
            key={msg.startsWith("poured") ? msg : "ready"}
            onCommit={() => setMsg("poured — committed.")}
          >
            hold to pour
          </PourSustain>
          <p className="t-meta text-ink-2">{msg}</p>
          {msg.startsWith("poured") ? (
            <WaveButton onClick={() => setMsg("the room is quiet.")}>reset basin</WaveButton>
          ) : null}
        </div>
      );
    case "pool-well":
      return (
        <div className="p-6">
          <PoolWell title="reading well">
            <p className="font-serif italic text-ink-2">
              a contained stillness. content sits in a basin, not a card.
            </p>
          </PoolWell>
        </div>
      );
    case "eddy-menu":
      return (
        <div className="flex justify-center bg-deep/30 p-6">
          <EddyMenu items={EDDY_ITEMS} value={eddy} onChange={setEddy} />
        </div>
      );
    case "lake-basin":
      return <LakeBasin depth={depth} onDepthChange={setDepth} />;
    case "tide-line":
      return (
        <div className="space-y-3 p-8">
          <TideLine value={tide} onChange={setTide} />
          <p className="t-meta text-ink-2">{Math.round(tide * 100)}% across the wet line</p>
        </div>
      );
    case "crest-meter":
      return (
        <div className="flex flex-col items-center gap-4 p-8">
          <CrestMeter value={amp} label="signal" />
          <SwellRail
            label="amplitude"
            value={amp}
            onChange={setAmp}
            className="w-48"
          />
        </div>
      );
    case "fetch-horizon":
      return <FetchHorizon height={160} />;
    case "cloud-veil":
      return (
        <div className="space-y-3 p-6">
          <WaveButton onClick={() => setVeil((v) => !v)}>
            {veil ? "break to blue" : "gather clouds"}
          </WaveButton>
          <CloudVeil active={veil} label="gathering…" className="min-h-[140px] border border-rule">
            <div className="p-8 font-serif italic text-ink">the content waits under mist.</div>
          </CloudVeil>
        </div>
      );
    case "snow-settle":
      return (
        <div className="space-y-3">
          <div className="flex gap-2 px-4 pt-4">
            <WaveButton onClick={() => setSnow((s) => s + 4)}>more</WaveButton>
            <WaveButton onClick={() => setSnow(0)}>clear</WaveButton>
          </div>
          <SnowSettle count={snow} height={200} />
        </div>
      );
    case "ice-lattice":
      return (
        <div className="p-6">
          <IceLattice
            locked={locked}
            onThaw={() => setLocked(false)}
            onFreeze={() => setLocked(true)}
            className="min-h-[160px] border border-rule"
          >
            <div className="p-8">
              <p className="font-serif italic text-ink">a draft under ice.</p>
              <WaveInput mode="ask" onSubmit={(v) => setMsg(v)} />
            </div>
          </IceLattice>
        </div>
      );
    case "steam-plume":
      return (
        <div className="flex flex-col items-center gap-4 p-10">
          <WaveButton register="devotional" onClick={() => setSteam(true)}>
            release steam
          </WaveButton>
          <SteamPlume open={steam} message="kept · the room remembers." onGone={() => setSteam(false)} />
          <p className="t-meta text-ink-2">toast that rises and dissolves</p>
        </div>
      );
    case "squall-warning":
      return (
        <div className="space-y-4 p-6">
          <SquallWarning
            level={squall}
            onCalm={() => setSquall(0.1)}
          />
          <SwellRail label="squall level" value={squall} onChange={setSquall} />
        </div>
      );
    case "tide-calendar":
      return (
        <div className="p-6">
          <TideCalendar range={tideRange} onRangeChange={setTideRange} />
        </div>
      );
    case "resonance-match":
      return (
        <div className="p-6">
          <ResonanceMatch onUnlock={() => setMsg("unlocked — resonance held.")} />
          <p className="mt-3 t-meta text-ink-2">{msg}</p>
        </div>
      );
    case "undertow-scroll":
      return <UndertowScroll sections={UNDERTOW} height={300} />;
    case "caustic-focus":
      return <CausticFocusDemo />;
    case "harmonic-stepper":
      return (
        <div className="flex justify-center p-10">
          <HarmonicStepper value={harmonics} onChange={setHarmonics} />
        </div>
      );
    case "shoal-select":
      return (
        <ShoalSelect options={SHOAL} value={shoal} onChange={setShoal} height={260} />
      );
    case "barometric-badge":
      return (
        <div className="flex flex-col items-center gap-4 p-10">
          <BarometricBadge count={baro} onClick={() => setBaro((c) => c + 1)} size={64} />
          <div className="flex gap-2">
            <WaveButton onClick={() => setBaro((c) => Math.max(0, c - 1))}>−</WaveButton>
            <WaveButton onClick={() => setBaro((c) => c + 1)}>+</WaveButton>
            <WaveButton onClick={() => setBaro(14)}>storm</WaveButton>
          </div>
        </div>
      );
    case "refraction-split":
      return (
        <RefractionSplit
          value={split}
          onChange={setSplit}
          height={200}
          a={
            <div>
              <p className="t-eyebrow text-sea">before</p>
              <p className="mt-2 font-serif text-xl italic">tidewater vellum</p>
            </div>
          }
          b={
            <div>
              <p className="t-eyebrow text-crest">after</p>
              <p className="mt-2 font-serif text-xl italic">abyss phosphor</p>
            </div>
          }
        />
      );
    case "echo-form":
      return (
        <div className="p-6">
          <EchoForm fields={ECHO_FIELDS} onSubmit={() => setMsg("wake released.")} />
        </div>
      );
    case "swell-rail":
      return (
        <div className="space-y-4 p-8">
          <SwellRail label="swell" value={amp} onChange={setAmp} />
          <SwellRail label="stress" value={stress} onChange={setStress} />
        </div>
      );
    case "morph-shell":
      return (
        <div className="grid gap-4 p-6 md:grid-cols-2">
          <MorphShell caustic>
            <p className="t-eyebrow text-sea">paper basin</p>
            <p className="mt-2 font-serif italic text-ink-2">
              content sits in a meniscus, not a card.
            </p>
          </MorphShell>
          <MorphShell dark>
            <p className="t-eyebrow text-crest">deep basin</p>
            <p className="mt-2 font-serif italic text-on-deep/80">
              dark register for instruments.
            </p>
          </MorphShell>
        </div>
      );
    case "wave-rule":
      return (
        <div className="space-y-6 p-8">
          <WaveRule amp={4} freq={4} />
          <WaveRule amp={8} freq={2.5} />
          <WaveRule amp={5} freq={6} color="rgba(var(--candle-rgb), 0.55)" />
        </div>
      );
    case "basin-caustic":
      return (
        <div className="relative h-56 overflow-hidden">
          <BasinCaustic intensity={0.7} />
          <div className="relative z-10 flex h-full items-end p-6">
            <p className="font-serif italic text-ink">
              shared under-island material · theme-locked
            </p>
          </div>
        </div>
      );
    default:
      return <div className="p-8 t-meta text-ink-2">demo for {slug}</div>;
  }
}
