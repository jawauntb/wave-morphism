import { DocsShell, PageHeader } from "@/components/layout/Chrome";
import { CodeBlock } from "@/components/ui/Surfaces";

export const metadata = { title: "Motion" };

export default function MotionPage() {
  return (
    <DocsShell>
      <PageHeader
        eyebrow="foundations"
        title="motion"
        dek="One shared swell. Rituals ramp. Ripples decay. Reduced motion freezes loops without deleting interaction."
      />

      <div className="prose-docs">
        <h2>the swell LFO</h2>
        <p>
          Default <code>0.14 Hz</code> with a slower <code>0.03 Hz</code> drift. Visual
          caustics, ambient gain, and hero breath should share this oscillator.
        </p>
      </div>
      <CodeBlock
        code={`const { value, drift } = useSwellLFO(0.14, 0.03);
// value ∈ [-1, 1] each frame — phase-lock your surfaces`}
      />

      <div className="prose-docs">
        <h2>timing token</h2>
        <p>
          All UI transitions use <code>--t: 320ms cubic-bezier(.2,.6,.2,1)</code>. Ritual
          actions may run longer (calm ~2s, hold-discharge ~800ms charge).
        </p>
        <h2>propagation grammar</h2>
        <p>
          <code>touch → wavefront → decay → audio → tape → reread</code>
        </p>
        <ul>
          <li>Hover: tiny ripple, no tape (or ghost pulse).</li>
          <li>Press: ripple + tape pulse.</li>
          <li>Drag: continuous tone / morph; release rings.</li>
          <li>Ritual: visible charge or decay curve.</li>
        </ul>
      </div>
    </DocsShell>
  );
}
