import { SyncPanel } from "@/components/field/sync-panel";

export default function FieldSyncPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="font-display text-3xl font-semibold">Sync</h1>
      <SyncPanel />
    </div>
  );
}
