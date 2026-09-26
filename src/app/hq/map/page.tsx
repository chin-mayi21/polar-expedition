import { HqPageShell } from "@/components/layout/hq-page-shell";
import { SimulatedGpsMap } from "@/components/hq/maps/simulated-gps-map";
import { getSession } from "@/lib/auth/session";
import { fetchExpeditionMapMarkers } from "@/lib/maps/expedition-map-data";
import { redirect } from "next/navigation";

export default async function HqMapPage() {
  const session = await getSession();
  if (!session || session.role !== "OPERATIONS_OFFICIAL") redirect("/");

  const { markers, center } = await fetchExpeditionMapMarkers(session.expeditionIds);

  return (
    <HqPageShell
      title="Field map"
      subtitle="MapLibre view of stations and last-confirmed simulated positions."
    >
      <SimulatedGpsMap markers={markers} center={center} />
    </HqPageShell>
  );
}
