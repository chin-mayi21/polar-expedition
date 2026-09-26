"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { queueFieldOperation } from "@/lib/field/queue-operation";

export type SupplyRow = { id: string; sku: string; name: string; unit: string; onHand: number };

export function SuppliesPanel({ items, stationCode }: { items: SupplyRow[]; stationCode: string | null }) {
  const router = useRouter();
  const [selected, setSelected] = useState(items[0]?.id ?? "");
  const [qty, setQty] = useState("1");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function logConsumption() {
    if (!selected) return;
    setBusy(true);
    try {
      await queueFieldOperation("INVENTORY_CONSUMPTION", {
        inventoryItemId: selected,
        quantity: Number(qty),
        note: note || undefined,
      });
      toast.success("Consumption queued.");
      setNote("");
      router.refresh();
    } catch {
      toast.error("Could not queue consumption.");
    } finally {
      setBusy(false);
    }
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-text-secondary">
        No supplies at your station{stationCode ? ` (${stationCode})` : ""}.
      </p>
    );
  }

  const item = items.find((i) => i.id === selected);

  return (
    <div className="space-y-4 border border-border bg-surface p-4 rounded-[2px]">
      <p className="font-mono text-xs text-text-secondary">Station {stationCode ?? "—"} · ledger sync</p>
      <select
        className="h-11 w-full border border-border px-3 text-sm rounded-[2px]"
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
      >
        {items.map((i) => (
          <option key={i.id} value={i.id}>
            {i.sku} — {i.onHand} {i.unit} on hand
          </option>
        ))}
      </select>
      {item ? <p className="text-sm text-text-primary">{item.name}</p> : null}
      <Input type="number" min={0.1} step={0.1} value={qty} onChange={(e) => setQty(e.target.value)} placeholder="Quantity" />
      <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)" />
      <Button variant="navy" size="field" disabled={busy} onClick={logConsumption}>
        Queue consumption
      </Button>
    </div>
  );
}
