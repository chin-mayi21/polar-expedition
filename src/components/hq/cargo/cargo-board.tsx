"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/design/status-badge";
import { nextPipelineStatus, PIPELINE_ORDER } from "@/lib/cargo/pipeline";
import type { CargoItemStatus } from "@prisma/client";

export type CargoRow = {
  id: string;
  manifestCode: string;
  description: string;
  status: CargoItemStatus;
  route: string;
  recentEvents: { at: string; note: string | null; toStatus: string | null }[];
};

function chipTone(status: string, current: string) {
  if (status === current) return "border-cyan bg-teal-soft-bg text-text-primary";
  const order = ["CREATED", ...PIPELINE_ORDER];
  const ci = order.indexOf(current as CargoItemStatus);
  const si = order.indexOf(status as CargoItemStatus);
  if (si < ci) return "border-border bg-bg text-text-secondary";
  return "border-border bg-surface text-text-secondary opacity-60";
}

export function CargoBoard({ items }: { items: CargoRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState(items[0]?.id ?? "");
  const [evidence, setEvidence] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const item = items.find((i) => i.id === selected);

  async function transition(kind: "advance" | "delayed" | "damaged") {
    if (!item) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/hq/cargo/${item.id}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, evidence }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Transition failed.");
        return;
      }
      toast.success("Cargo event recorded.");
      setEvidence({});
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const next = item ? nextPipelineStatus(item.status) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <ul className="max-h-[520px] space-y-2 overflow-y-auto border border-border bg-surface p-2 rounded-[2px]">
        {items.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => setSelected(c.id)}
              className={`w-full border px-3 py-2 text-left rounded-[2px] ${selected === c.id ? "border-cyan bg-bg" : "border-transparent"}`}
            >
              <p className="font-mono text-xs">{c.manifestCode}</p>
              <p className="text-sm font-medium truncate">{c.description}</p>
              <StatusBadge label={c.status} tone={c.status === "DELAYED" || c.status === "DAMAGED" ? "warning" : "accent"} />
            </button>
          </li>
        ))}
      </ul>

      {item ? (
        <div className="border border-border bg-surface p-4 rounded-[2px]">
          <h3 className="font-display font-semibold">{item.manifestCode}</h3>
          <p className="text-xs text-text-secondary">{item.route}</p>
          <div className="mt-3 flex flex-wrap gap-1">
            {["CREATED", ...PIPELINE_ORDER].map((s) => (
              <span key={s} className={`border px-2 py-0.5 font-mono text-[10px] rounded-[2px] ${chipTone(s, item.status)}`}>
                {s.replace("_", " ")}
              </span>
            ))}
          </div>

          {next ? (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-medium text-text-primary">Advance to {next} — evidence required</p>
              {item.status === "CREATED" && (
                <>
                  <Input placeholder="Manifest / package ID" onChange={(e) => setEvidence({ ...evidence, manifestId: e.target.value })} />
                  <Input placeholder="Packer name" onChange={(e) => setEvidence({ ...evidence, packer: e.target.value })} />
                  <Input type="datetime-local" onChange={(e) => setEvidence({ ...evidence, packedAt: new Date(e.target.value).toISOString() })} />
                </>
              )}
              {item.status === "PACKED" && (
                <>
                  <Input placeholder="Origin" onChange={(e) => setEvidence({ ...evidence, origin: e.target.value })} />
                  <Input placeholder="Carrier / transport" onChange={(e) => setEvidence({ ...evidence, carrier: e.target.value })} />
                  <Input type="datetime-local" onChange={(e) => setEvidence({ ...evidence, dispatchedAt: new Date(e.target.value).toISOString() })} />
                </>
              )}
              {item.status === "DISPATCHED" && (
                <>
                  <Input placeholder="Milestone" onChange={(e) => setEvidence({ ...evidence, milestone: e.target.value })} />
                  <Input placeholder="Source" onChange={(e) => setEvidence({ ...evidence, source: e.target.value })} />
                  <Input type="datetime-local" onChange={(e) => setEvidence({ ...evidence, milestoneAt: new Date(e.target.value).toISOString() })} />
                </>
              )}
              {item.status === "IN_TRANSIT" && (
                <>
                  <Input placeholder="Recipient confirmation" onChange={(e) => setEvidence({ ...evidence, recipient: e.target.value })} />
                  <Input type="datetime-local" onChange={(e) => setEvidence({ ...evidence, confirmedAt: new Date(e.target.value).toISOString() })} />
                </>
              )}
              <Button variant="navy" size="sm" disabled={busy} onClick={() => transition("advance")}>
                Log stage advance
              </Button>
            </div>
          ) : null}

          <div className="mt-4 space-y-2 border-t border-border pt-4">
            <p className="text-xs text-text-secondary">Flag issue (branch state)</p>
            <Input placeholder="Reason" onChange={(e) => setEvidence({ ...evidence, reason: e.target.value })} />
            <Input placeholder="Owner" onChange={(e) => setEvidence({ ...evidence, owner: e.target.value })} />
            <Input placeholder="Next action" onChange={(e) => setEvidence({ ...evidence, nextAction: e.target.value })} />
            <Input placeholder="Evidence note" onChange={(e) => setEvidence({ ...evidence, evidence: e.target.value })} />
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" disabled={busy} onClick={() => transition("delayed")}>Mark delayed</Button>
              <Button size="sm" variant="destructive" disabled={busy} onClick={() => transition("damaged")}>Mark damaged</Button>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs font-medium text-text-secondary">Event history</p>
            <ul className="mt-2 max-h-32 space-y-1 overflow-y-auto font-mono text-[10px] text-text-secondary">
              {item.recentEvents.map((e, i) => (
                <li key={i}>{e.at} → {e.toStatus} {e.note ? `· ${e.note.slice(0, 80)}` : ""}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}
