"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@prisma/client";

type GoogleSignInButtonProps = {
  role: UserRole;
  disabled?: boolean;
};

export function GoogleSignInButton({ role, disabled }: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);
  const googleEnabled = Boolean(
    process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true"
  );

  async function onGoogle() {
    setLoading(true);
    try {
      await fetch("/api/oauth/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      await signIn("google", { callbackUrl: "/" });
    } finally {
      setLoading(false);
    }
  }

  if (!googleEnabled) {
    return (
      <p className="text-center text-xs text-text-secondary">
        Google sign-in: add <span className="font-mono">GOOGLE_CLIENT_ID</span> and{" "}
        <span className="font-mono">GOOGLE_CLIENT_SECRET</span> to <span className="font-mono">.env</span>, then set{" "}
        <span className="font-mono">NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true</span>.
      </p>
    );
  }

  return (
    <Button
      type="button"
      variant="secondary"
      className="w-full gap-2"
      disabled={disabled || loading}
      onClick={onGoogle}
    >
      <GoogleMark />
      {loading ? "Redirecting…" : "Continue with Google"}
    </Button>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.083 36 24 36c-7.18 0-13-5.82-13-13s5.82-13 13-13c3.31 0 6.28 1.17 8.62 3.08l6.06-6.06C33.91 4.18 29.24 2 24 2 11.85 2 2 11.85 2 24s9.85 22 22 22c11.05 0 20.45-8.02 20.45-22 0-1.34-.12-2.65-.34-3.92z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.31 0 6.28 1.17 8.62 3.08l6.06-6.06C33.91 4.18 29.24 2 24 2 11.85 2 2 11.85 2 24c0 3.77.92 7.29 2.535 10.41z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.01 0 9.58-1.92 13.09-5.04l-6.05-4.74C29.08 35.91 26.64 37 24 37c-5.03 0-9.31-3.4-10.82-8.01l-6.5 5.01C7.09 39.98 14.77 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a13.94 13.94 0 0 1-4.787 5.785l.003-.002 6.05 4.74C42.012 35.99 44 30.47 44 24c0-1.34-.12-2.65-.34-3.92z"
      />
    </svg>
  );
}
