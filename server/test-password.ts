import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

async function testPassword() {
  const email = process.argv[2];
  const password = process.argv[3] || "admin123";

  if (!email) {
    console.log("Usage: npx tsx server/test-password.ts <email> [password]");
    console.log("Example: npx tsx server/test-password.ts owner@testdumpster.com admin123");
    return;
  }

  console.log(`\n🔍 Testing login for: ${email}`);
  console.log(`Password: ${password}\n`);

  // Find user
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (result.length === 0) {
    console.log("❌ User not found!");
    return;
  }

  const user = result[0];
  console.log(`✅ User found:`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Name: ${user.firstName} ${user.lastName}`);
  console.log(`   Role: ${user.role}`);
  console.log(`   Org ID: ${user.organizationId || 'None'}`);

  // Test password
  console.log(`\n🔐 Testing password...`);
  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (isValid) {
    console.log(`✅ Password is CORRECT! Login should work.`);
  } else {
    console.log(`❌ Password is INCORRECT!`);
    console.log(`\nGenerating new hash for "${password}"...`);
    const newHash = await bcrypt.hash(password, 10);
    console.log(`\nTo fix, run this in Render shell:`);
    console.log(`npx tsx -e "import { db } from './server/db'; import { users } from '@shared/schema'; import { eq } from 'drizzle-orm'; await db.update(users).set({ passwordHash: '${newHash}' }).where(eq(users.email, '${email}')); console.log('Password updated!'); process.exit(0);"`);
  }
}

testPassword()
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
