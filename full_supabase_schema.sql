-- ==========================================
-- AngoLife Full Database Schema (Consolidated)
-- Includes: Tables, Columns, and RLS Policies
-- ==========================================
-- Enable UUID extension
create extension if not exists "uuid-ossp";
-- 1. Exchange Rates Table
create table if not exists public.exchange_rates (
    id uuid default uuid_generate_v4() primary key,
    currency text not null,
    formal_buy numeric,
    formal_sell numeric,
    informal_buy numeric,
    informal_sell numeric,
    last_updated timestamp with time zone default timezone('utc'::text, now())
);
-- Seed initial rates (only if table is empty)
insert into public.exchange_rates (
        currency,
        formal_buy,
        formal_sell,
        informal_buy,
        informal_sell
    )
select 'USD',
    850.50,
    865.00,
    1100.00,
    1150.00
where not exists (
        select 1
        from public.exchange_rates
        where currency = 'USD'
    );
insert into public.exchange_rates (
        currency,
        formal_buy,
        formal_sell,
        informal_buy,
        informal_sell
    )
select 'EUR',
    920.10,
    940.20,
    1200.00,
    1260.00
where not exists (
        select 1
        from public.exchange_rates
        where currency = 'EUR'
    );
-- 2. Product Deals Table
create table if not exists public.product_deals (
    id uuid default uuid_generate_v4() primary key,
    title text not null,
    store text not null,
    original_price numeric,
    discount_price numeric,
    location text,
    description text,
    image_placeholder text,
    status text default 'pending',
    -- approved, rejected
    submitted_by text,
    created_at timestamp with time zone default timezone('utc'::text, now())
);
-- 3. Jobs Table
create table if not exists public.jobs (
    id uuid default uuid_generate_v4() primary key,
    title text not null,
    company text not null,
    location text,
    type text,
    salary text,
    description text,
    requirements text [],
    -- Array of strings
    source_url text,
    application_email text,
    -- Added application email
    status text default 'pending',
    -- published
    posted_at timestamp with time zone default timezone('utc'::text, now())
);
-- Ensure application_email column exists if table was already created
do $$ begin if not exists (
    select 1
    from information_schema.columns
    where table_name = 'jobs'
        and column_name = 'application_email'
) then
alter table public.jobs
add column application_email text;
end if;
end $$;
-- 4. News Articles Table
create table if not exists public.news_articles (
    id uuid default uuid_generate_v4() primary key,
    title text not null,
    summary text,
    source text,
    url text,
    category text,
    status text default 'pending',
    -- published
    published_at timestamp with time zone default timezone('utc'::text, now())
);
-- ==========================================
-- Security & Policies (RLS)
-- ==========================================
-- Enable Row Level Security (RLS)
alter table public.exchange_rates enable row level security;
alter table public.product_deals enable row level security;
alter table public.jobs enable row level security;
alter table public.news_articles enable row level security;
-- Drop existing policies to avoid conflicts (clean slate for policies)
drop policy if exists "Public rates are viewable by everyone" on public.exchange_rates;
drop policy if exists "Public deals are viewable by everyone" on public.product_deals;
drop policy if exists "Public jobs are viewable by everyone" on public.jobs;
drop policy if exists "Public news are viewable by everyone" on public.news_articles;
drop policy if exists "Enable insert for rates" on public.exchange_rates;
drop policy if exists "Enable update for rates" on public.exchange_rates;
drop policy if exists "Enable insert for deals" on public.product_deals;
drop policy if exists "Enable update for deals" on public.product_deals;
drop policy if exists "Enable insert for jobs" on public.jobs;
drop policy if exists "Enable update for jobs" on public.jobs;
drop policy if exists "Enable insert for news" on public.news_articles;
drop policy if exists "Enable update for news" on public.news_articles;
-- Re-create Policies
-- READ (Select) - Public
create policy "Public rates are viewable by everyone" on public.exchange_rates for
select using (true);
create policy "Public deals are viewable by everyone" on public.product_deals for
select using (true);
create policy "Public jobs are viewable by everyone" on public.jobs for
select using (true);
create policy "Public news are viewable by everyone" on public.news_articles for
select using (true);
-- WRITE (Insert/Update) - Enabled for Anon/Scrapers
-- NOTE: In production, you might want to restrict this to a service role or authenticated admin users.
-- For this setup with Python scripts using the Anon Key, we enable these:
-- Exchange Rates
create policy "Enable insert for rates" on public.exchange_rates for
insert with check (true);
create policy "Enable update for rates" on public.exchange_rates for
update using (true);
-- Product Deals
create policy "Enable insert for deals" on public.product_deals for
insert with check (true);
create policy "Enable update for deals" on public.product_deals for
update using (true);
-- Jobs
create policy "Enable insert for jobs" on public.jobs for
insert with check (true);
create policy "Enable update for jobs" on public.jobs for
update using (true);
-- News
create policy "Enable insert for news" on public.news_articles for
insert with check (true);
create policy "Enable update for news" on public.news_articles for
update using (true);