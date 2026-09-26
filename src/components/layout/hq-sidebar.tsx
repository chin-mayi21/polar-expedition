"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Compass,
  Users,
  Map,
  MapPinned,
  LifeBuoy,
  Package,
  Boxes,
  Wrench,
  Siren,
  FileBarChart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PolarLogo } from "@/components/brand/polar-logo";

const navItems = [
  { href: "/hq/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/hq/expeditions", label: "Expeditions", icon: Compass },
  { href: "/hq/personnel", label: "Personnel & Teams", icon: Users },
  { href: "/hq/missions", label: "Missions", icon: Map },
  { href: "/hq/map", label: "Field map", icon: MapPinned },
  { href: "/hq/rescue", label: "Rescue", icon: LifeBuoy },
  { href: "/hq/cargo", label: "Cargo & Logistics", icon: Package },
  { href: "/hq/inventory", label: "Inventory", icon: Boxes },
  { href: "/hq/assets", label: "Assets", icon: Wrench },
  { href: "/hq/emergency", label: "Emergency Control Center", icon: Siren },
  { href: "/hq/reports", label: "Reports & Audit", icon: FileBarChart },
] as const;

export function HqSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-navy text-white">
      <div className="border-b border-white/10 px-5 py-6">
        <PolarLogo className="[&_p]:text-white [&_.font-display]:text-white" />
        <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-white/70">Operations — HQ</p>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-4" aria-label="HQ navigation">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            pathname.startsWith(`${href}/`) ||
            (href === "/hq/personnel" && pathname.startsWith("/hq/teams"));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-h-10 items-center gap-3 px-3 py-2 text-sm font-medium rounded-[2px] transition-colors",
                active
                  ? "bg-white/10 text-cyan"
                  : "text-white/75 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              <span className="leading-snug">{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
