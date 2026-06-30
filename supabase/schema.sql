-- Founders.Club — Supabase Schema
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query)

-- ─── Extensions ────────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ─── Enums ─────────────────────────────────────────────────────────────────────
create type public.app_role           as enum ('admin', 'member');
create type public.suggestion_kind    as enum ('change', 'channel');
create type public.suggestion_status  as enum ('pending', 'reviewed', 'done', 'rejected');
create type public.booking_status     as enum ('pending', 'confirmed', 'done', 'rejected');

-- ─── Tables ────────────────────────────────────────────────────────────────────

-- profiles
create table public.profiles (
  id           uuid        primary key references auth.users(id) on delete cascade,
  full_name    text,
  email        text,
  what_they_do text,
  company_name text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- user_roles  (never store role on profiles)
create table public.user_roles (
  id      bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  role    public.app_role not null,
  unique(user_id, role)
);

-- channels
create table public.channels (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null unique,
  created_at timestamptz not null default now()
);

-- messages
create table public.messages (
  id         uuid        primary key default gen_random_uuid(),
  channel_id uuid        not null references public.channels(id) on delete cascade,
  user_id    uuid        not null references auth.users(id) on delete cascade,
  content    text        not null,
  created_at timestamptz not null default now()
);

-- events
create table public.events (
  id          uuid        primary key default gen_random_uuid(),
  title       text        not null,
  description text,
  location    text,
  capacity    integer,
  starts_at   timestamptz not null,
  created_at  timestamptz not null default now()
);

-- event_rsvps
create table public.event_rsvps (
  id         uuid        primary key default gen_random_uuid(),
  event_id   uuid        not null references public.events(id) on delete cascade,
  user_id    uuid        not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(event_id, user_id)
);

-- consulting_bookings  (publicly submittable)
create table public.consulting_bookings (
  id         uuid                  primary key default gen_random_uuid(),
  name       text                  not null,
  email      text                  not null,
  topic      text                  not null,
  status     public.booking_status not null default 'pending',
  created_at timestamptz           not null default now()
);

-- suggestions
create table public.suggestions (
  id         uuid                    primary key default gen_random_uuid(),
  user_id    uuid                    not null references auth.users(id) on delete cascade,
  kind       public.suggestion_kind  not null,
  title      text                    not null,
  details    text,
  status     public.suggestion_status not null default 'pending',
  created_at timestamptz              not null default now()
);

-- ─── Seed channels ─────────────────────────────────────────────────────────────
insert into public.channels (name) values
  ('general'), ('intros'), ('marketing'), ('tech');

-- ─── SECURITY DEFINER helper (never bypassed by RLS) ───────────────────────────
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;

-- ─── Trigger: auto-create profile + assign member role on sign-up ───────────────
create or replace function public.on_auth_user_created()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, what_they_do, company_name)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    new.raw_user_meta_data->>'what_they_do',
    new.raw_user_meta_data->>'company_name'
  );

  insert into public.user_roles (user_id, role)
  values (new.id, 'member');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.on_auth_user_created();

-- ─── Row Level Security ─────────────────────────────────────────────────────────
alter table public.profiles           enable row level security;
alter table public.user_roles         enable row level security;
alter table public.channels           enable row level security;
alter table public.messages           enable row level security;
alter table public.events             enable row level security;
alter table public.event_rsvps        enable row level security;
alter table public.consulting_bookings enable row level security;
alter table public.suggestions        enable row level security;

-- profiles
create policy "auth users can read profiles"
  on public.profiles for select
  to authenticated using (true);

create policy "users can update own profile"
  on public.profiles for update
  to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create policy "admins have full profile access"
  on public.profiles for all
  to authenticated using (public.has_role(auth.uid(), 'admin'));

-- user_roles  (read-only via function; admins manage via SQL)
create policy "users can read own roles"
  on public.user_roles for select
  to authenticated using (auth.uid() = user_id);

create policy "admins can manage roles"
  on public.user_roles for all
  to authenticated using (public.has_role(auth.uid(), 'admin'));

-- channels
create policy "authenticated users can read channels"
  on public.channels for select
  to authenticated using (true);

-- messages
create policy "authenticated users can read messages"
  on public.messages for select
  to authenticated using (true);

create policy "authenticated users can insert messages"
  on public.messages for insert
  to authenticated with check (auth.uid() = user_id);

create policy "users can delete own messages"
  on public.messages for delete
  to authenticated using (auth.uid() = user_id);

-- events
create policy "authenticated users can read events"
  on public.events for select
  to authenticated using (true);

create policy "admins can manage events"
  on public.events for all
  to authenticated using (public.has_role(auth.uid(), 'admin'));

-- event_rsvps
create policy "authenticated users can read rsvps"
  on public.event_rsvps for select
  to authenticated using (true);

create policy "authenticated users can rsvp"
  on public.event_rsvps for insert
  to authenticated with check (auth.uid() = user_id);

create policy "users can cancel own rsvp"
  on public.event_rsvps for delete
  to authenticated using (auth.uid() = user_id);

-- consulting_bookings
create policy "anyone can submit a booking"
  on public.consulting_bookings for insert
  to anon, authenticated with check (true);

create policy "admins can read all bookings"
  on public.consulting_bookings for select
  to authenticated using (public.has_role(auth.uid(), 'admin'));

create policy "admins can update bookings"
  on public.consulting_bookings for update
  to authenticated using (public.has_role(auth.uid(), 'admin'));

create policy "admins can delete bookings"
  on public.consulting_bookings for delete
  to authenticated using (public.has_role(auth.uid(), 'admin'));

-- suggestions
create policy "members can view own suggestions"
  on public.suggestions for select
  to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

create policy "members can submit suggestions"
  on public.suggestions for insert
  to authenticated with check (auth.uid() = user_id);

create policy "admins can manage suggestions"
  on public.suggestions for all
  to authenticated using (public.has_role(auth.uid(), 'admin'));

-- ─── Grants (no anon grants on private tables) ─────────────────────────────────
-- Revoke anon access from private tables
revoke all on public.profiles           from anon;
revoke all on public.user_roles         from anon;
revoke all on public.channels           from anon;
revoke all on public.messages           from anon;
revoke all on public.events             from anon;
revoke all on public.event_rsvps        from anon;
revoke all on public.suggestions        from anon;

-- Grant authenticated users appropriate access
grant select, update            on public.profiles            to authenticated;
grant select                    on public.user_roles          to authenticated;
grant select                    on public.channels            to authenticated;
grant select, insert, delete    on public.messages            to authenticated;
grant select, insert            on public.event_rsvps         to authenticated;
grant select                    on public.events              to authenticated;
grant insert                    on public.consulting_bookings to anon, authenticated;
grant select, insert            on public.suggestions         to authenticated;

-- Allow admins full access (enforced by RLS + has_role)
grant all on public.profiles            to authenticated;
grant all on public.events              to authenticated;
grant all on public.consulting_bookings to authenticated;
grant all on public.suggestions         to authenticated;
grant all on public.channels            to authenticated;
grant all on public.user_roles          to authenticated;

-- Grant sequences for insert
grant usage, select on all sequences in schema public to authenticated;

-- ─── Realtime ──────────────────────────────────────────────────────────────────
-- Enable realtime for messages (in Supabase dashboard: Database → Replication)
-- Or run:
alter publication supabase_realtime add table public.messages;
