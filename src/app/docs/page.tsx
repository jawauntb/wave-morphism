import { DocsShell, PageHeader } from "@/components/layout/Chrome";

export default function DocsIndex() {
  return (
    <DocsShell>
      <PageHeader
        eyebrow="docs"
        title="wave-morphism docs"
        dek="Philosophy, tokens, redesigned controls, and live patterns — a shadcn-shaped catalog for propagating UI."
      />
      <div className="prose-docs">
        <p>
          Start with <a href="/docs/philosophy">philosophy</a>, install{" "}
          <a href="/docs/installation">tokens</a>, then open any component. The tape at
          the bottom of every page is part of the system — interactions leave a wake.
        </p>
      </div>
    </DocsShell>
  );
}
