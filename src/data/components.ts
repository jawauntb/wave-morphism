export type ComponentTier = "core" | "lab";

export type ComponentDoc = {
  slug: string;
  name: string;
  category: "foundation" | "primitive" | "control" | "surface" | "ritual" | "chrome";
  /** core = ship in products; lab = research / optional instruments */
  tier: ComponentTier;
  traditional: string;
  summary: string;
  when: string;
  props: { name: string; type: string; note: string }[];
  snippet: string;
};

/**
 * The public kit — twelve surfaces. Everything else is lab attic.
 * If it isn't on this list, it isn't on the critical path.
 */
export const CORE_SLUGS = [
  "wave-button",
  "phase-chip",
  "swell-rail",
  "wave-input",
  "hold-discharge",
  "calm-decay",
  "morph-shell",
  "wave-rule",
  "drawer-wake",
  "caustic-focus",
  "undertow-scroll",
  "tape",
] as const;

export const navSections = [
  {
    title: "Start",
    items: [
      { href: "/docs/installation", label: "Install" },
      { href: "/docs/patterns", label: "Patterns" },
      { href: "/docs/proof", label: "Proof" },
      { href: "/docs/tokens", label: "Tokens" },
      { href: "/docs/philosophy", label: "Philosophy" },
    ],
  },
  {
    title: "Product",
    items: [
      { href: "/harbor", label: "Harbor · reference app" },
      { href: "/docs/settings", label: "Settings" },
      { href: "/docs/auth", label: "Auth" },
    ],
  },
  {
    title: "Twelve",
    items: [
      { href: "/docs/components/wave-button", label: "Wave Button" },
      { href: "/docs/components/phase-chip", label: "Phase Chip" },
      { href: "/docs/components/swell-rail", label: "Swell Rail" },
      { href: "/docs/components/wave-input", label: "Wave Input" },
      { href: "/docs/components/hold-discharge", label: "Hold Discharge" },
      { href: "/docs/components/calm-decay", label: "Calm Decay" },
      { href: "/docs/components/morph-shell", label: "Morph Shell" },
      { href: "/docs/components/wave-rule", label: "Wave Rule" },
      { href: "/docs/components/drawer-wake", label: "Drawer Wake" },
      { href: "/docs/components/caustic-focus", label: "Caustic Focus" },
      { href: "/docs/components/undertow-scroll", label: "Undertow Scroll" },
      { href: "/docs/components/tape", label: "Tape" },
    ],
  },
  {
    title: "Attic",
    items: [
      { href: "/docs/lab", label: "Lab instruments" },
      { href: "/docs/playground", label: "Playground" },
      { href: "/docs/scales", label: "Water scales" },
    ],
  },

] as const;

export const components: ComponentDoc[] = [
  {
    slug: "ripple-field",
    tier: "lab",
    name: "Ripple Field",
    category: "primitive",
    traditional: "Click ripple / Material ink",
    summary:
      "Top-down interference instrument. Every touch is a wavefront; multitouch sources interfere with bright constructive peaks. The atomic primitive the sea uses under the hood.",
    when: "Any surface that should feel touchable — pads, empty states, playable fields.",
    props: [
      { name: "height", type: "number", note: "Field height in px" },
      { name: "maxRipples", type: "number", note: "Default 24 active slots" },
    ],
    snippet: `<RippleField height={320} />
{/* multitouch: two fingers = two interfering sources */}`,
  },
  {
    slug: "swell-lfo",
    tier: "lab",
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
    tier: "core",
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
    tier: "lab",
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
    tier: "core",
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
    tier: "core",
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
    tier: "lab",
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
    tier: "lab",
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
    tier: "core",
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
    tier: "core",
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
    tier: "core",
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
    tier: "lab",
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
    tier: "lab",
    name: "Sea Surface",
    category: "surface",
    traditional: "Hero image / background video",
    summary:
      "Canonical dual-layer water from objet d'art: WebGL FBM caustics + depth gradient under 2D foam crests. Pointer ripples feed the shader as vec4 uniforms and displace the foam lines.",
    when: "Thresholds, immersive scenes, any page that needs a living horizon.",
    props: [
      { name: "height", type: "number", note: "Pixel height" },
      { name: "intensity", type: "0..1", note: "Ripple amplitude scale" },
      { name: "showFoam", type: "boolean", note: "2D swell lines on top" },
    ],
    snippet: `<SeaSurface height={320} intensity={0.9} showFoam />`,
  },
  {
    slug: "drawer-wake",
    tier: "core",
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
    tier: "lab",
    name: "Oscilloscope",
    category: "surface",
    traditional: "Progress / chart / meter",
    summary:
      "Phosphor-fade multi-channel scope with glow passes, grid, and a scanning beam. Stress drives amplitude and noise — the room's vitals as waves.",
    when: "Live status, vitals, multi-signal monitoring, playable charts.",
    props: [
      { name: "stress", type: "0..1", note: "Drives amplitude + noise" },
      { name: "height", type: "number", note: "Canvas height" },
    ],
    snippet: `<Oscilloscope stress={0.4} height={180} />`,
  },
  {
    slug: "progress-wake",
    tier: "lab",
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
  {
    slug: "wind-rose",
    tier: "lab",
    name: "Wind Rose",
    category: "control",
    traditional: "Direction slider / compass picker",
    summary:
      "360° bearing control from the storm instrument. Drag the arrow; N/E/S/W ticks orient the field. Writes soft tape pulses as you turn.",
    when: "Wind, heading, phase offset, any circular direction that shouldn't be a linear range.",
    props: [
      { name: "value", type: "radians", note: "0 = east, π/2 = south" },
      { name: "onChange", type: "(rad) => void", note: "Continuous while dragging" },
      { name: "size", type: "number", note: "Default 96" },
    ],
    snippet: `<WindRose value={wind} onChange={setWind} label="wind" />`,
  },
  {
    slug: "storm-surface",
    tier: "lab",
    name: "Storm Surface",
    category: "surface",
    traditional: "Intensity slider + weather widget",
    summary:
      "Sea at peak intensity: WebGL storm/maelstrom depth, 2D foam claws, spray particles, wind streaks, lightning. Helm dial, wind rose, maelstrom toggle, calm decay.",
    when: "High-energy scenes, destructive confirmations' backdrop, any control surface that should rage then settle.",
    props: [
      { name: "intensity", type: "0..1", note: "Initial storm scalar" },
      { name: "showControls", type: "boolean", note: "Helm + wind + rituals" },
      { name: "height", type: "number", note: "Pixel height" },
    ],
    snippet: `<StormSurface height={360} intensity={0.6} showControls />`,
  },
  {
    slug: "plasma-orb",
    tier: "lab",
    name: "Plasma Orb",
    category: "surface",
    traditional: "Loader / status orb / avatar glow",
    summary:
      "WebGL crossed-band plasma disc with breath LFO and palette (candle, sea, flame, electric, aurora). CSS radial fallback when GL is unavailable.",
    when: "Living status marks, focus anchors, electric/plasma register chrome.",
    props: [
      { name: "size", type: "number", note: "Default 280" },
      { name: "palette", type: "PlasmaPalette", note: "candle | sea | flame | electric | aurora" },
      { name: "flicker", type: "0..1", note: "Band agitation" },
    ],
    snippet: `<PlasmaOrb size={180} palette="electric" flicker={0.55} />`,
  },
  {
    slug: "interference-field",
    tier: "lab",
    name: "Interference Field",
    category: "surface",
    traditional: "Multi-handle slider / heatmap",
    summary:
      "Standing-wave heatmap from Plasma Zone 4. Drag sources; tap empty space to add. Constructive peaks read white — the field is the control.",
    when: "Multi-source blending, spatial EQ, any value that should be a standing wave not a number.",
    props: [
      { name: "maxSources", type: "number", note: "Default 3" },
      { name: "height", type: "number", note: "Pixel height" },
    ],
    snippet: `<InterferenceField height={280} maxSources={3} />`,
  },
  {
    slug: "wave-particle-morph",
    tier: "lab",
    name: "Wave/Particle Morph",
    category: "surface",
    traditional: "Toggle / segmented control",
    summary:
      "Continuous duality dial from Plasma Zone 3: sine field morphs into discrete particles. Drag the dial or tap eight phase dots.",
    when: "Mode blends that aren't binary — wave↔particle, continuous↔discrete, analog↔digital.",
    props: [
      { name: "value", type: "0..1", note: "0 = wave, 1 = particle" },
      { name: "onChange", type: "(m) => void", note: "Optional controlled" },
    ],
    snippet: `<WaveParticleMorph value={m} onChange={setM} />`,
  },
  {
    slug: "audio-scope",
    tier: "lab",
    name: "Audio Scope",
    category: "surface",
    traditional: "Audio visualizer / EQ meter",
    summary:
      "Signal-lite: EMA spectrum, time-domain waveform with drag distortion, nautilus spiral. Driven by a local Web Audio graph; tap bins to tone.",
    when: "Hearing the room, compose waits, any surface that should make audio visible and playable.",
    props: [
      { name: "bins", type: "number", note: "Spectrum resolution, default 64" },
      { name: "height", type: "number", note: "Pixel height" },
    ],
    snippet: `<AudioScope height={320} bins={64} />`,
  },
  {
    slug: "droplet-mark",
    tier: "lab",
    name: "Droplet Mark",
    category: "control",
    traditional: "Badge / notification dot",
    summary:
      "Atomic bead of confirmation. Count coalesces into a cluster of droplets; overflow reads as max+. Surface tension settles with the swell LFO.",
    when: "Unread counts, keep marks, any single-unit touch that should feel like a bead of water.",
    props: [
      { name: "count", type: "number", note: "Bead count" },
      { name: "max", type: "number", note: "Cap before N+" },
    ],
    snippet: `<DropletMark count={3} max={9} onClick={open} />`,
  },
  {
    slug: "rain-field",
    tier: "lab",
    name: "Rain Field",
    category: "surface",
    traditional: "Activity feed / typing indicators",
    summary:
      "Distributed ambient hits as rain. Poisson arrivals wet the ground with splashlets. Tap to add a splash. Rate controls downpour.",
    when: "Multi-user presence, streaming events, ambient activity without a list.",
    props: [
      { name: "rate", type: "0..1", note: "Fall intensity" },
      { name: "height", type: "number", note: "Field height" },
    ],
    snippet: `<RainField height={200} rate={0.6} />`,
  },
  {
    slug: "pour-sustain",
    tier: "lab",
    name: "Pour Sustain",
    category: "ritual",
    traditional: "Delete confirm / irreversible submit",
    summary:
      "Hold to fill a basin past the brim line; cascade commits. Release early aborts. Vertical commitment — sink/waterfall scale.",
    when: "Destructive actions, send, any one-way pour that should feel intentional.",
    props: [
      { name: "thresholdMs", type: "number", note: "Default 1100" },
      { name: "onCommit", type: "() => void", note: "Fires at full pour" },
    ],
    snippet: `<PourSustain onCommit={deleteItem}>hold to pour</PourSustain>`,
  },
  {
    slug: "pool-well",
    tier: "lab",
    name: "Pool Well",
    category: "surface",
    traditional: "Card / inset well",
    summary:
      "Contained stillness — elliptical basin with seiche rock and meniscus edge. Content sits in a reading pool, not a rectangle.",
    when: "Focus containers, quote wells, modal basins without horizon escape.",
    props: [
      { name: "title", type: "string", note: "Optional eyebrow" },
      { name: "children", type: "ReactNode", note: "Pool contents" },
    ],
    snippet: `<PoolWell title="still water">{prose}</PoolWell>`,
  },
  {
    slug: "eddy-menu",
    tier: "lab",
    name: "Eddy Menu",
    category: "control",
    traditional: "Select / dropdown / radial menu",
    summary:
      "Nav items orbit a slow vortex. Selection pulls one into the center wake. River-scale side quests as eddies.",
    when: "Mode pickers, constellation shortcuts, any select that should feel like current.",
    props: [
      { name: "items", type: "{id,label}[]", note: "Orbiting options" },
      { name: "value", type: "string", note: "Active id" },
      { name: "onChange", type: "(id) => void", note: "Selection" },
    ],
    snippet: `<EddyMenu items={modes} value={mode} onChange={setMode} />`,
  },
  {
    slug: "lake-basin",
    tier: "lab",
    name: "Lake Basin",
    category: "surface",
    traditional: "Depth slider / overview panel",
    summary:
      "Bounded horizon with dive depth. Scrub depth to darken the basin — lake-scale overview that can go deep.",
    when: "Dashboard basins, zoom-into-detail, calm overview with a dive control.",
    props: [
      { name: "depth", type: "0..1", note: "Dive amount" },
      { name: "onDepthChange", type: "(d) => void", note: "Optional" },
    ],
    snippet: `<LakeBasin depth={0.4} onDepthChange={setDepth} />`,
  },
  {
    slug: "tide-line",
    tier: "lab",
    name: "Tide Line",
    category: "control",
    traditional: "Threshold slider / publish bar",
    summary:
      "The wet line between states. Drag the foam lace across dry sand → water. Labels mark draft / review / publish shores.",
    when: "Publish thresholds, environment switches, any binary-ish state that is really a tide.",
    props: [
      { name: "value", type: "0..1", note: "Tide position" },
      { name: "labels", type: "string[]", note: "Shore labels" },
    ],
    snippet: `<TideLine value={tide} onChange={setTide} />`,
  },
  {
    slug: "crest-meter",
    tier: "lab",
    name: "Crest Meter",
    category: "control",
    traditional: "Progress / meter / gauge",
    summary:
      "Value as wave amplitude. A living crest line whose height is the reading — waves-scale grammar for meters.",
    when: "Signal strength, charge, any 0..1 that should breathe as a crest.",
    props: [
      { name: "value", type: "0..1", note: "Crest height" },
      { name: "label", type: "string", note: "Caption" },
    ],
    snippet: `<CrestMeter value={0.72} label="signal" />`,
  },
  {
    slug: "fetch-horizon",
    tier: "lab",
    name: "Fetch Horizon",
    category: "surface",
    traditional: "Hero strip / immersive banner",
    summary:
      "Unbounded depth in a strip — sky meets sea with a breathing horizon line. Open-ocean scale without a full SeaSurface.",
    when: "Section heroes, immersive dividers, any edge that should feel like fetch.",
    props: [{ name: "height", type: "number", note: "Strip height" }],
    snippet: `<FetchHorizon height={120} />`,
  },
  {
    slug: "cloud-veil",
    tier: "lab",
    name: "Cloud Veil",
    category: "chrome",
    traditional: "Skeleton / blur overlay / private mode",
    summary:
      "Soft occlusion as drifting cloud. Obscures children without a hard blocker; label whispers through the mist.",
    when: "Loading veils, privacy fog, deferred content.",
    props: [
      { name: "active", type: "boolean", note: "Show veil" },
      { name: "label", type: "string", note: "Wait phrase" },
    ],
    snippet: `<CloudVeil active={loading} label="gathering…">{content}</CloudVeil>`,
  },
  {
    slug: "snow-settle",
    tier: "lab",
    name: "Snow Settle",
    category: "surface",
    traditional: "Badge pile / archive / quiet mode",
    summary:
      "Gentle accumulation. Flakes fall and blanket deepen with count — hush register of unread/kept items.",
    when: "Archive drift, quiet unread piles, winter tape.",
    props: [
      { name: "count", type: "number", note: "Drives flake density" },
      { name: "height", type: "number", note: "Field height" },
    ],
    snippet: `<SnowSettle count={12} height={160} />`,
  },
  {
    slug: "ice-lattice",
    tier: "lab",
    name: "Ice Lattice",
    category: "ritual",
    traditional: "Disabled / lock / read-only",
    summary:
      "Phase lock. Content freezes under a lattice; click cracks the ice; thaw melts over ~1.8s. Freeze again to re-lock.",
    when: "Permissions, frozen drafts, read-only that can intentionally thaw.",
    props: [
      { name: "locked", type: "boolean", note: "Ice state" },
      { name: "onThaw", type: "() => void", note: "Unlock" },
      { name: "onFreeze", type: "() => void", note: "Re-lock" },
    ],
    snippet: `<IceLattice locked={frozen} onThaw={unlock}>{form}</IceLattice>`,
  },
  {
    slug: "steam-plume",
    tier: "lab",
    name: "Steam Plume",
    category: "chrome",
    traditional: "Toast / snackbar",
    summary:
      "Ephemeral feedback that rises and dissolves. No return path — vapor scale. Replaces popups with heat that leaves.",
    when: "Success flashes, soft confirmations, any toast that should not demand a click.",
    props: [
      { name: "message", type: "string", note: "Plume text" },
      { name: "open", type: "boolean", note: "Show" },
      { name: "durationMs", type: "number", note: "Default 2200" },
    ],
    snippet: `<SteamPlume open={ok} message="kept." onGone={clear} />`,
  },
  {
    slug: "squall-warning",
    tier: "lab",
    name: "Squall Warning",
    category: "chrome",
    traditional: "Alert / error banner",
    summary:
      "Peak intensity as weather, not a red box. Level bar, optional flash, calm action. Storm scale that can still.",
    when: "Critical alerts, intensity warnings, errors that should offer calm.",
    props: [
      { name: "level", type: "0..1", note: "Storm scalar" },
      { name: "onCalm", type: "() => void", note: "Still the sea" },
    ],
    snippet: `<SquallWarning level={0.8} onCalm={reset} />`,
  },
  {
    slug: "tide-calendar",
    tier: "lab",
    name: "Tide Calendar",
    category: "control",
    traditional: "Date range picker",
    summary:
      "Dates as high/low marks on a lunar swell. Range select by dragging between crests — not a grid of cells.",
    when: "Booking windows, tide windows, any date range that should feel like weather.",
    props: [
      { name: "range", type: "[day, day] | null", note: "Selected day range" },
      { name: "onRangeChange", type: "fn", note: "Controlled update" },
    ],
    snippet: `<TideCalendar range={r} onRangeChange={setR} />`,
  },
  {
    slug: "resonance-match",
    tier: "lab",
    name: "Resonance Match",
    category: "ritual",
    traditional: "Password confirm field",
    summary:
      "Two waveforms must phase-lock before submit unlocks. Typing shifts phase; matching strings pull the waves into resonance.",
    when: "Confirm password, pairing rituals, any dual-entry that should feel physical.",
    props: [{ name: "onUnlock", type: "() => void", note: "Fires when locked + submit" }],
    snippet: `<ResonanceMatch onUnlock={createAccount} />`,
  },
  {
    slug: "undertow-scroll",
    tier: "core",
    name: "Undertow Scroll",
    category: "chrome",
    traditional: "Long scroll / section nav",
    summary:
      "Long scroll as diving — depth rail, pressure-shifted sections, hidden native scrollbar. The thesis pattern for chaptered reading.",
    when: "Long-form docs, journals, chaptered product copy. Prefer over dual scrollbars.",
    props: [
      { name: "sections", type: "{id,title,body}[]", note: "Content layers" },
      { name: "height", type: "number", note: "Viewport height" },
    ],
    snippet: `<UndertowScroll sections={chapters} height={320} />`,
  },
  {
    slug: "caustic-focus",
    tier: "core",
    name: "Caustic Focus",
    category: "chrome",
    traditional: "Focus ring / outline",
    summary:
      "Focus as moving caustic light that pools on the active control and leaves a short wake when tabbing away.",
    when: "Accessible focus that stays on-brand — wrap a form region with CausticFocusRoot.",
    props: [{ name: "children", type: "ReactNode", note: "Focusable subtree" }],
    snippet: `<CausticFocusRoot>{form}</CausticFocusRoot>`,
  },
  {
    slug: "harmonic-stepper",
    tier: "lab",
    name: "Harmonic Stepper",
    category: "control",
    traditional: "Number stepper",
    summary:
      "Increment/decrement as partials stacking on a fundamental. Value is heard and seen as chord density.",
    when: "Counts, octaves, intensity steps that should sing.",
    props: [
      { name: "value", type: "number", note: "Partial count" },
      { name: "fundamental", type: "Hz", note: "Base frequency" },
    ],
    snippet: `<HarmonicStepper value={n} onChange={setN} fundamental={110} />`,
  },
  {
    slug: "shoal-select",
    tier: "lab",
    name: "Shoal Select",
    category: "control",
    traditional: "Multi-select / checkbox group",
    summary:
      "Multi-select as fish that school toward the cursor. Deselect scatters them with decay.",
    when: "Tag pickers, multi-filters, playful multi-select.",
    props: [
      { name: "options", type: "{id,label}[]", note: "Fish in the shoal" },
      { name: "value", type: "string[]", note: "Selected ids" },
    ],
    snippet: `<ShoalSelect options={tags} value={sel} onChange={setSel} />`,
  },
  {
    slug: "barometric-badge",
    tier: "lab",
    name: "Barometric Badge",
    category: "control",
    traditional: "Notification badge 99+",
    summary:
      "Count as atmospheric pressure in a sealed glass. Overflow is a micro-storm — not a 99+ label.",
    when: "Notification counts, inbox pressure, urgency without numerals stacking.",
    props: [
      { name: "count", type: "number", note: "Pressure source" },
      { name: "stormAt", type: "number", note: "Threshold for storm, default 12" },
    ],
    snippet: `<BarometricBadge count={14} stormAt={12} />`,
  },
  {
    slug: "refraction-split",
    tier: "lab",
    name: "Refraction Split",
    category: "surface",
    traditional: "A/B compare / split view",
    summary:
      "Compare A/B by dragging a media boundary. A Snell-bent seam reveals the other state through the interface.",
    when: "Before/after, theme compare, dual-state reveal.",
    props: [
      { name: "a", type: "ReactNode", note: "Left medium" },
      { name: "b", type: "ReactNode", note: "Right medium" },
      { name: "value", type: "0..1", note: "Boundary position" },
    ],
    snippet: `<RefractionSplit a={<Before />} b={<After />} />`,
  },
  {
    slug: "echo-form",
    tier: "lab",
    name: "Echo Form",
    category: "surface",
    traditional: "Form + changelog",
    summary:
      "Each submission leaves a decaying ghost waveform. Form history is a readable interference pattern — not a changelog list.",
    when: "Compose, ask-the-room, any form whose past should remain audible/visible as wake.",
    props: [
      { name: "fields", type: "{name,label}[]", note: "Inputs" },
      { name: "onSubmit", type: "fn", note: "Payload handler" },
    ],
    snippet: `<EchoForm fields={fields} onSubmit={save} />`,
  },
  {
    slug: "swell-rail",
    tier: "core",
    name: "Swell Rail",
    category: "control",
    traditional: "Range input / slider",
    summary:
      "Canonical 0–1 control. A swell rail with a crest thumb — values as geometry. Policy: no native <input type=\"range\"> in the system.",
    when: "Any continuous scalar that would otherwise be a browser range. Prefer TideLine / RotaryDial / ConcernPolygon when the metaphor fits better.",
    props: [
      { name: "value", type: "number", note: "Current value" },
      { name: "onChange", type: "fn", note: "Value setter" },
      { name: "label", type: "string", note: "Accessible label + readout" },
      { name: "min / max", type: "number", note: "Default 0–1" },
    ],
    snippet: `<SwellRail value={v} onChange={setV} label="stress" />`,
  },
  {
    slug: "morph-shell",
    tier: "core",
    name: "Morph Shell",
    category: "chrome",
    traditional: "Card / panel / content island",
    summary:
      "Living wavy basin for content. Optional BasinCaustic underlay. The substrate for docs chrome — not a bordered rectangle.",
    when: "Any panel, sidebar, or content island. Prefer over content-island / rounded cards.",
    props: [
      { name: "pad", type: "boolean", note: "Default padding" },
      { name: "dark", type: "boolean", note: "Deep register fill" },
      { name: "caustic", type: "boolean", note: "Quiet WebGL under-basin (chrome only)" },
    ],
    snippet: `<MorphShell caustic>\n  {children}\n</MorphShell>`,
  },
  {
    slug: "wave-rule",
    tier: "core",
    name: "Wave Rule",
    category: "chrome",
    traditional: "HR / divider",
    summary: "Living sine divider phase-locked to the shared swell LFO. Replaces hairline rules.",
    when: "Section breaks, prop lists, any place a static <hr> would appear.",
    props: [
      { name: "amp", type: "number", note: "Wave amplitude" },
      { name: "freq", type: "number", note: "Cycles across width" },
    ],
    snippet: `<WaveRule amp={5} freq={3} />`,
  },
  {
    slug: "basin-caustic",
    tier: "lab",
    name: "Basin Caustic",
    category: "chrome",
    traditional: "Panel background / gradient wash",
    summary:
      "Shared quiet WebGL caustic material for under-island substance. Theme-driven; 2D fallback; freezes on reduced motion. Prefer one per chrome basin — not per card.",
    when: "Under MorphShell docs chrome, hero basins. Not for every widget.",
    props: [
      { name: "intensity", type: "number", note: "0–1 caustic strength" },
    ],
    snippet: `<MorphShell caustic>{/* BasinCaustic mounts inside */}</MorphShell>`,
  },
];

export function getComponent(slug: string) {
  return components.find((c) => c.slug === slug);
}

export function getCoreComponents() {
  return components.filter((c) => c.tier === "core");
}

export function getLabComponents() {
  return components.filter((c) => c.tier === "lab");
}

export const traditionalMap = [
  { from: "Slider", to: "Swell Rail / Tide Line / Rotary Dial / Concern Polygon" },
  { from: "Toggle", to: "Phase Chip / Hold Discharge / Wave↔Particle Morph" },
  { from: "Button", to: "Wave Button (ripple + tape + register)" },
  { from: "Text input", to: "Wave Input (sentence → tide)" },
  { from: "Select", to: "Constellation drawer / gem row / shell pad" },
  { from: "Tabs", to: "Phase memory rail / material chips" },
  { from: "Card", to: "Sigil card / shaped-prose drawer panel" },
  { from: "Modal", to: "Drawer Wake (tide entry, swipe dismiss)" },
  { from: "Progress", to: "Progress Wake / EKG self-draw" },
  { from: "Toast", to: "Steam plume / Tape pulse (no popup)" },
  { from: "Avatar", to: "Sigil Mark / Plasma Orb (state as identity)" },
  { from: "Color picker", to: "Light pad (hue → chord) / Plasma palette" },
  { from: "Checkbox", to: "Keep mark (chime + tape)" },
  { from: "Loading", to: "Cloud veil / Plasma Orb breath" },
  { from: "Tooltip", to: "Inscription / whisper float" },
  { from: "Nav", to: "Constellation panel / Eddy menu" },
  { from: "Compass / direction", to: "Wind Rose" },
  { from: "Weather / intensity", to: "Storm Surface (helm + maelstrom)" },
  { from: "EQ / visualizer", to: "Audio Scope (spectrum + spiral)" },
  { from: "Multi-handle blend", to: "Interference Field" },
  { from: "Disabled / lock", to: "Ice lattice → thaw" },
  { from: "Delete confirm", to: "Sink / waterfall pour" },
  { from: "Badge count", to: "Droplet coalesce / Snow settle" },
  { from: "Skeleton screen", to: "Cloud veil (soft occlusion)" },
  { from: "Timeline / stepper", to: "River flow + eddy side quests" },
  { from: "Publish threshold", to: "Beach tide line" },
  { from: "Date range", to: "Tide Calendar (drag crests)" },
  { from: "Password confirm", to: "Resonance Match (phase-lock)" },
  { from: "Focus ring", to: "Caustic Focus" },
  { from: "Number stepper", to: "Harmonic Stepper" },
  { from: "Multi-select", to: "Shoal Select / Eddy Menu" },
  { from: "Notification badge", to: "Barometric Badge (pressure → storm)" },
  { from: "A/B split", to: "Refraction Split" },
  { from: "Form history", to: "Echo Form (interference wake)" },
  { from: "Long scroll", to: "Undertow Scroll (depth rail)" },
] as const;
