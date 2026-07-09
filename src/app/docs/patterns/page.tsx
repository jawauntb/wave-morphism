import { DocsShell, PageHeader } from "@/components/layout/Chrome";
import { CodeBlock } from "@/components/ui/Surfaces";

export const metadata = { title: "Patterns" };

export default function PatternsPage() {
  return (
    <DocsShell>
      <PageHeader
        eyebrow="recipes"
        title="patterns"
        dek="Composition recipes for immersive scenes, shape-state, and mobile-safe instruments."
      />

      <div className="space-y-12">
        <Pattern
          title="immersive scene"
          body="Header floats. Footer omitted. Dark route palette. Scene owns the viewport below the header. Sound toggle + tape remain."
          code={`// dark route shell
<body data-route="ocean">
  <SiteHeader theme="dark" />
  <SeaSurface height="100vh" audioLock tilt />
  <TapeStrip />
</body>`}
        />
        <Pattern
          title="shape as state"
          body="Encode multi-axis values as a polygon. Render as compass, sigil, OG image, and music. Share via compact hash."
          code={`const values = [0.7, 0.4, 0.55, 0.8, 0.3, 0.65, 0.5, 0.25];
<ConcernPolygon axes={AXES} values={values} onChange={setValues} tones />
<SigilMark values={values} playable />`}
        />
        <Pattern
          title="tape feedback"
          body="Replace toasts with pulses. Kind + intensity is enough. The strip is ambient memory."
          code={`const { pulse } = useTape();
pulse("keep", 0.7);
pulse("ripple", amp);`}
        />
        <Pattern
          title="mobile instruments"
          body="Prefer tap-then-tap and rotary dials over dense vertex drags. Collapsible tune drawers. 44px targets. touch-action: none on canvases."
          code={`<div data-touch-surface className="touch-none">
  <RotaryDial value={amp} onChange={setAmp} rings={2} />
  {/* collapse advanced sliders into DrawerWake on small screens */}
</div>`}
        />
        <Pattern
          title="web + mobile element plan"
          body="Web leans on hover ghosts, dual-ring dials, and shaped prose. Mobile leans on hold-discharge, scrub canvases, multitouch ripples, and swipe-dismiss drawers. Same grammar — different affordances."
          code={`| element   | web                     | mobile                  |
| button    | hover ghost + ripple    | larger hit + haptic     |
| slider    | rotary / polygon vertex | nested dial / scrub     |
| select    | constellation panel     | full-bleed drawer       |
| modal     | drawer wake             | swipe-dismiss sheet     |
| feedback  | tape + tone             | tape + haptic           |`}
        />
      </div>
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
