import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import ConnectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import { storage } from "./storage";
import { requireAuth, requireRole, type AuthRequest } from "./middleware/auth";
import { insertUserSchema, insertOrganizationSchema, type User } from "@shared/schema";
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
      });

      const { email, password } = loginSchema.parse(req.body);
      const normalizedEmail = email.toLowerCase();

      // Find user by email (automatically handles multi-tenant lookup)
      const user = await storage.getUserByEmail(normalizedEmail);

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

  // Organization management routes (super_admin only)

  // Get all organizations
  app.get("/api/admin/organizations", requireAuth, requireRole("super_admin"), async (req: AuthRequest, res) => {
    try {
      const orgs = await storage.getAllOrganizations();
      res.json(orgs);
    } catch (error) {
      console.error("Get organizations error:", error);
      res.status(500).json({ message: "Failed to get organizations" });
    }
  });

  // Get organization by ID
  app.get("/api/admin/organizations/:id", requireAuth, requireRole("super_admin"), async (req: AuthRequest, res) => {
    try {
      const org = await storage.getOrganization(req.params.id);
      if (!org) {
        return res.status(404).json({ message: "Organization not found" });
      }
      res.json(org);
    } catch (error) {
      console.error("Get organization error:", error);
      res.status(500).json({ message: "Failed to get organization" });
    }
  });

  // Create organization
  app.post("/api/admin/organizations", requireAuth, requireRole("super_admin"), async (req: AuthRequest, res) => {
    try {
      // Extend the insert schema to add slug validation regex
      const createOrgSchema = insertOrganizationSchema.extend({
        slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
      });

      const validatedData = createOrgSchema.parse(req.body);

      // Check if slug already exists
      const existingOrg = await storage.getOrganizationBySlug(validatedData.slug);
      if (existingOrg) {
        return res.status(400).json({ message: "Organization with this slug already exists" });
      }

      const org = await storage.createOrganization(validatedData);
      res.status(201).json(org);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Create organization error:", error);
      res.status(500).json({ message: "Failed to create organization" });
    }
  });

  // Update organization
  app.patch("/api/admin/organizations/:id", requireAuth, requireRole("super_admin"), async (req: AuthRequest, res) => {
    try {
      // Make all fields optional for partial updates, but maintain slug validation if provided
      const updateOrgSchema = insertOrganizationSchema.extend({
        slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
      }).partial();

      const validatedData = updateOrgSchema.parse(req.body);

      // If updating slug, check for conflicts
      if (validatedData.slug) {
        const existingOrg = await storage.getOrganizationBySlug(validatedData.slug);
        if (existingOrg && existingOrg.id !== req.params.id) {
          return res.status(400).json({ message: "Organization with this slug already exists" });
        }
      }

      const org = await storage.updateOrganization(req.params.id, validatedData);
      if (!org) {
        return res.status(404).json({ message: "Organization not found" });
      }
      res.json(org);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Update organization error:", error);
      res.status(500).json({ message: "Failed to update organization" });
    }
  });

  // Delete organization
  app.delete("/api/admin/organizations/:id", requireAuth, requireRole("super_admin"), async (req: AuthRequest, res) => {
    try {
      await storage.deleteOrganization(req.params.id);
      res.json({ message: "Organization deleted successfully" });
    } catch (error) {
      console.error("Delete organization error:", error);
      res.status(500).json({ message: "Failed to delete organization" });
    }
  });

  // Public route to get organization by slug (for booking pages)
  // Only returns safe public-facing fields
  app.get("/api/organizations/:slug", async (req, res) => {
    try {
      const org = await storage.getOrganizationBySlug(req.params.slug);
      if (!org) {
        return res.status(404).json({ message: "Organization not found" });
      }
      
      // Return only public-safe fields for booking pages
      const publicOrg = {
        id: org.id,
        name: org.name,
        slug: org.slug,
        phone: org.phone,
        city: org.city,
        state: org.state,
        website: org.website,
        logo: org.logo,
        primaryColor: org.primaryColor,
        secondaryColor: org.secondaryColor,
      };
      
      res.json(publicOrg);
    } catch (error) {
      console.error("Get organization by slug error:", error);
      res.status(500).json({ message: "Failed to get organization" });
    }
  });

  // Dashboard stats endpoint
  app.get("/api/dashboard/stats", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(400).json({ message: "User has no organization" });
      }

      const stats = await storage.getDashboardStats(req.user.organizationId, new Date());
      res.json(stats);
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      res.status(500).json({ message: "Failed to get dashboard stats" });
    }
  });

  // Bookings endpoints
  app.get("/api/bookings", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(400).json({ message: "User has no organization" });
      }

      const bookings = await storage.getBookingsByOrganization(req.user.organizationId);
      res.json(bookings);
    } catch (error) {
      console.error("Get bookings error:", error);
      res.status(500).json({ message: "Failed to get bookings" });
    }
  });

  app.get("/api/bookings/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const booking = await storage.getBooking(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Verify user has access to this booking's organization
      if (req.user?.role !== "super_admin" && booking.organizationId !== req.user?.organizationId) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(booking);
    } catch (error) {
      console.error("Get booking error:", error);
      res.status(500).json({ message: "Failed to get booking" });
    }
  });

  app.post("/api/bookings", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(400).json({ message: "User has no organization" });
      }

      // Ensure organizationId matches the user's organization
      const bookingData = {
        ...req.body,
        organizationId: req.user.organizationId,
      };

      const booking = await storage.createBooking(bookingData);
      res.status(201).json(booking);
    } catch (error) {
      console.error("Create booking error:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.patch("/api/bookings/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const existingBooking = await storage.getBooking(req.params.id);
      if (!existingBooking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Verify user has access to this booking's organization
      if (req.user?.role !== "super_admin" && existingBooking.organizationId !== req.user?.organizationId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const booking = await storage.updateBooking(req.params.id, req.body);
      res.json(booking);
    } catch (error) {
      console.error("Update booking error:", error);
      res.status(500).json({ message: "Failed to update booking" });
    }
  });

  app.delete("/api/bookings/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const existingBooking = await storage.getBooking(req.params.id);
      if (!existingBooking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Verify user has access to this booking's organization
      if (req.user?.role !== "super_admin" && existingBooking.organizationId !== req.user?.organizationId) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.deleteBooking(req.params.id);
      res.json({ message: "Booking deleted successfully" });
    } catch (error) {
      console.error("Delete booking error:", error);
      res.status(500).json({ message: "Failed to delete booking" });
    }
  });

  // Dumpster Types endpoints
  app.get("/api/dumpster-types", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(400).json({ message: "User has no organization" });
      }

      const types = await storage.getDumpsterTypesByOrganization(req.user.organizationId);
      res.json(types);
    } catch (error) {
      console.error("Get dumpster types error:", error);
      res.status(500).json({ message: "Failed to get dumpster types" });
    }
  });

  app.post("/api/dumpster-types", requireAuth, requireRole("org_owner", "org_admin"), async (req: AuthRequest, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(400).json({ message: "User has no organization" });
      }

      const typeData = {
        ...req.body,
        organizationId: req.user.organizationId,
      };

      const type = await storage.createDumpsterType(typeData);
      res.status(201).json(type);
    } catch (error) {
      console.error("Create dumpster type error:", error);
      res.status(500).json({ message: "Failed to create dumpster type" });
    }
  });

  app.patch("/api/dumpster-types/:id", requireAuth, requireRole("org_owner", "org_admin"), async (req: AuthRequest, res) => {
    try {
      const type = await storage.updateDumpsterType(req.params.id, req.body);
      if (!type) {
        return res.status(404).json({ message: "Dumpster type not found" });
      }
      res.json(type);
    } catch (error) {
      console.error("Update dumpster type error:", error);
      res.status(500).json({ message: "Failed to update dumpster type" });
    }
  });

  app.delete("/api/dumpster-types/:id", requireAuth, requireRole("org_owner", "org_admin"), async (req: AuthRequest, res) => {
    try {
      await storage.deleteDumpsterType(req.params.id);
      res.json({ message: "Dumpster type deleted successfully" });
    } catch (error) {
      console.error("Delete dumpster type error:", error);
      res.status(500).json({ message: "Failed to delete dumpster type" });
    }
  });

  // Inventory endpoints
  app.get("/api/inventory", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(400).json({ message: "User has no organization" });
      }

      const inventory = await storage.getDumpsterInventoryByOrganization(req.user.organizationId);
      res.json(inventory);
    } catch (error) {
      console.error("Get inventory error:", error);
      res.status(500).json({ message: "Failed to get inventory" });
    }
  });

  app.post("/api/inventory", requireAuth, requireRole("org_owner", "org_admin"), async (req: AuthRequest, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(400).json({ message: "User has no organization" });
      }

      const inventoryData = {
        ...req.body,
        organizationId: req.user.organizationId,
      };

      const item = await storage.createDumpsterInventoryItem(inventoryData);
      res.status(201).json(item);
    } catch (error) {
      console.error("Create inventory item error:", error);
      res.status(500).json({ message: "Failed to create inventory item" });
    }
  });

  app.patch("/api/inventory/:id", requireAuth, requireRole("org_owner", "org_admin"), async (req: AuthRequest, res) => {
    try {
      const item = await storage.updateDumpsterInventoryItem(req.params.id, req.body);
      if (!item) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Update inventory item error:", error);
      res.status(500).json({ message: "Failed to update inventory item" });
    }
  });

  app.delete("/api/inventory/:id", requireAuth, requireRole("org_owner", "org_admin"), async (req: AuthRequest, res) => {
    try {
      await storage.deleteDumpsterInventoryItem(req.params.id);
      res.json({ message: "Inventory item deleted successfully" });
    } catch (error) {
      console.error("Delete inventory item error:", error);
      res.status(500).json({ message: "Failed to delete inventory item" });
    }
  });

  // Organization Settings endpoints
  app.get("/api/settings", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(400).json({ message: "User has no organization" });
      }

      let settings = await storage.getOrganizationSettings(req.user.organizationId);

      // Create default settings if they don't exist
      if (!settings) {
        settings = await storage.createOrganizationSettings({
          organizationId: req.user.organizationId,
        });
      }

      res.json(settings);
    } catch (error) {
      console.error("Get settings error:", error);
      res.status(500).json({ message: "Failed to get settings" });
    }
  });

  app.patch("/api/settings", requireAuth, requireRole("org_owner", "org_admin"), async (req: AuthRequest, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(400).json({ message: "User has no organization" });
      }

      const settings = await storage.updateOrganizationSettings(req.user.organizationId, req.body);
      res.json(settings);
    } catch (error) {
      console.error("Update settings error:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // Service Areas endpoints
  app.get("/api/service-areas", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(400).json({ message: "User has no organization" });
      }

      const areas = await storage.getServiceAreasByOrganization(req.user.organizationId);
      res.json(areas);
    } catch (error) {
      console.error("Get service areas error:", error);
      res.status(500).json({ message: "Failed to get service areas" });
    }
  });

  app.post("/api/service-areas", requireAuth, requireRole("org_owner", "org_admin"), async (req: AuthRequest, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(400).json({ message: "User has no organization" });
      }

      const areaData = {
        ...req.body,
        organizationId: req.user.organizationId,
      };

      const area = await storage.createServiceArea(areaData);
      res.status(201).json(area);
    } catch (error) {
      console.error("Create service area error:", error);
      res.status(500).json({ message: "Failed to create service area" });
    }
  });

  app.delete("/api/service-areas/:id", requireAuth, requireRole("org_owner", "org_admin"), async (req: AuthRequest, res) => {
    try {
      await storage.deleteServiceArea(req.params.id);
      res.json({ message: "Service area deleted successfully" });
    } catch (error) {
      console.error("Delete service area error:", error);
      res.status(500).json({ message: "Failed to delete service area" });
    }
  });

  // Team Management endpoints
  app.get("/api/team", requireAuth, requireRole("org_owner", "org_admin"), async (req: AuthRequest, res) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(400).json({ message: "User has no organization" });
      }

      const teamMembers = await storage.getUsersByOrganization(req.user.organizationId);

      // Remove password hashes from response
      const safeTeamMembers = teamMembers.map(({ passwordHash, ...user }) => user);

      res.json(safeTeamMembers);
    } catch (error) {
      console.error("Get team error:", error);
      res.status(500).json({ message: "Failed to get team members" });
    }
  });

  app.patch("/api/team/:id", requireAuth, requireRole("org_owner"), async (req: AuthRequest, res) => {
    try {
      const { role } = req.body;

      if (!role || !["org_admin", "customer"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      // Get the user to verify they're in the same organization
      const targetUser = await storage.getUser(req.params.id);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }

      if (targetUser.organizationId !== req.user?.organizationId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Update user role (implementation would need to be added to storage)
      // For now, return error since we don't have updateUser method
      res.status(501).json({ message: "User role update not yet implemented" });
    } catch (error) {
      console.error("Update team member error:", error);
      res.status(500).json({ message: "Failed to update team member" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
