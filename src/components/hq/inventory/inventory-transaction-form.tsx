"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inventoryTransactionSchema, type InventoryTransactionInput } from "@/lib/inventory/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";

type InventoryOption = { id: string; label: string };

export function InventoryTransactionForm({ items }: { items: InventoryOption[] }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<InventoryTransactionInput>({
    resolver: zodResolver(inventoryTransactionSchema),
    defaultValues: {
      inventoryItemId: items[0]?.id ?? "",
      type: "RECEIPT",
      quantity: 1,
      reference: "",
      note: "",
    },
  });

  async function onSubmit(values: InventoryTransactionInput) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/hq/inventory/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not record transaction.");
        return;
      }
      toast.success("Transaction recorded — stock updated from ledger.");
      form.reset({
        inventoryItemId: values.inventoryItemId,
        type: values.type,
        quantity: 1,
        reference: "",
        note: "",
      });
      router.refresh();
    } catch {
      toast.error("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-text-secondary">
        No inventory items in scope. Run the seed script to load station stock.
      </p>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 border border-border bg-surface p-5 rounded-[4px]">
      <h3 className="font-display text-lg font-semibold text-text-primary">Record transaction</h3>
      <p className="text-xs text-text-secondary">Ledger-only — on-hand quantity is computed from all transactions.</p>

      <div className="space-y-2">
        <Label htmlFor="inventoryItemId">Item</Label>
        <select
          id="inventoryItemId"
          className="flex h-11 w-full border border-border bg-surface px-3 text-sm rounded-[4px]"
          {...form.register("inventoryItemId")}
        >
          {items.map((i) => (
            <option key={i.id} value={i.id}>{i.label}</option>
          ))}
        </select>
        {form.formState.errors.inventoryItemId ? (
          <p className="text-xs text-red">{form.formState.errors.inventoryItemId.message}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <select
            id="type"
            className="flex h-11 w-full border border-border bg-surface px-3 text-sm rounded-[4px]"
            {...form.register("type")}
          >
            <option value="RECEIPT">Receipt (+)</option>
            <option value="CONSUMPTION">Consumption (−)</option>
            <option value="LOSS">Loss (−)</option>
            <option value="ADJUSTMENT">Adjustment (±)</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            step="any"
            {...form.register("quantity", { valueAsNumber: true })}
          />
          {form.formState.errors.quantity ? (
            <p className="text-xs text-red">{form.formState.errors.quantity.message}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reference">Reference</Label>
        <Input id="reference" placeholder="PO-8841, GEN-SET-WEEK-03…" {...form.register("reference")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="note">Note</Label>
        <Input id="note" {...form.register("note")} />
      </div>

      <Button type="submit" variant="navy" disabled={submitting}>
        {submitting ? "Saving…" : "Post to ledger"}
      </Button>
    </form>
  );
}
