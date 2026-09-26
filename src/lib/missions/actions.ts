import { MissionStatus } from "@prisma/client";

export type MissionAction = "activate" | "mark_delayed" | "mark_returned" | "cancel";

export function canPerformAction(status: MissionStatus, action: MissionAction): boolean {
  switch (action) {
    case "activate":
      return status === MissionStatus.PLANNED;
    case "mark_delayed":
      return status === MissionStatus.ACTIVE || status === MissionStatus.PLANNED;
    case "mark_returned":
      return status === MissionStatus.ACTIVE || status === MissionStatus.OVERDUE;
    case "cancel":
      return status === MissionStatus.PLANNED || status === MissionStatus.OVERDUE;
    default:
      return false;
  }
}

export function statusAfterAction(status: MissionStatus, action: MissionAction): MissionStatus {
  switch (action) {
    case "activate":
      return MissionStatus.ACTIVE;
    case "mark_delayed":
      return MissionStatus.OVERDUE;
    case "mark_returned":
      return MissionStatus.RETURNED;
    case "cancel":
      return MissionStatus.CANCELLED;
    default:
      return status;
  }
}
