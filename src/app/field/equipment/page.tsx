import { EquipmentList } from "@/components/field/equipment-list";
import { getSession } from "@/lib/auth/session";
import { listFieldAssets } from "@/lib/field/dashboard";
import { redirect } from "next/navigation";

export default async function FieldEquipmentPage() {
  const session = await getSession();
  if (!session?.personnelId) redirect("/");

  const assets = await listFieldAssets(session.personnelId);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="font-display text-3xl font-semibold">Equipment</h1>
      <p className="text-sm text-text-secondary">Read-only gear at your team station.</p>
      <EquipmentList assets={assets} />
    </div>
  );
}
