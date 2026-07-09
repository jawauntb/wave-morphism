"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { navSections } from "@/data/components";
import { WaveButton } from "@/components/ui/WaveButton";
import { DrawerWake } from "@/components/ui/Surfaces";
import { WaterText } from "@/components/ui/WaterText";
import { WaveEdge, WaveRule } from "@/components/ui/WaveMorph";
import { useSwellLFO } from "@/lib/motion";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { value: swell } = useSwellLFO(0.1, 0.03);

  return (
    <>
      <header className="sticky top-0 z-30 bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-site items-center justify-between gap-4 px-pad-x py-3">
          <Link href="/" className="group flex items-baseline gap-3">
            <WaterText as="span" className="t-brand text-[1.35rem]" radius={80} strength={8}>
              wave-morphism
            </WaterText>
            <span className="hidden t-eyebrow text-ink-2 sm:inline">design system</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {[
              ["/docs/philosophy", "philosophy"],
              ["/docs/components/wave-button", "components"],
              ["/docs/patterns", "patterns"],
              ["/docs/playground", "playground"],
            ].map(([href, label]) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative px-3 py-2 t-meta transition-colors duration-wave ${
                    active ? "text-candle" : "text-ink-2 hover:text-ink"
                  }`}
                >
                  {label}
                  {active ? (
                    <span
                      className="absolute inset-x-2 bottom-0 block h-[3px] overflow-hidden"
                      aria-hidden
                    >
                      <svg viewBox="0 0 60 6" className="h-full w-full" preserveAspectRatio="none">
                        <path
                          d={`M 0 3 Q 15 ${3 - swell * 2} 30 3 T 60 3`}
                          fill="none"
                          stroke="var(--candle)"
                          strokeWidth="1.5"
                        />
                      </svg>
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
          <WaveButton
            register="oceanic"
            className="md:hidden"
            onClick={() => setOpen(true)}
            aria-label="open navigation"
          >
            menu
          </WaveButton>
        </div>
        <WaveEdge side="bottom" amp={10} fill="var(--paper)" />
      </header>
      <DrawerWake open={open} onClose={() => setOpen(false)} side="right" title="constellation">
        <DocsNav onNavigate={() => setOpen(false)} />
      </DrawerWake>
    </>
  );
}

export function DocsNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="space-y-6">
      {navSections.map((section) => (
        <div key={section.title}>
          <p className="mb-2 t-eyebrow text-ink-2">{section.title}</p>
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={`nav-wake block py-1.5 pl-3 t-meta transition-all duration-wave ${
                      active
                        ? "text-ink"
                        : "text-ink-2 hover:text-ink"
                    }`}
                    data-active={active || undefined}
                  >
                    <span className="relative">
                      {item.label}
                      {active ? (
                        <span className="nav-wake-mark" aria-hidden />
                      ) : null}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function DocsShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto grid max-w-site gap-10 px-pad-x py-10 lg:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="hidden lg:block">
        <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">
          <DocsNav />
        </div>
      </aside>
      <main className="min-w-0 pb-24">{children}</main>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  dek,
}: {
  eyebrow?: string;
  title: string;
  dek?: string;
}) {
  return (
    <header className="mb-8 max-w-3xl">
      {eyebrow ? <p className="mb-3 t-eyebrow text-candle">{eyebrow}</p> : null}
      <WaterText as="h1" className="t-display" radius={160} strength={12}>
        {title}
      </WaterText>
      <WaveRule className="mt-5 max-w-md" amp={5} freq={2.5} />
      {dek ? <p className="mt-5 t-body text-ink-2">{dek}</p> : null}
    </header>
  );
}
