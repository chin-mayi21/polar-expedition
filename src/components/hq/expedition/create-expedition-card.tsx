"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateExpeditionCard() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function create() {
    setLoading(true);
    try {
      const res = await fetch("/api/hq/expeditions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          name,
          season: "2026-27",
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Could not create expedition.");
        return;
      }
      toast.success("Draft expedition created.");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <details className="border border-border bg-surface p-4 rounded-[2px]">
      <summary className="cursor-pointer font-display text-sm font-semibold text-text-primary">
        Step 1 — Create another draft expedition
      </summary>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div>
          <Label htmlFor="ex-code">Code</Label>
          <Input id="ex-code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="ISEA-45" />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="ex-name">Name</Label>
          <Input id="ex-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Expedition title" />
        </div>
      </div>
      <Button type="button" className="mt-3" variant="secondary" disabled={loading || !code || !name} onClick={create}>
        Create draft
      </Button>
    </details>
  );
}
