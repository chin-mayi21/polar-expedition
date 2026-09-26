import { z } from "zod";

export const inventoryTransactionSchema = z.object({
  inventoryItemId: z.string().min(1, "Select an inventory item"),
  type: z.enum(["RECEIPT", "CONSUMPTION", "LOSS", "ADJUSTMENT"]),
  quantity: z.number().positive("Quantity must be greater than zero"),
  reference: z.string().max(64).optional().or(z.literal("")),
  note: z.string().max(500).optional().or(z.literal("")),
});

export type InventoryTransactionInput = z.infer<typeof inventoryTransactionSchema>;
