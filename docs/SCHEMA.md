# POLAR-NEXUS — Prisma schema summary

Source: `prisma/schema.prisma` (SQLite local dev).

## Core spine

```
User ↔ Expedition (UserExpeditionScope for HQ)
Personnel ↔ Team ↔ Station ↔ Expedition
Mission ↔ Team ↔ CheckIn / Incident
CargoItem ↔ CargoEvent (append-only pipeline history)
InventoryItem ↔ InventoryTransaction (ledger — no quantity column on item)
Asset ↔ Station / Expedition
AuditEvent, SyncOperation
```

## Inventory rule

**On-hand = SUM(inventory_transaction.quantity)** per item. Status in UI:

- `AVAILABLE` — on hand ≥ threshold  
- `LOW` — on hand &lt; threshold  
- `CRITICAL` — on hand ≤ 0  

## Seed

```bash
npm run db:reset   # push + seed
npm run db:seed    # seed only
```

Produces **ISEA-44** (Day 18 of 180), ~15 personnel, 4 teams, 3 missions (one overdue), 30 cargo lines, 10 inventory SKUs (≥1 below threshold), 6 assets, check-ins, closed incident, audit rows.

Demo logins (password `demo1234`):

| Role | Email |
|------|--------|
| Official | demo-official@ncpor.test |
| Field | demo-field@ncpor.test |
| Family | demo-family@ncpor.test |

## Verify data (optional)

```bash
npx tsx -e "const {PrismaClient}=require('@prisma/client'); const p=new PrismaClient(); p.inventoryItem.count().then(c=>console.log('inventory',c));"
```
