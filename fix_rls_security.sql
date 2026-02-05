-- 1. Criar Tabela de Perfis (Protegida)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  is_admin BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ativar RLS nos Perfis
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Usuários só podem ler seu próprio perfil
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- Apenas admins podem ver todos os perfis ou editar qualquer um
CREATE POLICY "Admins can manage all profiles" 
ON public.profiles FOR ALL 
TO authenticated 
USING (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true OR
  (auth.jwt() ->> 'email' = 'josuemiguelsued@gmail.com')
);

-- 2. Função Segura para Verificar Admin (SECURITY DEFINER)
-- Isso evita o erro de "user_metadata" nas políticas
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT is_admin FROM public.profiles WHERE id = auth.uid()
  ) OR (auth.jwt() ->> 'email' = 'josuemiguelsued@gmail.com');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger para Sincronizar Novos Usuários (Opcional, mas recomendado)
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Migrar Usuários Existentes
INSERT INTO public.profiles (id, email, is_admin)
SELECT id, email, COALESCE((raw_user_meta_data->>'is_admin')::boolean, false)
FROM auth.users
ON CONFLICT (id) DO UPDATE 
SET is_admin = EXCLUDED.is_admin;

-- 5. Atualizar Políticas de Segurança
-- TABELA: jobs
DROP POLICY IF EXISTS "Admins have full access to jobs" ON jobs;
CREATE POLICY "Admins have full access to jobs" 
ON jobs FOR ALL 
TO authenticated 
USING (public.check_is_admin());

-- TABELA: promotions
DROP POLICY IF EXISTS "Admins have full access to promotions" ON promotions;
CREATE POLICY "Admins have full access to promotions" 
ON promotions FOR ALL 
TO authenticated 
USING (public.check_is_admin());

-- TABELA: exchange_rates
DROP POLICY IF EXISTS "Admins can manage exchange rates" ON exchange_rates;
CREATE POLICY "Admins can manage exchange rates" 
ON exchange_rates FOR ALL 
TO authenticated 
USING (public.check_is_admin());

-- 6. Tabela e Políticas para 'news'
CREATE TABLE IF NOT EXISTS public.news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  image_url TEXT,
  category TEXT DEFAULT 'Geral',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- Público pode ler notícias
DROP POLICY IF EXISTS "Public can view news" ON public.news;
CREATE POLICY "Public can view news" 
ON public.news FOR SELECT 
TO public 
USING (true);

-- Apenas admins podem gerenciar notícias
DROP POLICY IF EXISTS "Admins can manage news" ON public.news;
CREATE POLICY "Admins can manage news" 
ON public.news FOR ALL 
TO authenticated 
USING (public.check_is_admin());
