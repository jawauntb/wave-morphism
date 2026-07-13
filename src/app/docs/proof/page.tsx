"use client";

import Link from "next/link";
import { DocsShell, PageHeader } from "@/components/layout/Chrome";
import { MorphShell, WaveRule } from "@/components/ui/WaveMorph";
import { WaveButton } from "@/components/ui/WaveButton";
import { PhaseChip } from "@/components/ui/PhaseChip";
import { useState } from "react";
import { useWake } from "@/lib/wake";
import { auditThemeContrast } from "@/lib/contrast";
import { useTheme } from "@/lib/theme";
import { CORE_SLUGS } from "@/data/components";

/**
 * Proof — receipts, not vibes.
 * Glass vs wave, keyboard, reduced-motion, contrast, kit size.
 */
export default function ProofPage() {
  const { theme } = useTheme();
  const { announce, Wake } = useWake();
  const [chip, setChip] = useState("change");
  const audit = auditThemeContrast(theme);
  const bodyPass = audit.filter((r) => r.role === "body" && r.passAA).length;
  const bodyTotal = audit.filter((r) => r.role === "body").length;

  return (
    <DocsShell>
      <PageHeader
        eyebrow="receipts"
        title="proof"
        dek="Why not glass — with a scoreboard. Blind-test Harbor against a frosted settings clone. Keyboard and reduced-motion are defaults, not afterthoughts."
      />

      <div className="grid gap-8 lg:grid-cols-2">
        <MorphShell quiet density="quiet">
          <p className="t-eyebrow text-ink-2">glass (caricature)</p>
          <h2 className="mt-2 font-serif text-2xl">Settings</h2>
          <div
            className="mt-5 space-y-4 rounded-2xl border border-white/40 p-5 shadow-[0_8px_40px_rgba(0,0,0,0.08)]"
            style={{
              background: "rgba(255,255,255,0.45)",
              backdropFilter: "blur(16px)",
            }}
          >
            <div className="flex items-center justify-between text-sm">
              <span>Notifications</span>
              <span className="rounded-full bg-black/10 px-3 py-1 text-xs">On</span>
            </div>
            <div className="h-2 rounded-full bg-black/10">
              <div className="h-2 w-2/3 rounded-full bg-indigo-400/80" />
            </div>
            <button
              type="button"
              className="w-full rounded-xl bg-indigo-500/90 py-2.5 text-sm text-white"
            >
              Save changes
            </button>
            <p className="text-xs text-black/50">
              Frost · blur · pill · toast. Calm forever. Dead on interaction.
            </p>
          </div>
        </MorphShell>

        <MorphShell quiet density="quiet">
          <p className="t-eyebrow text-candle">wave (this kit)</p>
          <h2 className="mt-2 font-serif text-2xl italic">settings</h2>
          <WaveRule className="my-4" amp={3} freq={4} />
          <PhaseChip
            options={["press", "change", "commit"]}
            value={chip}
            onChange={(v) => {
              setChip(String(v));
              announce("phase", `${v} · crest`, 0.4);
            }}
          />
          <div className="mt-6 flex flex-wrap gap-2">
            <WaveButton
              density="quiet"
              register="oceanic"
              onClick={() => announce("press", "ripple · decay", 0.45)}
            >
              press
            </WaveButton>
            <WaveButton
              density="quiet"
              register="devotional"
              onClick={() => announce("keep", "commit · held", 0.7)}
            >
              commit
            </WaveButton>
          </div>
          <p className="mt-5 t-meta text-ink-2">
            Quiet at rest. Edge wakes on hover. Feedback is tape + steam — not a toast
            stack.{" "}
            <Link href="/harbor" className="text-candle hover:underline">
              open Harbor
            </Link>
          </p>
        </MorphShell>
      </div>

      <WaveRule className="my-12" amp={5} freq={3} />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Score
          label="public kit"
          value={`${CORE_SLUGS.length}`}
          note="surfaces on the critical path · lab in attic"
        />
        <Score
          label="body contrast"
          value={`${bodyPass}/${bodyTotal}`}
          note={`${theme.name} · AA body pairs`}
        />
        <Score
          label="motion verbs"
          value="3"
          note="press · change · commit · idle ≈ 0"
        />
        <Score
          label="GPU default"
          value="0"
          note="css atmosphere · basin opt-in once"
        />
      </div>

      <MorphShell quiet density="quiet" className="mt-10">
        <p className="t-eyebrow text-candle">checklist</p>
        <ul className="mt-4 space-y-3 t-meta text-ink-2">
          <li>✓ Keyboard: PhaseChip arrows, SwellRail Home/End, Drawer Escape</li>
          <li>✓ Reduced motion: crest focus, frozen basin, shared LFO → 0</li>
          <li>✓ No sound required for meaning (tape is ambient memory)</li>
          <li>✓ One material · one focus · one feedback channel</li>
          <li>
            → Blind test:{" "}
            <Link href="/harbor" className="text-candle hover:underline">
              Harbor
            </Link>{" "}
            vs any glass settings clone — which would you ship?
          </li>
        </ul>
      </MorphShell>

      <Wake />
    </DocsShell>
  );
}

function Score({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div>
      <p className="t-eyebrow text-ink-2">{label}</p>
      <p className="mt-1 font-serif text-4xl italic text-ink">{value}</p>
      <p className="mt-2 t-meta text-ink-2">{note}</p>
    </div>
  );
}
