-- Supabase schema for ads, tools, categories, feature flags

create table if not exists public.ads (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('adsense','ad_manager','direct')),
  slot_id text,
  sizes jsonb, -- e.g. [[300,250],[336,280]]
  html text,
  image_url text,
  click_url text,
  status text not null default 'active' check (status in ('active','paused')),
  priority int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tools (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  category text not null references public.categories(slug) on delete set null,
  icon text,
  status text not null default 'published' check (status in ('draft','published')),
  priority int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.feature_flags (
  key text primary key,
  enabled boolean not null default false,
  description text,
  updated_at timestamptz not null default now()
);

-- RLS suggestions (enable and tailor)
alter table public.ads enable row level security;
create policy "ads_read_all" on public.ads for select using (true);
create policy "ads_write_admin" on public.ads for all using (auth.jwt() ->> 'email' is not null) with check (auth.jwt() ->> 'email' is not null);

alter table public.categories enable row level security;
create policy "categories_read_all" on public.categories for select using (true);
create policy "categories_write_admin" on public.categories for all using (auth.jwt() ->> 'email' is not null) with check (auth.jwt() ->> 'email' is not null);

alter table public.tools enable row level security;
create policy "tools_read_all" on public.tools for select using (true);
create policy "tools_write_admin" on public.tools for all using (auth.jwt() ->> 'email' is not null) with check (auth.jwt() ->> 'email' is not null);
