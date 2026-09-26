import { IncidentStatus } from "@prisma/client";

export type IncidentAction =
  | "acknowledge"
  | "start_investigation"
  | "activate_response"
  | "resolve"
  | "close";

export function canPerformIncidentAction(status: IncidentStatus, action: IncidentAction): boolean {
  switch (action) {
    case "acknowledge":
      return status === IncidentStatus.NEW;
    case "start_investigation":
      return status === IncidentStatus.NEW || status === IncidentStatus.ACKNOWLEDGED;
    case "activate_response":
      return (
        status === IncidentStatus.INVESTIGATING || status === IncidentStatus.ACKNOWLEDGED
      );
    case "resolve":
      return (
        status === IncidentStatus.INVESTIGATING || status === IncidentStatus.RESPONSE_ACTIVE
      );
    case "close":
      return status === IncidentStatus.RESOLVED;
    default:
      return false;
  }
}

export function statusAfterIncidentAction(
  status: IncidentStatus,
  action: IncidentAction
): IncidentStatus {
  switch (action) {
    case "acknowledge":
      return IncidentStatus.ACKNOWLEDGED;
    case "start_investigation":
      return IncidentStatus.INVESTIGATING;
    case "activate_response":
      return IncidentStatus.RESPONSE_ACTIVE;
    case "resolve":
      return IncidentStatus.RESOLVED;
    case "close":
      return IncidentStatus.CLOSED;
    default:
      return status;
  }
}
