"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { MissionReport } from "@/lib/reports/mission-report";

export function MissionReportPanel({
  missions,
}: {
  missions: { id: string; code: string; title: string }[];
}) {
  const [missionId, setMissionId] = useState(missions[0]?.id ?? "");
  const [report, setReport] = useState<MissionReport | null>(null);
  const [busy, setBusy] = useState(false);

  async function generate() {
    if (!missionId) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/hq/missions/${missionId}/report`);
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Could not generate report.");
        return;
      }
      setReport(json.report);
      toast.success("Mission report synthesized.");
    } finally {
      setBusy(false);
    }
  }

  async function copyMarkdown() {
    if (!report) return;
    await navigator.clipboard.writeText(report.markdown);
    toast.success("Markdown copied.");
  }

  return (
    <section className="border border-border bg-surface rounded-[2px]" aria-labelledby="mission-report-heading">
      <header className="border-b border-border px-4 py-3">
        <h2 id="mission-report-heading" className="font-display text-lg font-semibold text-text-primary">
          AI mission report (synthesis)
        </h2>
        <p className="mt-1 text-xs text-text-secondary">
          Deterministic narrative from DB state — demo stand-in for LLM mission debrief. Export via copy.
        </p>
      </header>
      <div className="space-y-4 p-4">
        <select
          className="h-11 w-full border border-border px-3 text-sm rounded-[2px]"
          value={missionId}
          onChange={(e) => {
            setMissionId(e.target.value);
            setReport(null);
          }}
        >
          {missions.map((m) => (
            <option key={m.id} value={m.id}>
              {m.code} — {m.title}
            </option>
          ))}
        </select>
        <Button variant="navy" size="sm" disabled={busy || !missionId} onClick={generate}>
          Generate report
        </Button>
        {report ? (
          <div className="space-y-3 border border-border bg-bg p-4 rounded-[2px]">
            <p className="font-mono text-[10px] text-text-secondary">
              {report.generator} · {report.generatedAt.slice(0, 19)}Z
            </p>
            <p className="text-xs italic text-text-secondary">{report.disclaimer}</p>
            {report.sections.map((s) => (
              <div key={s.id}>
                <h3 className="text-sm font-semibold text-text-primary">{s.title}</h3>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">{s.body}</p>
              </div>
            ))}
            <Button variant="secondary" size="sm" onClick={copyMarkdown}>
              Copy markdown
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
