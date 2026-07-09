"use client";

import Link from "next/link";
import { useState } from "react";
import { SeaSurface } from "@/components/canvas/SeaSurface";
import { BreathHero, WaterText } from "@/components/ui/WaterText";
import { WaveButton } from "@/components/ui/WaveButton";
import { PhaseChip } from "@/components/ui/PhaseChip";
import { RotaryDial } from "@/components/ui/RotaryDial";
import { ConcernPolygon, SigilMark } from "@/components/ui/ConcernPolygon";
import { WaveInput, HoldDischarge, CalmDecay } from "@/components/ui/WaveInput";
import { Oscilloscope, ProgressWake, CodeBlock } from "@/components/ui/Surfaces";
import { MorphShell, WaveRule } from "@/components/ui/WaveMorph";
import { axioms, learnings, registers } from "@/data/philosophy";
import { traditionalMap, components } from "@/data/components";

const AXES = ["prayer", "body", "work", "memory", "future", "love", "friend", "risk"];

export default function HomePage() {
  const [wave, setWave] = useState("sine");
  const [amp, setAmp] = useState(0.62);
  const [freq, setFreq] = useState(0.4);
  const [values, setValues] = useState([0.7, 0.45, 0.55, 0.8, 0.35, 0.65, 0.5, 0.3]);
  const [stress, setStress] = useState(0.35);
  const [progress, setProgress] = useState<number | null>(0.55);
  const [reply, setReply] = useState("the room is listening.");

  return (
    <div className="pb-16">
      {/* Hero */}
      <section className="hero-atmosphere relative overflow-hidden">
        <div className="mx-auto max-w-site px-pad-x pb-8 pt-16 md:pt-24">
          <p className="mb-6 t-eyebrow text-sea">a design system for propagating UI</p>
          <BreathHero>wave-morphism</BreathHero>
          <p className="mt-6 max-w-xl t-body text-ink-2">
            not waves painted on buttons — chrome that undulates, props that tide,
            state that is a shape, and every control phase-locked to one swell.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/docs/philosophy">
              <WaveButton register="oceanic">read the philosophy →</WaveButton>
            </Link>
            <Link href="/docs/components/wave-button">
              <WaveButton register="devotional">browse components</WaveButton>
            </Link>
            <Link href="/docs/playground">
              <WaveButton>open playground</WaveButton>
            </Link>
          </div>
        </div>
        <SeaSurface height={320} label="touch the sea · the template for every control" />
      </section>

      {/* Philosophy distill */}
      <section className="mx-auto max-w-site px-pad-x py-20">
        <p className="mb-3 t-eyebrow text-candle">distilled from objet d&apos;art</p>
        <WaterText as="h2" className="t-h2 mb-4" radius={100}>
          twelve axioms of wave-morphism
        </WaterText>
        <p className="mb-12 max-w-2xl t-body text-ink-2">
          Studied across sea, tide, storm, pulse, pretext, jewel, watch, and twenty more
          instruments. The grammar is propagation — not decoration.
        </p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {axioms.map((a, i) => (
            <MorphShell key={a.id} className="axiom-card">
              <p className="mb-2 t-eyebrow text-ink-2">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mb-2 font-serif text-xl italic">{a.title}</h3>
              <p className="text-[0.95rem] leading-relaxed text-ink-2">{a.body}</p>
            </MorphShell>
          ))}
        </div>
      </section>

      {/* Learnings */}
      <section className="border-y border-rule bg-paper-2/50 py-16">
        <div className="mx-auto max-w-site px-pad-x">
          <p className="mb-3 t-eyebrow text-sea">field notes</p>
          <h2 className="t-h2 mb-10">what each page taught</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {learnings.map((l) => (
              <div key={l.source} className="border-l-2 border-candle/40 pl-4">
                <p className="t-meta text-candle">{l.source}</p>
                <p className="mt-1 text-ink-2">{l.lesson}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {registers.map((r) => (
              <div key={r.name} className="border border-rule bg-paper p-5">
                <p className="t-eyebrow text-ink-2">{r.name}</p>
                <p className="mt-3 font-mono text-sm text-ink">
                  {r.examples.join(" · ")}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Traditional → wave map */}
      <section className="mx-auto max-w-site px-pad-x py-20">
        <p className="mb-3 t-eyebrow text-candle">redesign map</p>
        <h2 className="t-h2 mb-4">every traditional element, rewritten</h2>
        <p className="mb-10 max-w-2xl t-body text-ink-2">
          Not waves painted on buttons — each control inherits the sea&apos;s interaction
          language: wavefront, decay, tone, tape.
        </p>
        <div>
          <div className="tide-map-row t-eyebrow text-ink-2">
            <span>traditional</span>
            <span>wave-morph</span>
          </div>
          <WaveRule amp={4} freq={4} />
          {traditionalMap.map((row) => (
            <div key={row.from}>
              <div className="tide-map-row">
                <span className="font-mono text-sm text-ink-2">{row.from}</span>
                <span className="font-serif italic text-ink">{row.to}</span>
              </div>
              <WaveRule amp={3.5} freq={5} color="rgba(44,74,92,0.22)" />
            </div>
          ))}
        </div>
      </section>

      {/* Live gallery */}
      <section className="border-t border-rule bg-[#0c141c] py-20 text-paper">
        <div className="mx-auto max-w-site px-pad-x">
          <p className="mb-3 t-eyebrow text-[#8eb6c9]">live gallery</p>
          <h2 className="font-serif text-3xl italic font-light mb-2">play the system</h2>
          <p className="mb-12 max-w-xl text-paper/70">
            Every demo below writes to the tape at the bottom of the page. Touch, hold,
            drag — watch the wake.
          </p>

          <div className="grid gap-8 lg:grid-cols-2">
            <MorphShell dark>
              <p className="mb-4 t-eyebrow text-[#8eb6c9]">wave button · phase chip</p>
              <div className="mb-6 flex flex-wrap gap-3">
                <WaveButton register="oceanic">oceanic</WaveButton>
                <WaveButton register="devotional" ritual>
                  ritual press
                </WaveButton>
                <WaveButton>operational</WaveButton>
              </div>
              <PhaseChip
                options={["sine", "triangle", "square", "saw"]}
                value={wave}
                onChange={(v) => setWave(v as string)}
              />
            </MorphShell>

            <MorphShell dark className="flex flex-col items-center">
              <p className="mb-4 self-start t-eyebrow text-[#8eb6c9]">rotary dial</p>
              <RotaryDial
                value={amp}
                onChange={setAmp}
                secondary={freq}
                onSecondaryChange={setFreq}
                rings={2}
                label="helm"
                size={180}
              />
              <p className="mt-3 t-meta text-paper/50">
                outer amp {Math.round(amp * 100)} · inner freq {Math.round(freq * 100)}
              </p>
            </MorphShell>

            <MorphShell dark className="flex flex-col items-center">
              <p className="mb-2 self-start t-eyebrow text-[#8eb6c9]">concern polygon · sigil</p>
              <ConcernPolygon axes={AXES} values={values} onChange={setValues} size={280} />
              <div className="mt-4 flex items-center gap-3">
                <SigilMark values={values} size={56} playable />
                <span className="t-meta text-paper/50">click sigil to pulse tape</span>
              </div>
            </MorphShell>

            <MorphShell dark className="space-y-6">
              <p className="t-eyebrow text-[#8eb6c9]">wave input · rituals</p>
              <WaveInput
                mode="ask"
                onSubmit={(v) => setReply(`the room heard: “${v}”`)}
              />
              <p className="font-serif italic text-paper/80">{reply}</p>
              <div className="flex flex-wrap gap-3">
                <HoldDischarge onDischarge={() => setStress(1)}>
                  hold for lightning
                </HoldDischarge>
                <CalmDecay onCalm={() => setStress(0.1)}>still the sea</CalmDecay>
              </div>
              <label className="block">
                <span className="t-eyebrow text-paper/50">stress → oscilloscope</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={stress}
                  onChange={(e) => setStress(Number(e.target.value))}
                  className="mt-2 w-full accent-candle"
                />
              </label>
              <Oscilloscope stress={stress} height={140} />
            </MorphShell>
          </div>

          <MorphShell dark className="mt-8">
            <p className="mb-4 t-eyebrow text-[#8eb6c9]">progress wake</p>
            <div className="mb-4 flex flex-wrap gap-3">
              <WaveButton onClick={() => setProgress(null)}>indeterminate</WaveButton>
              <WaveButton onClick={() => setProgress(0.25)}>25%</WaveButton>
              <WaveButton onClick={() => setProgress(0.75)}>75%</WaveButton>
              <WaveButton register="devotional" onClick={() => setProgress(1)}>
                complete
              </WaveButton>
            </div>
            <ProgressWake value={progress} variant="ekg" />
            <div className="mt-4">
              <ProgressWake value={progress} variant="fill" />
            </div>
          </MorphShell>
        </div>
      </section>

      {/* Component index */}
      <section className="mx-auto max-w-site px-pad-x py-20">
        <p className="mb-3 t-eyebrow text-candle">component library</p>
        <h2 className="t-h2 mb-10">docs with snippets</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {components.map((c) => (
            <Link key={c.slug} href={`/docs/components/${c.slug}`} className="group block">
              <MorphShell className="h-full transition-transform duration-wave group-hover:-translate-y-0.5">
                <p className="t-eyebrow text-ink-2">{c.category}</p>
                <h3 className="mt-2 font-serif text-xl italic group-hover:text-sea">
                  {c.name}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-ink-2">{c.summary}</p>
                <p className="mt-3 t-meta text-candle">replaces {c.traditional}</p>
              </MorphShell>
            </Link>
          ))}
        </div>
      </section>

      {/* Install snippet */}
      <section className="border-t border-rule bg-paper-2/40 py-16">
        <div className="mx-auto max-w-site px-pad-x">
          <p className="mb-3 t-eyebrow text-sea">start</p>
          <h2 className="t-h2 mb-6">tokens in one paste</h2>
          <CodeBlock
            code={`/* wave-morphism tokens */
:root {
  --paper: #F2EEE6;
  --ink: #15171A;
  --candle: #C8732A;
  --sea: #2C4A5C;
  --t: 320ms cubic-bezier(.2,.6,.2,1);
}

/* grammar */
touch → wavefront → decay → audio → tape → reread`}
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/docs/installation">
              <WaveButton register="oceanic">installation</WaveButton>
            </Link>
            <Link href="/docs/patterns">
              <WaveButton>patterns</WaveButton>
            </Link>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-site px-pad-x py-12 pb-20">
        <p className="t-meta text-ink-2">
          wave-morphism · distilled from objet d&apos;art instruments · tidewater vellum
        </p>
      </footer>
    </div>
  );
}
