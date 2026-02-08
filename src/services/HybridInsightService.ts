import { ExchangeRate } from '../types';
import { MarketAnalysisService } from './MarketAnalysisService';
import { getMarketInsight as getGeminiInsight } from './gemini';

/**
 * Sistema Híbrido de Insights
 * Combina análises baseadas em regras (instantâneas) com Gemini AI (enriquecimento)
 */

export interface InsightResult {
  text: string;
  source: 'rules' | 'ai' | 'hybrid';
  timestamp: Date;
}

export const HybridInsightService = {
  /**
   * Gera insight híbrido:
   * 1. Retorna análise de regras IMEDIATAMENTE (callback instantâneo)
   * 2. Tenta buscar Gemini em background
   * 3. Se Gemini retornar, chama callback novamente com versão enriquecida
   * 4. Se Gemini falhar, mantém as regras
   */
  getHybridInsight: async (
    rates: ExchangeRate[],
    onInsightUpdate: (result: InsightResult) => void
  ): Promise<void> => {
    // FASE 1: Resposta instantânea com regras (0ms)
    const rulesInsight = MarketAnalysisService.getCompleteInsight(rates);
    onInsightUpdate({
      text: rulesInsight,
      source: 'rules',
      timestamp: new Date()
    });

    // FASE 2: Tentar enriquecer com Gemini AI em background
    try {
      // Timeout de 5s para não deixar usuário esperando
      const geminiPromise = getGeminiInsight(rates);
      const timeoutPromise = new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini timeout')), 5000)
      );

      const aiInsight = await Promise.race([geminiPromise, timeoutPromise]) as string;

      // Se Gemini retornou algo válido e diferente, usar
      if (aiInsight && aiInsight.length > 20 && aiInsight !== rulesInsight) {
        onInsightUpdate({
          text: aiInsight,
          source: 'ai',
          timestamp: new Date()
        });
        console.log('✨ [HybridInsight] Gemini AI enrichment applied');
      } else {
        console.log('📊 [HybridInsight] Using rules-based insight (Gemini returned similar)');
      }
    } catch {
      // Gemini falhou - mantém regras (já foi retornado)
      console.log('📊 [HybridInsight] Using rules-based insight (Gemini unavailable)');
    }
  },

  /**
   * Versão simplificada que retorna apenas o melhor insight disponível
   * Tenta Gemini primeiro (com timeout curto), fallback para regras
   */
  getBestInsight: async (rates: ExchangeRate[]): Promise<InsightResult> => {
    try {
      // Tentar Gemini com timeout de 3s
      const geminiPromise = getGeminiInsight(rates);
      const timeoutPromise = new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 3000)
      );

      const aiInsight = await Promise.race([geminiPromise, timeoutPromise]) as string;

      if (aiInsight && aiInsight.length > 20) {
        return {
          text: aiInsight,
          source: 'ai',
          timestamp: new Date()
        };
      }
    } catch {
      // Fallback silencioso
    }

    // Fallback para regras
    return {
      text: MarketAnalysisService.getCompleteInsight(rates),
      source: 'rules',
      timestamp: new Date()
    };
  },

  /**
   * Gera insight combinado (regras + contexto da IA)
   * Útil para criar insights mais ricos
   */
  getCombinedInsight: async (rates: ExchangeRate[]): Promise<InsightResult> => {
    const rulesInsight = MarketAnalysisService.getMarketInsight(rates);
    const trendAnalysis = MarketAnalysisService.getTrendAnalysis(rates);

    try {
      const aiContext = await Promise.race([
        getGeminiInsight(rates),
        new Promise<string>((_, reject) => setTimeout(() => reject(), 2000))
      ]) as string;

      if (aiContext && aiContext.length > 20) {
        // Combinar: regras técnicas + contexto IA
        const combined = trendAnalysis
          ? `${rulesInsight} ${trendAnalysis} 💡 ${aiContext}`
          : `${rulesInsight} 💡 ${aiContext}`;

        return {
          text: combined,
          source: 'hybrid',
          timestamp: new Date()
        };
      }
    } catch {
      // Continuar com regras
    }

    return {
      text: rulesInsight + (trendAnalysis ? ` ${trendAnalysis}` : ''),
      source: 'rules',
      timestamp: new Date()
    };
  }
};
