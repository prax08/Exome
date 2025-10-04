import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import webpush from 'https://deno.land/x/web_push@1.0.0/mod.ts'; // Updated to version 1.0.0

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => { // Explicitly type 'req' as Request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify the JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response('Unauthorized: Missing Authorization header', { status: 401, headers: corsHeaders });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: `Bearer ${token}` },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response('Unauthorized: Invalid token', { status: 401, headers: corsHeaders });
    }

    const { subscription, payload } = await req.json();

    if (!subscription || !payload) {
      return new Response('Bad Request: Missing subscription or payload', { status: 400, headers: corsHeaders });
    }

    // Set VAPID keys from Supabase secrets
    webpush.setVapidDetails(
      Deno.env.get('VAPID_SUBJECT') ?? '',
      Deno.env.get('VAPID_PUBLIC_KEY') ?? '',
      Deno.env.get('VAPID_PRIVATE_KEY') ?? ''
    );

    const notificationPayload = JSON.stringify(payload);

    await webpush.sendNotification(subscription, notificationPayload);

    return new Response('Notification sent successfully', {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), { // Cast error to Error
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});