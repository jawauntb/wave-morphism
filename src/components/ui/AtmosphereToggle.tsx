"use client";

import { useAtmosphere, type AtmosphereMode } from "@/lib/atmosphere";
import { useTape } from "@/lib/tape";

const FIELD_LABELS: Record<AtmosphereMode, string> = {
  css: "css",
  canvas: "canvas",
  off: "off",
};

/**
 * Cycle ambient cost: css (default) → canvas → off.
 * Lets product pages stay GPU-free while demos can opt into AmbientField.
 */
export function AtmosphereToggle({ className = "" }: { className?: string }) {
  const { ambient, tapeStrip, cycleAmbient, setTapeStrip } = useAtmosphere();
  const { pulse } = useTape();

  return (
    <div
      className={`inline-flex flex-wrap items-center gap-2 ${className}`}
      role="group"
      aria-label="atmosphere controls"
    >
      <button
        type="button"
        onClick={() => {
          cycleAmbient();
          pulse("phase", 0.3);
        }}
        className="t-meta text-ink-2 transition-colors duration-wave hover:text-candle"
        aria-label={`Atmosphere field: ${FIELD_LABELS[ambient]}. Click to cycle css, canvas, or off.`}
        title="css = zero GPU · canvas = AmbientField · off = flat"
      >
        field: {FIELD_LABELS[ambient]}
      </button>
      <button
        type="button"
        onClick={() => {
          setTapeStrip(!tapeStrip);
          pulse("phase", 0.25);
        }}
        className="t-meta text-ink-2 transition-colors duration-wave hover:text-candle"
        aria-pressed={tapeStrip}
        aria-label={`Tape strip: ${tapeStrip ? "on" : "off"}. Click to toggle.`}
        title="show or hide the tape strip"
      >
        tape: {tapeStrip ? "on" : "off"}
      </button>
    </div>
  );
}
