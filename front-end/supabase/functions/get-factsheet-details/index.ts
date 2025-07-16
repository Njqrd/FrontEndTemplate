import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  const requestOrigin = req.headers.get('Origin')
  const corsHeaders = getCorsHeaders(requestOrigin)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { factsheetId } = await req.json();

    if (!factsheetId) {
      return new Response(JSON.stringify({ error: 'factsheetId is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: version, error: versionError } = await supabaseAdmin.from('factsheet_versions').select('*').eq('id', factsheetId).single();
    if (versionError) throw versionError;

    const { data: statsData, error: statsError } = await supabaseAdmin.from('factsheet_performance_stats').select('*').eq('factsheet_id', factsheetId);
    if (statsError) throw statsError;

    const { data: contribs, error: contribsError } = await supabaseAdmin.from('factsheet_contribution').select('*').eq('factsheet_id', factsheetId);
    if (contribsError) throw contribsError;


    return new Response(JSON.stringify({ version, statsData, contribs }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    return new Response(String(err?.message ?? err), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}) 