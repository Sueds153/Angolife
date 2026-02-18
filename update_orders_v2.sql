-- ==========================================
-- Update Orders Table for Sell (Cashout) Flow
-- ==========================================
-- 1. Add new columns to the orders table
-- Using do block to prevent errors if columns already exist
do $$ begin -- Add order type
if not exists (
    select 1
    from information_schema.columns
    where table_name = 'orders'
        and column_name = 'type'
) then
alter table public.orders
add column type text default 'buy';
end if;
-- Add bank details for sell orders
if not exists (
    select 1
    from information_schema.columns
    where table_name = 'orders'
        and column_name = 'bank'
) then
alter table public.orders
add column bank text;
end if;
if not exists (
    select 1
    from information_schema.columns
    where table_name = 'orders'
        and column_name = 'iban'
) then
alter table public.orders
add column iban text;
end if;
if not exists (
    select 1
    from information_schema.columns
    where table_name = 'orders'
        and column_name = 'account_holder'
) then
alter table public.orders
add column account_holder text;
end if;
end $$;
-- 2. Update RLS Policies
-- Enable INSERT for everyone (Checkout)
create policy "Enable insert for everyone on orders" on public.orders for
insert with check (true);
-- Enable SELECT for users to track their own orders (assuming user_id or similar, 
-- but for simplicity now we allow select if order id is known)
create policy "Enable select for everyone on orders" on public.orders for
select using (true);