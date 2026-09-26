import { Construction } from "lucide-react";

export function PlaceholderPanel({
  title,
  phase,
  description,
}: {
  title: string;
  phase: string;
  description: string;
}) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 rounded-2xl border border-dashed border-border bg-surface/50 p-10 text-center duration-300">
      <Construction className="mx-auto h-10 w-10 text-amber" aria-hidden />
      <h2 className="mt-4 text-xl font-semibold text-foreground">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <p className="mt-6 inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
        {phase}
      </p>
    </div>
  );
}
