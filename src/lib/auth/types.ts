import type { UserRole } from "@prisma/client";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  personnelId: string | null;
  nextOfKinForId: string | null;
  expeditionIds: string[];
};
