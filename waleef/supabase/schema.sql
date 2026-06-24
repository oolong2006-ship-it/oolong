-- ─────────────────────────────────────────────────────────────
-- Waleef — Supabase schema
--
-- Run this in the Supabase SQL editor. The app works without it
-- (local-storage fallback), but this enables real persistence.
--
-- Tables mirror the prototype's data layer (src/lib/store.ts).
-- ─────────────────────────────────────────────────────────────

-- Users (lightweight; works with Supabase Auth or guest ids)
create table if not exists public.users (
  id text primary key,
  name text,
  language text default 'ar',
  communication_preference text,
  created_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  role text not null check (role in ('user','waleef')),
  content text not null,
  detected_category text,
  urgency text,
  created_at timestamptz not null default now()
);

create table if not exists public.daily_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  mood text not null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  content text not null,
  detected_emotion text,
  created_at timestamptz not null default now()
);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  type text not null,
  status text not null default 'suggested',
  created_at timestamptz not null default now()
);

create index if not exists idx_chat_messages_user on public.chat_messages(user_id);
create index if not exists idx_checkins_user on public.daily_checkins(user_id);
create index if not exists idx_journal_user on public.journal_entries(user_id);
create index if not exists idx_referrals_user on public.referrals(user_id);

-- ── Row Level Security ───────────────────────────────────────
-- Enable RLS and add policies appropriate to your auth model.
-- The example below is permissive for prototyping; tighten before
-- any real launch (e.g. restrict to auth.uid() = user_id).

alter table public.users enable row level security;
alter table public.chat_messages enable row level security;
alter table public.daily_checkins enable row level security;
alter table public.journal_entries enable row level security;
alter table public.referrals enable row level security;

-- Example permissive policies (PROTOTYPE ONLY).
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'daily_checkins' and policyname = 'proto_all') then
    create policy proto_all on public.daily_checkins for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'journal_entries' and policyname = 'proto_all') then
    create policy proto_all on public.journal_entries for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'referrals' and policyname = 'proto_all') then
    create policy proto_all on public.referrals for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'chat_messages' and policyname = 'proto_all') then
    create policy proto_all on public.chat_messages for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'users' and policyname = 'proto_all') then
    create policy proto_all on public.users for all using (true) with check (true);
  end if;
end $$;
