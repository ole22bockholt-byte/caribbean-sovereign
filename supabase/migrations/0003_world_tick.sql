-- ============================================================================
-- Karibik 1765 — Welt-Tick (Migration 0003)
-- Eine SQL-Funktion, die in EINER Transaktion den Weltzustand vorrückt:
--   1) Marktpreise driften zufällig Richtung base_price (Mean-Reversion) + Rauschen
--   2) Trend (-1/0/+1) für UI-Pfeile aus der Preisänderung ableiten
--   3) Spieldatum +1 Tag, Tick-Zähler +1, last_tick_at = now()
-- Wird vom Backend-Cron (tickWorld) per RPC aufgerufen.
-- ============================================================================

create or replace function world_tick()
returns table (new_date date, new_tick bigint)
language plpgsql
as $$
declare
  v_date date;
  v_tick bigint;
begin
  -- Weltzustand sperren (Singleton-Zeile) -> kein paralleler Doppel-Tick.
  select game_date, tick_number into v_date, v_tick
    from world_state where id = true for update;

  -- ---------------------------------------------------------------------------
  -- Marktpreise aktualisieren: sanfte Rückkehr zum Basispreis + Zufallsrauschen.
  -- neuer Preis = alt + 10% * (base - alt) + Rauschen(+/- ~8% des Basispreises)
  -- Trend aus dem Vorzeichen der Änderung.
  -- ---------------------------------------------------------------------------
  with calc as (
    select
      mp.port_id,
      mp.good_id,
      mp.price as old_price,
      greatest(
        1,
        round(
          mp.price
          + 0.10 * (g.base_price - mp.price)
          + (random() - 0.5) * 0.16 * g.base_price
        )
      )::int as new_price
    from market_prices mp
    join goods g on g.id = mp.good_id
  )
  update market_prices mp
     set price = calc.new_price,
         trend = case
                   when calc.new_price > calc.old_price then 1
                   when calc.new_price < calc.old_price then -1
                   else 0
                 end,
         updated_at = now()
    from calc
   where mp.port_id = calc.port_id and mp.good_id = calc.good_id;

  -- ---------------------------------------------------------------------------
  -- Weltzustand vorrücken.
  -- ---------------------------------------------------------------------------
  update world_state
     set game_date = v_date + interval '1 day',
         tick_number = v_tick + 1,
         last_tick_at = now()
   where id = true;

  return query select (v_date + interval '1 day')::date, v_tick + 1;
end;
$$;