import Link from "next/link";
import { DocsShell, PageHeader } from "@/components/layout/Chrome";
import { CodeBlock } from "@/components/ui/Surfaces";
import { MorphShell, WaveRule } from "@/components/ui/WaveMorph";
import { CORE_INSTALL_FILES, CORE_INSTALL_NEXT, SEMANTIC_BRIDGE } from "@/data/install";
import { getCoreComponents } from "@/data/components";

export const metadata = { title: "Install" };

export default function InstallationPage() {
  const core = getCoreComponents();
  const bridgeLines = Object.entries(SEMANTIC_BRIDGE)
    .map(([k, v]) => `  --${k}: var(${v});`)
    .join("\n");

  return (
    <DocsShell>
      <PageHeader
        eyebrow="dx"
        title="install"
        dek="Paste eight files. Or run the local add map. Ship Harbor-shaped screens in under an hour — no philosophy required."
      />

      <MorphShell quiet density="quiet" className="mb-10">
        <p className="t-eyebrow text-candle">CLI · local map</p>
        <p className="mt-2 max-w-2xl text-ink-2">
          No registry server — prints the files to copy. Feels like shadcn; stays offline.
        </p>
        <CodeBlock
          code={`npm run wave -- button
npm run wave -- rail
npm run wave -- core   # 8-file kit`}
        />
      </MorphShell>

      <MorphShell quiet density="quiet" className="mb-10">
        <p className="t-eyebrow text-candle">8-file core</p>
        <ol className="mt-5 space-y-2">
          {CORE_INSTALL_FILES.map((f, i) => (
            <li key={f.path} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="t-meta text-candle">{i + 1}.</span>
              <code className="font-mono text-sm text-ink">{f.path}</code>
              <span className="t-meta text-ink-2">{f.note}</span>
            </li>
          ))}
        </ol>
      </MorphShell>

      <div className="prose-docs">
        <h2>providers</h2>
      </div>
      <CodeBlock
        code={`import { ThemeProvider } from "@/lib/theme";
import { TapeProvider } from "@/lib/tape";
import { AtmosphereProvider } from "@/lib/atmosphere";

<ThemeProvider>
  <AtmosphereProvider defaultAmbient="css" defaultTapeStrip>
    <TapeProvider>{children}</TapeProvider>
  </AtmosphereProvider>
</ThemeProvider>`}
      />

      <div className="prose-docs">
        <h2>semantic bridge</h2>
      </div>
      <CodeBlock code={`:root {\n${bridgeLines}\n}`} />

      <WaveRule className="my-10" amp={5} freq={3} />

      <MorphShell quiet density="quiet">
        <p className="t-eyebrow text-candle">next</p>
        <ul className="mt-4 space-y-2">
          {CORE_INSTALL_NEXT.map((f) => (
            <li key={f.path} className="flex flex-wrap items-baseline gap-x-3">
              <code className="font-mono text-sm text-ink">{f.path}</code>
              <span className="t-meta text-ink-2">{f.note}</span>
            </li>
          ))}
        </ul>
      </MorphShell>

      <div className="prose-docs mt-10">
        <h2>policies</h2>
        <ul>
          <li>Twelve public surfaces. Lab stays in the attic.</li>
          <li>Three verbs: press · change · commit. Idle amp ≈ 0.</li>
          <li>One basin · one focus · one feedback (tape + steam).</li>
          <li>No native <code>type=&quot;range&quot;</code>. Deep text = on-deep.</li>
        </ul>
      </div>

      <p className="mt-10 t-meta text-ink-2">
        The twelve ({core.length}):{" "}
        {core.map((c, i) => (
          <span key={c.slug}>
            {i > 0 ? " · " : null}
            <Link href={`/docs/components/${c.slug}`} className="text-sea hover:text-candle">
              {c.name}
            </Link>
          </span>
        ))}
        <br />
        <Link href="/harbor" className="text-candle hover:underline">
          Harbor
        </Link>{" "}
        ·{" "}
        <Link href="/docs/proof" className="text-candle hover:underline">
          proof
        </Link>
      </p>
    </DocsShell>
  );
}
