import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@14.14.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // SECURITY NOTE: In production, use Deno.env.get('STRIPE_SECRET_KEY')
    // We are using the provided key here as requested, protected inside the server-side function.
    // Fix: Use globalThis.Deno to resolve "Cannot find name 'Deno'" error.
    const STRIPE_SECRET_KEY = (globalThis as any).Deno.env.get('STRIPE_SECRET_KEY') || 'sk_test_51SuPsBREbvolxYWvYsDgSQrH93Hl2ydssincgg4QKQ0IHRi74KvKrqICjED4KGCcURSgWS4wqnGbENRtRIoae0ff00Zwm5rctl';
    
    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    const { priceId, returnUrl } = await req.json();

    // Validate inputs
    if (!priceId) {
      throw new Error("Price ID is required");
    }

    // Get the user from the authorization header (Supabase Auth)
    const authHeader = req.headers.get('Authorization')!;
    // Fix: Use (globalThis as any).Deno to resolve "Cannot find name 'Deno'" error.
    const supabaseClient = createClient(
      (globalThis as any).Deno.env.get('SUPABASE_URL') ?? '',
      (globalThis as any).Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
        throw new Error("User not authenticated");
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId, // Ensure this ID exists in your Stripe Dashboard
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl}`,
      customer_email: user.email,
      metadata: {
        user_id: user.id,
      }
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error("Stripe Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})