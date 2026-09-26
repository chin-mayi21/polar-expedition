import type { UserRole } from "@prisma/client";
import type { LucideIcon } from "lucide-react";
import { LayoutGrid, Snowflake, Users } from "lucide-react";

export type RoleEntryConfig = {
  role: UserRole;
  title: string;
  description: string;
  icon: LucideIcon;
  iconAccentClass: string;
  demoEmail: string;
};

export const DEMO_PASSWORD = "demo1234";

export const ROLE_ENTRIES: RoleEntryConfig[] = [
  {
    role: "OPERATIONS_OFFICIAL",
    title: "Operations Official",
    description: "Command, logistics and emergency control",
    icon: LayoutGrid,
    iconAccentClass: "text-teal",
    demoEmail: "demo-official@ncpor.test",
  },
  {
    role: "FIELD_PERSONNEL",
    title: "Expedition Personnel",
    description: "Field status, tasks and wellbeing",
    icon: Users,
    iconAccentClass: "text-cyan",
    demoEmail: "demo-field@ncpor.test",
  },
  {
    role: "FAMILY_NOK",
    title: "Family / Next of Kin",
    description: "Verified safety updates from the field",
    icon: Snowflake,
    iconAccentClass: "text-teal",
    demoEmail: "demo-family@ncpor.test",
  },
];

export function isUserRole(value: string): value is UserRole {
  return value === "OPERATIONS_OFFICIAL" || value === "FIELD_PERSONNEL" || value === "FAMILY_NOK";
}

export function getRoleEntry(role: UserRole): RoleEntryConfig | undefined {
  return ROLE_ENTRIES.find((e) => e.role === role);
}
