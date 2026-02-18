-- Upgrade Schema for Banking Grade Features
-- 1. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID,
    -- Optional if we don't have auth yet, but good for future
    full_name TEXT NOT NULL,
    age TEXT,
    gender TEXT,
    wallet TEXT NOT NULL,
    coordinates TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    currency TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    -- pending, processing, sent, completed
    proof_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);
-- 2. Create Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id),
    user_id UUID,
    rating INTEGER CHECK (
        rating >= 1
        AND rating <= 5
    ),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);
-- 3. Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
-- 4. Policies
CREATE POLICY "Public orders are insertable by everyone" ON public.orders FOR
INSERT WITH CHECK (true);
CREATE POLICY "Public orders are viewable by everyone" ON public.orders FOR
SELECT USING (true);
CREATE POLICY "Public orders are updatable by everyone" ON public.orders FOR
UPDATE USING (true);
CREATE POLICY "Public reviews are insertable by everyone" ON public.reviews FOR
INSERT WITH CHECK (true);
CREATE POLICY "Public reviews are viewable by everyone" ON public.reviews FOR
SELECT USING (true);
-- 5. Enable Realtime for orders
ALTER PUBLICATION supabase_realtime
ADD TABLE orders;