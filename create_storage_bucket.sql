-- ====================================
-- CRIAR BUCKET DE STORAGE + POLÍTICAS
-- ====================================
-- VERSÃO COMPATÍVEL - Executa linha por linha se necessário
-- 1. CRIAR BUCKET (se não existir)
INSERT INTO storage.buckets (
        id,
        name,
        public,
        file_size_limit,
        allowed_mime_types
    )
VALUES (
        'exchange-proofs',
        'exchange-proofs',
        true,
        5242880,
        -- 5MB em bytes
        ARRAY ['image/jpeg', 'image/png', 'application/pdf']
    ) ON CONFLICT (id) DO NOTHING;
-- 2. REMOVER POLÍTICAS ANTIGAS (se existirem) - SEGURO
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes" ON storage.objects;
-- 3. CRIAR POLÍTICA DE UPLOAD
CREATE POLICY "Allow public uploads" ON storage.objects FOR
INSERT TO public WITH CHECK (bucket_id = 'exchange-proofs');
-- 4. CRIAR POLÍTICA DE LEITURA
CREATE POLICY "Allow public reads" ON storage.objects FOR
SELECT TO public USING (bucket_id = 'exchange-proofs');
-- 5. CRIAR POLÍTICA DE ATUALIZAÇÃO
CREATE POLICY "Allow public updates" ON storage.objects FOR
UPDATE TO public USING (bucket_id = 'exchange-proofs');
-- 6. CRIAR POLÍTICA DE ELIMINAÇÃO
CREATE POLICY "Allow public deletes" ON storage.objects FOR DELETE TO public USING (bucket_id = 'exchange-proofs');
-- ====================================
-- VERIFICAÇÃO (executa depois)
-- ====================================
-- SELECT * FROM storage.buckets WHERE id = 'exchange-proofs';