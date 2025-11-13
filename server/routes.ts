import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import ConnectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import { storage } from "./storage";
import { requireAuth, requireRole, type AuthRequest } from "./middleware/auth";
import { insertUserSchema, type User } from "@shared/schema";
import { z } from "zod";

const PgSession = ConnectPgSimple(session);

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Validate SESSION_SECRET is set
  if (!process.env.SESSION_SECRET && process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be set in production");
  }

  // Session middleware with enhanced security
  app.use(
    session({
      store: new PgSession({
        pool,
        tableName: "user_sessions",
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET || "dev-secret-change-in-production",
      resave: false,
      saveUninitialized: false,
      name: "sessionId", // Don't use default 'connect.sid'
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict", // CSRF protection
      },
    })
  );

  // Customer registration for public booking (organization-specific)
  app.post("/api/auth/register/customer", async (req, res) => {
    try {
      const registerSchema = z.object({
        email: z.string().email(),
        password: z.string().min(8, "Password must be at least 8 characters"),
        firstName: z.string().min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required"),
        phone: z.string().optional(),
        organizationId: z.string().min(1, "Organization is required"),
      });

      const validatedData = registerSchema.parse(req.body);
      
      // Normalize email to lowercase
      const normalizedEmail = validatedData.email.toLowerCase();

      // Verify organization exists
      const org = await storage.getOrganization(validatedData.organizationId);
      if (!org) {
        return res.status(400).json({ message: "Invalid organization" });
      }

      // Check if user already exists in this organization (organization-scoped)
      const existingUser = await storage.getUserByEmailAndOrg(normalizedEmail, validatedData.organizationId);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered for this organization" });
      }

      // Hash password
      const passwordHash = await storage.hashPassword(validatedData.password);

      // Create customer user (role is always 'customer' for public registration)
      const { password, email, ...userDataWithoutPassword } = validatedData;
      const user = await storage.createUser({
        ...userDataWithoutPassword,
        email: normalizedEmail, // Use normalized email
        passwordHash,
        role: "customer", // Force customer role for security
      });

      // Regenerate session to prevent fixation attacks
      req.session.regenerate((err) => {
        if (err) {
          console.error("Session regeneration error:", err);
          return res.status(500).json({ message: "Failed to create session" });
        }

        // Set session inside callback
        req.session.userId = user.id;

        // Return user without password hash
        const { passwordHash: _, ...userWithoutHash } = user;
        res.json(userWithoutHash);
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Failed to register user" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const loginSchema = z.object({
        email: z.string().email(),
        password: z.string().min(1),
        organizationId: z.string().optional(), // Required for non-super-admin login
      });

      const { email, password, organizationId } = loginSchema.parse(req.body);

      // Get user by email and organization (or just email for super_admin)
      let user;
      if (organizationId) {
        // Organization-scoped login for org users and customers
        user = await storage.getUserByEmailAndOrg(email.toLowerCase(), organizationId);
      } else {
        // Global login for super_admin (no organization)
        user = await storage.getUserByEmail(email.toLowerCase());
        // Ensure only super_admin can login without organization context
        if (user && user.role !== "super_admin") {
          return res.status(401).json({ message: "Organization required for login" });
        }
      }

      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Verify password
      const isValid = await storage.verifyPassword(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Update last login
      await storage.updateUserLastLogin(user.id);

      // Regenerate session to prevent fixation attacks
      req.session.regenerate((err) => {
        if (err) {
          console.error("Session regeneration error:", err);
          return res.status(500).json({ message: "Failed to log in" });
        }

        // Set session
        req.session.userId = user.id;

        // Return user without password hash
        const { passwordHash: _, ...userWithoutHash } = user;
        res.json(userWithoutHash);
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Login error:", error);
      res.status(500).json({ message: "Failed to log in" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to log out" });
      }
      // Clear the session cookie
      res.clearCookie("sessionId");
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { passwordHash: _, ...userWithoutHash } = user;
      res.json(userWithoutHash);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Example protected routes using middleware

  // Get current user's organization (protected, requires authentication)
  app.get("/api/organization/current", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(404).json({ message: "User has no organization" });
      }

      const org = await storage.getOrganization(req.user.organizationId);
      if (!org) {
        return res.status(404).json({ message: "Organization not found" });
      }

      res.json(org);
    } catch (error) {
      console.error("Get organization error:", error);
      res.status(500).json({ message: "Failed to get organization" });
    }
  });

  // Super admin only route example
  app.get("/api/admin/stats", requireAuth, requireRole("super_admin"), async (req: AuthRequest, res) => {
    try {
      // Example protected endpoint - only super_admin can access
      res.json({ message: "Admin stats endpoint - super_admin only" });
    } catch (error) {
      console.error("Admin stats error:", error);
      res.status(500).json({ message: "Failed to get stats" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
