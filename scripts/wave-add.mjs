#!/usr/bin/env node
/**
 * wave add <name> — shadcn-shaped copy path.
 * Prints the files to copy for a surface. No network; local map only.
 *
 *   node scripts/wave-add.mjs button
 *   npm run wave -- rail
 */

const REGISTRY = {
  button: {
    files: ["src/components/ui/WaveButton.tsx"],
    note: "press verb · ripple + tape",
  },
  rail: {
    files: ["src/components/ui/SwellRail.tsx"],
    note: "change verb · 0–1 · no native range",
  },
  chip: {
    files: ["src/components/ui/PhaseChip.tsx"],
    note: "change verb · discrete crest nodes",
  },
  input: {
    files: ["src/components/ui/WaveInput.tsx"],
    note: "compose / ask · tide field",
  },
  shell: {
    files: ["src/components/ui/WaveMorph.tsx", "src/components/canvas/BasinCaustic.tsx"],
    note: "MorphShell quiet · optional one basin",
  },
  focus: {
    files: ["src/components/ui/CausticFocus.tsx"],
    note: "the only focus system",
  },
  undertow: {
    files: ["src/components/ui/UndertowScroll.tsx"],
    note: "long scroll · depth rail",
  },
  wake: {
    files: ["src/lib/wake.tsx", "src/lib/tape.tsx"],
    note: "announce() = tape + steam",
  },
  hold: {
    files: ["src/components/ui/WaveInput.tsx"],
    note: "HoldDischarge + CalmDecay live here",
  },
  drawer: {
    files: ["src/components/ui/Surfaces.tsx"],
    note: "DrawerWake · Escape dismiss",
  },
  core: {
    files: [
      "src/app/globals.css",
      "src/data/themes.ts",
      "src/lib/theme.tsx",
      "src/lib/motion.ts",
      "src/lib/tape.tsx",
      "src/components/ui/WaveButton.tsx",
      "src/components/ui/WaveMorph.tsx",
      "src/components/ui/SwellRail.tsx",
    ],
    note: "8-file install — paste and ship",
  },
};

const name = (process.argv[2] || "").toLowerCase().replace(/^wave-?/, "");

if (!name || name === "help" || name === "--help") {
  console.log(`wave add <name>

Surfaces: ${Object.keys(REGISTRY).join(" · ")}

Example:
  npm run wave -- button
  npm run wave -- core
`);
  process.exit(name ? 0 : 1);
}

const entry = REGISTRY[name];
if (!entry) {
  console.error(`Unknown surface "${name}". Try: ${Object.keys(REGISTRY).join(", ")}`);
  process.exit(1);
}

console.log(`\nwave add ${name}`);
console.log(`  ${entry.note}\n`);
console.log("Copy these files into your app:\n");
for (const f of entry.files) {
  console.log(`  ${f}`);
}
console.log(`
Also need ThemeProvider + TapeProvider (see /docs/installation).
Harbor reference: /harbor
`);
