import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, webhook-id, webhook-signature, webhook-timestamp',
};

interface DodoWebhookPayload {
  type: string;
  data: {
    payment_id?: string;
    subscription_id?: string;
    customer?: {
      email: string;
      customer_id?: string;
    };
    metadata?: {
      userId?: string;
    };
    status?: string;
    product_id?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get webhook headers for verification
    const webhookId = req.headers.get('webhook-id');
    const webhookSignature = req.headers.get('webhook-signature');
    const webhookTimestamp = req.headers.get('webhook-timestamp');

    // Get the raw body
    const body = await req.text();
    const payload: DodoWebhookPayload = JSON.parse(body);

    console.log('Received webhook:', payload.type);

    // Verify webhook signature (optional but recommended)
    const webhookKey = Deno.env.get('DODO_WEBHOOK_KEY');
    if (webhookKey && webhookSignature) {
      // Standard Webhooks signature verification
      // In production, implement proper signature verification
      // See: https://docs.dodopayments.com/webhooks
      console.log('Webhook signature present, verification should be implemented');
    }

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle different webhook events
    switch (payload.type) {
      case 'payment.succeeded':
      case 'subscription.active': {
        // Extract user ID from metadata or lookup by email
        let userId = payload.data.metadata?.userId;

        if (!userId && payload.data.customer?.email) {
          // Lookup user by email
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('user_id')
            .eq('email', payload.data.customer.email.toLowerCase())
            .single();

          userId = profile?.user_id;
        }

        if (!userId) {
          console.error('Could not identify user for upgrade');
          return new Response(
            JSON.stringify({ error: 'User not found' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Update user plan to pro
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({
            plan: 'pro',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);

        if (updateError) {
          console.error('Failed to update user plan:', updateError);
          return new Response(
            JSON.stringify({ error: 'Failed to update plan' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`Successfully upgraded user ${userId} to Pro`);
        break;
      }

      case 'subscription.cancelled':
      case 'subscription.expired': {
        // Handle subscription cancellation - downgrade to free
        let userId = payload.data.metadata?.userId;

        if (!userId && payload.data.customer?.email) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('user_id')
            .eq('email', payload.data.customer.email.toLowerCase())
            .single();

          userId = profile?.user_id;
        }

        if (userId) {
          await supabase
            .from('user_profiles')
            .update({
              plan: 'free',
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId);

          console.log(`User ${userId} downgraded to Free`);
        }
        break;
      }

      default:
        console.log(`Unhandled webhook type: ${payload.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: 'Webhook processing failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
