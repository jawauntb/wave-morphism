"use client";

import { AmbientField } from "@/components/canvas/AmbientField";
import { TapeStrip } from "@/components/canvas/TapeStrip";
import { useAtmosphere } from "@/lib/atmosphere";

/** CSS-only ambient — zero canvas cost. Theme tokens drive the wash. */
export function CssAmbient() {
  return <div className="css-ambient" aria-hidden />;
}

/**
 * Renders ambient + tape according to AtmosphereProvider.
 * Default path: CSS ambient (no full-screen canvas rAF).
 */
export function AtmosphereLayer() {
  const { ambient, tapeStrip } = useAtmosphere();

  return (
    <>
      {ambient === "canvas" ? <AmbientField /> : null}
      {ambient === "css" ? <CssAmbient /> : null}
      {/* ambient === "off" → body --field only */}
      {tapeStrip ? (
        <div className="fixed bottom-0 inset-x-0 z-20 bg-paper pb-[env(safe-area-inset-bottom)]">
          <TapeStrip />
        </div>
      ) : null}
    </>
  );
}
