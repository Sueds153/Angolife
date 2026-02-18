-- Enable INSERT for Scrapers (Anon Key)
-- Run this in your Supabase SQL Editor
create policy "Enable insert for jobs" on public.jobs for
insert with check (true);
create policy "Enable insert for news" on public.news_articles for
insert with check (true);
-- Ensure exchange rates can be inserted if empty
create policy "Enable insert for rates" on public.exchange_rates for
insert with check (true);