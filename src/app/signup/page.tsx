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
import { getRoleEntry, isUserRole } from "@/lib/auth/role-entry";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role") ?? "";
  const roleEntry = isUserRole(roleParam) ? getRoleEntry(roleParam) : undefined;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!roleEntry) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role: roleEntry.role,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Sign-up failed.");
        return;
      }

      const signInResult = await signIn("credentials", {
        email,
        password,
        expectedRole: roleEntry.role,
        redirect: false,
      });

      if (signInResult?.error) {
        setError("Account created. Please sign in with your email and password.");
        router.push(`/login?role=${roleEntry.role}`);
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!roleEntry) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-bg px-4">
        <p className="text-sm text-text-secondary">Select a role first.</p>
        <Link href="/" className="mt-4 text-sm font-medium text-cyan hover:underline">
          Back to role selection
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
        <p className="mt-2 text-sm text-text-secondary">Create your CryoLink account</p>
        <div className="mt-8 flex items-start gap-3 rich-card p-4">
          <div className="flex h-10 w-10 items-center justify-center border border-border bg-bg rounded-[2px]">
            <RoleIcon className={`h-5 w-5 ${roleEntry.iconAccentClass}`} strokeWidth={1.75} aria-hidden />
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-text-primary">Create account</p>
            <p className="text-sm text-text-secondary">{roleEntry.title}</p>
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

        <form onSubmit={onSubmit} className="mt-4 space-y-4 rich-card p-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password (min. 8 characters)</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
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
            {loading ? "Creating account…" : "Sign up"}
          </Button>
        </form>

        {roleEntry.role === "FAMILY_NOK" ? (
          <p className="mt-4 text-xs leading-relaxed text-text-secondary">
            New family accounts link to the next available expedition member in the demo database. If sign-up
            fails, use <span className="font-mono">demo-family@ncpor.test</span> /{" "}
            <span className="font-mono">demo1234</span> after{" "}
            <span className="font-mono">npm run db:seed</span>.
          </p>
        ) : null}
        <p className="mt-4 text-center text-sm text-text-secondary">
          Already have an account?{" "}
          <Link href={`/login?role=${roleEntry.role}`} className="font-medium text-cyan hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
