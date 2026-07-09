"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { navSections } from "@/data/components";
import { WaveButton } from "@/components/ui/WaveButton";
import { DrawerWake } from "@/components/ui/Surfaces";
import { WaterText } from "@/components/ui/WaterText";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-rule bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-site items-center justify-between gap-4 px-pad-x py-3">
          <Link href="/" className="group flex items-baseline gap-3">
            <WaterText as="span" className="t-brand text-[1.35rem]" radius={80} strength={8}>
              wave-morphism
            </WaterText>
            <span className="hidden t-eyebrow text-ink-2 sm:inline">design system</span>
          </Link>
          <nav className="hidden items-center gap-5 md:flex">
            {[
              ["/docs/philosophy", "philosophy"],
              ["/docs/components/wave-button", "components"],
              ["/docs/patterns", "patterns"],
              ["/docs/playground", "playground"],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className={`t-meta transition-colors duration-wave ${
                  pathname.startsWith(href) ? "text-candle" : "text-ink-2 hover:text-ink"
                }`}
              >
                {label}
              </Link>
            ))}
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
          <ul className="space-y-1">
            {section.items.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={`block border-l-2 py-1.5 pl-3 t-meta transition-colors duration-wave ${
                      active
                        ? "border-candle text-ink"
                        : "border-transparent text-ink-2 hover:border-rule hover:text-ink"
                    }`}
                  >
                    {item.label}
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
    <div className="mx-auto grid max-w-site gap-10 px-pad-x py-10 lg:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="hidden lg:block">
        <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2">
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
    <header className="mb-10 max-w-3xl">
      {eyebrow ? <p className="mb-3 t-eyebrow text-candle">{eyebrow}</p> : null}
      <WaterText as="h1" className="t-display" radius={160} strength={12}>
        {title}
      </WaterText>
      {dek ? <p className="mt-4 t-body text-ink-2">{dek}</p> : null}
    </header>
  );
}
