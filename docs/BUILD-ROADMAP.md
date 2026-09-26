# POLAR-NEXUS — spec → build status

This file maps the **full SIH26062 prompt** to implementation phases.  
**Checkpoint (approved before mass UI):** schema + seed + login + **HQ Inventory** (ledger + simulator).

## Checkpoint — click now

| Step | URL / command |
|------|----------------|
| Role entry | `/` |
| Login | `/login?role=OPERATIONS_OFFICIAL` |
| Demo official | `demo-official@ncpor.test` / `demo1234` |
| Working HQ page | `/hq/inventory` — post transaction, refresh, chart updates |
| Verify DB | `npx tsx scripts/verify-seed.ts` |
| Reseed | `npm run db:seed` |

## Phase status

| Phase | Spec section | Status |
|-------|----------------|--------|
| 1 | Prisma + seed | **Done (MVP schema)** — not full entity list yet |
| 2 | Auth + 3 roles + middleware | **Done** — HQ Specialist / hash-chain audit / 403 tests **pending** |
| 3 | HQ Overview + 9-step expedition | **Done (MVP)** — live attention queries, feed, 9-step workflow + readiness gate |
| 4 | Personnel, missions, cargo, inventory | **Done (MVP)** — roster/teams, mission actions, cargo pipeline UI, assets CRUD; inventory ledger from phase 2 |
| 5 | Field PWA + offline + SOS | **Done (MVP)** — IndexedDB queue, `/api/field/sync`, check-in, SOS hold, supplies consumption |
| 6 | Family portal | **Done (MVP)** — NOK-scoped status API + safe check-in summary (no HQ ops leakage) |
| 7 | ECC + readiness engine | **Done (MVP)** — incident lifecycle actions, emergency packet, explainable readiness rules |
| 8 | Reports/Audit reproducible | **Done (MVP)** — ops summary, resupply + readiness on reports, audit trail + JSON export |
| 9 | AI report, GPS, Rescue dashboard | **Done (MVP)** — synthesis report API, `/hq/map` MapLibre, `/hq/rescue` |

## Schema: implemented vs full spec

**In `prisma/schema.prisma` today:**  
User, UserExpeditionScope, Expedition, Station, Team, Personnel, Mission, MissionPersonnel, CheckIn, CargoItem, CargoEvent, InventoryItem, InventoryTransaction, Asset, Incident, AuditEvent, SyncOperation, ExpeditionReadinessItem.

**Spec still to model (later phases):**  
Separate Role/Permission tables, Objective, Task, CheckInRule, Shipment, InventoryLocation, Threshold entity, AssetAssignment, AssetCondition, MaintenanceRecord, IncidentTrigger, ResponseAction, Message, DeliveryState, audit hash-chain fields, expanded enums (Expedition Paused, Mission Assigned→Ready→Returning, etc.), HQ Lead vs Specialist roles.

**Inventory rule:** enforced — no `quantity` on `InventoryItem`; UI uses `InventoryTransaction` + computed balance.

## RBAC matrix (target)

| Role | Current enum | Spec |
|------|----------------|------|
| HQ Lead | `OPERATIONS_OFFICIAL` | Full expedition scope via `UserExpeditionScope` |
| HQ Specialist | — | **Not in schema yet** |
| Field | `FIELD_PERSONNEL` | Scoped via `Personnel` / missions |
| Family | `FAMILY_NOK` | `nextOfKinForId` — queries scoped to linked personnel only (`/api/family/status`) |

## Next build slice

Polish / hardening: hash-chain audit, HQ Specialist role, E2E tests, production deploy.

Phases 1–9 are clickable for judge demo.
