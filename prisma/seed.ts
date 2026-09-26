import {
  PrismaClient,
  UserRole,
  ExpeditionStatus,
  PersonnelStatus,
  MissionStatus,
  CargoItemStatus,
  CargoEventType,
  InventoryTransactionType,
  AssetStatus,
  IncidentStatus,
  IncidentSeverity,
  CheckInStatus,
  AuditAction,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const DEMO_PASSWORD = "demo1234";

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function daysFromNow(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

function hoursAgo(h: number) {
  const d = new Date();
  d.setHours(d.getHours() - h);
  return d;
}

async function main() {
  await prisma.auditEvent.deleteMany();
  await prisma.syncOperation.deleteMany();
  await prisma.inventoryTransaction.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.cargoEvent.deleteMany();
  await prisma.cargoItem.deleteMany();
  await prisma.checkIn.deleteMany();
  await prisma.missionPersonnel.deleteMany();
  await prisma.mission.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.expeditionReadinessItem.deleteMany();
  await prisma.userExpeditionScope.deleteMany();
  await prisma.user.deleteMany();
  await prisma.personnel.deleteMany();
  await prisma.team.deleteMany();
  await prisma.station.deleteMany();
  await prisma.expedition.deleteMany();

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const plannedStart = daysAgo(18);
  const plannedEnd = daysFromNow(180 - 18);

  const expedition = await prisma.expedition.create({
    data: {
      code: "ISEA-44",
      name: "44th Indian Antarctic Expedition (ISEA-44)",
      description: "National polar research rotation — Maitri and Bharati stations operational.",
      destination: "Dronning Maud Land sector — Maitri & Bharati",
      objectives:
        "Glaciological survey, atmospheric monitoring, station resupply, and traverse safety validation.",
      status: ExpeditionStatus.ACTIVE,
      season: "2025-26",
      plannedStart,
      plannedEnd,
      activatedAt: plannedStart,
      readinessItems: {
        create: [
          { key: "personnel_roster", label: "Personnel roster approved", isComplete: true },
          { key: "cargo_manifest", label: "Outbound cargo manifest verified", isComplete: true },
          { key: "medical_clearance", label: "Medical clearance complete", isComplete: false },
          { key: "comms_plan", label: "Communications plan signed off", isComplete: true },
          { key: "emergency_contacts", label: "Emergency contacts & response process", isComplete: false },
        ],
      },
    },
  });

  const [maitri, bharati] = await Promise.all([
    prisma.station.create({
      data: {
        expeditionId: expedition.id,
        name: "Maitri",
        code: "MAITRI",
        latitude: -70.7667,
        longitude: 11.7333,
        elevationM: 130,
      },
    }),
    prisma.station.create({
      data: {
        expeditionId: expedition.id,
        name: "Bharati",
        code: "BHARATI",
        latitude: -69.4103,
        longitude: 76.1964,
        elevationM: 45,
      },
    }),
  ]);

  const [teamAlpha, iceSurvey, logisticsSupport, commsRelay] = await Promise.all([
    prisma.team.create({
      data: { expeditionId: expedition.id, stationId: maitri.id, name: "Team Alpha", callsign: "ALPHA-1" },
    }),
    prisma.team.create({
      data: { expeditionId: expedition.id, stationId: bharati.id, name: "Ice Survey Unit", callsign: "ICE-SURV" },
    }),
    prisma.team.create({
      data: {
        expeditionId: expedition.id,
        stationId: maitri.id,
        name: "Logistics Support",
        callsign: "LOG-SPT",
      },
    }),
    prisma.team.create({
      data: {
        expeditionId: expedition.id,
        stationId: bharati.id,
        name: "Comms Relay",
        callsign: "COMMS-2",
      },
    }),
  ]);

  const personnelData = [
    { code: "INAE-1001", name: "Dr. Priya Nair", role: "Chief Scientist", team: teamAlpha, med: false },
    { code: "INAE-1002", name: "Lt. Ananya Sharma", role: "Field Team Lead", team: teamAlpha, med: false },
    { code: "INAE-1003", name: "Dr. Rohit Menon", role: "Glaciologist", team: teamAlpha, med: false },
    { code: "INAE-1004", name: "Capt. Meera Iyer", role: "Logistics Officer", team: logisticsSupport, med: false },
    { code: "INAE-1005", name: "Arjun Deshpande", role: "Meteorologist", team: iceSurvey, med: true },
    { code: "INAE-1006", name: "Kavitha Reddy", role: "Medical Officer", team: logisticsSupport, med: false },
    { code: "INAE-1007", name: "Vikram Singh", role: "Mechanic", team: logisticsSupport, med: false },
    { code: "INAE-1008", name: "Neha Kapoor", role: "Comms Specialist", team: commsRelay, med: false },
    { code: "INAE-1009", name: "Sanjay Pillai", role: "Ice Core Technician", team: iceSurvey, med: true },
    { code: "INAE-1010", name: "Divya Krishnan", role: "Field Safety Officer", team: teamAlpha, med: false },
    { code: "INAE-1011", name: "Rahul Bose", role: "Chef / Rations", team: logisticsSupport, med: false },
    { code: "INAE-1012", name: "Aisha Khan", role: "Data Analyst", team: commsRelay, med: false },
    { code: "INAE-1013", name: "Manish Gupta", role: "Vehicle Operator", team: logisticsSupport, med: false },
    { code: "INAE-1014", name: "Lakshmi Venkat", role: "Station Engineer", team: iceSurvey, med: false },
    { code: "INAE-1015", name: "Aditya Joshi", role: "Research Assistant", team: teamAlpha, med: true },
  ] as const;

  const personnelRecords: { id: string; name: string }[] = [];
  for (const p of personnelData) {
    const rec = await prisma.personnel.create({
      data: {
        expeditionId: expedition.id,
        teamId: p.team.id,
        employeeCode: p.code,
        fullName: p.name,
        roleTitle: p.role,
        status: PersonnelStatus.ACTIVE,
        medicalClearancePending: p.med,
      },
    });
    personnelRecords.push({ id: rec.id, name: p.name });
  }

  await prisma.personnel.updateMany({
    where: { teamId: teamAlpha.id },
    data: { lastDeviceSyncAt: hoursAgo(1) },
  });
  await prisma.personnel.updateMany({
    where: { teamId: iceSurvey.id },
    data: { lastDeviceSyncAt: hoursAgo(6) },
  });

  const [lead, glaciologist] = personnelRecords.slice(1, 3);

  const missionActive = await prisma.mission.create({
    data: {
      expeditionId: expedition.id,
      teamId: teamAlpha.id,
      leadId: lead.id,
      title: "DML traverse — ice core survey",
      code: "MSN-ALPHA-12",
      status: MissionStatus.ACTIVE,
      plannedDepartAt: daysAgo(3),
      expectedReturnAt: daysFromNow(2),
      checkInIntervalMinutes: 180,
      lastCheckInAt: daysAgo(0.2),
      briefingNotes: "Maintain 3-hour check-in cadence. Simulated GPS for demo.",
      personnel: {
        create: [{ personnelId: lead.id }, { personnelId: glaciologist.id }],
      },
    },
  });

  const missionOverdue = await prisma.mission.create({
    data: {
      expeditionId: expedition.id,
      teamId: iceSurvey.id,
      leadId: personnelRecords[4].id,
      title: "Coastal radar calibration run",
      code: "MSN-ICE-04",
      status: MissionStatus.OVERDUE,
      plannedDepartAt: daysAgo(5),
      expectedReturnAt: daysAgo(1),
      checkInIntervalMinutes: 120,
      lastCheckInAt: daysAgo(2.5),
      personnel: {
        create: [{ personnelId: personnelRecords[4].id }, { personnelId: personnelRecords[8].id }],
      },
    },
  });

  await prisma.mission.create({
    data: {
      expeditionId: expedition.id,
      teamId: logisticsSupport.id,
      title: "Inter-station fuel cache inspection",
      code: "MSN-LOG-02",
      status: MissionStatus.PLANNED,
      plannedDepartAt: daysFromNow(4),
      expectedReturnAt: daysFromNow(6),
      checkInIntervalMinutes: 240,
    },
  });

  const official = await prisma.user.create({
    data: {
      email: "demo-official@ncpor.test",
      name: "Demo Official",
      passwordHash,
      role: UserRole.OPERATIONS_OFFICIAL,
      expeditionScopes: { create: { expeditionId: expedition.id } },
    },
  });

  const fieldPersonnel = personnelRecords[1];
  const fieldUser = await prisma.user.create({
    data: {
      email: "demo-field@ncpor.test",
      name: fieldPersonnel.name,
      passwordHash,
      role: UserRole.FIELD_PERSONNEL,
      personnelId: fieldPersonnel.id,
    },
  });

  await prisma.user.create({
    data: {
      email: "demo-family@ncpor.test",
      name: "Family Contact",
      passwordHash,
      role: UserRole.FAMILY_NOK,
      nextOfKinForId: fieldPersonnel.id,
    },
  });

  const cargoStatuses: CargoItemStatus[] = [
    CargoItemStatus.DELIVERED,
    CargoItemStatus.DELIVERED,
    CargoItemStatus.IN_TRANSIT,
    CargoItemStatus.IN_TRANSIT,
    CargoItemStatus.DISPATCHED,
    CargoItemStatus.PACKED,
    CargoItemStatus.DELAYED,
    CargoItemStatus.DAMAGED,
  ];

  for (let i = 1; i <= 30; i++) {
    const status = cargoStatuses[i % cargoStatuses.length];
    const item = await prisma.cargoItem.create({
      data: {
        expeditionId: expedition.id,
        manifestCode: `CGO-ISEA-${String(i).padStart(3, "0")}`,
        description:
          i % 3 === 0
            ? "Science payload — sensor modules (crated)"
            : i % 3 === 1
              ? "Station consumables — dry rations pallet"
              : "Spare parts — generator service kit",
        weightKg: 120 + i * 15,
        status,
        originStationId: i % 2 === 0 ? maitri.id : bharati.id,
        destinationStationId: i % 2 === 0 ? bharati.id : maitri.id,
      },
    });
    await prisma.cargoEvent.create({
      data: {
        cargoItemId: item.id,
        eventType: CargoEventType.STATUS_CHANGE,
        toStatus: status,
        note: status === CargoItemStatus.DELAYED ? "Blizzard hold — ETA +48h" : "Manifest logged",
        actorUserId: official.id,
      },
    });
  }

  const inventoryDefs = [
    { sku: "FUEL-DIESEL-L", name: "Station diesel reserve", cat: "Fuel", unit: "L", th: 5000, rate: 320, station: maitri, receipt: 28000, consume: 25000 },
    { sku: "FOOD-RATION-KG", name: "Dry ration stores", cat: "Rations", unit: "kg", th: 800, rate: 45, station: maitri, receipt: 4200, consume: 2100 },
    { sku: "MED-O2-CYL", name: "Medical oxygen cylinders", cat: "Medical", unit: "cyl", th: 6, rate: 0.2, station: maitri, receipt: 24, consume: 4 },
    { sku: "MED-SUPPLY-KIT", name: "Field medical kits", cat: "Medical", unit: "kit", th: 4, rate: 0.1, station: bharati, receipt: 12, consume: 2 },
    { sku: "SPARE-GEN-FILTER", name: "Generator air filters", cat: "Spares", unit: "ea", th: 8, rate: 0.05, station: bharati, receipt: 20, consume: 6 },
    { sku: "FUEL-AVGAS-L", name: "Aviation fuel (helo)", cat: "Fuel", unit: "L", th: 1200, rate: 80, station: bharati, receipt: 6000, consume: 5200 },
    { sku: "WATER-POTABLE-L", name: "Potable water reserve", cat: "Life support", unit: "L", th: 3000, rate: 200, station: maitri, receipt: 18000, consume: 9000 },
    { sku: "CHEM-ETHANOL-L", name: "Lab ethanol", cat: "Science", unit: "L", th: 40, rate: 2, station: maitri, receipt: 120, consume: 45 },
    { sku: "BATT-LITHIUM-EA", name: "Lithium battery packs", cat: "Comms", unit: "ea", th: 15, rate: 1, station: bharati, receipt: 40, consume: 28 },
    { sku: "SPARE-TRACK-PAD", name: "PistenBully track pads", cat: "Spares", unit: "set", th: 2, rate: 0.02, station: maitri, receipt: 4, consume: 3 },
  ];

  for (const inv of inventoryDefs) {
    await prisma.inventoryItem.create({
      data: {
        expeditionId: expedition.id,
        stationId: inv.station.id,
        sku: inv.sku,
        name: inv.name,
        category: inv.cat,
        unit: inv.unit,
        lowStockThreshold: inv.th,
        dailyConsumptionRate: inv.rate,
        transactions: {
          create: [
            {
              type: InventoryTransactionType.RECEIPT,
              quantity: inv.receipt,
              reference: `RCV-${inv.sku}`,
              actorUserId: official.id,
              occurredAt: daysAgo(30),
            },
            {
              type: InventoryTransactionType.CONSUMPTION,
              quantity: -inv.consume,
              reference: `USE-WEEKLY`,
              actorUserId: official.id,
              occurredAt: daysAgo(2),
            },
          ],
        },
      },
    });
  }

  const assets = [
    { tag: "SNOW-MAITRI-03", name: "PistenBully PB300", cat: "Vehicle", st: maitri, status: AssetStatus.OPERATIONAL },
    { tag: "GEN-MAITRI-01", name: "Primary generator set", cat: "Power", st: maitri, status: AssetStatus.OPERATIONAL },
    { tag: "GEN-BHARATI-01", name: "Backup generator", cat: "Power", st: bharati, status: AssetStatus.MAINTENANCE },
    { tag: "COMMS-HF-02", name: "HF radio suite", cat: "Comms", st: bharati, status: AssetStatus.OPERATIONAL },
    { tag: "SNOW-BHARATI-01", name: "Hagglunds BV206", cat: "Vehicle", st: bharati, status: AssetStatus.OPERATIONAL },
    { tag: "SAT-LINK-01", name: "Satellite terminal", cat: "Comms", st: maitri, status: AssetStatus.OPERATIONAL },
  ];
  for (const a of assets) {
    await prisma.asset.create({
      data: {
        expeditionId: expedition.id,
        stationId: a.st.id,
        assetTag: a.tag,
        name: a.name,
        category: a.cat,
        status: a.status,
        lastServiceAt: daysAgo(14),
      },
    });
  }

  await prisma.checkIn.createMany({
    data: [
      {
        missionId: missionActive.id,
        personnelId: lead.id,
        status: CheckInStatus.ON_TIME,
        message: "Camp established — all systems nominal",
        simulatedLatitude: -71.02,
        simulatedLongitude: 12.14,
        checkedInAt: daysAgo(0.2),
      },
      {
        missionId: missionActive.id,
        personnelId: glaciologist.id,
        status: CheckInStatus.ON_TIME,
        message: "Core sample 3 logged",
        checkedInAt: daysAgo(0.5),
      },
      {
        missionId: missionOverdue.id,
        personnelId: personnelRecords[4].id,
        status: CheckInStatus.LATE,
        message: "Delayed by whiteout — proceeding when safe",
        checkedInAt: daysAgo(2.5),
      },
    ],
  });

  await prisma.incident.create({
    data: {
      expeditionId: expedition.id,
      missionId: missionOverdue.id,
      title: "Open comms check — Ice Survey Unit",
      severity: IncidentSeverity.HIGH,
      status: IncidentStatus.INVESTIGATING,
      summary: "Follow-up after overdue return window — not auto-SOS.",
      lastConfirmedLat: -69.5,
      lastConfirmedLng: 76.1,
      lastConfirmedAt: daysAgo(2),
      currentStatusSummary: "HQ investigating; field team last check-in late.",
      createdAt: daysAgo(1),
    },
  });

  await prisma.incident.create({
    data: {
      expeditionId: expedition.id,
      missionId: missionOverdue.id,
      title: "Minor equipment failure — resolved",
      severity: IncidentSeverity.LOW,
      status: IncidentStatus.CLOSED,
      summary: "Generator starter relay replaced; no injury.",
      lastConfirmedLat: -69.5,
      lastConfirmedLng: 76.1,
      lastConfirmedAt: daysAgo(10),
      currentStatusSummary: "Closed after field repair and HQ acknowledgement.",
      resolvedAt: daysAgo(9),
      createdAt: daysAgo(11),
    },
  });

  await prisma.auditEvent.createMany({
    data: [
      {
        actorUserId: official.id,
        expeditionId: expedition.id,
        entityType: "Expedition",
        entityId: expedition.id,
        action: AuditAction.ACTIVATE,
        newState: JSON.stringify({ status: "ACTIVE", code: expedition.code }),
      },
      {
        actorUserId: fieldUser.id,
        expeditionId: expedition.id,
        entityType: "CheckIn",
        entityId: missionActive.id,
        action: AuditAction.CREATE,
        metadata: JSON.stringify({ mission: "MSN-ALPHA-12" }),
      },
      {
        actorUserId: official.id,
        expeditionId: expedition.id,
        entityType: "CargoItem",
        entityId: expedition.id,
        action: AuditAction.STATUS_CHANGE,
        metadata: JSON.stringify({ note: "Delayed cargo flagged" }),
      },
    ],
  });

  console.log("POLAR-NEXUS seed complete (ISEA-44).");
  console.log("Demo logins (password for all: demo1234):");
  console.log("  Official:", "demo-official@ncpor.test");
  console.log("  Field:", "demo-field@ncpor.test");
  console.log("  Family:", "demo-family@ncpor.test");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
