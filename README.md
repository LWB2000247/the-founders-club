# Founders.Club

**The club for people who build.** Free forever · No payment required.

A members-only community app for entrepreneurs — built with React + TanStack Router, Tailwind CSS v4, shadcn/ui components, and Supabase.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TanStack Router (file-based routing) |
| Styling | Tailwind CSS v4 + semantic design tokens |
| Components | shadcn/ui (Radix UI primitives) |
| Backend | Supabase (Postgres + Auth + Realtime) |
| Forms | React Hook Form + Zod v4 |
| Toasts | Sonner |
| Build | Vite |

---

## Getting Started

### 1. Clone & install

```bash
npm install
```

### 2. Create a Supabase project

Go to [supabase.com](https://supabase.com) and create a new project.

### 3. Run the schema

In your Supabase dashboard → **SQL Editor → New query**, paste and run the contents of `supabase/schema.sql`.

### 4. Configure Supabase Auth

In **Authentication → Settings**:
- Set minimum password length to **6**
- Enable **Auto-confirm** (skip email verification)
- Disable **Leaked password protection** (optional)
- Make sure Google/social providers are **disabled**

### 5. Environment variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Both values are found in **Project Settings → API**.

### 6. Run dev server

```bash
npm run dev
```

---

## Admin Bootstrap

1. Sign up at `/auth`
2. In Supabase SQL Editor, run:

```sql
insert into public.user_roles (user_id, role)
values ('<your-user-uuid>', 'admin');
```

Your user UUID is in **Authentication → Users**.

This unlocks the **Admin** tab in the navbar.

---

## Routes

| Path | Access | Description |
|------|--------|-------------|
| `/` | Public | Landing page |
| `/auth` | Public | Sign up / sign in |
| `/book-call` | Public | 1:1 consulting booking |
| `/dashboard` | Members | View and edit profile |
| `/events` | Members | Meetups + RSVP |
| `/chat` | Members | Multi-channel realtime chat |
| `/admin` | Admin only | Members, events, bookings, suggestions |

---

## Deploy

Build for production:

```bash
npm run build
```

The `dist/` folder is a standard SPA — deploy to Vercel, Netlify, Cloudflare Pages, or any static host.

For Vercel/Netlify, configure a rewrite rule so all paths serve `index.html` (SPA fallback).
