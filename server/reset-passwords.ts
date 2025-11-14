import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

async function resetPasswords() {
  console.log("🔑 Resetting passwords...");

  // Generate password hash for "admin123"
  const passwordHash = await bcrypt.hash("admin123", 10);
  console.log("✅ Generated password hash");

  // Update super admin password
  await db.update(users)
    .set({ passwordHash })
    .where(eq(users.email, "admin@dumpsterpro.com"));
  console.log("✅ Reset password for admin@dumpsterpro.com");

  // Update 1 Call owner password
  await db.update(users)
    .set({ passwordHash })
    .where(eq(users.email, "owner@1calljunkremoval.com"));
  console.log("✅ Reset password for owner@1calljunkremoval.com");

  // Update test org owner password (if exists)
  const result = await db.update(users)
    .set({ passwordHash })
    .where(eq(users.email, "owner@testdumpster.com"))
    .returning();

  if (result.length > 0) {
    console.log("✅ Reset password for owner@testdumpster.com");
  }

  console.log("\n✨ Password reset complete!");
  console.log("\nAll passwords are now: admin123");
}

resetPasswords()
  .catch((error) => {
    console.error("❌ Password reset failed:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
