import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, decimal, integer, pgEnum, json, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum("user_role", ["super_admin", "org_owner", "org_admin", "customer"]);
export const organizationStatusEnum = pgEnum("organization_status", ["active", "suspended", "trial"]);
export const dumpsterStatusEnum = pgEnum("dumpster_status", ["available", "rented", "maintenance", "retired"]);
export const bookingStatusEnum = pgEnum("booking_status", ["pending", "confirmed", "delivered", "picked_up", "completed", "cancelled"]);
export const paymentMethodEnum = pgEnum("payment_method", ["credit_card", "debit_card", "ach"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "completed", "failed", "refunded"]);
export const quoteStatusEnum = pgEnum("quote_status", ["pending", "quoted", "accepted", "rejected", "completed"]);

// Organizations Table
export const organizations = pgTable("organizations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  businessName: text("business_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zip: text("zip").notNull(),
  website: text("website"),
  logo: text("logo"),
  primaryColor: text("primary_color"),
  secondaryColor: text("secondary_color"),
  serviceAreaRadius: integer("service_area_radius").default(25),
  taxRate: decimal("tax_rate", { precision: 5, scale: 4 }).default("0.0000"),
  stripeAccountId: text("stripe_account_id"),
  status: organizationStatusEnum("status").default("trial").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Users Table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  passwordHash: text("password_hash").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  role: userRoleEnum("role").notNull(),
  organizationId: varchar("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
  emailVerified: boolean("email_verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastLogin: timestamp("last_login"),
}, (table) => ({
  // Composite unique constraint for organization-scoped email uniqueness
  emailOrgUnique: unique("users_email_org_unique").on(table.email, table.organizationId),
}));

// Organization Invitations Table
export const organizationInvitations = pgTable("organization_invitations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: userRoleEnum("role").notNull(),
  invitedBy: varchar("invited_by").notNull().references(() => users.id),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  acceptedAt: timestamp("accepted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Dumpster Types Table
export const dumpsterTypes = pgTable("dumpster_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  sizeYards: integer("size_yards").notNull(),
  capacityDescription: text("capacity_description"),
  dailyRate: decimal("daily_rate", { precision: 10, scale: 2 }).notNull(),
  weeklyRate: decimal("weekly_rate", { precision: 10, scale: 2 }).notNull(),
  weightLimitTons: decimal("weight_limit_tons", { precision: 5, scale: 2 }).notNull(),
  overageFeePerTon: decimal("overage_fee_per_ton", { precision: 10, scale: 2 }).default("0"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Dumpster Inventory Table
export const dumpsterInventory = pgTable("dumpster_inventory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  dumpsterTypeId: varchar("dumpster_type_id").notNull().references(() => dumpsterTypes.id),
  unitNumber: text("unit_number").notNull(),
  status: dumpsterStatusEnum("status").default("available").notNull(),
  currentLocation: text("current_location"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Bookings Table
export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  customerId: varchar("customer_id").references(() => users.id),
  dumpsterTypeId: varchar("dumpster_type_id").notNull().references(() => dumpsterTypes.id),
  dumpsterInventoryId: varchar("dumpster_inventory_id").references(() => dumpsterInventory.id),
  bookingNumber: text("booking_number").notNull().unique(),
  status: bookingStatusEnum("status").default("pending").notNull(),
  
  // Customer Info
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  
  // Service Details
  deliveryAddress: text("delivery_address").notNull(),
  deliveryCity: text("delivery_city").notNull(),
  deliveryState: text("delivery_state").notNull(),
  deliveryZip: text("delivery_zip").notNull(),
  deliveryDate: timestamp("delivery_date").notNull(),
  deliveryTimeSlot: text("delivery_time_slot"),
  pickupDate: timestamp("pickup_date"),
  pickupTimeSlot: text("pickup_time_slot"),
  rentalDays: integer("rental_days").notNull(),
  
  // Pricing
  baseRate: decimal("base_rate", { precision: 10, scale: 2 }).notNull(),
  dailyRate: decimal("daily_rate", { precision: 10, scale: 2 }).notNull(),
  deliveryFee: decimal("delivery_fee", { precision: 10, scale: 2 }).default("0"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  depositAmount: decimal("deposit_amount", { precision: 10, scale: 2 }).default("0"),
  amountPaid: decimal("amount_paid", { precision: 10, scale: 2 }).default("0"),
  balanceDue: decimal("balance_due", { precision: 10, scale: 2 }).notNull(),
  
  // Additional
  specialInstructions: text("special_instructions"),
  internalNotes: text("internal_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Junk Hauling Quotes Table
export const junkHaulingQuotes = pgTable("junk_hauling_quotes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  customerId: varchar("customer_id").references(() => users.id),
  quoteNumber: text("quote_number").notNull().unique(),
  status: quoteStatusEnum("status").default("pending").notNull(),
  
  // Customer Info
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  serviceAddress: text("service_address").notNull(),
  serviceCity: text("service_city").notNull(),
  serviceState: text("service_state").notNull(),
  serviceZip: text("service_zip").notNull(),
  
  // Quote Details
  itemDescription: text("item_description").notNull(),
  estimatedVolume: text("estimated_volume"),
  photoUrls: json("photo_urls").$type<string[]>(),
  quoteAmount: decimal("quote_amount", { precision: 10, scale: 2 }),
  notes: text("notes"),
  preferredDate: timestamp("preferred_date"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
});

// Payments Table
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  bookingId: varchar("booking_id").references(() => bookings.id),
  quoteId: varchar("quote_id").references(() => junkHaulingQuotes.id),
  customerId: varchar("customer_id").references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  paymentStatus: paymentStatusEnum("payment_status").default("pending").notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeChargeId: text("stripe_charge_id"),
  transactionDate: timestamp("transaction_date").defaultNow().notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Service Areas Table
export const serviceAreas = pgTable("service_areas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  zipCode: text("zip_code").notNull(),
  deliveryFee: decimal("delivery_fee", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueOrgZip: unique().on(table.organizationId, table.zipCode),
}));

// Blackout Dates Table
export const blackoutDates = pgTable("blackout_dates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Settings Table
export const organizationSettings = pgTable("organization_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().unique().references(() => organizations.id, { onDelete: "cascade" }),
  minimumRentalDays: integer("minimum_rental_days").default(7).notNull(),
  turnaroundHours: integer("turnaround_hours").default(24).notNull(),
  leadTimeHours: integer("lead_time_hours").default(48).notNull(),
  requireCustomerAccount: boolean("require_customer_account").default(false).notNull(),
  allowSameDayPickup: boolean("allow_same_day_pickup").default(false).notNull(),
  bookingConfirmationEmail: boolean("booking_confirmation_email").default(true).notNull(),
  reminderEmailHoursBefore: integer("reminder_email_hours_before").default(24).notNull(),
  cancellationHoursNotice: integer("cancellation_hours_notice").default(48).notNull(),
  cancellationFeePercent: decimal("cancellation_fee_percent", { precision: 5, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert Schemas and Types
export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type Organization = typeof organizations.$inferSelect;

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLogin: true,
  emailVerified: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const insertDumpsterTypeSchema = createInsertSchema(dumpsterTypes).omit({
  id: true,
  createdAt: true,
});
export type InsertDumpsterType = z.infer<typeof insertDumpsterTypeSchema>;
export type DumpsterType = typeof dumpsterTypes.$inferSelect;

export const insertDumpsterInventorySchema = createInsertSchema(dumpsterInventory).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertDumpsterInventory = z.infer<typeof insertDumpsterInventorySchema>;
export type DumpsterInventoryItem = typeof dumpsterInventory.$inferSelect;

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  transactionDate: true,
});
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

export const insertServiceAreaSchema = createInsertSchema(serviceAreas).omit({
  id: true,
  createdAt: true,
});
export type InsertServiceArea = z.infer<typeof insertServiceAreaSchema>;
export type ServiceArea = typeof serviceAreas.$inferSelect;

export const insertOrganizationSettingsSchema = createInsertSchema(organizationSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertOrganizationSettings = z.infer<typeof insertOrganizationSettingsSchema>;
export type OrganizationSettings = typeof organizationSettings.$inferSelect;

export const insertQuoteSchema = createInsertSchema(junkHaulingQuotes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type Quote = typeof junkHaulingQuotes.$inferSelect;

export const insertInvitationSchema = createInsertSchema(organizationInvitations).omit({
  id: true,
  createdAt: true,
  acceptedAt: true,
});
export type InsertInvitation = z.infer<typeof insertInvitationSchema>;
export type Invitation = typeof organizationInvitations.$inferSelect;

export const insertBlackoutDateSchema = createInsertSchema(blackoutDates).omit({
  id: true,
  createdAt: true,
});
export type InsertBlackoutDate = z.infer<typeof insertBlackoutDateSchema>;
export type BlackoutDate = typeof blackoutDates.$inferSelect;
