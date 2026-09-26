import { CheckInStatus } from "@prisma/client";

export function checkInStatusForSubmission(
  lastCheckInAt: Date | null,
  intervalMinutes: number,
  now = new Date()
): CheckInStatus {
  if (!lastCheckInAt) return CheckInStatus.ON_TIME;
  const elapsedMs = now.getTime() - lastCheckInAt.getTime();
  const intervalMs = intervalMinutes * 60 * 1000;
  if (elapsedMs <= intervalMs) return CheckInStatus.ON_TIME;
  if (elapsedMs <= intervalMs * 2) return CheckInStatus.LATE;
  return CheckInStatus.MISSED;
}
