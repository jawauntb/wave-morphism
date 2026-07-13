/**
 * Water at every scale — the design vocabulary of wave-morphism.
 * From bead to storm, liquid → solid → vapor. Each scale owns
 * a physics metaphor, a motion register, and a UI job.
 */

export type WaterPhase = "liquid" | "solid" | "vapor" | "mixed";

export type WaterScale = {
  id: string;
  name: string;
  phase: WaterPhase;
  /** Rough spatial order: 0 = molecular/bead … 1 = planetary weather */
  order: number;
  epithet: string;
  physics: string;
  uiJob: string;
  motion: string;
  replaces: string[];
  components: string[];
  proposed: string[];
  tokens: {
    amp: string;
    decay: string;
    color: string;
  };
};

export const waterScales: WaterScale[] = [
  {
    id: "droplet",
    name: "Droplet",
    phase: "liquid",
    order: 0.05,
    epithet: "the unit of touch",
    physics: "Surface tension · single impact · bead coalescence",
    uiJob: "Atomic confirmation. One press = one bead. Coalesce beads into a pool when many accumulate.",
    motion: "Impact → ring (80–180ms) → surface tension settle",
    replaces: ["Click ripple", "Dot indicator", "Unread badge (as bead)"],
    components: ["RippleField (single)", "WaveButton crest", "DropletMark"],
    proposed: ["BeadCounter", "CoalesceStack"],
    tokens: { amp: "2–6px", decay: "180ms", color: "candle highlight on sea" },
  },
  {
    id: "rain",
    name: "Rain",
    phase: "liquid",
    order: 0.12,
    epithet: "distributed touch",
    physics: "Many independent impacts · Poisson arrival · soft ground response",
    uiJob: "Ambient activity, multi-user presence, streaming events as discrete hits that wet the surface.",
    motion: "Staggered falls · splashlets · ground darkening",
    replaces: ["Activity feed ticks", "Typing indicators (many)", "Particle confetti"],
    components: ["Tape (as rain on strip)", "RippleField multitouch", "RainField"],
    proposed: ["WetnessMap", "DownpourBadge"],
    tokens: { amp: "1–3px hits", decay: "120–400ms", color: "sea → paper wet" },
  },
  {
    id: "sink",
    name: "Sink / Waterfall",
    phase: "liquid",
    order: 0.18,
    epithet: "vertical commitment",
    physics: "Gravity-led flow · pour · cascade over lip · irreversible drop",
    uiJob: "Destructive or one-way actions. Hold to pour; release mid-pour aborts; full pour commits.",
    motion: "Fill → brim → cascade (irreversible after lip)",
    replaces: ["Delete confirm", "Send", "Submit irreversible"],
    components: ["HoldDischarge", "CalmDecay (inverse)", "PourSustain"],
    proposed: ["CascadeRail", "BrimThreshold"],
    tokens: { amp: "full height", decay: "pour 600–1400ms", color: "sea falling to deep" },
  },
  {
    id: "pool",
    name: "Pool",
    phase: "liquid",
    order: 0.28,
    epithet: "contained stillness",
    physics: "Bounded basin · reflection · slow seiche · edge meniscus",
    uiJob: "Focus containers, reading wells, modal basins that hold content without horizon escape.",
    motion: "Seiche rock · mirror blur · meniscus edge",
    replaces: ["Card", "Well", "Inset panel"],
    components: ["MorphShell", "DrawerWake", "content-island", "PoolWell"],
    proposed: ["MeniscusFrame", "ReflectionPane"],
    tokens: { amp: "2–4px seiche", decay: "1.2–2.5s", color: "paper island on tide" },
  },
  {
    id: "river",
    name: "River",
    phase: "liquid",
    order: 0.38,
    epithet: "directed current",
    physics: "Channel flow · banks · eddies · downstream memory",
    uiJob: "Process flows, timelines, wizards — content moves downstream; banks constrain; eddies hold side quests.",
    motion: "Laminar → turbulent · bank wake · eddy trap",
    replaces: ["Stepper", "Timeline", "Kanban column flow"],
    components: ["ProgressWake", "Tape", "EddyMenu"],
    proposed: ["RiverFlow", "BankConstraint"],
    tokens: { amp: "flow speed", decay: "eddy 2–4s", color: "sea channel" },
  },
  {
    id: "lake",
    name: "Lake",
    phase: "liquid",
    order: 0.48,
    epithet: "bounded horizon",
    physics: "Large calm body · distant shore · wind chop · depth under glass",
    uiJob: "Dashboard basins, overview surfaces — calm enough to read, deep enough to dive.",
    motion: "Long-period chop · shore haze · dive parallax",
    replaces: ["Dashboard", "Overview grid", "Home canvas"],
    components: ["SeaSurface (calm)", "AmbientField", "LakeBasin"],
    proposed: ["ShoreHaze", "DepthDive"],
    tokens: { amp: "4–10px chop", decay: "3–8s", color: "azure → prussian" },
  },
  {
    id: "beach",
    name: "Beach",
    phase: "liquid",
    order: 0.55,
    epithet: "the wet line",
    physics: "Tide line · wet/dry sand · foam lace · backwash",
    uiJob: "Thresholds between states — draft/publish, private/public, land/sea. The line itself is interactive.",
    motion: "Advance · lace · backwash · stain memory",
    replaces: ["Toggle threshold", "Publish bar", "Environment switch"],
    components: ["PhaseChip", "WaveEdge", "TideLine"],
    proposed: ["WetSandMemory", "FoamLace"],
    tokens: { amp: "tide travel", decay: "backwash 800ms", color: "paper wet → dry" },
  },
  {
    id: "waves",
    name: "Waves",
    phase: "liquid",
    order: 0.62,
    epithet: "periodic grammar",
    physics: "Frequency · amplitude · interference · crest/trough",
    uiJob: "The default control language — every dial, chip, and rule speaks in period and crest.",
    motion: "Swell LFO · crest break · constructive peak",
    replaces: ["Slider", "Progress", "Divider", "Animation loop"],
    components: ["WaveRule", "SwellLFO", "PhaseChip", "RotaryDial", "Oscilloscope", "CrestMeter"],
    proposed: ["PeriodPicker"],
    tokens: { amp: "swell ±1", decay: "wave period", color: "sea + candle crest" },
  },
  {
    id: "ocean",
    name: "Open Ocean",
    phase: "liquid",
    order: 0.72,
    epithet: "unbounded depth",
    physics: "Horizon · swell trains · fetch · no visible shore",
    uiJob: "Immersive scenes, hero fields, full-bleed instruments. Depth without edge.",
    motion: "Long swell · caustic depth · horizon breathe",
    replaces: ["Hero video", "Full-bleed bg", "Immersive mode"],
    components: ["SeaSurface", "AmbientField", "StormSurface (calm end)", "FetchHorizon"],
    proposed: ["SwellTrain"],
    tokens: { amp: "swell trains", decay: "∞ ambient", color: "full depth gradient" },
  },
  {
    id: "clouds",
    name: "Clouds",
    phase: "vapor",
    order: 0.58,
    epithet: "soft occlusion",
    physics: "Condensed vapor · drift · soft shadow · occasional break",
    uiJob: "Loading veils, privacy fog, deferred content — obscure without hard blockers.",
    motion: "Drift · thicken · break to blue",
    replaces: ["Skeleton screen", "Blur overlay", "Private mode veil"],
    components: ["CloudVeil"],
    proposed: ["FogPrivacy", "BreakToBlue"],
    tokens: { amp: "opacity 0.15–0.7", decay: "drift 8–20s", color: "paper mist on sea" },
  },
  {
    id: "snow",
    name: "Snow",
    phase: "solid",
    order: 0.42,
    epithet: "soft accumulation",
    physics: "Crystal fall · settle · blanket · quiet",
    uiJob: "Gentle accumulation of unread/kept items; hush mode; winter register of the tape.",
    motion: "Fall · settle · blanket deepen · hush gain",
    replaces: ["Badge count pile", "Quiet mode", "Archive drift"],
    components: ["Tape (winter palette)", "SnowSettle"],
    proposed: ["BlanketDepth", "HushGain"],
    tokens: { amp: "flake 1–2px", decay: "settle 2–6s", color: "paper crystal" },
  },
  {
    id: "ice",
    name: "Ice",
    phase: "solid",
    order: 0.35,
    epithet: "phase lock",
    physics: "Lattice · fracture · thaw · rigid until stress",
    uiJob: "Locked state, frozen drafts, permissions — rigid until intentional thaw or crack.",
    motion: "Lock snap · stress crack · thaw melt",
    replaces: ["Disabled state", "Lock icon", "Read-only"],
    components: ["CalmDecay (as freeze)", "IceLattice"],
    proposed: ["ThawControl", "FractureConfirm"],
    tokens: { amp: "0 until crack", decay: "thaw 1.5–3s", color: "glacial cyan" },
  },
  {
    id: "steam",
    name: "Steam",
    phase: "vapor",
    order: 0.22,
    epithet: "rising dissipation",
    physics: "Phase change up · plume · dissolve into air",
    uiJob: "Ephemeral feedback that leaves — toasts that rise and vanish, heat of a just-completed action.",
    motion: "Rise · plume · dissolve (no return)",
    replaces: ["Toast", "Snackbar", "Success flash"],
    components: ["Tape pulse (as steam mark)", "SteamPlume"],
    proposed: ["HeatGhost", "DissipateToast"],
    tokens: { amp: "rise 40–120px", decay: "600–1200ms", color: "paper vapor" },
  },
  {
    id: "storm",
    name: "Storm",
    phase: "mixed",
    order: 0.88,
    epithet: "peak intensity",
    physics: "Wind · maelstrom · lightning · spray · then calm",
    uiJob: "High-stakes intensity surfaces — rage, then still. Never leave the user in permanent storm.",
    motion: "Build · peak · lightning · calm decay",
    replaces: ["Error explosion", "Critical alert wall", "Intensity slider"],
    components: ["StormSurface", "WindRose", "HoldDischarge", "CalmDecay", "SquallWarning"],
    proposed: ["EyeOfStorm"],
    tokens: { amp: "0.5–1.0 storm", decay: "calm 2s", color: "sky→prussian + flash" },
  },
];

export const scaleBands = [
  {
    id: "micro",
    label: "micro",
    range: "bead → pour",
    ids: ["droplet", "rain", "steam", "sink"],
  },
  {
    id: "meso",
    label: "meso",
    range: "basin → channel",
    ids: ["pool", "ice", "snow", "river", "lake", "beach"],
  },
  {
    id: "macro",
    label: "macro",
    range: "period → weather",
    ids: ["waves", "clouds", "ocean", "storm"],
  },
] as const;

export function getScale(id: string) {
  return waterScales.find((s) => s.id === id);
}
