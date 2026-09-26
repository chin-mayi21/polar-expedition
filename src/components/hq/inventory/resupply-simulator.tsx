"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

type SimItem = {
  id: string;
  sku: string;
  onHand: number;
  threshold: number;
  dailyRate: number | null;
  unit: string;
};

export function ResupplySimulator({ items }: { items: SimItem[] }) {
  const [mounted, setMounted] = useState(false);
  const [itemId, setItemId] = useState(items[0]?.id ?? "");
  const [delayDays, setDelayDays] = useState(14);

  useEffect(() => setMounted(true), []);

  const selected = items.find((i) => i.id === itemId) ?? items[0];

  const chartData = useMemo(() => {
    if (!selected || !selected.dailyRate || selected.dailyRate <= 0) return [];
    const points = [];
    let stock = selected.onHand;
    for (let day = 0; day <= 60; day++) {
      if (day > 0) stock -= selected.dailyRate;
      points.push({ day, stock: Math.max(stock, 0) });
    }
    const withDelay: { day: number; stock: number }[] = [];
    let delayed = selected.onHand;
    for (let day = 0; day <= 60; day++) {
      if (day > 0) delayed -= selected.dailyRate;
      if (day === delayDays) delayed += selected.threshold * 2;
      withDelay.push({ day, stock: Math.max(delayed, 0) });
    }
    return points.map((p, i) => ({
      day: p.day,
      baseline: p.stock,
      withResupply: withDelay[i]?.stock ?? 0,
    }));
  }, [selected, delayDays]);

  const criticalDay = useMemo(() => {
    if (!selected?.dailyRate) return null;
    const days = selected.onHand / selected.dailyRate;
    return Math.floor(days);
  }, [selected]);

  if (!selected) {
    return <p className="text-sm text-text-secondary">No items available for simulation.</p>;
  }

  return (
    <div className="border border-border bg-surface p-5 rounded-[4px]">
      <h3 className="font-display text-lg font-semibold text-text-primary">Resupply what-if</h3>
      <p className="mt-1 text-xs text-text-secondary">
        Projects burn-down from current ledger balance. Resupply at day {delayDays} adds 2× threshold units.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-text-secondary">Resource</label>
          <select
            className="mt-1 flex h-10 w-full border border-border px-2 text-sm rounded-[2px]"
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
          >
            {items.map((i) => (
              <option key={i.id} value={i.id}>{i.sku}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-text-secondary">Resupply delay (days)</label>
          <InputDelay value={delayDays} onChange={setDelayDays} />
        </div>
      </div>

      {criticalDay !== null ? (
        <p className="mt-3 font-mono text-xs text-amber">
          First threshold breach (no resupply): ~{criticalDay} days at {selected.dailyRate} {selected.unit}/day
        </p>
      ) : null}

      <div className="mt-4 h-56 w-full min-h-[14rem]">
        {!mounted || chartData.length === 0 ? (
          <p className="flex h-full items-center justify-center text-sm text-text-secondary">Loading chart…</p>
        ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid stroke="#E1E8EF" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="#5B6B82" />
            <YAxis tick={{ fontSize: 10 }} stroke="#5B6B82" />
            <Tooltip
              contentStyle={{ borderRadius: 2, borderColor: "#E1E8EF", fontSize: 12 }}
              labelFormatter={(d) => `Day ${d}`}
            />
            <ReferenceLine y={selected.threshold} stroke="#D89614" strokeDasharray="4 4" label="Threshold" />
            <Line type="monotone" dataKey="baseline" name="No resupply" stroke="#C1272D" dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="withResupply" name="With resupply" stroke="#127475" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function InputDelay({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <input
      type="number"
      min={1}
      max={45}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="mt-1 flex h-10 w-full border border-border px-2 font-mono text-sm rounded-[2px]"
    />
  );
}
