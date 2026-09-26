import type { FeedItem } from "@/lib/hq/activity-feed";

function relativeTime(date: Date) {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 48) return `${hrs}h ago`;
  return date.toISOString().slice(0, 16).replace("T", " ");
}

export function ActivityFeedPanel({ items }: { items: FeedItem[] }) {
  return (
    <section className="border border-border bg-surface rounded-[2px]">
      <header className="border-b border-border px-4 py-3">
        <h2 className="font-display text-base font-semibold text-text-primary">Recent activity</h2>
        <p className="text-xs text-text-secondary">Human-readable feed from check-ins, cargo, inventory, and audit.</p>
      </header>
      {items.length === 0 ? (
        <p className="px-4 py-6 text-sm text-text-secondary">No events yet for this expedition scope.</p>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((item) => (
            <li key={item.id} className="flex gap-3 px-4 py-3">
              <span className="mt-1.5 h-2 w-2 shrink-0 bg-cyan rounded-[1px]" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-text-primary">{item.text}</p>
                <p className="mt-1 font-mono text-[10px] text-text-secondary">
                  {relativeTime(item.at)}
                  {item.tag ? ` · ${item.tag}` : ""}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
