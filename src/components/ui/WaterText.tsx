"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";
// offsets drive per-word transforms

type Props = {
  children: string;
  as?: ElementType;
  className?: string;
  radius?: number;
  strength?: number;
  style?: CSSProperties;
};

export function WaterText({
  children,
  as: Tag = "span",
  className = "",
  radius = 120,
  strength = 14,
  style,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const [offsets, setOffsets] = useState<{ x: number; y: number }[]>([]);
  const words = children.split(/(\s+)/);
  const targets = useRef<{ x: number; y: number }[]>([]);
  const current = useRef<{ x: number; y: number }[]>([]);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const reduced = useRef(false);

  useEffect(() => {
    const n = words.filter((w) => w.trim()).length;
    targets.current = Array.from({ length: n }, () => ({ x: 0, y: 0 }));
    current.current = Array.from({ length: n }, () => ({ x: 0, y: 0 }));
    setOffsets(current.current.map((o) => ({ ...o })));
  }, [children]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduced.current = mq.matches;
    const onChange = () => {
      reduced.current = mq.matches;
    };
    mq.addEventListener("change", onChange);

    let raf = 0;
    const tick = () => {
      if (!reduced.current) {
        const el = ref.current;
        if (el) {
          const spans = el.querySelectorAll<HTMLElement>("[data-wt]");
          spans.forEach((span, i) => {
            const rect = span.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            let tx = 0;
            let ty = 0;
            if (pointer.current) {
              const dx = cx - pointer.current.x;
              const dy = cy - pointer.current.y;
              const dist = Math.hypot(dx, dy);
              if (dist < radius && dist > 0.001) {
                const f = (1 - dist / radius) ** 2;
                tx = (dx / dist) * f * strength;
                ty = (dy / dist) * f * strength;
              }
            }
            targets.current[i] = { x: tx, y: ty };
            const c = current.current[i] ?? { x: 0, y: 0 };
            c.x += (tx - c.x) * 0.18;
            c.y += (ty - c.y) * 0.18;
            current.current[i] = c;
          });
          setOffsets(current.current.map((o) => ({ ...o })));
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onMove = (e: PointerEvent) => {
      pointer.current = { x: e.clientX, y: e.clientY };
    };
    const onLeave = () => {
      pointer.current = null;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      mq.removeEventListener("change", onChange);
    };
  }, [radius, strength]);

  let wordIndex = 0;
  const nodes: ReactNode[] = words.map((part, i) => {
    if (!part.trim()) return <span key={i}>{part}</span>;
    const idx = wordIndex++;
    const o = offsets[idx] ?? { x: 0, y: 0 };
    return (
      <span
        key={i}
        data-wt
        style={{
          display: "inline-block",
          transform: `translate3d(${o.x}px, ${o.y}px, 0)`,
          willChange: "transform",
        }}
      >
        {part}
      </span>
    );
  });

  return (
    <Tag ref={ref as never} className={className} style={style}>
      {nodes}
    </Tag>
  );
}

export function BreathHero({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  const words = children.split(/\s+/);
  return (
    <h1 className={`t-display ${className}`}>
      {words.map((w, i) => (
        <span
          key={`${w}-${i}`}
          className="breath-word"
          style={{ animationDelay: `${i * 0.18}s` }}
        >
          {w}
          {i < words.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </h1>
  );
}

export function useLocalPointer() {
  return useCallback((e: React.PointerEvent, el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);
}
