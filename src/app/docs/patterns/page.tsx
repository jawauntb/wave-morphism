import Link from "next/link";
import { DocsShell, PageHeader } from "@/components/layout/Chrome";
import { CodeBlock } from "@/components/ui/Surfaces";
import { MorphShell, WaveRule } from "@/components/ui/WaveMorph";
import { getCoreComponents } from "@/data/components";

export const metadata = { title: "Patterns" };

export default function PatternsPage() {
  const core = getCoreComponents();

  return (
    <DocsShell>
      <PageHeader
        eyebrow="law"
        title="patterns"
        dek="Twelve surfaces. Three verbs. One material, one focus, one feedback. Everything else is attic."
      />

      <MorphShell quiet density="quiet" className="mb-10">
        <p className="t-eyebrow text-candle">twelve · {core.length}</p>
        <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-2">
          {core.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/docs/components/${c.slug}`}
                className="t-meta text-sea hover:text-candle"
              >
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </MorphShell>

      <div className="space-y-12">
        <Pattern
          title="three verbs"
          body="Ban decoration motion. Idle amp ≈ 0. If it moves at rest, it's wrong."
          code={`press  → WaveButton ripple + decay
change → PhaseChip crest / SwellRail
commit → HoldDischarge / CalmDecay / announce("keep")

// shared clock
useSwellLFO()
IDLE_AMP = 0.02`}
        />
        <Pattern
          title="one of each"
          body="No second metaphor for the same job."
          code={`material  BasinCaustic ≤1 / viewport (MorphShell caustic)
focus     CausticFocusRoot (crest if reduced-motion)
feedback  useWake().announce → tape + SteamPlume`}
        />
        <Pattern
          title="Harbor"
          body="The reference product — notes from the twelve only. Blind-test against glass."
          code={`/harbor

// empty state, list+detail, compose, publish, sink
// no lab imports allowed on this route`}
        />
        <Pattern
          title="density"
          body="Tables, forms, nav, empty — hairline WaveRules, quiet shells, tide fields."
          code={`<MorphShell quiet density="quiet" pad={false}>
  <WaveRule amp={2} freq={6} />  {/* row hairline */}
  <button className="…">row</button>
</MorphShell>

// empty
<p className="font-serif italic">empty tide</p>
<WaveButton density="quiet">show all</WaveButton>`}
        />
        <Pattern
          title="when to use what"
          body="One job → one control from the twelve."
          code={`| job         | use              |
| press       | WaveButton       |
| 0–1         | SwellRail        |
| discrete    | PhaseChip        |
| compose     | WaveInput        |
| destroy     | HoldDischarge    |
| undo/calm   | CalmDecay        |
| panel       | MorphShell quiet |
| divider     | WaveRule         |
| overlay     | DrawerWake       |
| focus       | CausticFocus     |
| long scroll | UndertowScroll   |
| feedback    | Tape / useWake   |`}
        />
        <Pattern
          title="DX"
          body="Copy path that compiles without reading philosophy."
          code={`npm run wave -- core
npm run wave -- button
npm run wave -- wake

// then open /harbor and steal the layout`}
        />
      </div>

      <WaveRule className="my-12" amp={5} freq={3} />
      <p className="t-meta text-ink-2">
        <Link href="/harbor" className="text-candle hover:underline">
          Harbor
        </Link>{" "}
        ·{" "}
        <Link href="/docs/proof" className="text-candle hover:underline">
          proof
        </Link>{" "}
        ·{" "}
        <Link href="/docs/lab" className="text-candle hover:underline">
          attic
        </Link>
      </p>
    </DocsShell>
  );
}

function Pattern({
  title,
  body,
  code,
}: {
  title: string;
  body: string;
  code: string;
}) {
  return (
    <article>
      <h2 className="t-h2 mb-2">{title}</h2>
      <p className="mb-4 max-w-2xl text-ink-2">{body}</p>
      <CodeBlock code={code} />
    </article>
  );
}
