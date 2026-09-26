import { StatusBadge } from "@/components/design/status-badge";
import { AlertTriangle, CheckCircle2, Package } from "lucide-react";
import type { StockLevel } from "@/lib/inventory/stock-status";

export type InventoryRow = {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  stationCode: string;
  onHand: string;
  lowStockThreshold: string;
  dailyConsumptionRate: string | null;
  stockLevel: StockLevel;
  daysRemaining: number | null;
};

function levelTone(level: StockLevel) {
  if (level === "CRITICAL") return "critical" as const;
  if (level === "LOW") return "warning" as const;
  return "success" as const;
}

function levelLabel(level: StockLevel) {
  if (level === "CRITICAL") return "Critical";
  if (level === "LOW") return "Low";
  return "Available";
}

export function InventoryTable({ rows }: { rows: InventoryRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="border border-dashed border-border bg-surface p-10 text-center rounded-[2px]">
        <Package className="mx-auto h-8 w-8 text-text-secondary" aria-hidden />
        <p className="mt-3 font-display text-lg font-semibold text-text-primary">No inventory records</p>
        <p className="mt-2 text-sm text-text-secondary">
          Run <span className="font-mono">npm run db:seed</span> to load ISEA-44 station stock, then refresh.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-border bg-surface rounded-[2px]">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-bg">
            <th className="px-3 py-2 font-medium text-text-secondary">SKU</th>
            <th className="px-3 py-2 font-medium text-text-secondary">Item</th>
            <th className="px-3 py-2 font-medium text-text-secondary">Station</th>
            <th className="px-3 py-2 font-medium text-text-secondary">On hand</th>
            <th className="px-3 py-2 font-medium text-text-secondary">Threshold</th>
            <th className="px-3 py-2 font-medium text-text-secondary">Est. days</th>
            <th className="px-3 py-2 font-medium text-text-secondary">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-border last:border-0">
              <td className="px-3 py-2 font-mono text-xs text-text-primary">{row.sku}</td>
              <td className="px-3 py-2">
                <p className="font-medium text-text-primary">{row.name}</p>
                <p className="text-xs text-text-secondary">{row.category}</p>
              </td>
              <td className="px-3 py-2 font-mono text-xs">{row.stationCode}</td>
              <td className="px-3 py-2 font-mono text-xs">
                {row.onHand} {row.unit}
              </td>
              <td className="px-3 py-2 font-mono text-xs">
                {row.lowStockThreshold} {row.unit}
              </td>
              <td className="px-3 py-2 font-mono text-xs">
                {row.daysRemaining ?? "—"}
              </td>
              <td className="px-3 py-2">
                <StatusBadge
                  label={levelLabel(row.stockLevel)}
                  tone={levelTone(row.stockLevel)}
                  icon={row.stockLevel === "AVAILABLE" ? CheckCircle2 : AlertTriangle}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
