
import { supabase } from '../lib/supabase';

export const getMarketInsight = async (rates: unknown) => {
  try {
    const { data, error } = await supabase.functions.invoke('gemini-insight', {
      body: { 
        type: 'market_insight', 
        prompt: JSON.stringify(rates) 
      }
    });

    if (error) throw error;
    return data.text || "A convergência entre as taxas formal e informal indica uma maturidade crescente no ecossistema financeiro local.";
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "Mantenha cautela nas operações de câmbio devido à volatilidade sazonal do mercado informal.";
  }
};

export const summarizeJob = async (jobTitle: string, company: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('gemini-insight', {
      body: { 
        type: 'job_summary', 
        prompt: `Job: ${jobTitle}, Company: ${company}` 
      }
    });

    if (error) throw error;
    return data.text;
  } catch {
    return "Uma oportunidade única de crescimento profissional em uma das instituições de maior prestígio no mercado angolano.";
  }
};
