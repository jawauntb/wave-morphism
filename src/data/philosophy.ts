export const axioms = [
  {
    id: "water-template",
    title: "Water is the template",
    body: "Touch creates a wavefront that propagates and decays. Dwell thickens. Release rings. Every control should answer the way a sea answers a finger.",
  },
  {
    id: "state-as-shape",
    title: "State is a shape, not a column",
    body: "Values become geometry first. Geometry becomes tone. Tone becomes prose. A slider column is a spreadsheet; a polygon is a self-portrait.",
  },
  {
    id: "substance-surface",
    title: "Substance under surface",
    body: "Depth lives in one layer (shader, material, field). Form lives in another (line, foam, crest). Never ask one pass to do both jobs.",
  },
  {
    id: "av-lock",
    title: "Audio-visual lock",
    body: "What you hear should breathe with what you see. Share one LFO. Phase-lock swell, caustic brightness, and ambient gain.",
  },
  {
    id: "tape-is-time",
    title: "The tape is time",
    body: "Meaningful gestures leave a pulse that drifts. State is a time series, not a snapshot. Feedback is a wake, not a toast — useTape / useWake, SteamPlume for ephemeral copy.",
  },
  {
    id: "one-basin",
    title: "One basin per region",
    body: "Shared under-island caustic is substance, not decoration. ≤1 BasinCaustic per viewport region. Undertow owns long scroll. Lab stays off the critical path.",
  },
  {
    id: "three-registers",
    title: "Three registers, never one",
    body: "Devotional, operational, oceanic. A surface is on-brand when at least two are present and none dominates.",
  },
  {
    id: "phenomenology",
    title: "Phenomenology over explanation",
    body: "One inscribed line. The rest must be felt. If the user has to read a paragraph to understand a control, the control failed the water test.",
  },
  {
    id: "ritual-controls",
    title: "Ritual over instant",
    body: "Calm, discharge, pour, defibrillate — these ramp, decay, or demand hold-release. Feeling outranks efficiency for consequential actions.",
  },
  {
    id: "touch-first",
    title: "Touch surfaces are first-class",
    body: "Pointer capture on drags. Forty-four pixel targets. Haptics on meaningful moments. Hover is a preview; press is a commitment.",
  },
  {
    id: "type-moves",
    title: "Typography moves",
    body: "Words breathe, repel from the cursor, wrap around shapes, and phase-offset across a line like swell. Static type is a missed modality.",
  },
  {
    id: "propagation",
    title: "Propagation is the grammar",
    body: "touch → wavefront → decay → audio → tape → reread. Export this grammar more than any single shader.",
  },
  {
    id: "reduced-motion",
    title: "Reduced motion is respect",
    body: "Freeze animation. Keep single-frame interaction and audio cues when they still communicate. Stillness is not emptiness.",
  },
  {
    id: "all-scales",
    title: "Water at every scale",
    body: "Droplet, rain, sink, pool, river, lake, beach, waves, ocean, clouds, snow, ice, steam, storm — each scale owns a physics, a motion register, and a UI job. Ocean is one octave, not the whole instrument.",
  },
] as const;

export const learnings = [
  {
    source: "Sea / Ocean",
    lesson:
      "Dual canvas (WebGL depth + 2D foam) plus shared ripple uniforms make water feel like a window, not decoration.",
  },
  {
    source: "Concern Field",
    lesson:
      "Replacing sliders with a draggable polygon made state hearable, visible, and shareable as one object.",
  },
  {
    source: "Tide / Watch",
    lesson:
      "Scrubbing time and dwelling on objects beats explanatory UI. The room teaches by responding.",
  },
  {
    source: "Storm / Plasma",
    lesson:
      "Rotary dials and nested rings outperform linear ranges when the metaphor is helm, prism, or wheel.",
  },
  {
    source: "Pretext / WaterText",
    lesson:
      "Measured typography that moves with phase or cursor turns reading into an instrument.",
  },
  {
    source: "Signal / Pulse / Charts",
    lesson:
      "Oscilloscopes, spectra, and candles are UI — drag the data, hear the channel, pin the wake.",
  },
  {
    source: "Aphros / Jewel / Coin",
    lesson:
      "Physical objects (shells, gems, medals) map cleanly to notes, chords, and friction waves.",
  },
  {
    source: "Waves poem / Beyond",
    lesson:
      "Scroll thresholds and fold-memory hotspots turn navigation into recording and place into residue.",
  },
] as const;

export const registers = [
  {
    name: "devotional",
    examples: ["candle", "vigil", "keep", "inscription", "calm"],
  },
  {
    name: "operational",
    examples: ["calibrate", "route", "pin", "compose", "scrub"],
  },
  {
    name: "oceanic",
    examples: ["swell", "horizon", "wake", "crest", "depth"],
  },
] as const;
