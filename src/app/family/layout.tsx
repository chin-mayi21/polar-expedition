import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { CryoLinkLogo } from "@/components/brand/cryolink-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default async function FamilyLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "FAMILY_NOK") {
    redirect("/");
  }

  if (!session.nextOfKinForId) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        <p className="text-sm text-text-secondary">
          Your account is not linked to an expedition member. Contact HQ to complete NOK registration.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-bg">
      <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-4">
        <CryoLinkLogo compact />
        <div className="flex items-center gap-2">
          <span className="max-w-[10rem] truncate text-sm text-text-secondary">{session.name}</span>
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto max-w-lg px-4 py-8">{children}</main>
    </div>
  );
}
