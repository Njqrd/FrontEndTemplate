import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  const requestOrigin = req.headers.get('Origin')
  const corsHeaders = getCorsHeaders(requestOrigin)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { factsheet, performanceStats, contributions, monthlyReturn } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Validate and clean factsheet data - NO UNDEFINED VALUES
    if (!factsheet || typeof factsheet !== 'object') {
      throw new Error('Invalid factsheet data');
    }

    const { id, ...factsheetData } = factsheet;

    // Clean the factsheet data
    const cleanFactsheetData = {
      year: factsheetData.year,
      month: factsheetData.month,
      commentary: factsheetData.commentary === undefined ? null : factsheetData.commentary
    };

    // Validate required fields
    if (typeof cleanFactsheetData.year !== 'number' || typeof cleanFactsheetData.month !== 'number') {
      throw new Error('Year and month are required and must be numbers');
    }

    // 1. Upsert the factsheet_versions table
    const upsertPayload = id && typeof id === 'string' ? { id, ...cleanFactsheetData } : cleanFactsheetData;

    console.log('About to upsert factsheet:', JSON.stringify(upsertPayload, null, 2));
    const { data: versionData, error: versionError } = await supabaseAdmin
      .from('factsheet_versions')
      .upsert(upsertPayload)
      .select()
      .single();

    if (versionError) throw versionError;

    const factsheetId = versionData.id;

    // 2. Delete existing stats (these are always safe to just replace)
    await supabaseAdmin.from('factsheet_performance_stats').delete().eq('factsheet_id', factsheetId);

    // 3. Insert new performance stats
    if (performanceStats && Array.isArray(performanceStats) && performanceStats.length > 0) {
      // Validate and clean performance stats - NO UNDEFINED VALUES ALLOWED
      const validStats = performanceStats.filter(stat => {
        return stat && 
               typeof stat.series_name === 'string' && 
               stat.series_name.trim() !== '';
      });

      if (validStats.length > 0) {
        const statsToInsert = validStats.map(stat => {
          const cleanStat = {
            factsheet_id: factsheetId,
            series_name: stat.series_name.trim(),
            one_month_return: stat.one_month_return === undefined ? null : stat.one_month_return,
            three_month_return: stat.three_month_return === undefined ? null : stat.three_month_return,
            six_month_return: stat.six_month_return === undefined ? null : stat.six_month_return,
            twelve_month_return: stat.twelve_month_return === undefined ? null : stat.twelve_month_return,
            ytd_return: stat.ytd_return === undefined ? null : stat.ytd_return,
            cagr_since_inception: stat.cagr_since_inception === undefined ? null : stat.cagr_since_inception,
            sharpe_ratio: stat.sharpe_ratio === undefined ? null : stat.sharpe_ratio,
            ann_volatility: stat.ann_volatility === undefined ? null : stat.ann_volatility,
            worst_monthly_return: stat.worst_monthly_return === undefined ? null : stat.worst_monthly_return,
            max_drawdown: stat.max_drawdown === undefined ? null : stat.max_drawdown
          };
          
          // Only include id if it exists and is valid
          if (stat.id && typeof stat.id === 'string') {
            cleanStat.id = stat.id;
          }
          
          return cleanStat;
        });
        
        console.log('About to insert performance stats:', JSON.stringify(statsToInsert, null, 2));
        const { error: statsError } = await supabaseAdmin.from('factsheet_performance_stats').insert(statsToInsert);
        if (statsError) {
          console.error('Stats insert error:', statsError);
          throw statsError;
        }
      }
    }

    // 4. Safely update contributions
    if (contributions && Array.isArray(contributions)) {
      // First, validate ALL incoming contributions before doing ANY database operations
      const validContributions = contributions.filter(c => {
        // Must have all required fields that are NOT NULL in database
        return c && 
               typeof c.name === 'string' && 
               c.name.trim() !== '' && 
               typeof c.portfolio_type === 'string' && 
               c.portfolio_type.trim() !== '' && 
               (c.value === null || c.value === undefined || typeof c.value === 'number');
      });

      // Get IDs of incoming contributions that have them (and are valid UUIDs)
      const incomingIds = new Set(
        validContributions
          .map(c => c.id)
          .filter(id => id && typeof id === 'string' && id.length === 36) // Basic UUID validation
      );

      // Fetch existing contributions for this factsheet
      const { data: existingContribs, error: fetchError } = await supabaseAdmin
        .from('factsheet_contribution')
        .select('id')
        .eq('factsheet_id', factsheetId);

      if (fetchError) throw fetchError;

      const existingIds = new Set((existingContribs || []).map(c => c.id));

      // Determine which contributions to delete
      const toDelete = [...existingIds].filter(id => !incomingIds.has(id));
      if (toDelete.length > 0) {
        await supabaseAdmin.from('factsheet_contribution').delete().in('id', toDelete);
      }

      // Separate new from existing contributions
      const toInsert = validContributions
        .filter(c => !c.id) // New contributions are those without an ID
        .map(c => ({
          factsheet_id: factsheetId,
          portfolio_type: c.portfolio_type.trim(),
          name: c.name.trim(),
          value: c.value === undefined ? null : c.value
        }));

      const toUpsert = validContributions
        .filter(c => c.id && typeof c.id === 'string') // Existing contributions have an ID
        .map(c => ({
          id: c.id,
          factsheet_id: factsheetId,
          portfolio_type: c.portfolio_type.trim(),
          name: c.name.trim(),
          value: c.value === undefined ? null : c.value
        }));

      // Perform insert for new contributions
      if (toInsert.length > 0) {
        console.log('About to insert contributions:', JSON.stringify(toInsert, null, 2));
        const { error: insertError } = await supabaseAdmin.from('factsheet_contribution').insert(toInsert);
        if (insertError) {
          console.error('Insert error:', insertError);
          throw insertError;
        }
      }

      // Perform upsert for existing contributions
      if (toUpsert.length > 0) {
        console.log('About to upsert contributions:', JSON.stringify(toUpsert, null, 2));
        const { error: upsertError } = await supabaseAdmin.from('factsheet_contribution').upsert(toUpsert);
        if (upsertError) {
          console.error('Upsert error:', upsertError);
          throw upsertError;
        }
      }
    } else if (contributions === null || (Array.isArray(contributions) && contributions.length === 0)) {
        // If the contributions array is explicitly empty or null, delete all associated contributions
        console.log(`Deleting all contributions for factsheet_id: ${factsheetId}`);
        await supabaseAdmin.from('factsheet_contribution').delete().eq('factsheet_id', factsheetId);
    }


    // 5. Upsert the monthly return data
    if (monthlyReturn && typeof monthlyReturn === 'object') {
        // Validate and clean monthly return data - NO UNDEFINED VALUES
        const cleanMonthlyReturn = {
          date: monthlyReturn.date,
          sodefi_return: monthlyReturn.sodefi_return === undefined ? null : monthlyReturn.sodefi_return,
          reference_return: monthlyReturn.reference_return === undefined ? null : monthlyReturn.reference_return
        };
        
        // Only include id if it exists and is valid
        if (monthlyReturn.id && typeof monthlyReturn.id === 'string') {
          cleanMonthlyReturn.id = monthlyReturn.id;
        }
        
        // Validate required fields
        if (cleanMonthlyReturn.date && typeof cleanMonthlyReturn.date === 'string') {
          console.log('About to upsert monthly return:', JSON.stringify(cleanMonthlyReturn, null, 2));
          const { error: monthlyReturnError } = await supabaseAdmin
              .from('monthly_returns')
              .upsert(cleanMonthlyReturn, { onConflict: 'date' });
          if (monthlyReturnError) {
            console.error('Monthly return upsert error:', monthlyReturnError);
            throw monthlyReturnError;
          }
        }
    }

    return new Response(JSON.stringify({ factsheetId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err) {
    // We can keep the detailed logging for now
    console.error("Caught an error in save-factsheet:", err);
    return new Response(String(err?.message ?? err), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})