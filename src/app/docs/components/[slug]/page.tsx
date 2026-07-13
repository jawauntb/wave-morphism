import { notFound } from "next/navigation";
import { DocsShell, PageHeader } from "@/components/layout/Chrome";
import { components, getComponent } from "@/data/components";
import { CodeBlock } from "@/components/ui/Surfaces";
import { ComponentDemo } from "@/components/demos/ComponentDemo";
import { MorphShell, PropTide, WaveRule } from "@/components/ui/WaveMorph";

export function generateStaticParams() {
  return components.map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const doc = getComponent(params.slug);
  return { title: doc?.name ?? "Component" };
}

export default function ComponentDocPage({
  params,
}: {
  params: { slug: string };
}) {
  const doc = getComponent(params.slug);
  if (!doc) notFound();

  return (
    <DocsShell>
      <PageHeader eyebrow={doc.category} title={doc.name} dek={doc.summary} />
      <p className="mb-6 t-meta text-candle">
        {doc.tier === "core" ? "core kit" : "lab"} · replaces {doc.traditional}
      </p>

      <MorphShell
        pad={false}
        className="mb-10 min-h-[18rem]"
        dark={
          doc.slug === "swell-lfo" ||
          doc.slug === "oscilloscope" ||
          doc.slug === "sea-surface" ||
          doc.slug === "ripple-field" ||
          doc.slug === "signal" ||
          doc.slug === "progress-wake"
        }
      >
        <ComponentDemo slug={doc.slug} />
      </MorphShell>

      <WaveRule className="mb-8" amp={5} freq={3.5} />

      <div className="prose-docs">
        <h2>when to use</h2>
        <p>{doc.when}</p>
      </div>

      <WaveRule className="my-8" amp={4} freq={4} />

      <h2 className="t-h2 mb-4">props</h2>
      <PropTide rows={doc.props} />

      <WaveRule className="my-8" amp={5} freq={3} />

      <div className="prose-docs">
        <h2>snippet</h2>
      </div>
      <MorphShell className="mt-4" pad={false} dark>
        <CodeBlock code={doc.snippet} />
      </MorphShell>
    </DocsShell>
  );
}
