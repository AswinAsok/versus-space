import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, webhook-id, webhook-signature, webhook-timestamp',
};

interface DodoWebhookPayload {
  type: string;
  // DodoPayments can have fields at root level or nested in data
  payment_id?: string;
  customer?: {
    email: string;
    customer_id?: string;
    name?: string;
  };
  metadata?: Record<string, string>;
  status?: string;
  product_id?: string;
  // Some events nest data
  data?: {
    payment_id?: string;
    subscription_id?: string;
    customer?: {
      email: string;
      customer_id?: string;
      name?: string;
    };
    metadata?: Record<string, string>;
    status?: string;
    product_id?: string;
    // Some providers forward metadata_* at this level
    [key: string]: unknown;
  };
  // Some providers forward metadata_* at the root level
  [key: string]: unknown;
}

function extractMetadata(payload: DodoWebhookPayload): Record<string, string> {
  const meta =
    payload.metadata ||
    payload.data?.metadata ||
    {};

  // DodoPayments sometimes forwards metadata_* at the root/data level.
  // Normalize those into the metadata object.
  const merged: Record<string, string> = { ...meta };

  const copyPrefixedFields = (source?: Record<string, unknown>) => {
    if (!source) return;
    for (const [key, value] of Object.entries(source)) {
      if (!key.startsWith('metadata_')) continue;
      const unprefixed = key.replace(/^metadata_/, '');
      merged[unprefixed] = typeof value === 'string' ? value : String(value);
    }
  };

  copyPrefixedFields(payload as Record<string, unknown>);
  copyPrefixedFields(payload.data as Record<string, unknown>);

  return merged;
}

function extractUserId(metadata: Record<string, string>, customerEmail?: string | null) {
  // Try common keys first
  const userId =
    metadata.userId ||
    metadata.user_id ||
    metadata.userid ||
    metadata.user ||
    null;

  if (userId) return userId;

  // Fallback: try parsing any metadata value that looks like a UUID
  for (const value of Object.values(metadata)) {
    if (typeof value === 'string' && /^[0-9a-fA-F-]{32,}$/.test(value)) {
      return value;
    }
  }

  // Fallback: caller will try email lookup
  return customerEmail || null;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the raw body
    const body = await req.text();
    const payload: DodoWebhookPayload = JSON.parse(body);

    // Log full payload for debugging
    console.log('Received webhook:', payload.type);
    console.log('Full payload:', JSON.stringify(payload, null, 2));

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract data from either root level or nested data object (DodoPayments format varies)
    const metadata = extractMetadata(payload);
    const customer = payload.customer || payload.data?.customer;

    console.log('Extracted metadata:', JSON.stringify(metadata));
    console.log('Extracted customer:', JSON.stringify(customer));

    // Handle different webhook events
    // Note: This is a one-time lifetime payment model
    switch (payload.type) {
      case 'payment.succeeded': {
        // Extract user ID from metadata (DodoPayments uses metadata_userId param)
        let userId = extractUserId(metadata, customer?.email ?? null);

        console.log('userId from metadata:', userId);

        if (!userId && customer?.email) {
          console.log('Looking up user by email:', customer.email);
          // Lookup user by email
          const { data: profile, error: lookupError } = await supabase
            .from('user_profiles')
            .select('user_id')
            .eq('email', customer.email.toLowerCase())
            .single();

          if (lookupError) {
            console.error('Email lookup error:', lookupError);
          }

          userId = profile?.user_id;
          console.log('userId from email lookup:', userId);
        }

        if (!userId) {
          console.error(
            'Could not identify user for upgrade. Metadata:',
            metadata,
            'Customer:',
            customer
          );
          return new Response(JSON.stringify({ error: 'User not found', metadata, customer }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Update user plan to pro (lifetime)
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
            JSON.stringify({ error: 'Failed to update plan', details: updateError }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`Successfully upgraded user ${userId} to Pro (lifetime)`);
        break;
      }

      default:
        console.log(`Unhandled webhook type: ${payload.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: 'Webhook processing failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
