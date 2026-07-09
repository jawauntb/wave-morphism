import { notFound } from "next/navigation";
import { DocsShell, PageHeader } from "@/components/layout/Chrome";
import { components, getComponent } from "@/data/components";
import { CodeBlock } from "@/components/ui/Surfaces";
import { ComponentDemo } from "@/components/demos/ComponentDemo";

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
      <p className="mb-8 t-meta text-candle">replaces {doc.traditional}</p>

      <div className="demo-stage mb-8 overflow-hidden">
        <ComponentDemo slug={doc.slug} />
      </div>

      <div className="prose-docs">
        <h2>when to use</h2>
        <p>{doc.when}</p>
        <h2>props</h2>
      </div>
      <div className="mb-8 overflow-hidden border border-rule">
        <table className="w-full text-left">
          <thead className="border-b border-rule bg-paper-2">
            <tr>
              <th className="px-4 py-2 t-eyebrow font-normal">prop</th>
              <th className="px-4 py-2 t-eyebrow font-normal">type</th>
              <th className="px-4 py-2 t-eyebrow font-normal">notes</th>
            </tr>
          </thead>
          <tbody>
            {doc.props.map((p) => (
              <tr key={p.name} className="border-b border-rule/70 last:border-0">
                <td className="px-4 py-2 font-mono text-sm">{p.name}</td>
                <td className="px-4 py-2 font-mono text-xs text-ink-2">{p.type}</td>
                <td className="px-4 py-2 text-sm text-ink-2">{p.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="prose-docs">
        <h2>snippet</h2>
      </div>
      <CodeBlock code={doc.snippet} />
    </DocsShell>
  );
}
