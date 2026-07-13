"use client";

import { useState } from "react";
import { DocsShell, PageHeader } from "@/components/layout/Chrome";
import { MorphShell, WaveRule } from "@/components/ui/WaveMorph";
import { WaveButton } from "@/components/ui/WaveButton";
import { PhaseChip } from "@/components/ui/PhaseChip";
import { SwellRail } from "@/components/ui/SwellRail";
import { TideLine } from "@/components/ui/ScalePrimitives";
import { WaveInput, HoldDischarge, CalmDecay } from "@/components/ui/WaveInput";
import { ProgressWake, DrawerWake } from "@/components/ui/Surfaces";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { AtmosphereToggle } from "@/components/ui/AtmosphereToggle";
import { CausticFocusRoot } from "@/components/ui/CausticFocus";
import { useWake } from "@/lib/wake";

/**
 * Density demo — wave-morphism competing with glass on a settings screen.
 * Quiet chrome, tide fields, core controls only. Tape + steam for feedback.
 */
export default function SettingsDemoPage() {
  const { announce, pulse, Wake } = useWake();
  const [channel, setChannel] = useState("signal");
  const [notify, setNotify] = useState(0.55);
  const [tide, setTide] = useState(0.4);
  const [progress, setProgress] = useState<number | null>(0.62);
  const [drawer, setDrawer] = useState(false);
  const [msg, setMsg] = useState("preferences held in the room.");
  const [displayName, setDisplayName] = useState("tide watcher");

  return (
    <DocsShell>
      <PageHeader
        eyebrow="density"
        title="settings"
        dek="A product-density screen with the core kit only — quiet MorphShell, tide fields, SwellRail, PhaseChip, CausticFocus. Feedback is tape + steam, not toasts. Zero WebGL required (css atmosphere)."
      />

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <ThemeToggle />
        <AtmosphereToggle />
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_240px]">
        <CausticFocusRoot contained className="space-y-8">
          <MorphShell quiet density="quiet">
            <p className="t-eyebrow text-candle">profile</p>
            <h2 className="mt-1 font-serif text-2xl italic">identity</h2>
            <WaveRule className="my-4" amp={3} freq={4} />
            <label className="block">
              <span className="t-eyebrow text-ink-2">display name</span>
              <input
                className="tide-field caustic-field mt-1 w-full px-1 py-2 font-serif text-lg italic text-ink"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </label>
            <div className="mt-5">
              <WaveInput
                mode="compose"
                placeholder="bio · one line the room remembers"
                onSubmit={(v) => {
                  setMsg(`kept · “${v}”`);
                  announce("keep", `kept · “${v}”`, 0.7);
                }}
              />
            </div>
            <p className="mt-3 t-meta text-ink-2">{msg}</p>
          </MorphShell>

          <MorphShell quiet density="quiet">
            <p className="t-eyebrow text-candle">channel</p>
            <h2 className="mt-1 font-serif text-2xl italic">routing</h2>
            <WaveRule className="my-4" amp={3} freq={4} />
            <PhaseChip
              options={["signal", "storm", "calm", "archive"]}
              value={channel}
              onChange={(v) => {
                setChannel(String(v));
                pulse("phase", 0.4);
              }}
            />
            <div className="mt-6">
              <TideLine
                value={tide}
                onChange={setTide}
                labels={["draft", "review", "live"]}
              />
            </div>
          </MorphShell>

          <MorphShell quiet density="quiet">
            <p className="t-eyebrow text-candle">thresholds</p>
            <h2 className="mt-1 font-serif text-2xl italic">sensitivity</h2>
            <WaveRule className="my-4" amp={3} freq={4} />
            <SwellRail
              label="notify above"
              value={notify}
              onChange={setNotify}
            />
            <div className="mt-6">
              <p className="mb-2 t-eyebrow text-ink-2">sync progress</p>
              <ProgressWake value={progress} variant="fill" />
              <div className="mt-3 flex flex-wrap gap-2">
                <WaveButton density="quiet" onClick={() => setProgress(null)}>
                  pending
                </WaveButton>
                <WaveButton density="quiet" onClick={() => setProgress(0.35)}>
                  35%
                </WaveButton>
                <WaveButton
                  register="devotional"
                  density="quiet"
                  onClick={() => {
                    setProgress(1);
                    setMsg("sync complete · wake on the tape.");
                    announce("keep", "sync complete · wake on the tape.", 0.75);
                  }}
                >
                  finish
                </WaveButton>
              </div>
            </div>
          </MorphShell>

          <MorphShell quiet density="quiet">
            <p className="t-eyebrow text-candle">danger</p>
            <h2 className="mt-1 font-serif text-2xl italic">rituals</h2>
            <WaveRule className="my-4" amp={3} freq={4} />
            <div className="flex flex-wrap gap-3">
              <HoldDischarge
                onDischarge={() => {
                  setMsg("session discharged.");
                  announce("discharge", "session discharged.", 0.9);
                }}
              >
                hold to sign out
              </HoldDischarge>
              <CalmDecay
                onCalm={() => {
                  setNotify(0.2);
                  setMsg("thresholds stilled.");
                  announce("calm", "thresholds stilled.", 0.5);
                }}
              >
                still thresholds
              </CalmDecay>
              <WaveButton
                register="oceanic"
                density="quiet"
                onClick={() => setDrawer(true)}
              >
                open region
              </WaveButton>
            </div>
          </MorphShell>
        </CausticFocusRoot>

        <aside className="space-y-6">
          <MorphShell quiet density="quiet" pad={false}>
            <div className="px-5 py-5">
              <p className="t-eyebrow text-sea">summary</p>
              <ul className="mt-3 space-y-2 t-meta text-ink-2">
                <li>
                  name · <span className="text-ink">{displayName}</span>
                </li>
                <li>
                  channel · <span className="text-ink">{channel}</span>
                </li>
                <li>
                  tide · <span className="text-ink">{Math.round(tide * 100)}%</span>
                </li>
                <li>
                  notify · <span className="text-ink">{Math.round(notify * 100)}</span>
                </li>
              </ul>
              <WaveRule className="my-4" amp={2.5} freq={5} />
              <p className="font-serif text-sm italic text-ink-2">
                At rest this should read like a calm settings page. Hover a button —
                the edge wakes. Feedback rides the tape, not a toast stack.
              </p>
            </div>
          </MorphShell>
        </aside>
      </div>

      <DrawerWake open={drawer} onClose={() => setDrawer(false)} title="region">
        <p className="font-serif italic text-ink-2">
          Drawer wake replaces modal chrome. Escape or backdrop to dismiss.
        </p>
        <WaveButton className="mt-6" onClick={() => setDrawer(false)}>
          close
        </WaveButton>
      </DrawerWake>

      <Wake />
    </DocsShell>
  );
}
