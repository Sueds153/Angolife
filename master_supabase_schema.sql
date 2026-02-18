-- ==========================================
-- AngoLife MASTER Database Schema
-- Last Updated: 2026-02-13
-- Includes: Rates, Deals, Jobs, News, and Updated Orders
-- ==========================================
-- 0. Extensions
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
    source_url text,
    application_email text,
    status text default 'pending',
    -- published
    posted_at timestamp with time zone default timezone('utc'::text, now())
);
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
-- 5. Orders Table (LATEST VERSION)
create table if not exists public.orders (
    id uuid default uuid_generate_v4() primary key,
    type text default 'buy',
    -- buy, sell
    full_name text,
    age text,
    gender text,
    wallet text,
    coordinates text,
    amount numeric,
    currency text,
    total_kz numeric,
    bank text,
    iban text,
    account_holder text,
    payment_method text,
    proof_url text,
    status text default 'pending',
    created_at timestamp with time zone default timezone('utc'::text, now())
);
-- ==========================================
-- Security & Policies (RLS)
-- ==========================================
-- Enable RLS for all tables
alter table public.exchange_rates enable row level security;
alter table public.product_deals enable row level security;
alter table public.jobs enable row level security;
alter table public.news_articles enable row level security;
alter table public.orders enable row level security;
-- Drop existing policies to prevent conflicts
drop policy if exists "Public rates viewable" on public.exchange_rates;
drop policy if exists "Public deals viewable" on public.product_deals;
drop policy if exists "Public jobs viewable" on public.jobs;
drop policy if exists "Public news viewable" on public.news_articles;
drop policy if exists "Public orders viewable" on public.orders;
-- READ POLICIES
create policy "Public rates viewable" on public.exchange_rates for
select using (true);
create policy "Public deals viewable" on public.product_deals for
select using (true);
create policy "Public jobs viewable" on public.jobs for
select using (true);
create policy "Public news viewable" on public.news_articles for
select using (true);
create policy "Orders viewable by id" on public.orders for
select using (true);
-- WRITE POLICIES (Scrapers & Checkout)
create policy "Allow internal rate updates" on public.exchange_rates for
update using (true);
create policy "Allow rate inserts" on public.exchange_rates for
insert with check (true);
create policy "Allow deal submissions" on public.product_deals for
insert with check (true);
create policy "Allow job scraper inserts" on public.jobs for
insert with check (true);
create policy "Allow news scraper inserts" on public.news_articles for
insert with check (true);
create policy "Allow order submissions" on public.orders for
insert with check (true);
-- ==========================================
-- SEED DATA (Optional initial rates)
-- ==========================================
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