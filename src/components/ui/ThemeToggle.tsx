"use client";

import { useTheme } from "@/lib/theme";
import { useTape } from "@/lib/tape";

type Props = {
  className?: string;
  /** compact = swatch row only; full = name + epithet */
  variant?: "compact" | "full";
};

/**
 * Theme toggle — cycle or pick among water-scale color systems.
 * Writes a soft tape pulse on change.
 */
export function ThemeToggle({ className = "", variant = "compact" }: Props) {
  const { theme, themeId, themes, setTheme, cycleTheme } = useTheme();
  const { pulse } = useTape();

  const pick = (id: typeof themeId) => {
    setTheme(id);
    pulse("phase", 0.4);
  };

  if (variant === "full") {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex flex-wrap gap-3">
          {themes.map((t) => {
            const active = t.id === themeId;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => pick(t.id)}
                className={`group relative min-w-[9.5rem] flex-1 overflow-hidden text-left transition-transform duration-wave ${
                  active ? "-translate-y-0.5" : "opacity-80 hover:opacity-100"
                }`}
                aria-pressed={active}
              >
                <span
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(145deg, ${t.ambient[0]}, ${t.ambient[2]}, ${t.ambient[4]})`,
                  }}
                  aria-hidden
                />
                <span
                  className="absolute inset-x-0 bottom-0 h-1"
                  style={{
                    background: `linear-gradient(90deg, ${t.candle}, ${t.sea}, ${t.crest})`,
                  }}
                  aria-hidden
                />
                <span className="relative block p-4">
                  <span className="t-eyebrow" style={{ color: t.ink2 }}>
                    {t.scale}
                  </span>
                  <span
                    className="mt-1 block font-serif text-xl italic"
                    style={{ color: t.ink }}
                  >
                    {t.name}
                  </span>
                  <span className="mt-1 block text-xs" style={{ color: t.ink2 }}>
                    {t.epithet}
                  </span>
                  <span className="mt-3 flex gap-1.5">
                    {[t.paper, t.candle, t.sea, t.crest, t.deep].map((c) => (
                      <span
                        key={c}
                        className="h-3 w-3 rounded-sm"
                        style={{ background: c, boxShadow: `0 0 0 1px ${t.ink}22` }}
                      />
                    ))}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        <p className="t-meta text-ink-2">
          active · {theme.name} · {theme.phase} phase · evokes {theme.scale}
        </p>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <button
        type="button"
        onClick={() => {
          cycleTheme();
          pulse("phase", 0.35);
        }}
        className="t-meta text-ink-2 transition-colors duration-wave hover:text-candle"
        aria-label={`theme: ${theme.name}. click to cycle`}
        title={`${theme.name} — ${theme.epithet}`}
      >
        {theme.name.toLowerCase()}
      </button>
      <div className="flex items-center gap-1" role="radiogroup" aria-label="color theme">
        {themes.map((t) => {
          const active = t.id === themeId;
          return (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={t.name}
              title={`${t.name} — ${t.epithet}`}
              onClick={() => pick(t.id)}
              className="relative h-4 w-4 rounded-full transition-transform duration-wave hover:scale-110"
              style={{
                background: `linear-gradient(135deg, ${t.candle}, ${t.sea})`,
                boxShadow: active
                  ? `0 0 0 2px var(--paper), 0 0 0 3px ${t.sea}`
                  : `0 0 0 1px rgba(var(--ink-rgb), 0.2)`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
