"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { StatusBadge } from "@/components/design/status-badge";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export type PersonnelRow = {
  id: string;
  employeeCode: string;
  fullName: string;
  roleTitle: string;
  teamId: string | null;
  teamName: string | null;
  medicalClearancePending: boolean;
  status: string;
};

export function PersonnelRoster({
  rows,
  teams,
}: {
  rows: PersonnelRow[];
  teams: { id: string; name: string }[];
}) {
  const router = useRouter();

  async function assign(personId: string, teamId: string) {
    const res = await fetch(`/api/hq/personnel/${personId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId: teamId || null }),
    });
    if (!res.ok) {
      toast.error("Could not update assignment.");
      return;
    }
    toast.success("Assignment saved.");
    router.refresh();
  }

  if (rows.length === 0) {
    return (
      <p className="border border-dashed border-border p-8 text-center text-sm text-text-secondary">
        No personnel in your expedition scope. Run <span className="font-mono">npm run db:seed</span>.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto border border-border bg-surface rounded-[2px]">
      <table className="w-full min-w-[800px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-bg text-left">
            <th className="px-3 py-2 text-text-secondary">ID</th>
            <th className="px-3 py-2 text-text-secondary">Name</th>
            <th className="px-3 py-2 text-text-secondary">Role</th>
            <th className="px-3 py-2 text-text-secondary">Team</th>
            <th className="px-3 py-2 text-text-secondary">Medical</th>
            <th className="px-3 py-2 text-text-secondary">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.id} className="border-b border-border last:border-0">
              <td className="px-3 py-2 font-mono text-xs">{p.employeeCode}</td>
              <td className="px-3 py-2 font-medium">{p.fullName}</td>
              <td className="px-3 py-2 text-text-secondary">{p.roleTitle}</td>
              <td className="px-3 py-2">
                <select
                  className="h-9 border border-border px-2 text-xs rounded-[2px]"
                  value={p.teamId ?? ""}
                  onChange={(e) => assign(p.id, e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </td>
              <td className="px-3 py-2">
                {p.medicalClearancePending ? (
                  <StatusBadge label="Pending clearance" tone="warning" icon={AlertTriangle} />
                ) : (
                  <StatusBadge label="Cleared" tone="success" icon={CheckCircle2} />
                )}
              </td>
              <td className="px-3 py-2 font-mono text-xs">{p.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
