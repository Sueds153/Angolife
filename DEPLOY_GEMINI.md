# 🚀 Deploy Gemini AI - 3 Passos Simples

## Sua API Key
```
AIzaSyDYEN6Ov1tFhzVHI-wsNWY91dYA0SgP7c4
```

## Método Mais Rápido: Supabase Dashboard

### Passo 1: Configurar Secret (2 minutos)
1. Abra: https://supabase.com/dashboard/project/gugooebyxktrioyxxsjg/settings/vault
2. Clique em **"New Secret"**
3. Nome: `GEMINI_API_KEY`
4. Valor: `AIzaSyDYEN6Ov1tFhzVHI-wsNWY91dYA0SgP7c4`
5. Salvar

### Passo 2: Deploy da Edge Function (3 minutos)
1. Abra: https://supabase.com/dashboard/project/gugooebyxktrioyxxsjg/functions
2. Clique em **"Deploy a new function"**
3. Nome: `gemini-insight`
4. Cole o código do arquivo: `supabase\functions\gemini-insight\index.ts`
5. Deploy

### Passo 3: Testar (1 minuto)
```powershell
npm run dev
```
Abra http://localhost:5173 → Vá em "Monitor Cambial"

## ✅ Como Saber se Funcionou

**Console do navegador mostrará:**
- `✨ [HybridInsight] Gemini AI enrichment applied` = **Funcionando!**
- `📊 [HybridInsight] Using rules-based insight` = Usando fallback (também OK)

**No app:**
- Insight aparece **instantâneo** (regras)
- Após 2-3s pode atualizar (se Gemini responder)

---

## Alternativa: CLI (Se preferir terminal)

```powershell
# Login (abre navegador)
npx supabase login

# Configurar secret
npx supabase secrets set GEMINI_API_KEY=AIzaSyDYEN6Ov1tFhzVHI-wsNWY91dYA0SgP7c4 --project-ref gugooebyxktrioyxxsjg

# Deploy
npx supabase functions deploy gemini-insight --project-ref gugooebyxktrioyxxsjg
```

---

**Nota**: O sistema já funciona 100% com regras. O Gemini AI é apenas um "upgrade" opcional!
