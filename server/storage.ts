import { db } from "./db";
import { users, organizations, type User, type InsertUser, type Organization } from "@shared/schema";
import { eq, and } from "drizzle-orm";
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
}

export const storage = new DbStorage();
