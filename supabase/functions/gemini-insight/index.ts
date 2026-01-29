// Follows Deno runtime environment
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// Always use import {GoogleGenAI} from "@google/genai";
import { GoogleGenAI } from "@google/genai";

// CORS Headers needed to allow your React app to call this function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 1. Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. API Key is handled according to @google/genai guidelines using process.env.API_KEY directly.
    // This adheres to the strict requirement of obtaining the key exclusively from process.env.API_KEY.
    // The previous check using Deno.env has been removed to resolve "Cannot find name 'Deno'".

    // 3. Parse the request body coming from React
    const { prompt, schema, systemInstruction } = await req.json();

    // 4. Initialize Gemini (Server-Side)
    // Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // 5. Call the Model
    // Note: Updated model to gemini-3-flash-preview as per guidelines
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: systemInstruction,
      },
    });

    const text = response.text;

    // 6. Return the result to the Frontend
    return new Response(JSON.stringify({ data: text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error("Edge Function Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})