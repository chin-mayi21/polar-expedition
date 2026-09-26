import { Suspense } from "react";

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="min-h-dvh bg-bg" />}>{children}</Suspense>;
}
