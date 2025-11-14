import { db } from "./db";
import { users } from "@shared/schema";

async function checkUsers() {
  console.log("🔍 Checking users in database...\n");

  const allUsers = await db.select({
    id: users.id,
    email: users.email,
    firstName: users.firstName,
    lastName: users.lastName,
    role: users.role,
    organizationId: users.organizationId,
  }).from(users);

  if (allUsers.length === 0) {
    console.log("❌ No users found in database!");
    return;
  }

  console.log(`Found ${allUsers.length} users:\n`);

  for (const user of allUsers) {
    console.log(`Email: ${user.email}`);
    console.log(`Name: ${user.firstName} ${user.lastName}`);
    console.log(`Role: ${user.role}`);
    console.log(`Org ID: ${user.organizationId || 'None'}`);
    console.log('---');
  }
}

checkUsers()
  .catch((error) => {
    console.error("❌ Check failed:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
