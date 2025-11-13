# Dumpster Rental & Junk Hauling Platform

A multi-tenant SaaS platform for dumpster rental and junk hauling businesses featuring customer booking, inventory management, payment processing, and role-based access control.

## Project Overview

This platform allows dumpster rental companies to:
- Get their own branded public booking pages
- Manage inventory and bookings through a business dashboard
- Process payments via Stripe
- Track deliveries and pickups on a calendar
- Manage customer relationships

## Current Implementation Status

### ✅ Completed
- **Database Schema**: Full multi-tenant schema with organizations, users, dumpster types, inventory, bookings, payments, service areas
- **Frontend Prototype**: Complete UI components for public booking pages and business dashboard
- **First Tenant**: "1 Call Junk Removal" (816) 661-1759 - fully configured with Kansas City service area
- **Seed Data**: 4 dumpster sizes, 41 inventory units, 32 service area ZIP codes

### 🚧 In Progress
- Authentication system with role-based access control
- Organization management (super admin features)
- Multi-tenant routing for branded booking pages
- Booking flow with availability checking
- Stripe payment integration
- Business dashboard backend
- Email notifications

## Technical Stack

- **Frontend**: React, Wouter (routing), TanStack Query, Shadcn UI, Tailwind CSS
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle ORM
- **Payments**: Stripe
- **Auth**: Custom JWT-based authentication

## User Roles

1. **Super Admin** - Platform-level access, creates organizations
2. **Org Owner** - Full access to organization settings and billing
3. **Org Admin** - Can manage bookings and inventory
4. **Customer** - Can create bookings and view their history

## First Organization: 1 Call Junk Removal

- **Business**: Kansas City's Premier Junk Removal & Dumpster Rental
- **Phone**: (816) 661-1759
- **Service Area**: Kansas City metro (32 ZIP codes)
- **Inventory**: 41 dumpster units (10, 20, 30, 40 yard sizes)

### Login Credentials (Development)
- **Super Admin**: admin@dumpsterpro.com / admin123
- **Org Owner**: owner@1calljunkremoval.com / admin123

## Multi-Tenant Architecture

Each organization gets:
- Separate branded public booking page
- Own inventory and pricing
- Isolated booking and customer data
- Custom service areas and delivery fees
- Independent settings and preferences

The dashboard login is completely separate from public booking pages with no cross-links, maintaining proper tenant isolation.

## Design Guidelines

- **Primary Font**: Inter (Material Design foundation)
- **Color Scheme**: Professional blue (hsl(211 85% 42%))
- **Components**: Shadcn UI with custom styling
- **Responsive**: Mobile-first design approach

## Database Tables

- organizations
- users
- organization_invitations
- dumpster_types
- dumpster_inventory
- bookings
- junk_hauling_quotes
- payments
- service_areas
- blackout_dates
- organization_settings

## API Routes (Planned)

- `/api/auth/*` - Authentication endpoints
- `/api/super-admin/*` - Platform administration
- `/api/organizations/:orgId/*` - Organization management
- `/api/bookings/*` - Customer and admin booking management
- `/api/payments/*` - Stripe payment processing
- `/api/calendar/*` - Availability and scheduling

## Development Commands

```bash
npm run dev          # Start development server
npm run db:push      # Push schema changes to database
tsx server/seed.ts   # Seed database with initial data
```

## Next Steps

1. Implement authentication system with session management
2. Build organization creation and management for super admin
3. Create multi-tenant routing to serve different organizations
4. Connect booking flow to backend with availability checking
5. Integrate Stripe for payment processing
6. Build business dashboard features (calendar, reports, KPIs)
7. Add email notification system

## Notes

- Dashboard completely isolated from public booking pages (multi-tenant requirement)
- Using in-database sessions for authentication
- Stripe integration requires STRIPE_SECRET_KEY and VITE_STRIPE_PUBLIC_KEY
- Email notifications will use a service like SendGrid or Resend
