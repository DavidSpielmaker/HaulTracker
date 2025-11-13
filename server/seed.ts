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

  // Create first organization - 1 Call Junk Removal
  const [org] = await db.insert(organizations).values({
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

  console.log("✅ Created organization:", org.name);

  // Create organization settings
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

  // Create super admin user
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

  // Create organization owner
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

  console.log("\n✨ Seed complete!");
  console.log("\nLogin credentials:");
  console.log("Super Admin: admin@dumpsterpro.com / admin123");
  console.log("Org Owner: owner@1calljunkremoval.com / admin123");
}

seed()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
