# Yearly Vacation Tracker

A full-stack, modern web application for managing employee vacations with role-based workflows. Built with **Next.js 15**, **Convex** (real-time backend), and **shadcn/ui**.

Employees submit vacation requests, managers approve or reject them, admins manage the entire system, and accounts staff release leave salaries -- all in real-time with a dark-mode-first UI.

---

## Features

### Role-Based Access Control (4 Roles)

| Role | Capabilities |
|------|-------------|
| **Employee** | Submit vacation requests (up to 2 periods/year), view balance, track request status |
| **Manager** | Approve/reject department requests, view team Gantt timeline, see overlap warnings |
| **Admin** | Full system control: manage employees, departments, allowances, toggle vacation confidentiality |
| **Accounts** | Release leave salary for approved vacations with optional amount tracking |

### Core Functionality

- **Split Vacations** -- Each employee can request up to 2 vacation periods per year
- **NETWORKDAYS Calculation** -- Automatic business day counting (excludes weekends)
- **Overlap Detection** -- Real-time warning when an employee's vacation conflicts with their replacement's schedule
- **Confidentiality Toggle** -- Admins can hide specific vacations from other employees while keeping them visible to managers and accounts
- **Gantt Timeline** -- Visual year-long timeline showing all team vacations at a glance
- **Real-Time Notifications** -- Bell icon with unread count, powered by Convex's real-time subscriptions
- **Leave Salary Management** -- Accounts can track and release leave salary per approved vacation
- **Dark Mode** -- Default dark theme with light mode toggle

### Technical Highlights

- **Zero-latency updates** via Convex real-time subscriptions (no polling)
- **Type-safe end-to-end** -- TypeScript from database schema to UI components
- **Role-based middleware** -- Protected routes with Convex Auth + Next.js middleware
- **Responsive design** -- Mobile sidebar, adaptive layouts for all screen sizes

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | [Next.js 15](https://nextjs.org/) (App Router) + TypeScript |
| UI Components | [shadcn/ui](https://ui.shadcn.com/) + [Tailwind CSS v4](https://tailwindcss.com/) |
| Backend | [Convex](https://convex.dev/) (Database, Auth, Real-time, Serverless Functions) |
| Authentication | [@convex-dev/auth](https://labs.convex.dev/auth) (Email/Password) |
| Date Handling | [date-fns](https://date-fns.org/) |
| Notifications | [Sonner](https://sonner.emilkowal.dev/) (Toast) + Convex Real-time |
| Icons | [Lucide React](https://lucide.dev/) |
| Theme | [next-themes](https://github.com/pacocoursey/next-themes) |

---

## Project Structure

```
.
├── convex/                        # Convex backend
│   ├── schema.ts                  # Database schema (users, departments, vacationRequests, leaveSalary, notifications)
│   ├── auth.ts                    # Convex Auth config (Password provider)
│   ├── lib/
│   │   ├── auth.ts                # requireAuth(), requireRole() helpers
│   │   └── dates.ts               # NETWORKDAYS calculation, overlap detection
│   ├── users.ts                   # Employee CRUD (admin-only mutations)
│   ├── departments.ts             # Department CRUD
│   ├── vacationRequests.ts        # Submit/cancel/approve/reject/confidentiality toggle
│   ├── leaveSalary.ts             # Leave salary release operations
│   ├── notifications.ts           # Real-time notification queries/mutations
│   └── dashboard.ts               # Balance calculation queries
│
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout (Convex providers, theme, toaster)
│   │   ├── signin/page.tsx        # Authentication page
│   │   └── dashboard/
│   │       ├── layout.tsx         # Dashboard shell (sidebar + topbar)
│   │       ├── employee/          # Employee: vacations, new request, history
│   │       ├── manager/           # Manager: approvals, team timeline
│   │       ├── admin/             # Admin: overview, employees, departments
│   │       └── accounts/          # Accounts: leave salary management
│   │
│   ├── components/
│   │   ├── ui/                    # shadcn/ui primitives
│   │   ├── auth/                  # Sign-in/sign-up form
│   │   ├── layout/                # Sidebar, topbar, notification bell
│   │   ├── vacation/              # Request form, cards, approval actions, balance
│   │   ├── timeline/              # Gantt chart component
│   │   ├── dashboard/             # Stats cards
│   │   └── admin/                 # Employee & department management forms
│   │
│   ├── lib/utils.ts               # Utility helpers
│   └── providers/                 # Convex client provider
│
├── middleware.ts                   # Route protection (auth + role-based)
└── .env.example                   # Environment variable template
```

---

## Database Schema

```
users              -- Employee profiles with role, department, allowance
departments        -- Company departments with optional head assignment
vacationRequests   -- Vacation periods with status, overlap detection, confidentiality
leaveSalary        -- Leave salary records linked to approved vacations
notifications      -- Real-time notification system with read/unread tracking
+ authTables       -- Convex Auth tables (sessions, accounts, tokens, etc.)
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **npm** (or yarn/pnpm)
- A free [Convex](https://convex.dev/) account

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/yearly-vacation-tracker.git
cd yearly-vacation-tracker
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Convex Backend

```bash
npx convex dev
```

This will:
- Prompt you to log in to Convex (opens browser)
- Create a new project (or select an existing one)
- Deploy the database schema and backend functions
- Generate TypeScript types in `convex/_generated/`
- Create `.env.local` with your deployment URL

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Create Your First Admin Account

1. Go to `/signin` and click **"First time? Create an account"**
2. Sign up with your email, name, and password
3. This creates an "employee" account by default
4. Go to the [Convex Dashboard](https://dashboard.convex.dev/) > your project > Data > `users` table
5. Edit your user document and change `role` from `"employee"` to `"admin"`
6. Refresh the app -- you now have full admin access

### 6. Set Up Your Organization

As admin, you can now:
1. **Create departments** at `/dashboard/admin/departments`
2. **Add employees** at `/dashboard/admin/employees` (assign roles, departments, allowances)
3. Employees can then sign in and submit vacation requests

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_CONVEX_URL` | Your Convex deployment URL (auto-set by `npx convex dev`) |
| `CONVEX_DEPLOYMENT` | Convex deployment name (auto-set by `npx convex dev`) |

---

## Deployment

### Cloudflare Pages

```bash
npm run build
# Deploy the `.next` output to Cloudflare Pages
```

### Netlify

```bash
npm run build
# Deploy via Netlify CLI or connect your GitHub repo
```

> **Note:** The Convex backend runs on Convex Cloud -- no separate backend deployment needed. Only the Next.js frontend needs to be deployed to your hosting provider.

---

## User Workflow

```
Admin creates employee accounts
        |
Employee signs in --> Submits vacation request (Period 1 or 2)
        |
System checks: balance, period conflicts, replacement overlap
        |
Manager receives notification --> Reviews request
        |
    Approve / Reject (with optional note)
        |
If approved --> Leave salary record created automatically
        |
Accounts receives notification --> Releases leave salary
        |
Employee receives notification at each step
```

---

## License

This project is for internal/organizational use. Feel free to fork and adapt to your needs.
