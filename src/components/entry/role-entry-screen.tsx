"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PolarLogo } from "@/components/brand/polar-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { ROLE_ENTRIES } from "@/lib/auth/role-entry";
import { cn } from "@/lib/utils";

export function RoleEntryScreen() {
  return (
    <div className="min-h-dvh bg-bg">
      <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-4">
        <PolarLogo />
        <div className="flex items-center gap-4">
          <p className="hidden font-mono text-[10px] uppercase tracking-widest text-text-secondary sm:block">
            MoES / NCPOR
          </p>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="max-w-2xl border-b border-border pb-8">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary">
            Sign in to POLAR-NEXUS
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">
            Select your access role to continue. Authorization is verified on the server after sign-in — this
            selection is for navigation only.
          </p>
        </div>

        <div className="mt-6 border border-border bg-surface px-4 py-3 text-xs text-text-secondary rounded-[2px]">
          <span className="font-medium text-text-primary">Judge demo:</span> seed once, then sign in with{" "}
          <span className="font-mono">demo-official@ncpor.test</span> / <span className="font-mono">demo1234</span>
        </div>

        <ul className="mt-6 grid gap-3 md:grid-cols-3">
          {ROLE_ENTRIES.map((entry) => {
            const Icon = entry.icon;
            return (
              <li key={entry.role}>
                <Link
                  href={`/login?role=${entry.role}`}
                  className={cn(
                    "group flex h-full flex-col border border-border bg-surface p-5",
                    "rounded-[4px] transition-colors hover:border-cyan",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className="flex h-10 w-10 items-center justify-center border border-border bg-bg rounded-[2px]"
                      aria-hidden
                    >
                      <Icon className={cn("h-5 w-5", entry.iconAccentClass)} strokeWidth={1.75} />
                    </div>
                    <ChevronRight
                      className="h-4 w-4 text-text-secondary opacity-0 transition-opacity group-hover:opacity-100"
                      aria-hidden
                    />
                  </div>
                  <h2 className="mt-4 font-display text-lg font-semibold text-text-primary">{entry.title}</h2>
                  <p className="mt-2 flex-1 text-sm leading-snug text-text-secondary">{entry.description}</p>
                  <p className="mt-4 font-mono text-[10px] uppercase tracking-wide text-text-secondary">
                    Continue to credentials →
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
