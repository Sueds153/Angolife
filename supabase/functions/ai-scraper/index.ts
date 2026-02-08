
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

interface RequestBody {
  url: string;
  type: 'jobs' | 'promotions';
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
    const { url, type }: RequestBody = await req.json();

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    if (!url) {
      throw new Error('URL is required');
    }

    console.log(`Processing URL: ${url} for type: ${type}`);

    // Fetch page content
    // Note: Simple fetch may be blocked by some sites. 
    // In production, consider using a proxy or a dedicated scraping API (like Firecrawl or Jina).
    // For this demo, we'll try a direct fetch with a User-Agent.
    const pageResponse = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!pageResponse.ok) {
        throw new Error(`Failed to fetch page: ${pageResponse.statusText}`);
    }

    const htmlText = await pageResponse.text();
    
    // Truncate HTML to avoid token limits (Gemini Pro has a large context window, but good to be safe/cost-effective)
    // We'll take the first 30,000 characters which usually contains the main content, 
    // or you could use a library to extract just the body text.
    const truncatedHtml = htmlText.substring(0, 50000); 

    let systemPrompt = '';
    
    if (type === 'jobs') {
      systemPrompt = `You are an expert data extractor. Analyze the provided HTML from a job board or LinkedIn page in Angola.
      Extract job listings into a JSON array. 
      Each object should have:
      - title: Job title (string)
      - company: Company name (string)
      - location: Location (string)
      - type: Job type like Full-time, Contract (string)
      - link: Specific URL to the job post (string, absolute URL. If relative in HTML, prepend base URL '${new URL(url).origin}').
      - description: Brief summary (string, max 100 chars).
      
      Return ONLY valid JSON. No markdown formatting. If no jobs found, return empty array [].`;
    } else {
      systemPrompt = `You are an expert data extractor for e-commerce. Analyze the provided HTML from an Angolan online store.
      Extract product promotions/discounts into a JSON array.
      Each object should have:
      - productName: Name of product (string)
      - price: Price string (e.g. "12.000 AOA") (string)
      - store: Store name derived from URL or content (string)
      - category: Product category (string)
      - link: Specific URL to product (string, absolute URL).
      
      Return ONLY valid JSON. No markdown formatting. If no promotions found, return empty array [].`;
    }

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
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
                  text: `${systemPrompt}\n\nHTML Source:\n${truncatedHtml}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.1, // Low temperature for consistent extraction
            responseMimeType: "application/json"
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API error:', data);
      throw new Error(data.error?.message || 'Gemini API failed');
    }

    const jsonString = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!jsonString) {
        throw new Error('No data extracted from Gemini');
    }

    const extractedData = JSON.parse(jsonString);

    return new Response(
      JSON.stringify(extractedData),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );

  } catch (error) {
    console.error('AI Scraper Error:', error);

    return new Response(
      JSON.stringify({
        error: error.message,
        data: [] // Return empty array on error to prevent frontend crash loop
      }),
      {
        status: 200, // Return 200 with error message to handle gracefully in frontend
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});
