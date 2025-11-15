import { db } from "../db";
import { sql } from "drizzle-orm";

async function addBillingFields() {
  console.log("🔄 Adding billing fields to organizations table...");

  try {
    // Create billing_cycle enum if it doesn't exist
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE billing_cycle AS ENUM ('monthly', 'quarterly', 'annual');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Add billing columns to organizations table
    await db.execute(sql`
      ALTER TABLE organizations
      ADD COLUMN IF NOT EXISTS subscription_amount DECIMAL(10, 2),
      ADD COLUMN IF NOT EXISTS billing_cycle billing_cycle,
      ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS next_billing_date TIMESTAMP;
    `);

    console.log("✅ Billing fields added successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}

addBillingFields()
  .catch((error) => {
    console.error("Migration error:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
