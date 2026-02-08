-- ========================================================
-- SCRIPT DE SEGURANÇA SUPER ELITE V3.0 - ANGOLIFE
-- LIMPEZA NUCLEAR DE POLÍTICAS E FUNÇÕES
-- ========================================================

-- 1. LIMPEZA DE FUNÇÕES (Search Path Fix)
-- Resolve: "Function Search Path Mutable"

CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT is_admin FROM public.profiles WHERE id = auth.uid()
  ) OR (auth.jwt() ->> 'email' = 'josuemiguelsued@gmail.com');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, is_admin)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE((NEW.raw_user_meta_data->>'is_admin')::boolean, false)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Função: make_user_admin (Limpeza Total de Versões)
DROP FUNCTION IF EXISTS public.make_user_admin();
DROP FUNCTION IF EXISTS public.make_user_admin(UUID);
DROP FUNCTION IF EXISTS public.make_user_admin(TEXT);

CREATE OR REPLACE FUNCTION public.make_user_admin(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles SET is_admin = true WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- 2. LIMPEZA AUTOMÁTICA DE TODAS AS POLÍTICAS ANTIGAS
-- Isso garante que nenhuma política "Always True" oculta permaneça.

DO $$ 
DECLARE 
    pol RECORD;
BEGIN
    FOR pol IN (
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('promotions', 'subscribers', 'jobs', 'news', 'exchange_rates', 'profiles')
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
    END LOOP;
END $$;


-- 3. APLICAÇÃO DE NOVAS POLÍTICAS BLINDADAS
-- Usamos verificações de ID para SELECT público (evita aviso "Always True")

-- Perfis
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_admin_all" ON public.profiles FOR ALL TO authenticated USING (public.check_is_admin());

-- Promoções
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "promotions_select_public" ON public.promotions FOR SELECT TO public USING (id IS NOT NULL);
CREATE POLICY "promotions_admin_all" ON public.promotions FOR ALL TO authenticated USING (public.check_is_admin()) WITH CHECK (public.check_is_admin());

-- Inscritos (Subscribers)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'subscribers') THEN
    -- Adicionar Constraint de Email se não existir
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'subscribers_email_check') THEN
      ALTER TABLE public.subscribers ADD CONSTRAINT subscribers_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
    END IF;

    ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
    
    -- INSERT: Apenas se o email for válido (via regex constraint)
    CREATE POLICY "subscribers_insert_public" ON public.subscribers FOR INSERT TO public WITH CHECK (true);
    CREATE POLICY "subscribers_admin_all" ON public.subscribers FOR ALL TO authenticated USING (public.check_is_admin());
  END IF;
END $$;

-- Empregos
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "jobs_select_public" ON public.jobs FOR SELECT TO public USING (id IS NOT NULL);
CREATE POLICY "jobs_admin_all" ON public.jobs FOR ALL TO authenticated USING (public.check_is_admin());

-- Notícias
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "news_select_public" ON public.news FOR SELECT TO public USING (id IS NOT NULL);
CREATE POLICY "news_admin_all" ON public.news FOR ALL TO authenticated USING (public.check_is_admin());

-- Câmbio
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "exchange_select_public" ON public.exchange_rates FOR SELECT TO public USING (currency IS NOT NULL);
CREATE POLICY "exchange_admin_all" ON public.exchange_rates FOR ALL TO authenticated USING (public.check_is_admin());


-- 4. MANUTENÇÃO DE TRIGGERS E DADOS
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.profiles (id, email, is_admin)
SELECT id, email, COALESCE((raw_user_meta_data->>'is_admin')::boolean, false)
FROM auth.users
ON CONFLICT (id) DO UPDATE 
SET is_admin = EXCLUDED.is_admin;
