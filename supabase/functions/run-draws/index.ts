// Supabase Edge Function — runs every night at 9pm via pg_cron
// Deploy: npx supabase functions deploy run-draws
// Set secret: npx supabase secrets set DRAW_ENGINE_SECRET=<random-string>
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// No CORS headers — this is an internal cron endpoint, not browser-facing
serve(async (req) => {
  // Verify shared secret — prevents unauthenticated invocations
  const secret = req.headers.get('x-draw-secret');
  const expectedSecret = Deno.env.get('DRAW_ENGINE_SECRET');
  if (!expectedSecret || secret !== expectedSecret) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Service-role client — bypasses RLS so we can write winner data
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  const results: object[] = [];

  // ── 1. Fetch all draws that are scheduled to resolve tonight ──────────────
  const { data: draws, error: fetchErr } = await supabase
    .from('draws')
    .select('*')
    .eq('status', 'closing_tonight');

  if (fetchErr) {
    return new Response(JSON.stringify({ error: fetchErr.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }

  for (const draw of draws ?? []) {
    const progress = draw.tickets_sold / draw.total_tickets;

    // ── 2. Below threshold — cancel and refund ────────────────────────────
    if (progress < draw.min_threshold) {
      await supabase.from('draws').update({
        status: 'cancelled',
        completed_at: new Date().toISOString(),
      }).eq('id', draw.id);

      const { data: tickets } = await supabase
        .from('tickets')
        .select('user_id, quantity')
        .eq('draw_id', draw.id);

      for (const ticket of tickets ?? []) {
        const refund = ticket.quantity * draw.ticket_price;
        await supabase.rpc('increment_wallet', { uid: ticket.user_id, amount: refund });
        await supabase.from('wallet_transactions').insert({
          user_id: ticket.user_id,
          amount: refund,
          type: 'refund',
          description: `Refund — "${draw.title}" didn't reach its minimum (${Math.round(progress * 100)}% sold)`,
        });
      }

      results.push({ id: draw.id, title: draw.title, outcome: 'cancelled', progress });
      continue;
    }

    // ── 3. Threshold met — pick a weighted random winner ──────────────────
    const { data: tickets } = await supabase
      .from('tickets')
      .select('user_id, quantity, profiles(handle, avatar_letter)')
      .eq('draw_id', draw.id);

    if (!tickets || tickets.length === 0) {
      results.push({ id: draw.id, outcome: 'skipped_no_tickets' });
      continue;
    }

    // Each ticket = one entry in the pool (weighted by quantity)
    const pool: Array<{ userId: string; handle: string }> = [];
    for (const t of tickets) {
      const handle = (t.profiles as { handle: string } | null)?.handle ?? '@user';
      for (let i = 0; i < t.quantity; i++) {
        pool.push({ userId: t.user_id, handle });
      }
    }

    const winner = pool[Math.floor(Math.random() * pool.length)];

    // ── 4. Mark draw completed ────────────────────────────────────────────
    await supabase.from('draws').update({
      status: 'completed',
      winner_user_id: winner.userId,
      winner_handle: winner.handle,
      completed_at: new Date().toISOString(),
    }).eq('id', draw.id);

    // ── 5. Credit winner (win transaction — no cash, just record the prize) ─
    await supabase.from('wallet_transactions').insert({
      user_id: winner.userId,
      amount: 0, // prize is physical item, not cash
      type: 'win',
      description: `🏆 You won "${draw.title}" — retail value £${(draw.retail_value / 100).toFixed(0)}`,
    });

    // ── 6. Pay seller 84.6% of ticket revenue (12% DRAWN fee + 3.4% processing) ─
    const revenue = draw.tickets_sold * draw.ticket_price;
    const sellerPay = Math.floor(revenue * 0.846);
    await supabase.rpc('increment_wallet', { uid: draw.seller_id, amount: sellerPay });
    await supabase.from('wallet_transactions').insert({
      user_id: draw.seller_id,
      amount: sellerPay,
      type: 'payout',
      description: `Payout — "${draw.title}" · ${draw.tickets_sold.toLocaleString()} tickets sold`,
    });

    results.push({
      id: draw.id,
      title: draw.title,
      outcome: 'completed',
      winner: winner.handle,
      sellerPay,
      revenue,
    });
  }

  return new Response(
    JSON.stringify({ ran: results.length, results, timestamp: new Date().toISOString() }),
    { headers: { 'Content-Type': 'application/json' } },
  );
});
