-- Enable UUID extension
create extension if not exists "uuid-ossp";
-- 1. Exchange Rates Table
create table public.exchange_rates (
    id uuid default uuid_generate_v4() primary key,
    currency text not null,
    formal_buy numeric,
    formal_sell numeric,
    informal_buy numeric,
    informal_sell numeric,
    last_updated timestamp with time zone default timezone('utc'::text, now())
);
-- Seed initial rates
insert into public.exchange_rates (
        currency,
        formal_buy,
        formal_sell,
        informal_buy,
        informal_sell
    )
values ('USD', 850.50, 865.00, 1100.00, 1150.00),
    ('EUR', 920.10, 940.20, 1200.00, 1260.00);
-- 2. Product Deals Table
create table public.product_deals (
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
create table public.jobs (
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
    status text default 'pending',
    -- published
    posted_at timestamp with time zone default timezone('utc'::text, now())
);
-- 4. News Articles Table
create table public.news_articles (
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
-- Enable Row Level Security (RLS)
alter table public.exchange_rates enable row level security;
alter table public.product_deals enable row level security;
alter table public.jobs enable row level security;
alter table public.news_articles enable row level security;
-- Create Policies (Public Read)
create policy "Public rates are viewable by everyone" on public.exchange_rates for
select using (true);
create policy "Public deals are viewable by everyone" on public.product_deals for
select using (true);
create policy "Public jobs are viewable by everyone" on public.jobs for
select using (true);
create policy "Public news are viewable by everyone" on public.news_articles for
select using (true);
-- Create Policies (Public Insert/Update - for demo purposes, adjust for auth)
-- Ideally limited to authenticated users or admins
create policy "Enable insert for everyone" on public.product_deals for
insert with check (true);
create policy "Enable update for everyone" on public.exchange_rates for
update using (true);
create policy "Enable update for everyone" on public.product_deals for
update using (true);
create policy "Enable update for everyone" on public.jobs for
update using (true);
create policy "Enable update for everyone" on public.news_articles for
update using (true);