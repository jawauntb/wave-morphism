"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Undertow Scroll — the long-scroll pattern.
 * Depth rail replaces dual scrollbars. Sections pressure-shift with depth.
 * Prefer this over nested overflow + native chrome for chaptered content.
 */
export function UndertowScroll({
  sections,
  className = "",
  height = 320,
}: {
  sections: { id: string; title: string; body: string }[];
  className?: string;
  height?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [depth, setDepth] = useState(0);
  const [markers, setMarkers] = useState<{ id: string; t: number }[]>([]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const max = el.scrollHeight - el.clientHeight;
      const t = max > 0 ? el.scrollTop / max : 0;
      setDepth(t);
      setMarkers(
        sections.map((s, i) => ({
          id: s.id,
          t: sections.length <= 1 ? 0 : i / (sections.length - 1),
        }))
      );
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [sections]);

  return (
    <div className={`relative ${className}`}>
      <div
        ref={ref}
        className="undertow-scroll overflow-y-auto overscroll-contain pr-10"
        style={{ height }}
        tabIndex={0}
        role="region"
        aria-label="undertow scroll"
      >
        {sections.map((s, i) => {
          const anchor = sections.length <= 1 ? 0 : i / (sections.length - 1);
          const offset = (depth - anchor) * -10;
          return (
            <section
              key={s.id}
              id={s.id}
              className="relative px-6 py-10"
              style={{
                transform: `translateY(${offset}px)`,
                background: `linear-gradient(180deg, rgba(var(--paper-rgb), ${0.94 - depth * 0.28}), rgba(var(--sea-rgb), ${0.05 + depth * 0.2}))`,
              }}
            >
              <svg
                className="pointer-events-none absolute inset-x-0 top-0 h-4 w-full opacity-50"
                viewBox="0 0 200 12"
                preserveAspectRatio="none"
                aria-hidden
              >
                <path
                  d={`M 0 6 Q 50 ${4 - depth * 2} 100 6 T 200 6`}
                  fill="none"
                  stroke="rgba(var(--crest-rgb), 0.55)"
                  strokeWidth="1.25"
                />
              </svg>
              <p className="t-eyebrow text-candle">pressure · {i + 1}</p>
              <h3 className="mt-1 font-serif text-2xl italic">{s.title}</h3>
              <p className="mt-3 max-w-prose text-ink-2">{s.body}</p>
            </section>
          );
        })}
      </div>
      <div className="pointer-events-none absolute bottom-3 right-1 top-3 w-9">
        <svg
          className="h-full w-full"
          viewBox="0 0 28 200"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d={`M 14 4
                Q ${16 + depth * 3} 50 14 100
                Q ${12 - depth * 3} 150 14 196`}
            fill="none"
            stroke="rgba(var(--deep-rgb), 0.4)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d={`M 14 4
                Q ${16 + depth * 3} 50 14 ${4 + depth * 192}`}
            fill="none"
            stroke="var(--candle)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {markers.map((m) => (
            <circle
              key={m.id}
              cx={14}
              cy={4 + m.t * 192}
              r={2.5}
              fill="rgba(var(--crest-rgb), 0.9)"
            />
          ))}
          <circle cx={14} cy={4 + depth * 192} r={5} fill="var(--candle)" />
        </svg>
        <p
          className="mt-1 t-eyebrow text-ink-2"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          {Math.round(depth * 100)}m
        </p>
      </div>
    </div>
  );
}
