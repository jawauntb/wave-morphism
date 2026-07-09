import { DocsShell, PageHeader } from "@/components/layout/Chrome";
import { CodeBlock } from "@/components/ui/Surfaces";

export const metadata = { title: "Installation" };

export default function InstallationPage() {
  return (
    <DocsShell>
      <PageHeader
        eyebrow="start"
        title="installation"
        dek="Copy tokens, fonts, and the tape provider. Components are source — like shadcn, you own the code."
      />

      <div className="prose-docs">
        <h2>1. tokens</h2>
        <p>Add tidewater vellum CSS variables to your global stylesheet.</p>
      </div>
      <CodeBlock
        code={`:root {
  --paper: #F2EEE6;
  --paper-2: #E8E2D5;
  --ink: #15171A;
  --ink-2: #3A3D42;
  --rule: rgba(21,23,26,0.18);
  --candle: #C8732A;
  --sea: #2C4A5C;
  --t: 320ms cubic-bezier(.2,.6,.2,1);
}`}
      />

      <div className="prose-docs">
        <h2>2. fonts</h2>
        <p>
          Two faces only: Cormorant Garamond (display / meaning) and JetBrains Mono
          (controls / meta). The tension is the identity.
        </p>
      </div>
      <CodeBlock
        code={`import { Cormorant_Garamond, JetBrains_Mono } from "next/font/google";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});`}
      />

      <div className="prose-docs">
        <h2>3. tape provider</h2>
        <p>
          Wrap the app so every control can leave a wake. The strip is optional chrome;
          the pulse API is the contract.
        </p>
      </div>
      <CodeBlock
        code={`import { TapeProvider } from "@/lib/tape";
import { TapeStrip } from "@/components/canvas/TapeStrip";

<TapeProvider>
  {children}
  <TapeStrip />
</TapeProvider>`}
      />

      <div className="prose-docs">
        <h2>4. copy a component</h2>
        <p>
          Open any docs page, copy the snippet, and paste the source from{" "}
          <code>src/components</code>. No package publish required — ownership stays in
          your repo.
        </p>
      </div>
    </DocsShell>
  );
}
