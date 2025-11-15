import { db } from "./db";
import { organizations, users, organizationSettings, dumpsterTypes, dumpsterInventory, serviceAreas } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

async function addTestOrg() {
  console.log("🌱 Adding test organization and user...\n");

  // Generate password hash for "admin123"
  const passwordHash = await bcrypt.hash("admin123", 10);

  // Check if test org already exists
  const existingTestOrg = await db.select().from(organizations)
    .where(eq(organizations.slug, "test-dumpster-co"))
    .limit(1);

  let testOrg;
  if (existingTestOrg.length > 0) {
    console.log("✅ Test organization already exists");
    testOrg = existingTestOrg[0];
  } else {
    console.log("Creating test organization...");
    const [newTestOrg] = await db.insert(organizations).values({
      name: "Test Dumpster Co",
      slug: "test-dumpster-co",
      businessName: "Test Dumpster Company LLC",
      email: "info@testdumpster.com",
      phone: "(555) 123-4567",
      address: "456 Test Ave",
      city: "Test City",
      state: "TX",
      zip: "75001",
      serviceAreaRadius: 25,
      taxRate: "0.0825",
      status: "active",
      website: "https://www.testdumpster.com",
      logo: null,
      primaryColor: "0 0% 9%",
      secondaryColor: "0 0% 9%",
    }).returning();
    testOrg = newTestOrg;
    console.log("✅ Created test organization");
  }

  // Check if test user already exists
  const existingTestUser = await db.select().from(users)
    .where(eq(users.email, "owner@testdumpster.com"))
    .limit(1);

  if (existingTestUser.length > 0) {
    console.log("✅ Test user already exists, updating password...");
    await db.update(users)
      .set({ passwordHash })
      .where(eq(users.email, "owner@testdumpster.com"));
    console.log("✅ Password updated for owner@testdumpster.com");
  } else {
    console.log("Creating test user...");
    await db.insert(users).values({
      email: "owner@testdumpster.com",
      passwordHash: passwordHash,
      firstName: "Test",
      lastName: "Owner",
      phone: "(555) 123-4567",
      role: "org_owner",
      organizationId: testOrg.id,
      emailVerified: true,
    });
    console.log("✅ Created test user");
  }

  // Create org settings if they don't exist
  const existingSettings = await db.select().from(organizationSettings)
    .where(eq(organizationSettings.organizationId, testOrg.id))
    .limit(1);

  if (existingSettings.length === 0) {
    console.log("Creating organization settings...");
    await db.insert(organizationSettings).values({
      organizationId: testOrg.id,
      minimumRentalDays: 7,
      turnaroundHours: 24,
      leadTimeHours: 48,
      requireCustomerAccount: false,
      allowSameDayPickup: true,
      bookingConfirmationEmail: true,
      reminderEmailHoursBefore: 24,
      cancellationHoursNotice: 24,
      cancellationFeePercent: "20",
    });
    console.log("✅ Created organization settings");
  } else {
    console.log("✅ Organization settings already exist");
  }

  // Create dumpster types if they don't exist
  const existingTypes = await db.select().from(dumpsterTypes)
    .where(eq(dumpsterTypes.organizationId, testOrg.id));

  if (existingTypes.length === 0) {
    console.log("Creating dumpster types...");
    const testDumpsterTypes = [
      {
        organizationId: testOrg.id,
        name: "15 Yard Dumpster",
        sizeYards: 15,
        capacityDescription: "Medium-sized dumpster for residential projects",
        dailyRate: "55.00",
        weeklyRate: "350.00",
        weightLimitTons: "3.00",
        overageFeePerTon: "80.00",
        imageUrl: null,
        isActive: true,
      },
      {
        organizationId: testOrg.id,
        name: "25 Yard Dumpster",
        sizeYards: 25,
        capacityDescription: "Large dumpster for bigger projects",
        dailyRate: "75.00",
        weeklyRate: "500.00",
        weightLimitTons: "5.00",
        overageFeePerTon: "80.00",
        imageUrl: null,
        isActive: true,
      },
    ];

    const createdTypes = await db.insert(dumpsterTypes).values(testDumpsterTypes).returning();
    console.log(`✅ Created ${createdTypes.length} dumpster types`);

    // Create inventory
    let totalInventory = 0;
    for (const type of createdTypes) {
      const inventoryCount = 5;
      const inventoryItems = [];

      for (let i = 1; i <= inventoryCount; i++) {
        inventoryItems.push({
          organizationId: testOrg.id,
          dumpsterTypeId: type.id,
          unitNumber: `TEST-${type.sizeYards}Y-${String(i).padStart(3, '0')}`,
          status: "available" as const,
        });
      }

      await db.insert(dumpsterInventory).values(inventoryItems);
      totalInventory += inventoryCount;
    }
    console.log(`✅ Created ${totalInventory} inventory units`);
  } else {
    console.log("✅ Dumpster types and inventory already exist");
  }

  // Create service areas if they don't exist
  const existingAreas = await db.select().from(serviceAreas)
    .where(eq(serviceAreas.organizationId, testOrg.id));

  if (existingAreas.length === 0) {
    console.log("Creating service areas...");
    const testServiceAreas = [
      { organizationId: testOrg.id, zipCode: "75001", deliveryFee: "50.00", isActive: true },
      { organizationId: testOrg.id, zipCode: "75002", deliveryFee: "50.00", isActive: true },
      { organizationId: testOrg.id, zipCode: "75006", deliveryFee: "55.00", isActive: true },
      { organizationId: testOrg.id, zipCode: "75007", deliveryFee: "55.00", isActive: true },
      { organizationId: testOrg.id, zipCode: "75019", deliveryFee: "60.00", isActive: true },
    ];

    await db.insert(serviceAreas).values(testServiceAreas);
    console.log(`✅ Created ${testServiceAreas.length} service areas`);
  } else {
    console.log("✅ Service areas already exist");
  }

  console.log("\n✨ Test organization setup complete!");
  console.log("\nLogin credentials:");
  console.log("Email: owner@testdumpster.com");
  console.log("Password: admin123");
}

addTestOrg()
  .catch((error) => {
    console.error("❌ Failed:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
