export type ComponentDoc = {
  slug: string;
  name: string;
  category: "foundation" | "primitive" | "control" | "surface" | "ritual" | "chrome";
  traditional: string;
  summary: string;
  when: string;
  props: { name: string; type: string; note: string }[];
  snippet: string;
};

export const navSections = [
  {
    title: "Start",
    items: [
      { href: "/docs/philosophy", label: "Philosophy" },
      { href: "/docs/installation", label: "Installation" },
      { href: "/docs/tokens", label: "Tokens" },
      { href: "/docs/typography", label: "Typography" },
      { href: "/docs/motion", label: "Motion" },
      { href: "/docs/patterns", label: "Patterns" },
      { href: "/docs/playground", label: "Playground" },
    ],
  },
  {
    title: "Foundations",
    items: [
      { href: "/docs/components/ripple-field", label: "Ripple Field" },
      { href: "/docs/components/swell-lfo", label: "Swell LFO" },
      { href: "/docs/components/tape", label: "Tape" },
      { href: "/docs/components/water-text", label: "Water Text" },
    ],
  },
  {
    title: "Controls",
    items: [
      { href: "/docs/components/wave-button", label: "Wave Button" },
      { href: "/docs/components/phase-chip", label: "Phase Chip" },
      { href: "/docs/components/rotary-dial", label: "Rotary Dial" },
      { href: "/docs/components/concern-polygon", label: "Concern Polygon" },
      { href: "/docs/components/wave-input", label: "Wave Input" },
      { href: "/docs/components/hold-discharge", label: "Hold Discharge" },
      { href: "/docs/components/calm-decay", label: "Calm Decay" },
      { href: "/docs/components/sigil-mark", label: "Sigil Mark" },
    ],
  },
  {
    title: "Surfaces",
    items: [
      { href: "/docs/components/sea-surface", label: "Sea Surface" },
      { href: "/docs/components/drawer-wake", label: "Drawer Wake" },
      { href: "/docs/components/oscilloscope", label: "Oscilloscope" },
      { href: "/docs/components/progress-wake", label: "Progress Wake" },
    ],
  },
] as const;

export const components: ComponentDoc[] = [
  {
    slug: "ripple-field",
    name: "Ripple Field",
    category: "primitive",
    traditional: "Click ripple / Material ink",
    summary:
      "A shared wavefront buffer. Pointer events spawn gaussian ripples that decay across a canvas and can drive shaders, audio, and tape.",
    when: "Any surface that should feel touchable — cards, seas, pads, empty states.",
    props: [
      { name: "maxRipples", type: "number", note: "Default 12 active slots" },
      { name: "onRipple", type: "(r) => void", note: "Optional side effects" },
      { name: "intensity", type: "0..1", note: "Scales amplitude" },
    ],
    snippet: `<RippleField
  className="h-64 rounded-wave"
  intensity={0.8}
  onRipple={(r) => tape.pulse("touch", r.amp)}
/>`,
  },
  {
    slug: "swell-lfo",
    name: "Swell LFO",
    category: "foundation",
    traditional: "CSS animation / Framer motion loop",
    summary:
      "A 0.14 Hz breathing oscillator shared by visuals and audio so caustics, gain, and hero type stay phase-locked.",
    when: "Ambient life on a page. Prefer one shared swell over many independent loops.",
    props: [
      { name: "hz", type: "number", note: "Default 0.14" },
      { name: "driftHz", type: "number", note: "Slow tidal drift, default 0.03" },
    ],
    snippet: `const swell = useSwellLFO({ hz: 0.14 });
// swell.value ∈ [-1, 1] each frame`,
  },
  {
    slug: "tape",
    name: "Tape",
    category: "chrome",
    traditional: "Toast / snackbar / activity log",
    summary:
      "A drifting EKG strip. Gestures leave pulses that scroll right→left. Feedback becomes a wake instead of a popup.",
    when: "Session memory, confirmation, and ambient status without interrupting flow.",
    props: [
      { name: "pulse", type: "(kind, intensity) => void", note: "Record an event" },
      { name: "height", type: "number", note: "Strip height in px" },
    ],
    snippet: `<Tape />
<button onClick={() => tape.pulse("keep", 0.7)}>keep</button>`,
  },
  {
    slug: "water-text",
    name: "Water Text",
    category: "primitive",
    traditional: "Static heading / hover underline",
    summary:
      "Words displace from the cursor with quadratic falloff and lerp back — typography as a soft fluid.",
    when: "Heroes, section titles, and any line that should feel alive under pointer.",
    props: [
      { name: "as", type: "keyof JSX.IntrinsicElements", note: "Element tag" },
      { name: "radius", type: "number", note: "Influence radius in px" },
      { name: "strength", type: "number", note: "Displacement scale" },
    ],
    snippet: `<WaterText as="h1" className="t-display" radius={140}>
  wave-morphism
</WaterText>`,
  },
  {
    slug: "wave-button",
    name: "Wave Button",
    category: "control",
    traditional: "Button",
    summary:
      "Press spawns a local ripple, a tape pulse, and optional haptic. Variants map to the three registers.",
    when: "Primary actions, departure links, and ritual commits.",
    props: [
      { name: "register", type: "'devotional' | 'operational' | 'oceanic'", note: "Accent + copy tone" },
      { name: "ritual", type: "boolean", note: "Slower press with decay" },
    ],
    snippet: `<WaveButton register="oceanic" onPress={enter}>
  enter the field ↓
</WaveButton>`,
  },
  {
    slug: "phase-chip",
    name: "Phase Chip",
    category: "control",
    traditional: "Tabs / radio / toggle group",
    summary:
      "A continuous sine rail with crest nodes. Selection is a standing-wave peak that lifts the rail — not a bordered box.",
    when: "Presets, modes, materials, waveforms — any exclusive or multi-select set that should feel like crossing a threshold.",
    props: [
      { name: "options", type: "string[]", note: "Chip labels along the rail" },
      { name: "value", type: "string | string[]", note: "Controlled value" },
      { name: "multiple", type: "boolean", note: "Allow multiple crests" },
    ],
    snippet: `<PhaseChip
  options={["sine", "triangle", "square", "saw"]}
  value={wave}
  onChange={setWave}
/>`,
  },
  {
    slug: "rotary-dial",
    name: "Rotary Dial",
    category: "control",
    traditional: "Slider / range input",
    summary:
      "Nested rings for amplitude and frequency — helm metaphor. Drag angle maps to value; needle is RAF-decoupled for feel.",
    when: "Storm intensity, prism splits, any continuous value that wants a wheel not a track.",
    props: [
      { name: "value", type: "number", note: "0..1" },
      { name: "rings", type: "1 | 2", note: "Single or nested" },
      { name: "label", type: "string", note: "Center readout" },
    ],
    snippet: `<RotaryDial
  value={amp}
  onChange={setAmp}
  label="swell"
  rings={2}
/>`,
  },
  {
    slug: "concern-polygon",
    name: "Concern Polygon",
    category: "control",
    traditional: "Multi-slider form / radar chart",
    summary:
      "A liquid blob through N axis crests. Cardinal spline, tidal rings, breathing swell — the shape is the value, not a straight-edged radar.",
    when: "Multi-dimensional state that should read as one living object — preferences, mood, weights.",
    props: [
      { name: "axes", type: "string[]", note: "Axis labels" },
      { name: "values", type: "number[]", note: "0..1 per axis" },
      { name: "tones", type: "boolean", note: "Hold tone while dragging" },
    ],
    snippet: `<ConcernPolygon
  axes={CONCERNS}
  values={values}
  onChange={setValues}
  tones
/>`,
  },
  {
    slug: "wave-input",
    name: "Wave Input",
    category: "control",
    traditional: "Text input / textarea",
    summary:
      "A tide field: liquid shell, multi-layer swell that rises on focus, typing ripples, crest energy from text length. Submit releases a wake.",
    when: "Ask-the-room, compose prompts, pretext sentences — text that will be performed.",
    props: [
      { name: "mode", type: "'ask' | 'compose' | 'tide'", note: "Behavior after submit" },
      { name: "speak", type: "boolean", note: "Optional TTS path" },
    ],
    snippet: `<WaveInput
  mode="ask"
  placeholder="ask the room…"
  onSubmit={ask}
/>`,
  },
  {
    slug: "hold-discharge",
    name: "Hold Discharge",
    category: "ritual",
    traditional: "Toggle / long-press button",
    summary:
      "A storm cell you charge by holding. Rising crest fills the field; release past threshold fires lightning bolts and a flash.",
    when: "Destructive or dramatic actions that should feel intentional.",
    props: [
      { name: "thresholdMs", type: "number", note: "Default 900" },
      { name: "onDischarge", type: "() => void", note: "Fires on release after charge" },
    ],
    snippet: `<HoldDischarge
  thresholdMs={900}
  onDischarge={strike}
>
  hold for lightning
</HoldDischarge>`,
  },
  {
    slug: "calm-decay",
    name: "Calm Decay",
    category: "ritual",
    traditional: "Reset button",
    summary:
      "Still the sea over ~2s. Values ease to rest; tape records a long soft pulse. Not an instant zero.",
    when: "Resetting intensity, clearing storms, ending a session gently.",
    props: [
      { name: "durationMs", type: "number", note: "Default 2000" },
      { name: "onCalm", type: "() => void", note: "Called when settled" },
    ],
    snippet: `<CalmDecay durationMs={2000} onCalm={resetStorm}>
  still the sea
</CalmDecay>`,
  },
  {
    slug: "sigil-mark",
    name: "Sigil Mark",
    category: "control",
    traditional: "Avatar / logo / badge",
    summary:
      "A personal polygon at any size. Optional play-as-music. The mark is the state, not a decoration of it.",
    when: "Identity, kept items, OG cards, list rows, compare overlays.",
    props: [
      { name: "values", type: "number[]", note: "Axis values" },
      { name: "playable", type: "boolean", note: "Click to play phrase" },
      { name: "size", type: "number", note: "Pixel size" },
    ],
    snippet: `<SigilMark values={concerns} size={48} playable />`,
  },
  {
    slug: "sea-surface",
    name: "Sea Surface",
    category: "surface",
    traditional: "Hero image / background video",
    summary:
      "Canonical dual-layer water: WebGL caustics under 2D swell lines, shared ripples, optional audio lock.",
    when: "Thresholds, immersive scenes, any page that needs a living horizon.",
    props: [
      { name: "height", type: "string", note: "CSS height" },
      { name: "audioLock", type: "boolean", note: "Phase to swell LFO" },
      { name: "tilt", type: "boolean", note: "Device orientation slosh" },
    ],
    snippet: `<SeaSurface height="42vh" audioLock tilt />`,
  },
  {
    slug: "drawer-wake",
    name: "Drawer Wake",
    category: "surface",
    traditional: "Modal / sheet / dialog",
    summary:
      "A side drawer that arrives like a tide — content can shape-wrap a sigil. Swipe to dismiss on mobile.",
    when: "Detail panels, constellation nav, region readings — overlays that should feel spatial.",
    props: [
      { name: "side", type: "'left' | 'right'", note: "Entry edge" },
      { name: "open", type: "boolean", note: "Controlled open" },
    ],
    snippet: `<DrawerWake open={open} onClose={close} side="right">
  <ShapedProse obstacle={sigil}>{body}</ShapedProse>
</DrawerWake>`,
  },
  {
    slug: "oscilloscope",
    name: "Oscilloscope",
    category: "surface",
    traditional: "Progress / chart / meter",
    summary:
      "Scrolling ring-buffer traces. Channels can be audible. Patterns save as URL hashes.",
    when: "Live status, vitals, multi-signal monitoring, playable charts.",
    props: [
      { name: "channels", type: "Channel[]", note: "Named ring buffers" },
      { name: "audible", type: "boolean", note: "Per-channel tones" },
    ],
    snippet: `<Oscilloscope
  channels={[hr, breath, bp]}
  audible
/>`,
  },
  {
    slug: "progress-wake",
    name: "Progress Wake",
    category: "surface",
    traditional: "Progress bar / spinner",
    summary:
      "A self-drawing EKG or amber→cyan fill. Pending state shimmers like heat on water — never a spinner.",
    when: "Compose waits, uploads, long rituals, any indeterminate wait that should stay on-brand.",
    props: [
      { name: "value", type: "number | null", note: "null = indeterminate" },
      { name: "variant", type: "'ekg' | 'fill'", note: "Visual mode" },
    ],
    snippet: `<ProgressWake value={progress} variant="ekg" />`,
  },
];

export function getComponent(slug: string) {
  return components.find((c) => c.slug === slug);
}

export const traditionalMap = [
  { from: "Slider", to: "Rotary Dial / Concern Polygon / drag-the-wave" },
  { from: "Toggle", to: "Phase Chip / Hold Discharge / Pour Sustain" },
  { from: "Button", to: "Wave Button (ripple + tape + register)" },
  { from: "Text input", to: "Wave Input (sentence → tide)" },
  { from: "Select", to: "Constellation drawer / gem row / shell pad" },
  { from: "Tabs", to: "Phase memory rail / material chips" },
  { from: "Card", to: "Sigil card / shaped-prose drawer panel" },
  { from: "Modal", to: "Drawer Wake (tide entry, swipe dismiss)" },
  { from: "Progress", to: "Progress Wake / EKG self-draw" },
  { from: "Toast", to: "Tape pulse (no popup)" },
  { from: "Avatar", to: "Sigil Mark (state as identity)" },
  { from: "Color picker", to: "Light pad (hue → chord)" },
  { from: "Checkbox", to: "Keep mark (chime + tape)" },
  { from: "Loading", to: "Pending shimmer / wait phrases" },
  { from: "Tooltip", to: "Inscription / whisper float" },
  { from: "Nav", to: "Constellation panel with sigil rows" },
] as const;
