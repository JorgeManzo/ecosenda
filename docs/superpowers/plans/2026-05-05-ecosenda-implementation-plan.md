# Ecosenda Implementation Plan

## Overview

Build a Next.js + Supabase platform for managing community cleanup brigades in Guadalajara. The implementation follows the approved spec dated 2026-05-05.

---

## Phase 1: Project Setup

### 1.1 Initialize Next.js Project
- Run: `npx create-next-app@latest ecosenda --typescript --tailwind --app --src-dir --no-import-alias`
- Install dependencies: `npm install @supabase/supabase-js @supabase/ssr react-leaflet leaflet lucide-react date-fns`
- Install dev dependencies: `@types/leaflet`

### 1.2 Configure Supabase Client
- Create `src/lib/supabase.ts` with browser client
- Create `src/lib/supabase-server.ts` for server components
- Add environment variables to `.env.local`

### 1.3 Set Up Tailwind Theme
- Add custom colors to `tailwind.config.ts`:
  - Primary: `#2ecc71`
  - Background: `#f8fafc`
  - Text: dark slate / gray

### 1.4 Set Up Folder Structure
```
src/
  features/
    auth/
    brigades/
    profile/
    admin/
  components/ui/
  lib/
  types/
```

---

## Phase 2: Database & Supabase Setup

### 2.1 Create Supabase Project
- Sign up at supabase.com
- Create new project "ecosenda"

### 2.2 Run SQL Schema
Execute in Supabase SQL Editor:

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table
create table profiles (
  id uuid references auth.users primary key,
  full_name text not null,
  age int not null check (age >= 18),
  sex text not null,
  phone text,
  address text,
  created_at timestamp with time zone default now()
);

-- Brigades table
create table brigades (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  event_type text not null,
  description text,
  event_date date not null,
  event_time time not null,
  location_name text not null,
  location_address text not null,
  cover_image_url text,
  requirements text[] not null default '{}',
  created_at timestamp with time zone default now()
);

-- Brigade volunteers (junction table)
create table brigade_volunteers (
  brigade_id uuid references brigades on delete cascade,
  user_id uuid references profiles on delete cascade,
  status text not null default 'registered' check (status in ('registered', 'completed')),
  registered_at timestamp with time zone default now(),
  primary key (brigade_id, user_id)
);

-- Admin emails table
create table admin_emails (
  email text primary key,
  name text not null
);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table brigades enable row level security;
alter table brigade_volunteers enable row level security;
alter table admin_emails enable row level security;

-- RLS Policies (volunteers can read all, write own profile)
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Brigades: anyone can read, only admins can write
create policy "Public brigades are viewable by everyone" on brigades for select using (true);
create policy "Only admins can insert brigades" on brigades for insert with check (
  exists (select 1 from admin_emails where email = (select email from profiles where id = auth.uid()))
);

-- Volunteers: anyone can read, registered users can insert
create policy "Public volunteer lists are viewable" on brigade_volunteers for select using (true);
create policy "Users can register for brigades" on brigade_volunteers for insert with check (auth.uid() = user_id);
```

### 2.3 Generate Types
- Run: `npx supabase gen types typescript --project-id <your-project-id> > src/types/database.ts`

### 2.4 Add Predefined Requirements Constants
Create `src/lib/constants.ts`:
```typescript
export const REQUIREMENTS_OPTIONS = [
  'Guantes de goma',
  'Basurero de mano',
  'Botella de agua',
  'Bloqueador solar',
  'Sombrero o gorra',
  'Calzado cerrado',
  'Ropa cómoda para limpieza',
  'Bolsa reutilizable',
] as const;

export const EVENT_TYPES = [
  'Limpieza de parques',
  'Limpieza de calles',
  'Limpieza de ríos',
  'Limpieza de playas',
  'Educación ambiental',
  'Otro',
] as const;
```

---

## Phase 3: UI Components

Build in order. Each component is standalone with tests.

### 3.1 Button
- Variants: `primary` (green #2ecc71), `secondary` (outline), `danger` (red)
- States: default, hover, disabled, loading (spinner)
- Props: variant, size, loading, disabled, children, onClick

### 3.2 Input
- Label above input
- Rounded-lg borders
- Green focus ring
- Error state with red border + message below
- Props: label, error, type, placeholder, value, onChange

### 3.3 Select
- Same styling as Input
- Dropdown with options array
- Props: label, error, options, value, onChange

### 3.4 Card
- White background
- `rounded-xl` (12px radius)
- `shadow-sm`
- Padding: `p-4` or `p-6`
- Props: children, className

### 3.5 Badge
- Variants: `active` (green), `completed` (gray), `upcoming` (yellow)
- Small rounded pill shape
- Props: variant, children

### 3.6 Modal
- Centered overlay with backdrop blur
- `rounded-xl` container
- Close button top-right (X icon)
- Props: isOpen, onClose, title, children

### 3.7 Skeleton
- Gray animated placeholder
- Variants: `card`, `text`, `avatar`
- Props: variant, className

### 3.8 Sidebar (Admin)
- Fixed left, 240px width
- Logo/brand at top
- Nav items with icons
- Active state: green left border + bg tint
- Footer: user info + logout
- Props: isOpen, onClose (mobile)

### 3.9 Breadcrumb
- Display path as clickable links
- Separator: `/` or `>`
- Props: items array of `{ label, href }`

---

## Phase 4: Auth

### 4.1 Supabase Auth Setup
- Enable Email provider in Supabase Dashboard
- Configure redirect URLs: `http://localhost:3000/**`

### 4.2 Login Page (`/login`)
- Split screen: left form, right inspirational image
- Fields: email, password
- "Iniciar sesión" submit button
- Error handling: inline field errors
- On success: check admin → redirect

### 4.3 Register Page (`/register`)
- Step 1: Account info (name, age, sex dropdown, email, password)
- Age validation: inline error if < 18
- Step 2: Contact choice (radio cards for phone OR address)
- Must select at least one contact method
- Submit → create user + profile → redirect

### 4.4 Auth Middleware
- Create `middleware.ts`
- Protect `/admin/*` routes
- Redirect to `/login` if not authenticated or not admin
- Check admin_emails table for authorization

### 4.5 Logout
- Available in profile dropdown
- Clears session → redirect to `/login`

---

## Phase 5: Volunteer Views

### 5.1 Brigade Feed (`/brigades`)
- Fetch brigades where `event_date >= today`
- Grid layout: 1 col mobile, 2 col tablet, 3 col desktop
- Each Card shows: title, event_type badge, date, location snippet, status badge, "Registrarme" button
- Empty state component when no brigades

### 5.2 Brigade Detail Modal
- Opens on "Registrarme" click
- Shows all brigade info
- Leaflet map with marker at `location_address`
- "Volunteers Registered" section: list of `name, age years`
- Requirements checklist (checkboxes, not editable)
- "Confirm Registration" button → POST to brigade_volunteers

### 5.3 Profile Page (`/profile`)
- Header: user name, email
- Brigade history table:
  - Columns: Title, Date, Status
  - Filter tabs: All / Completed / Pending
- Dropdown menu in header (from any page)

---

## Phase 6: Admin Views

### 6.1 Admin Layout (`/admin/*`)
- Sidebar + main content area
- Breadcrumbs at top of content
- Responsive: sidebar collapses on tablet, hidden on mobile

### 6.2 Admin Dashboard (`/admin/dashboard`)
- Metric cards (with Skeleton loading):
  - Total Brigadas count
  - Voluntarios Registrados count + last updated
- Recent activity feed: last 10 actions from `brigade_volunteers` + `brigades` tables

### 6.3 Create Brigade (`/admin/brigadas/nueva`)
- Multi-section form:
  - Info: title input, event_type select, description textarea
  - Logistics: date picker, time picker, location_name input, location_address input
  - Media: cover_image_url input
  - Requirements: multi-select checkboxes from REQUIREMENTS_OPTIONS
- "Publicar Brigada" (green) and "Cancelar" (outline) buttons
- Form validation before submit

### 6.4 Manage Brigadas (`/admin/brigadas`)
- Table with columns:
  - General Info (title, type, date)
  - Location (name, address)
  - Requirements (list)
  - Controls (edit, delete buttons)
- "Nueva Ubicación" quick-add modal
- "Descargar reporte .CSV" button → generate CSV download
- Admin tip box at bottom

---

## Phase 7: Error Handling & Polish

### 7.1 Form Validation
- Real-time inline errors
- Required field indicators
- Email format validation
- Age >= 18 validation

### 7.2 Loading States
- Skeleton screens for:
  - Dashboard metrics
  - Brigade cards on feed
  - Table rows on manage page

### 7.3 Empty States
- "No hay brigadas disponibles" illustration for empty feed
- "No tienes brigadas registradas" for empty profile

### 7.4 Toast Notifications
- Success: green toast for successful registrations
- Error: red toast for network failures with retry button
- Position: top-right

### 7.5 Responsive Testing
- Test volunteer views: mobile, tablet, desktop
- Test admin views: tablet, laptop

---

## Phase 8: Deployment

### 8.1 Netlify Setup
- Connect repo to Netlify
- Add build command: `npm run build`
- Add publish directory: `.next`
- Set environment variables in Netlify dashboard

### 8.2 Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

### 8.3 Test Production
- Run `npm run build` to verify no errors
- Deploy preview on every PR
- Final production deploy on merge to main

---

## Task Checklist

- [ ] Initialize Next.js project with dependencies
- [ ] Configure Supabase client and types
- [ ] Set up Tailwind theme with custom colors
- [ ] Create database schema in Supabase
- [ ] Build UI components (Button, Input, Select, Card, Badge, Modal, Skeleton, Sidebar, Breadcrumb)
- [ ] Implement Login page with split-screen layout
- [ ] Implement Register page with 2-step form + age validation
- [ ] Set up Auth middleware for admin route protection
- [ ] Build Brigade Feed page with grid layout
- [ ] Build Brigade Detail Modal with Leaflet map
- [ ] Build User Profile page with history
- [ ] Build Admin Layout with Sidebar
- [ ] Build Admin Dashboard with metrics and activity feed
- [ ] Build Create Brigade form
- [ ] Build Manage Brigadas table with CSV export
- [ ] Add error handling and loading states
- [ ] Deploy to Netlify
