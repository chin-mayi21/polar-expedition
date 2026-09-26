import { CheckCircle2, XCircle } from "lucide-react";
import type { ReadinessRule } from "@/lib/expedition/readiness-explained";

export function ReadinessRulesPanel({
  expeditionName,
  pass,
  rules,
}: {
  expeditionName: string;
  pass: boolean;
  rules: ReadinessRule[];
}) {
  const byCategory = rules.reduce(
    (acc, rule) => {
      if (!acc[rule.category]) acc[rule.category] = [];
      acc[rule.category].push(rule);
      return acc;
    },
    {} as Record<string, ReadinessRule[]>
  );

  return (
    <section className="border border-border bg-surface rounded-[2px]" aria-labelledby="readiness-rules-heading">
      <header className="border-b border-border px-4 py-3">
        <h2 id="readiness-rules-heading" className="font-display text-lg font-semibold text-text-primary">
          Explainable readiness engine
        </h2>
        <p className="mt-1 text-xs text-text-secondary">
          {expeditionName} — {pass ? "All rules pass" : "Activation blockers listed with reasons"}
        </p>
      </header>
      <div className="divide-y divide-border">
        {Object.entries(byCategory).map(([category, items]) => (
          <div key={category} className="px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-text-secondary">{category}</p>
            <ul className="mt-2 space-y-2">
              {items.map((rule) => (
                <li key={rule.key} className="flex gap-2 text-sm">
                  {rule.pass ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-teal" aria-hidden />
                  ) : (
                    <XCircle className="h-4 w-4 shrink-0 text-red" aria-hidden />
                  )}
                  <div>
                    <p className="font-medium text-text-primary">{rule.label}</p>
                    <p className="text-xs leading-relaxed text-text-secondary">{rule.explanation}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
