"use client";

import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FamilyRefreshButton() {
  const router = useRouter();
  return (
    <Button type="button" variant="secondary" size="sm" className="gap-2" onClick={() => router.refresh()}>
      <RefreshCw className="h-4 w-4" aria-hidden />
      Refresh status
    </Button>
  );
}
