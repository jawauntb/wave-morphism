"use client";

import { useCallback, useState } from "react";
import { useTape } from "@/lib/tape";
import { SteamPlume } from "@/components/ui/ScalePrimitives";

/**
 * Tape is default feedback. SteamPlume carries ephemeral copy.
 * Prefer announce() over toasts / modals for keep / sync / soft errors.
 *
 *   const { announce, Wake } = useWake();
 *   announce("keep", "session held.");
 *   return <><form…/><Wake /></>
 */
export function useWake() {
  const { pulse, pulses } = useTape();
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [epoch, setEpoch] = useState(0);

  const announce = useCallback(
    (kind: string, copy?: string, intensity = 0.55) => {
      pulse(kind, intensity);
      if (copy) {
        setMessage(copy);
        setEpoch((e) => e + 1);
        setOpen(true);
      }
    },
    [pulse]
  );

  const clear = useCallback(() => setOpen(false), []);

  function Wake({ className = "" }: { className?: string }) {
    return (
      <SteamPlume
        key={epoch}
        open={open}
        message={message}
        onGone={clear}
        className={className}
      />
    );
  }

  return { announce, pulse, pulses, clear, open, message, Wake };
}
