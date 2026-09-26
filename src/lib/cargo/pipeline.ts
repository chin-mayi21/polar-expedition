import { CargoItemStatus } from "@prisma/client";
import { z } from "zod";

export const PIPELINE_ORDER: CargoItemStatus[] = [
  CargoItemStatus.PACKED,
  CargoItemStatus.DISPATCHED,
  CargoItemStatus.IN_TRANSIT,
  CargoItemStatus.DELIVERED,
];

export function nextPipelineStatus(current: CargoItemStatus): CargoItemStatus | null {
  if (current === CargoItemStatus.CREATED) return CargoItemStatus.PACKED;
  const idx = PIPELINE_ORDER.indexOf(current);
  if (idx === -1 || idx === PIPELINE_ORDER.length - 1) return null;
  return PIPELINE_ORDER[idx + 1];
}

export const packedEvidenceSchema = z.object({
  manifestId: z.string().min(1),
  packer: z.string().min(1),
  packedAt: z.string().datetime(),
});

export const dispatchedEvidenceSchema = z.object({
  origin: z.string().min(1),
  carrier: z.string().min(1),
  dispatchedAt: z.string().datetime(),
});

export const inTransitEvidenceSchema = z.object({
  milestone: z.string().min(1),
  source: z.string().min(1),
  milestoneAt: z.string().datetime(),
});

export const deliveredEvidenceSchema = z.object({
  recipient: z.string().min(1),
  confirmedAt: z.string().datetime(),
});

export const issueEvidenceSchema = z.object({
  reason: z.string().min(3),
  owner: z.string().min(1),
  nextAction: z.string().min(3),
  evidence: z.string().min(3),
});

export type CargoTransition =
  | { type: "advance" }
  | { type: "delayed"; evidence: z.infer<typeof issueEvidenceSchema> }
  | { type: "damaged"; evidence: z.infer<typeof issueEvidenceSchema> };

export function evidenceSchemaForTransition(from: CargoItemStatus, to: CargoItemStatus) {
  if (from === CargoItemStatus.CREATED && to === CargoItemStatus.PACKED) return packedEvidenceSchema;
  if (from === CargoItemStatus.PACKED && to === CargoItemStatus.DISPATCHED) return dispatchedEvidenceSchema;
  if (from === CargoItemStatus.DISPATCHED && to === CargoItemStatus.IN_TRANSIT) return inTransitEvidenceSchema;
  if (from === CargoItemStatus.IN_TRANSIT && to === CargoItemStatus.DELIVERED) return deliveredEvidenceSchema;
  return null;
}
