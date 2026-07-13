"use client";

import Link from "next/link";
import { SeaSurface } from "@/components/canvas/SeaSurface";
import { WaterText } from "@/components/ui/WaterText";
import { WaveButton } from "@/components/ui/WaveButton";
import { MorphShell, WaveRule } from "@/components/ui/WaveMorph";
import { getCoreComponents } from "@/data/components";

/**
 * Home — brand first, one composition, hero budget.
 * Brand · one line · one dek · CTAs · sea. No museum in the first viewport.
 */
export default function HomePage() {
  const twelve = getCoreComponents();

  return (
    <div className="pb-24">
      <section className="hero-atmosphere relative overflow-hidden">
        <div className="mx-auto max-w-site px-pad-x pb-6 pt-20 md:pt-28">
          <WaterText as="h1" className="t-brand text-[clamp(2.8rem,8vw,5.5rem)]" radius={180} strength={14}>
            wave-morphism
          </WaterText>
          <p className="mt-6 max-w-md font-serif text-xl italic text-ink-2 md:text-2xl">
            UI that propagates and decays — not frost on a card.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <WaveButton href="/harbor" register="oceanic" density="expressive">
              open Harbor →
            </WaveButton>
            <WaveButton href="/docs/installation" density="quiet">
              install the twelve
            </WaveButton>
          </div>
        </div>
        <SeaSurface height={360} label="touch · the template" />
      </section>

      <section className="mx-auto max-w-site px-pad-x py-20">
        <p className="t-eyebrow text-candle">three verbs</p>
        <h2 className="mt-2 font-serif text-3xl italic md:text-4xl">
          press · change · commit
        </h2>
        <p className="mt-4 max-w-xl t-body text-ink-2">
          Idle amp ≈ 0. Motion is grammar, not decoration. If it moves at rest, it&apos;s
          wrong.
        </p>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {[
            ["press", "ripple + decay", "WaveButton"],
            ["change", "crest / phase", "PhaseChip · SwellRail"],
            ["commit", "hold / discharge", "HoldDischarge · CalmDecay"],
          ].map(([verb, how, who]) => (
            <div key={verb}>
              <p className="font-serif text-2xl italic text-ink">{verb}</p>
              <p className="mt-2 t-meta text-candle">{how}</p>
              <p className="mt-1 t-meta text-ink-2">{who}</p>
            </div>
          ))}
        </div>
      </section>

      <WaveRule className="mx-auto max-w-site px-pad-x" amp={5} freq={3} />

      <section className="mx-auto max-w-site px-pad-x py-20">
        <p className="t-eyebrow text-sea">twelve</p>
        <h2 className="mt-2 font-serif text-3xl italic">the public kit</h2>
        <p className="mt-4 max-w-xl t-body text-ink-2">
          Everything else is attic. Copy these, ship a screen, skip the museum.
        </p>
        <ul className="mt-10 flex flex-wrap gap-x-4 gap-y-3">
          {twelve.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/docs/components/${c.slug}`}
                className="font-serif text-lg italic text-sea hover:text-candle"
              >
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-12 flex flex-wrap gap-3">
          <WaveButton href="/docs/proof" register="devotional" density="quiet">
            see the proof
          </WaveButton>
          <WaveButton href="/docs/lab" density="quiet">
            attic
          </WaveButton>
        </div>
      </section>

      <section className="mx-auto max-w-site px-pad-x pb-8">
        <MorphShell quiet density="quiet" caustic>
          <p className="t-eyebrow text-candle">one material · one focus · one feedback</p>
          <p className="mt-3 max-w-2xl font-serif text-xl italic text-ink-2">
            Basin under the island. Caustic on focus. Tape + steam for wakes. No second
            metaphor for the same job.
          </p>
          <WaveButton href="/docs/patterns" className="mt-8" density="quiet" register="oceanic">
            patterns →
          </WaveButton>
        </MorphShell>
      </section>
    </div>
  );
}
