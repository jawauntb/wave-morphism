import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "var(--paper)",
        "paper-2": "var(--paper-2)",
        ink: "var(--ink)",
        "ink-2": "var(--ink-2)",
        rule: "var(--rule)",
        candle: "var(--candle)",
        sea: "var(--sea)",
        kept: "var(--kept)",
        field: "var(--field)",
        deep: "var(--deep)",
        "deep-2": "var(--deep-2)",
        crest: "var(--crest)",
        haze: "var(--haze)",
        "on-deep": "var(--on-deep)",
        "on-deep-2": "var(--on-deep-2)",
      },
      maxWidth: {
        site: "var(--max)",
      },
      padding: {
        "pad-x": "var(--pad-x)",
      },
      fontFamily: {
        serif: ["var(--font-serif)"],
        mono: ["var(--font-text)"],
      },
      transitionTimingFunction: {
        wave: "cubic-bezier(0.2, 0.6, 0.2, 1)",
      },
      borderRadius: {
        wave: "var(--radius-wave)",
      },
    },
  },
  plugins: [],
};
export default config;
