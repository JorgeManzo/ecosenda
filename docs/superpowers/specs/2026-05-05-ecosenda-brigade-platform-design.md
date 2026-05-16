# Ecosenda - Community Brigade Management Platform

## Context

Ecosenda is a web platform for managing community cleanup brigades in Guadalajara. Volunteers register to participate in brigades; administrators manage the platform via a private backend panel. The platform emphasizes a clean, friendly aesthetic aligned with environmental community values.

---

## 1. Architecture

**Tech Stack:**
- Frontend: Next.js 14+ (App Router)
- Backend/Database: Supabase (PostgreSQL + Auth)
- Deployment: Netlify
- Maps: Leaflet + OpenStreetMap (react-leaflet)
- Icons: Lucide React

**Folder Structure:**
```
src/
  features/
    auth/           (login, register, password reset)
    brigades/       (volunteer feed, brigade detail, registration)
    profile/        (user profile, brigade history)
    admin/          (dashboard, create brigade, manage brigades)
  components/
    ui/             (Button, Card, Input, Modal, Badge, etc.)
  lib/
    supabase.ts     (client + types)
    constants.ts    (brigade "what to bring" options)
  types/
    database.ts     (Supabase generated types)
```

---

## 2. Database Schema

**profiles**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | FK auth.users |
| full_name | text | |
| age | int | must be >= 18 |
| sex | text | |
| phone | text | nullable |
| address | text | nullable |
| created_at | timestamp | |

**brigades**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| title | text | |
| event_type | text | dropdown selection |
| description | text | |
| event_date | date | |
| event_time | time | |
| location_name | text | |
| location_address | text | |
| cover_image_url | text | nullable |
| requirements | text[] | values from predefined list |
| created_at | timestamp | |

**brigade_volunteers**
| Column | Type | Notes |
|--------|------|-------|
| brigade_id | uuid | FK brigades |
| user_id | uuid | FK profiles |
| status | enum | registered / completed |
| registered_at | timestamp | |

**admin_emails**
| Column | Type | Notes |
|--------|------|-------|
| email | text | PK |
| name | text | |

---

## 3. Predefined Requirements List

Admin-defined "Qué llevar" items (stored in `constants.ts`):

```
Guantes de goma
Basurero de mano
Botella de agua
Bloqueador solar
Sombrero o gorra
Calzado cerrado
Ropa cómoda para limpieza
Bolsa reutilizable
```

Admins select which items apply when creating a brigade. Requirements are stored as a text array.

---

## 4. UI Components (Shared)

| Component | Description |
|-----------|-------------|
| `Button` | Variants: primary (green #2ecc71), secondary (outline), danger. States: default, hover, disabled, loading |
| `Card` | White bg, rounded-xl (12px), soft shadow. Used for brigade feed cards |
| `Input` | Label above, rounded-lg, green focus ring |
| `Select` | Dropdown for sex, event type, etc. |
| `Modal` | Centered overlay, rounded-xl, close button top-right |
| `Badge` | Status indicators: green (active), gray (completed), yellow (upcoming) |
| `Skeleton` | Loading placeholder for metrics/cards |
| `Sidebar` | Admin-only left navigation, fixed |
| `Breadcrumb` | Path display for admin navigation |

**Global Styles:**
- Background: #f8fafc (very light gray)
- Primary: #2ecc71 (vibrant green)
- Text titles: dark blue/black
- Text descriptions: medium gray
- Border radius: 12px+ for cards and buttons
- Shadows: soft (minimal)

---

## 5. Auth Flow

**Login Page (`/login`):**
- Split-screen layout: left = form (email + password), right = inspirational image
- On success: check if email in `admin_emails` table
  - Admin → redirect to `/admin/dashboard`
  - Volunteer → redirect to `/brigades`

**Register Page (`/register`):**
- Step 1: Account info
  - Full name (required)
  - Age (required, validated >= 18, inline error if under 18)
  - Sex (required, dropdown selection)
  - Email (required)
  - Password (required)
- Step 2: Contact choice (must select at least one):
  - Option A: Phone number
  - Option B: Full address
  - Or both (optional)
- Inline validation prevents submission until valid

**RBAC:**
- Middleware checks profile email against `admin_emails` table
- Protected routes: `/admin/*` redirect to `/login` if not admin

---

## 6. Volunteer Views

**Brigade Feed (`/brigades`):**
- Grid of `Card` components displaying available brigades
- Each card shows: title, event type badge, date, location snippet, status badge
- "Registrarme" button on each card → opens confirmation modal
- Empty state: "No hay brigadas disponibles" with illustration

**Brigade Detail Modal:**
- Full brigade info: title, event type, description, date/time, location
- Interactive Leaflet map with marker at brigade location
- "Volunteers Registered" list: each entry shows "Name, Age years" (e.g., "Juan Pérez, 25 años")
- "Checklist: Qué llevar" — checkboxes for each requirement item
- "Confirm Registration" button

**User Profile (`/profile`):**
- Dropdown menu accessible from header
- Displays: full name, email
- Brigade history with status filters: Completed / Pending
- Logout option

---

## 7. Admin Views

**Admin Sidebar (`/admin/*`):**
- Fixed left sidebar, 240px width
- Navigation items: Dashboard, Nueva Brigada, Gestionar Brigadas
- Footer: admin name, email, logout button
- Active state highlighted with primary green

**Admin Dashboard (`/admin/dashboard`):**
- Top metric cards with skeleton loading states:
  - Total Brigadas (count)
  - Voluntarios Registrados (count + last updated timestamp)
- Recent Activity feed: last 10 platform actions (new registrations, brigade creations)
- Cards use `Skeleton` component while loading

**Create Brigade (`/admin/brigadas/nueva`):**
- Form sections with clear visual grouping:
  - **Info:** Title (text), event type (dropdown), short description (textarea)
  - **Logistics:** Date picker, time picker, location name (text), location address (text)
  - **Media:** Cover image URL field
  - **Requirements:** Multi-select checklist from predefined list
- Actions: "Publicar Brigada" (green primary button), "Cancelar" (outline button)
- Cancel returns to manage brigadas list

**Manage Brigadas (`/admin/brigadas`):**
- Table layout with columns: General Info | Location/Logistics | Requirements | Controls
- "Nueva Ubicación" quick-add button for location templates
- "Descargar reporte .CSV" export button — generates CSV of all brigades
- Admin tip box: "Remember to keep your geographic data up to date for accurate volunteer mapping"

**Breadcrumbs:**
- Displayed at top of admin content area
- Examples: "Volver al Historial", "Volver al Dashboard"
- Navigate back to parent sections

---

## 8. Error Handling

- Form validation: real-time inline errors (age < 18, required fields, invalid email format)
- Empty states: "No hay brigadas disponibles" with relevant illustration
- Network errors: toast notification with retry option
- Auth errors: inline field-level error messages below inputs
- Loading states: skeleton screens for cards, metrics, and table rows

---

## 9. Responsive Behavior

- Volunteer views: fully responsive on mobile, tablet, desktop
- Admin panel: functional on tablets and laptops (optimized for 1024px+)
- Modals: centered on desktop, full-screen on mobile
- Sidebar: collapsed on tablet portrait, hidden on mobile (hamburger menu)

---

## 10. Deployment

- Frontend: Netlify (automatic deploys from git)
- Backend: Supabase hosted project
- Environment variables required:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
