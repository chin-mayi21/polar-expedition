import type { SessionUser } from "@/lib/auth/types";
import type { UserRole } from "@prisma/client";

export function homePathForRole(role: UserRole): string {
  switch (role) {
    case "OPERATIONS_OFFICIAL":
      return "/hq/overview";
    case "FIELD_PERSONNEL":
      return "/field/home";
    case "FAMILY_NOK":
      return "/family/status";
    default:
      return "/login";
  }
}

export function canAccessHq(user: SessionUser): boolean {
  return user.role === "OPERATIONS_OFFICIAL";
}

export function canAccessField(user: SessionUser): boolean {
  return user.role === "FIELD_PERSONNEL";
}

export function canAccessFamily(user: SessionUser): boolean {
  return user.role === "FAMILY_NOK";
}

/** Server-side expedition scope check — use in API routes before mutations */
export function isExpeditionInScope(user: SessionUser, expeditionId: string): boolean {
  return user.expeditionIds.includes(expeditionId);
}
