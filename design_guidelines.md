# Design Guidelines: Dumpster Rental & Junk Hauling Platform

## Design Approach

**Hybrid Strategy**: Material Design foundation with booking platform inspiration (Calendly for scheduling, Stripe for payment trust patterns, Monday.com for dashboard efficiency)

**Core Principles**:
- Professional trustworthiness for service industry credibility
- Clear visual hierarchy between public booking and business dashboard
- Conversion-optimized booking flow with minimal friction
- Data-dense dashboard without overwhelming users

## Typography

**Font System** (Google Fonts):
- **Primary**: Inter - headings, UI elements, buttons (weights: 400, 500, 600, 700)
- **Secondary**: Inter - body text, forms, data tables (weights: 400, 500)

**Scale**:
- Hero headlines: text-5xl to text-6xl (font-bold)
- Page titles: text-3xl to text-4xl (font-semibold)
- Section headers: text-2xl (font-semibold)
- Card titles: text-lg (font-medium)
- Body/UI: text-base
- Captions/meta: text-sm
- Small labels: text-xs

## Layout System

**Spacing Primitives**: Use Tailwind units of 4, 6, 8, 12, 16 for consistency
- Component padding: p-4 to p-8
- Section spacing: py-12 to py-16
- Card gaps: gap-6 to gap-8
- Form field spacing: space-y-4

**Grid Structure**:
- Public pages: max-w-7xl centered containers
- Dashboard: Full-width with side navigation (256px sidebar)
- Forms: max-w-2xl for optimal readability
- Calendar: Responsive grid adapting to viewport

## Component Library

### Navigation
**Public Header**:
- Transparent/white background with subtle shadow
- Logo left, navigation center, "Dashboard Login" + "Book Now" CTA right
- Sticky positioning with backdrop blur on scroll

**Dashboard Sidebar**:
- Fixed 256px width, full-height
- Organization logo/name at top
- Icon + label navigation items
- Active state with accent background
- User profile dropdown at bottom

### Booking Flow
**Multi-step Form**:
- Progress indicator at top (4 steps with connecting lines)
- Card-based layout with generous padding (p-8)
- Clear "Back" and "Continue" navigation
- Summary sidebar showing selections (sticky on desktop)

**Dumpster Selection**:
- Card grid: 2-3 columns on desktop, single on mobile
- Each card: Image, size badge, capacity, pricing prominent, CTA button
- Hover state: subtle lift with shadow

### Dashboard Components
**Calendar View**:
- Week/month toggle
- Color-coded booking status (pending/confirmed/delivered/picked-up)
- Click to view booking details in modal
- Today highlighted with distinct treatment

**Booking Cards**:
- Compact info density: Customer name, dumpster type, dates, status badge
- Quick actions: Status dropdown, assign inventory, view details
- Status badges: Rounded, bold, color-coded

**Data Tables**:
- Alternating row backgrounds for scannability
- Sticky headers on scroll
- Sortable columns with icons
- Pagination at bottom

### Forms
**Input Fields**:
- Floating labels or top-aligned labels
- Clear focus states with border accent
- Inline validation with icons
- Helper text below in muted text

**Buttons**:
- Primary CTA: Solid, bold, px-6 py-3
- Secondary: Outlined with border
- Danger: Red accent for destructive actions
- Disabled: Reduced opacity with cursor-not-allowed

### Payment
**Checkout Section**:
- Stripe Elements integration with consistent styling
- Security badges and SSL indicators
- Order summary card with line items
- Clear total with tax breakdown

## Page-Specific Guidelines

### Public Homepage
- **Hero**: Full-width (80vh) with large hero image of clean dumpster/construction site, headline overlay with blur background, prominent "Get Started" CTA
- **Services Grid**: 2-column (dumpster rental + junk hauling) with icons, descriptions
- **How It Works**: 3-step process with icons and brief descriptions
- **Service Areas**: ZIP code checker with map background
- **Trust Elements**: Customer testimonials, years in business, service guarantee

### Booking Flow
- **Step 1**: Visual dumpster cards with size comparison illustrations
- **Step 2**: Calendar picker (large, clear), address autocomplete, duration selector
- **Step 3**: Minimal form (name, email, phone), optional account creation
- **Step 4**: Split layout - payment form left, order summary right with delivery details

### Customer Dashboard
- Simple card-based layout
- "Active Rentals" section prominent at top
- Booking history table below
- Quick actions: Request pickup, extend rental, view receipt

### Business Dashboard Home
- KPI cards: Today's deliveries, pickups, available inventory, revenue (4-column grid)
- Combined timeline: Deliveries and pickups chronologically
- Recent bookings table (compact, 5 rows)
- Quick add booking button (floating or prominent)

### Calendar Page
- Full-screen calendar component
- Filters: Dumpster type, status, date range
- Legend for status colors
- Click booking: Side panel slides in with details

### Settings Pages
- Tab navigation: Profile, Service Areas, Pricing, Business Rules, Team
- Form sections with clear headers and dividers
- Save button sticky at bottom

## Images

**Hero Image**: Professional photo of clean dumpsters at organized yard/facility (conveys reliability and professionalism), full-width, 80vh height

**Dumpster Type Cards**: Clean product shots of each dumpster size, white/neutral background, consistent angle and lighting

**How It Works Section**: Simple iconography or illustrations (delivery truck, calendar, dumpster in use)

**Dashboard**: Minimal decorative images, focus on data visualization and functional UI

## Accessibility
- WCAG 2.1 AA compliance throughout
- Keyboard navigation for all interactive elements
- ARIA labels for screen readers
- Focus indicators clearly visible
- Sufficient color contrast (4.5:1 minimum for text)
- Form inputs with associated labels
- Status conveyed with text, not color alone