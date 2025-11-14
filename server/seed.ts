import { db } from "./db";
import { 
  organizations, 
  users, 
  dumpsterTypes, 
  dumpsterInventory,
  organizationSettings,
  serviceAreas,
} from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

async function seed() {
  console.log("🌱 Seeding database...");

  // Generate password hash for "admin123"
  const passwordHash = await bcrypt.hash("admin123", 10);
  console.log("✅ Generated password hash");

  // Check if 1 Call organization already exists
  const existing1Call = await db.select().from(organizations)
    .where(eq(organizations.slug, "1-call-junk-removal"))
    .limit(1);

  let org;
  if (existing1Call.length > 0) {
    console.log("⚠️  1 Call Junk Removal organization already exists, skipping...");
    org = existing1Call[0];
  } else {
    // Create first organization - 1 Call Junk Removal
    const [newOrg] = await db.insert(organizations).values({
    name: "1 Call Junk Removal",
    slug: "1-call-junk-removal",
    businessName: "1 Call Junk Removal LLC",
    email: "info@1calljunkremoval.com",
    phone: "(816) 661-1759",
    address: "123 Main St",
    city: "Kansas City",
    state: "MO",
    zip: "64101",
    serviceAreaRadius: 30,
    taxRate: "0.0875", // 8.75% tax rate for Kansas City
    status: "active",
    website: "https://www.1calljunkremoval.com",
    logo: null,
    primaryColor: "211 85% 42%",
    secondaryColor: "211 85% 42%",
  }).returning();
    org = newOrg;

  console.log("✅ Created organization:", org.name);
  }

  // Create organization settings (only if they don't exist)
  const existingSettings = await db.select().from(organizationSettings)
    .where(eq(organizationSettings.organizationId, org.id))
    .limit(1);

  if (existingSettings.length === 0) {
    await db.insert(organizationSettings).values({
    organizationId: org.id,
    minimumRentalDays: 7,
    turnaroundHours: 24,
    leadTimeHours: 48,
    requireCustomerAccount: false,
    allowSameDayPickup: false,
    bookingConfirmationEmail: true,
    reminderEmailHoursBefore: 24,
    cancellationHoursNotice: 48,
    cancellationFeePercent: "25",
  });

  console.log("✅ Created organization settings");
  } else {
    console.log("⚠️  Organization settings already exist, skipping...");
  }

  // Create super admin user (only if doesn't exist)
  const existingSuperAdmin = await db.select().from(users)
    .where(eq(users.email, "admin@dumpsterpro.com"))
    .limit(1);

  if (existingSuperAdmin.length === 0) {
    const [superAdmin] = await db.insert(users).values({
    email: "admin@dumpsterpro.com",
    passwordHash: passwordHash,
    firstName: "Super",
    lastName: "Admin",
    phone: "(555) 000-0000",
    role: "super_admin",
    emailVerified: true,
  }).returning();

  console.log("✅ Created super admin user");
  } else {
    console.log("⚠️  Super admin user already exists, skipping...");
  }

  // Create organization owner (only if doesn't exist)
  const existingOwner = await db.select().from(users)
    .where(eq(users.email, "owner@1calljunkremoval.com"))
    .limit(1);

  if (existingOwner.length === 0) {
    const [owner] = await db.insert(users).values({
    email: "owner@1calljunkremoval.com",
    passwordHash: passwordHash,
    firstName: "John",
    lastName: "Doe",
    phone: "(816) 661-1759",
    role: "org_owner",
    organizationId: org.id,
    emailVerified: true,
  }).returning();

  console.log("✅ Created organization owner");
  } else {
    console.log("⚠️  Organization owner already exists, skipping...");
  }

  // Create dumpster types (only if they don't exist for this org)
  const existingTypes = await db.select().from(dumpsterTypes)
    .where(eq(dumpsterTypes.organizationId, org.id));

  if (existingTypes.length === 0) {
  // Create dumpster types
  const dumpsterTypesData = [
    {
      organizationId: org.id,
      name: "10 Yard Dumpster",
      sizeYards: 10,
      capacityDescription: "Perfect for small projects like garage cleanouts or minor renovations",
      dailyRate: "45.00",
      weeklyRate: "299.00",
      weightLimitTons: "2.00",
      overageFeePerTon: "75.00",
      imageUrl: "/assets/generated_images/10_yard_dumpster_product_223909e0.png",
      isActive: true,
    },
    {
      organizationId: org.id,
      name: "20 Yard Dumpster",
      sizeYards: 20,
      capacityDescription: "Ideal for medium projects such as kitchen remodels or roof replacements",
      dailyRate: "65.00",
      weeklyRate: "425.00",
      weightLimitTons: "4.00",
      overageFeePerTon: "75.00",
      imageUrl: "/assets/generated_images/20_yard_dumpster_product_0952f587.png",
      isActive: true,
    },
    {
      organizationId: org.id,
      name: "30 Yard Dumpster",
      sizeYards: 30,
      capacityDescription: "Great for large projects including whole-home cleanouts or new construction",
      dailyRate: "85.00",
      weeklyRate: "575.00",
      weightLimitTons: "6.00",
      overageFeePerTon: "75.00",
      imageUrl: "/assets/generated_images/30_yard_dumpster_product_1a26a904.png",
      isActive: true,
    },
    {
      organizationId: org.id,
      name: "40 Yard Dumpster",
      sizeYards: 40,
      capacityDescription: "Best for major commercial projects or large-scale demolitions",
      dailyRate: "105.00",
      weeklyRate: "725.00",
      weightLimitTons: "8.00",
      overageFeePerTon: "75.00",
      imageUrl: "/assets/generated_images/40_yard_dumpster_product_faa9df10.png",
      isActive: true,
    },
  ];

    const createdTypes = await db.insert(dumpsterTypes).values(dumpsterTypesData).returning();
    console.log("✅ Created", createdTypes.length, "dumpster types");

    // Create inventory for each dumpster type
    let totalInventory = 0;
    for (const type of createdTypes) {
      const inventoryCount = type.sizeYards === 20 ? 15 : type.sizeYards === 10 ? 10 : 8; // More 20-yard units
      const inventoryItems = [];

      for (let i = 1; i <= inventoryCount; i++) {
        inventoryItems.push({
          organizationId: org.id,
          dumpsterTypeId: type.id,
          unitNumber: `${type.sizeYards}Y-${String(i).padStart(3, '0')}`,
          status: "available" as const,
        });
      }

      await db.insert(dumpsterInventory).values(inventoryItems);
      totalInventory += inventoryCount;
    }
    console.log("✅ Created", totalInventory, "inventory units");
  } else {
    console.log("⚠️  Dumpster types and inventory already exist, skipping...");
  }

  // Create service areas (Kansas City area ZIP codes) only if they don't exist
  const existingAreas = await db.select().from(serviceAreas)
    .where(eq(serviceAreas.organizationId, org.id));

  if (existingAreas.length === 0) {
  // Create service areas (Kansas City area ZIP codes)
  const serviceAreasData = [
    { organizationId: org.id, zipCode: "64101", deliveryFee: "75.00", isActive: true },
    { organizationId: org.id, zipCode: "64102", deliveryFee: "75.00", isActive: true },
    { organizationId: org.id, zipCode: "64105", deliveryFee: "75.00", isActive: true },
    { organizationId: org.id, zipCode: "64106", deliveryFee: "75.00", isActive: true },
    { organizationId: org.id, zipCode: "64108", deliveryFee: "75.00", isActive: true },
    { organizationId: org.id, zipCode: "64109", deliveryFee: "85.00", isActive: true },
    { organizationId: org.id, zipCode: "64110", deliveryFee: "85.00", isActive: true },
    { organizationId: org.id, zipCode: "64111", deliveryFee: "75.00", isActive: true },
    { organizationId: org.id, zipCode: "64112", deliveryFee: "85.00", isActive: true },
    { organizationId: org.id, zipCode: "64113", deliveryFee: "85.00", isActive: true },
    { organizationId: org.id, zipCode: "64114", deliveryFee: "90.00", isActive: true },
    { organizationId: org.id, zipCode: "64115", deliveryFee: "90.00", isActive: true },
    { organizationId: org.id, zipCode: "64116", deliveryFee: "95.00", isActive: true },
    { organizationId: org.id, zipCode: "64117", deliveryFee: "95.00", isActive: true },
    { organizationId: org.id, zipCode: "64118", deliveryFee: "100.00", isActive: true },
    { organizationId: org.id, zipCode: "64119", deliveryFee: "100.00", isActive: true },
    { organizationId: org.id, zipCode: "64120", deliveryFee: "90.00", isActive: true },
    { organizationId: org.id, zipCode: "64123", deliveryFee: "85.00", isActive: true },
    { organizationId: org.id, zipCode: "64124", deliveryFee: "85.00", isActive: true },
    { organizationId: org.id, zipCode: "64125", deliveryFee: "90.00", isActive: true },
    { organizationId: org.id, zipCode: "64126", deliveryFee: "90.00", isActive: true },
    { organizationId: org.id, zipCode: "64127", deliveryFee: "85.00", isActive: true },
    { organizationId: org.id, zipCode: "64128", deliveryFee: "85.00", isActive: true },
    { organizationId: org.id, zipCode: "64129", deliveryFee: "90.00", isActive: true },
    { organizationId: org.id, zipCode: "64130", deliveryFee: "90.00", isActive: true },
    { organizationId: org.id, zipCode: "64131", deliveryFee: "85.00", isActive: true },
    { organizationId: org.id, zipCode: "64132", deliveryFee: "85.00", isActive: true },
    { organizationId: org.id, zipCode: "64133", deliveryFee: "95.00", isActive: true },
    { organizationId: org.id, zipCode: "64134", deliveryFee: "95.00", isActive: true },
    { organizationId: org.id, zipCode: "64136", deliveryFee: "100.00", isActive: true },
    { organizationId: org.id, zipCode: "64137", deliveryFee: "95.00", isActive: true },
    { organizationId: org.id, zipCode: "64138", deliveryFee: "95.00", isActive: true },
  ];

    await db.insert(serviceAreas).values(serviceAreasData);
    console.log("✅ Created", serviceAreasData.length, "service areas");
  } else {
    console.log("⚠️  Service areas already exist, skipping...");
  }

  // Create test organization (only if doesn't exist)
  const existingTestOrg = await db.select().from(organizations)
    .where(eq(organizations.slug, "test-dumpster-co"))
    .limit(1);

  let testOrg;
  if (existingTestOrg.length > 0) {
    console.log("⚠️  Test organization already exists, skipping...");
    testOrg = existingTestOrg[0];
  } else {
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
    taxRate: "0.0825", // 8.25% tax rate
    status: "active",
    website: "https://www.testdumpster.com",
    logo: null,
    primaryColor: "0 0% 9%",
    secondaryColor: "0 0% 9%",
  }).returning();
    testOrg = newTestOrg;

  console.log("✅ Created test organization:", testOrg.name);

  // Create test organization settings
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

  console.log("✅ Created test organization settings");

  // Create test organization owner
  const [testOwner] = await db.insert(users).values({
    email: "owner@testdumpster.com",
    passwordHash: passwordHash,
    firstName: "Test",
    lastName: "Owner",
    phone: "(555) 123-4567",
    role: "org_owner",
    organizationId: testOrg.id,
    emailVerified: true,
  }).returning();

  console.log("✅ Created test organization owner");

  // Create test dumpster types (simpler set)
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

  const testCreatedTypes = await db.insert(dumpsterTypes).values(testDumpsterTypes).returning();
  console.log("✅ Created", testCreatedTypes.length, "test dumpster types");

  // Create test inventory
  let testTotalInventory = 0;
  for (const type of testCreatedTypes) {
    const inventoryCount = 5; // 5 units of each type
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
    testTotalInventory += inventoryCount;
  }
  console.log("✅ Created", testTotalInventory, "test inventory units");

  // Create test service areas (Dallas area)
  const testServiceAreas = [
    { organizationId: testOrg.id, zipCode: "75001", deliveryFee: "50.00", isActive: true },
    { organizationId: testOrg.id, zipCode: "75002", deliveryFee: "50.00", isActive: true },
    { organizationId: testOrg.id, zipCode: "75006", deliveryFee: "55.00", isActive: true },
    { organizationId: testOrg.id, zipCode: "75007", deliveryFee: "55.00", isActive: true },
    { organizationId: testOrg.id, zipCode: "75019", deliveryFee: "60.00", isActive: true },
  ];

  await db.insert(serviceAreas).values(testServiceAreas);
  console.log("✅ Created", testServiceAreas.length, "test service areas");
  }

  console.log("\n✨ Seed complete!");
  console.log("\nLogin credentials:");
  console.log("Super Admin: admin@dumpsterpro.com / admin123");
  console.log("Org Owner (1 Call): owner@1calljunkremoval.com / admin123");
  console.log("Org Owner (Test): owner@testdumpster.com / admin123");
}

seed()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
