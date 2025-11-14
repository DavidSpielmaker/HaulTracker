import { db } from "./db";
import {
  users,
  organizations,
  bookings,
  dumpsterTypes,
  dumpsterInventory,
  type User,
  type InsertUser,
  type Organization,
  type InsertOrganization,
  type Booking,
  type InsertBooking,
  type DumpsterType,
  type InsertDumpsterType,
  type DumpsterInventory,
  type InsertDumpsterInventory
} from "@shared/schema";
import { eq, and, gte, lte, count, sum, sql } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByEmailAndOrg(email: string, organizationId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserLastLogin(userId: string): Promise<void>;
  verifyPassword(password: string, hash: string): Promise<boolean>;
  hashPassword(password: string): Promise<string>;

  // Organization operations
  getOrganization(id: string): Promise<Organization | undefined>;
  getOrganizationBySlug(slug: string): Promise<Organization | undefined>;
  getAllOrganizations(): Promise<Organization[]>;
  createOrganization(org: InsertOrganization): Promise<Organization>;
  updateOrganization(id: string, updates: Partial<InsertOrganization>): Promise<Organization | undefined>;
  deleteOrganization(id: string): Promise<void>;

  // Booking operations
  getBooking(id: string): Promise<Booking | undefined>;
  getBookingsByOrganization(organizationId: string): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: string, updates: Partial<InsertBooking>): Promise<Booking | undefined>;
  deleteBooking(id: string): Promise<void>;

  // Dumpster Type operations
  getDumpsterType(id: string): Promise<DumpsterType | undefined>;
  getDumpsterTypesByOrganization(organizationId: string): Promise<DumpsterType[]>;
  createDumpsterType(type: InsertDumpsterType): Promise<DumpsterType>;
  updateDumpsterType(id: string, updates: Partial<InsertDumpsterType>): Promise<DumpsterType | undefined>;
  deleteDumpsterType(id: string): Promise<void>;

  // Dumpster Inventory operations
  getDumpsterInventoryItem(id: string): Promise<DumpsterInventory | undefined>;
  getDumpsterInventoryByOrganization(organizationId: string): Promise<DumpsterInventory[]>;
  getDumpsterInventoryByType(typeId: string): Promise<DumpsterInventory[]>;
  createDumpsterInventoryItem(item: InsertDumpsterInventory): Promise<DumpsterInventory>;
  updateDumpsterInventoryItem(id: string, updates: Partial<InsertDumpsterInventory>): Promise<DumpsterInventory | undefined>;
  deleteDumpsterInventoryItem(id: string): Promise<void>;

  // Dashboard statistics
  getDashboardStats(organizationId: string, date: Date): Promise<{
    todayDeliveries: number;
    todayPickups: number;
    availableUnits: number;
    monthlyRevenue: number;
  }>;
}

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async getUserByEmailAndOrg(email: string, organizationId: string): Promise<User | undefined> {
    const result = await db
      .select()
      .from(users)
      .where(and(
        eq(users.email, email),
        eq(users.organizationId, organizationId)
      ))
      .limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Normalize email to lowercase for all user creation
    const normalizedUser = {
      ...insertUser,
      email: insertUser.email.toLowerCase(),
    };
    const result = await db.insert(users).values(normalizedUser).returning();
    return result[0];
  }

  async updateUserLastLogin(userId: string): Promise<void> {
    await db.update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, userId));
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async getOrganization(id: string): Promise<Organization | undefined> {
    const result = await db.select().from(organizations).where(eq(organizations.id, id)).limit(1);
    return result[0];
  }

  async getOrganizationBySlug(slug: string): Promise<Organization | undefined> {
    const result = await db.select().from(organizations).where(eq(organizations.slug, slug)).limit(1);
    return result[0];
  }

  async getAllOrganizations(): Promise<Organization[]> {
    return await db.select().from(organizations).orderBy(organizations.name);
  }

  async createOrganization(insertOrg: InsertOrganization): Promise<Organization> {
    const result = await db.insert(organizations).values(insertOrg).returning();
    return result[0];
  }

  async updateOrganization(id: string, updates: Partial<InsertOrganization>): Promise<Organization | undefined> {
    const result = await db.update(organizations)
      .set(updates)
      .where(eq(organizations.id, id))
      .returning();
    return result[0];
  }

  async deleteOrganization(id: string): Promise<void> {
    await db.delete(organizations).where(eq(organizations.id, id));
  }

  // Booking operations
  async getBooking(id: string): Promise<Booking | undefined> {
    const result = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
    return result[0];
  }

  async getBookingsByOrganization(organizationId: string): Promise<Booking[]> {
    return await db.select().from(bookings)
      .where(eq(bookings.organizationId, organizationId))
      .orderBy(sql`${bookings.deliveryDate} DESC`);
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const result = await db.insert(bookings).values(insertBooking).returning();
    return result[0];
  }

  async updateBooking(id: string, updates: Partial<InsertBooking>): Promise<Booking | undefined> {
    const result = await db.update(bookings)
      .set(updates)
      .where(eq(bookings.id, id))
      .returning();
    return result[0];
  }

  async deleteBooking(id: string): Promise<void> {
    await db.delete(bookings).where(eq(bookings.id, id));
  }

  // Dumpster Type operations
  async getDumpsterType(id: string): Promise<DumpsterType | undefined> {
    const result = await db.select().from(dumpsterTypes).where(eq(dumpsterTypes.id, id)).limit(1);
    return result[0];
  }

  async getDumpsterTypesByOrganization(organizationId: string): Promise<DumpsterType[]> {
    return await db.select().from(dumpsterTypes)
      .where(eq(dumpsterTypes.organizationId, organizationId))
      .orderBy(dumpsterTypes.size);
  }

  async createDumpsterType(insertType: InsertDumpsterType): Promise<DumpsterType> {
    const result = await db.insert(dumpsterTypes).values(insertType).returning();
    return result[0];
  }

  async updateDumpsterType(id: string, updates: Partial<InsertDumpsterType>): Promise<DumpsterType | undefined> {
    const result = await db.update(dumpsterTypes)
      .set(updates)
      .where(eq(dumpsterTypes.id, id))
      .returning();
    return result[0];
  }

  async deleteDumpsterType(id: string): Promise<void> {
    await db.delete(dumpsterTypes).where(eq(dumpsterTypes.id, id));
  }

  // Dumpster Inventory operations
  async getDumpsterInventoryItem(id: string): Promise<DumpsterInventory | undefined> {
    const result = await db.select().from(dumpsterInventory).where(eq(dumpsterInventory.id, id)).limit(1);
    return result[0];
  }

  async getDumpsterInventoryByOrganization(organizationId: string): Promise<DumpsterInventory[]> {
    return await db.select().from(dumpsterInventory)
      .where(eq(dumpsterInventory.organizationId, organizationId))
      .orderBy(dumpsterInventory.unitNumber);
  }

  async getDumpsterInventoryByType(typeId: string): Promise<DumpsterInventory[]> {
    return await db.select().from(dumpsterInventory)
      .where(eq(dumpsterInventory.dumpsterTypeId, typeId))
      .orderBy(dumpsterInventory.unitNumber);
  }

  async createDumpsterInventoryItem(insertItem: InsertDumpsterInventory): Promise<DumpsterInventory> {
    const result = await db.insert(dumpsterInventory).values(insertItem).returning();
    return result[0];
  }

  async updateDumpsterInventoryItem(id: string, updates: Partial<InsertDumpsterInventory>): Promise<DumpsterInventory | undefined> {
    const result = await db.update(dumpsterInventory)
      .set(updates)
      .where(eq(dumpsterInventory.id, id))
      .returning();
    return result[0];
  }

  async deleteDumpsterInventoryItem(id: string): Promise<void> {
    await db.delete(dumpsterInventory).where(eq(dumpsterInventory.id, id));
  }

  // Dashboard statistics
  async getDashboardStats(organizationId: string, date: Date): Promise<{
    todayDeliveries: number;
    todayPickups: number;
    availableUnits: number;
    monthlyRevenue: number;
  }> {
    const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    // Count today's deliveries
    const deliveriesResult = await db.select({ count: count() })
      .from(bookings)
      .where(and(
        eq(bookings.organizationId, organizationId),
        gte(bookings.deliveryDate, today),
        lte(bookings.deliveryDate, tomorrow)
      ));

    // Count today's pickups
    const pickupsResult = await db.select({ count: count() })
      .from(bookings)
      .where(and(
        eq(bookings.organizationId, organizationId),
        gte(bookings.pickupDate, today),
        lte(bookings.pickupDate, tomorrow)
      ));

    // Count available units
    const availableResult = await db.select({ count: count() })
      .from(dumpsterInventory)
      .where(and(
        eq(dumpsterInventory.organizationId, organizationId),
        eq(dumpsterInventory.status, "available")
      ));

    // Calculate monthly revenue
    const revenueResult = await db.select({
      total: sum(bookings.totalAmount)
    })
      .from(bookings)
      .where(and(
        eq(bookings.organizationId, organizationId),
        gte(bookings.deliveryDate, monthStart),
        lte(bookings.deliveryDate, monthEnd),
        eq(bookings.paymentStatus, "paid")
      ));

    return {
      todayDeliveries: deliveriesResult[0]?.count || 0,
      todayPickups: pickupsResult[0]?.count || 0,
      availableUnits: availableResult[0]?.count || 0,
      monthlyRevenue: Number(revenueResult[0]?.total || 0),
    };
  }
}

export const storage = new DbStorage();
