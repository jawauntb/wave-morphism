"use client";

import { useState } from "react";
import Link from "next/link";
import { DocsShell, PageHeader } from "@/components/layout/Chrome";
import { MorphShell, WaveRule } from "@/components/ui/WaveMorph";
import { WaveButton } from "@/components/ui/WaveButton";
import { CausticFocusRoot } from "@/components/ui/CausticFocus";
import { HoldDischarge } from "@/components/ui/WaveInput";
import { useWake } from "@/lib/wake";

/**
 * Auth recipe — product-density sign-in with caustic focus + tape wake.
 */
export default function AuthRecipePage() {
  const { announce, Wake } = useWake();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("session waiting at the shore.");

  const submit = () => {
    if (!email.trim()) {
      setMsg("email needs a crest.");
      announce("ghost", "email needs a crest.", 0.3);
      return;
    }
    setMsg(`tide held · ${email}`);
    announce("keep", `tide held · ${email}`, 0.7);
  };

  return (
    <DocsShell>
      <PageHeader
        eyebrow="recipe"
        title="auth"
        dek="Sign-in as a quiet basin — tide fields, caustic focus, HoldDischarge for destructive exits. Feedback is tape + steam."
      />

      <div className="mx-auto max-w-md">
        <CausticFocusRoot contained>
          <MorphShell quiet density="quiet">
            <p className="t-eyebrow text-candle">return</p>
            <h2 className="mt-1 font-serif text-3xl italic">sign in</h2>
            <WaveRule className="my-5" amp={3} freq={4} />

            <label className="block">
              <span className="t-eyebrow text-ink-2">email</span>
              <input
                type="email"
                autoComplete="email"
                className="tide-field caustic-field mt-1 w-full px-1 py-2.5 font-serif text-lg italic text-ink"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@shore.example"
              />
            </label>

            <label className="mt-5 block">
              <span className="t-eyebrow text-ink-2">password</span>
              <input
                type="password"
                autoComplete="current-password"
                className="tide-field caustic-field mt-1 w-full px-1 py-2.5 font-serif text-lg italic text-ink"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="········"
              />
            </label>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <WaveButton register="oceanic" density="quiet" onClick={submit}>
                enter
              </WaveButton>
              <HoldDischarge
                onDischarge={() => {
                  setEmail("");
                  setPassword("");
                  setMsg("draft discharged.");
                  announce("discharge", "draft discharged.", 0.6);
                }}
              >
                hold to clear
              </HoldDischarge>
            </div>

            <p className="mt-5 t-meta text-ink-2">{msg}</p>
            <p className="mt-6 t-meta text-ink-2/70">
              Also see{" "}
              <Link href="/docs/settings" className="text-candle hover:underline">
                settings
              </Link>{" "}
              ·{" "}
              <Link href="/docs/list-detail" className="text-candle hover:underline">
                list + detail
              </Link>{" "}
              ·{" "}
              <Link href="/docs/undertow" className="text-candle hover:underline">
                undertow
              </Link>
            </p>
          </MorphShell>
        </CausticFocusRoot>
      </div>

      <Wake />
    </DocsShell>
  );
}
