import { SuppliesPanel } from "@/components/field/supplies-panel";
import { getSession } from "@/lib/auth/session";
import { getFieldDashboard, listFieldInventory } from "@/lib/field/dashboard";
import { redirect } from "next/navigation";

export default async function FieldInventoryPage() {
  const session = await getSession();
  if (!session?.personnelId) redirect("/");

  const [dashboard, items] = await Promise.all([
    getFieldDashboard(session.personnelId),
    listFieldInventory(session.personnelId),
  ]);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="font-display text-3xl font-semibold">Supplies</h1>
      <SuppliesPanel items={items} stationCode={dashboard?.stationCode ?? null} />
    </div>
  );
}
