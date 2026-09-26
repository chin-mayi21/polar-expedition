import { HqPageShell } from "@/components/layout/hq-page-shell";
import { PlaceholderPanel } from "@/components/layout/placeholder-panel";

export default function HqTeamsPage() {
  return (
    <HqPageShell title="Teams" subtitle="Team Alpha, Ice Survey Unit, and future field units.">
      <PlaceholderPanel title="Teams" phase="Phase 2" description="Team structure tied to stations and missions." />
    </HqPageShell>
  );
}
