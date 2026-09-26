"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { CryoLinkBackdrop } from "@/components/brand/cryolink-backdrop";
import { CryoLinkLogo } from "@/components/brand/cryolink-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { authErrorMessage } from "@/lib/auth/auth-error-messages";
import { DEMO_PASSWORD, getRoleEntry, isUserRole } from "@/lib/auth/role-entry";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role") ?? "";
  const errorParam = searchParams.get("error");
  const roleEntry = isUserRole(roleParam) ? getRoleEntry(roleParam) : undefined;

  const [email, setEmail] = useState(roleEntry?.demoEmail ?? "");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const error = formError ?? authErrorMessage(errorParam);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!roleEntry) {
      setFormError("Select a role on the entry screen first.");
      return;
    }
    setFormError(null);
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        expectedRole: roleEntry.role,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === "CredentialsSignin") {
          setFormError(
            "Invalid credentials. Use demo passwords below, sign up for a new account, or run npm run db:seed."
          );
        } else {
          setFormError("Sign-in could not be completed. Check the database setup and try again.");
        }
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setFormError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!roleEntry) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-bg px-4">
        <p className="text-sm text-text-secondary">No role selected.</p>
        <Link href="/" className="mt-4 text-sm font-medium text-cyan underline-offset-2 hover:underline">
          Return to role selection
        </Link>
      </div>
    );
  }

  const RoleIcon = roleEntry.icon;

  return (
    <div className="relative min-h-dvh bg-bg">
      <CryoLinkBackdrop />
      <header className="relative z-10 flex items-center justify-between border-b border-border/80 bg-surface/90 px-6 py-4 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-cyan">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          CryoLink roles
        </Link>
        <ThemeToggle />
      </header>

      <div className="relative z-10 mx-auto max-w-md px-4 py-10 animate-rise-in">
        <CryoLinkLogo href="/" />
        <p className="mt-2 text-sm text-text-secondary">Sign in to continue as {roleEntry.title}</p>
        <div className="mt-8 flex items-start gap-3 rich-card p-4">
          <div className="flex h-10 w-10 items-center justify-center border border-border bg-bg rounded-[2px]">
            <RoleIcon className={`h-5 w-5 ${roleEntry.iconAccentClass}`} strokeWidth={1.75} aria-hidden />
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-text-primary">{roleEntry.title}</p>
            <p className="text-sm text-text-secondary">{roleEntry.description}</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <GoogleSignInButton role={roleEntry.role} disabled={loading} />
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="font-mono text-[10px] uppercase text-text-secondary">or email</span>
            <div className="h-px flex-1 bg-border" />
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-4 space-y-5 rich-card p-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error ? (
            <p className="flex items-center gap-2 text-sm text-red" role="alert">
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
              {error}
            </p>
          ) : null}
          <Button type="submit" variant="navy" size="lg" className="w-full" disabled={loading}>
            {loading ? "Verifying…" : "Sign in"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={loading}
            onClick={() => {
              setEmail(roleEntry.demoEmail);
              setPassword(DEMO_PASSWORD);
            }}
          >
            Fill demo credentials
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-text-secondary">
          No account?{" "}
          <Link href={`/signup?role=${roleEntry.role}`} className="font-medium text-cyan hover:underline">
            Sign up
          </Link>
        </p>
        <div className="mt-6 border border-border bg-bg p-4 text-xs text-text-secondary rounded-[4px]">
          <p className="font-display font-semibold text-text-primary">Demo accounts (run npm run db:seed)</p>
          <ul className="mt-2 space-y-1 font-mono text-[11px]">
            <li>Official: demo-official@ncpor.test</li>
            <li>Field: demo-field@ncpor.test</li>
            <li>Family: demo-family@ncpor.test</li>
          </ul>
          <p className="mt-2">Password for all: <span className="font-mono text-text-primary">demo1234</span></p>
        </div>
      </div>
    </div>
  );
}

