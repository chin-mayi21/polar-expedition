import { FieldBottomNav } from "@/components/layout/field-bottom-nav";
import { FieldSyncProvider } from "@/components/field/field-sync-provider";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { CryoLinkLogo } from "@/components/brand/cryolink-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import type { Metadata } from "next";

export const metadata: Metadata = {
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "CryoLink Field" },
};

export default async function FieldLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "FIELD_PERSONNEL") {
    redirect("/");
  }

  return (
    <FieldSyncProvider>
      <div className="flex min-h-dvh flex-col bg-bg pb-24">
        <header className="flex items-center justify-between border-b border-border px-4 py-4">
          <CryoLinkLogo compact />
          <div className="flex items-center gap-2">
            <span className="max-w-[10rem] truncate text-sm text-muted-foreground">{session.name}</span>
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 px-4 py-6">{children}</main>
        <FieldBottomNav />
      </div>
    </FieldSyncProvider>
  );
}
