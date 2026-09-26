"use client";

import { LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

type HqHeaderProps = {
  title: string;
  subtitle?: string;
  userName?: string;
};

export function HqHeader({ title, subtitle, userName }: HqHeaderProps) {
  const router = useRouter();

  async function logout() {
    await signOut({ callbackUrl: "/" });
    router.refresh();
  }

  return (
    <header className="animate-rise-in flex flex-col gap-4 border-b border-border bg-surface/95 px-8 py-6 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan">CryoLink HQ</p>
        <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-text-primary md:text-3xl">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-text-secondary">{subtitle}</p> : null}
      </div>
      <div className="flex items-center gap-3">
        {userName ? (
          <p className="hidden text-sm text-text-secondary sm:block">{userName}</p>
        ) : null}
        <ThemeToggle />
        <Button type="button" variant="secondary" size="sm" onClick={logout} className="gap-2">
          <LogOut className="h-4 w-4" aria-hidden />
          Sign out
        </Button>
      </div>
    </header>
  );
}
