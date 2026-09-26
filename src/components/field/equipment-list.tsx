import { StatusBadge } from "@/components/design/status-badge";

export type EquipmentRow = {
  id: string;
  assetTag: string;
  name: string;
  category: string;
  status: string;
};

export function EquipmentList({ assets }: { assets: EquipmentRow[] }) {
  if (assets.length === 0) {
    return <p className="text-sm text-text-secondary">No assets registered at your station.</p>;
  }

  return (
    <ul className="divide-y divide-border border border-border bg-surface rounded-[2px]">
      {assets.map((a) => (
        <li key={a.id} className="flex items-center justify-between gap-2 px-4 py-3">
          <div>
            <p className="font-mono text-xs text-cyan">{a.assetTag}</p>
            <p className="font-medium text-sm">{a.name}</p>
            <p className="text-xs text-text-secondary">{a.category}</p>
          </div>
          <StatusBadge
            label={a.status}
            tone={a.status === "OPERATIONAL" ? "success" : a.status === "MAINTENANCE" ? "warning" : "neutral"}
          />
        </li>
      ))}
    </ul>
  );
}
