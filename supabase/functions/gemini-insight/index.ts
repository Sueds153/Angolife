import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

interface RequestBody {
  type: 'market_insight' | 'job_summary';
  prompt: string;
}

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const { type, prompt }: RequestBody = await req.json();

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    // Preparar prompt específico baseado no tipo
    let systemPrompt = '';
    const userPrompt = prompt;

    if (type === 'market_insight') {
      systemPrompt = `Você é um analista financeiro especialista no mercado cambial angolano. 
      Analise as taxas de câmbio fornecidas e forneça um insight profissional e contextualizado 
      sobre o mercado. Foque em tendências, oportunidades e riscos. Máximo 150 caracteres.`;
    } else if (type === 'job_summary') {
      systemPrompt = `Você é um recrutador profissional em Angola. 
      Crie uma descrição atraente e profissional para a vaga. Máximo 120 caracteres.`;
    }

    // Chamar API do Gemini
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${systemPrompt}\n\nDados: ${userPrompt}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 150,
            topP: 0.8,
            topK: 40,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API error:', data);
      throw new Error(data.error?.message || 'Gemini API failed');
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Análise não disponível no momento.';

    return new Response(
      JSON.stringify({ text: text.trim() }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );

  } catch (error) {
    console.error('Edge Function error:', error);

    return new Response(
      JSON.stringify({
        error: error.message,
        text: 'Análise temporariamente indisponível.'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});
