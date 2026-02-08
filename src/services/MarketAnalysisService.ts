import { ExchangeRate } from '../types';

/**
 * Serviço de Análise de Mercado Cambial
 * Sistema baseado em regras determinísticas (sem IA)
 * Específico para o mercado angolano
 */
export const MarketAnalysisService = {
  /**
   * Gera insight de mercado baseado nas taxas atuais
   */
  getMarketInsight: (rates: ExchangeRate[]): string => {
    const usdRate = rates.find(r => r.currency === 'USD');
    const eurRate = rates.find(r => r.currency === 'EUR');

    if (!usdRate || !eurRate) {
      return "Monitor as taxas de câmbio regularmente para identificar oportunidades.";
    }

    // Calcular spread (diferença percentual entre formal e informal)
    const usdSpread = ((usdRate.informal - usdRate.formal) / usdRate.formal) * 100;
    const eurSpread = ((eurRate.informal - eurRate.formal) / eurRate.formal) * 100;
    const avgSpread = (usdSpread + eurSpread) / 2;

    // Cenário 1: Alta volatilidade (spread >45%)
    if (avgSpread > 45) {
      return "⚠️ Volatilidade elevada no mercado informal. Recomenda-se operações no mercado formal para maior segurança e conformidade legal.";
    }

    // Cenário 2: Spread muito baixo (<25%) - mercado equilibrado
    if (avgSpread < 25) {
      return "✅ Mercado cambial em equilíbrio. Momento favorável para operações de importação e investimento estrangeiro.";
    }

    // Cenário 3: Spread médio (25-35%) - normal
    if (avgSpread >= 25 && avgSpread <= 35) {
      return "📊 Mercado estável com spread normal. Analise objetivos antes de decidir entre câmbio formal ou informal.";
    }

    // Cenário 4: Spread alto (35-45%) - cautela
    if (avgSpread > 35 && avgSpread <= 45) {
      return "⚡ Diferencial cambial acima da média. Prefira o mercado formal para grandes volumes e mantenha cautela no informal.";
    }

    // Default
    return "Acompanhe as variações diárias para identificar o melhor momento para suas operações de câmbio.";
  },

  /**
   * Analisa tendência baseada no campo 'trend' e 'change'
   */
  getTrendAnalysis: (rates: ExchangeRate[]): string => {
    const usdRate = rates.find(r => r.currency === 'USD');
    if (!usdRate) return "";

    const changeValue = parseFloat(usdRate.change?.replace('%', '').replace('+', '') || '0');

    if (usdRate.trend === 'up' && changeValue > 2) {
      return "📈 Dólar em alta acentuada. Considere adiar compras se possível.";
    }

    if (usdRate.trend === 'down' && changeValue < -1) {
      return "📉 Kwanza fortalecendo. Bom momento para aquisição de moeda estrangeira.";
    }

    if (usdRate.trend === 'stable') {
      return "⚖️ Mercado estável nas últimas 24h. Condições neutras para operações.";
    }

    return "";
  },

  /**
   * Recomendação específica por moeda
   */
  getCurrencyRecommendation: (currency: string, rate: ExchangeRate): string => {
    const spread = ((rate.informal - rate.formal) / rate.formal) * 100;

    if (currency === 'USD') {
      if (spread > 40) {
        return `Dólar: Spread de ${spread.toFixed(1)}% indica risco elevado no mercado informal. Prefira bancos autorizados.`;
      }
      return `Dólar: Diferencial de ${spread.toFixed(1)}% está dentro do esperado para o mercado angolano.`;
    }

    if (currency === 'EUR') {
      if (spread > 40) {
        return `Euro: Spread elevado (${spread.toFixed(1)}%). Avalie se a urgência justifica a diferença de preço.`;
      }
      return `Euro: Taxa competitiva com spread de ${spread.toFixed(1)}%.`;
    }

    return "";
  },

  /**
   * Insight completo combinando todas as análises
   */
  getCompleteInsight: (rates: ExchangeRate[]): string => {
    const mainInsight = MarketAnalysisService.getMarketInsight(rates);
    const trendAnalysis = MarketAnalysisService.getTrendAnalysis(rates);

    // Combinar insights de forma inteligente
    if (trendAnalysis) {
      return `${mainInsight} ${trendAnalysis}`;
    }

    return mainInsight;
  },

  /**
   * Gera resumo profissional para uma vaga de emprego
   */
  summarizeJob: (jobTitle: string, company: string): string => {
    const summaries: Record<string, string> = {
      // Títulos comuns
      'gestor': `Posição estratégica de ${jobTitle} na ${company}, ideal para profissionais com experiência em liderança e gestão de equipas.`,
      'director': `Oportunidade executiva como ${jobTitle} para impulsionar o crescimento e estratégia da ${company}.`,
      'coordenador': `${jobTitle} na ${company} - role crucial para coordenação de operações e projetos estratégicos.`,
      'analista': `Vaga para ${jobTitle} com foco em análise de dados e suporte à tomada de decisões na ${company}.`,
      'técnico': `Posição técnica de ${jobTitle} na ${company}, requerendo expertise especializada e hands-on.`,
      'engenheiro': `Oportunidade para Engenheiro(a) na ${company}, atuando em projetos de alta complexidade técnica.`,
      'desenvolvedor': `Vaga para Developer na ${company}, trabalhando com tecnologias modernas e projetos inovadores.`,
    };

    // Procurar match por palavra-chave
    const titleLower = jobTitle.toLowerCase();
    for (const [keyword, template] of Object.entries(summaries)) {
      if (titleLower.includes(keyword)) {
        return template;
      }
    }

    // Default genérico mas profissional
    return `Excelente oportunidade como ${jobTitle} na ${company}, uma das instituições de referência no mercado angolano.`;
  }
};
