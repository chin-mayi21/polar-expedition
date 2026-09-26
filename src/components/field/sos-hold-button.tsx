"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Siren } from "lucide-react";
import { toast } from "sonner";
import { queueFieldOperation } from "@/lib/field/queue-operation";
import { cn } from "@/lib/utils";

const HOLD_MS = 3000;

export function SosHoldButton({
  missionId,
  disabled,
}: {
  missionId?: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);

  const clearTimers = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    if (interval.current) clearInterval(interval.current);
    timer.current = null;
    interval.current = null;
    setHolding(false);
    setProgress(0);
  }, []);

  async function sendSos() {
    try {
      await queueFieldOperation("SOS", {
        missionId,
        message: "Hold-to-confirm SOS from field device.",
        simulatedLatitude: -71.02,
        simulatedLongitude: 12.14,
      });
      toast.error("SOS queued — HQ will be notified when sync completes.");
      router.refresh();
    } catch {
      toast.error("Could not queue SOS.");
    }
  }

  function startHold() {
    if (disabled) return;
    setHolding(true);
    const started = Date.now();
    interval.current = setInterval(() => {
      const pct = Math.min(100, ((Date.now() - started) / HOLD_MS) * 100);
      setProgress(pct);
    }, 50);
    timer.current = setTimeout(() => {
      clearTimers();
      sendSos();
    }, HOLD_MS);
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onPointerDown={startHold}
      onPointerUp={clearTimers}
      onPointerLeave={clearTimers}
      onPointerCancel={clearTimers}
      className={cn(
        "relative flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-[4px] border-2 border-red bg-red text-lg font-medium text-white",
        disabled && "opacity-50",
        holding && "ring-2 ring-amber ring-offset-2 ring-offset-bg"
      )}
      aria-label="Hold for three seconds to send SOS"
    >
      <span
        className="absolute inset-y-0 left-0 bg-white/25 transition-[width]"
        style={{ width: `${progress}%` }}
        aria-hidden
      />
      <Siren className="relative h-6 w-6 shrink-0" aria-hidden />
      <span className="relative">
        {holding ? `Hold… ${Math.ceil((HOLD_MS - (progress / 100) * HOLD_MS) / 1000)}s` : "Hold to send SOS (3s)"}
      </span>
    </button>
  );
}
