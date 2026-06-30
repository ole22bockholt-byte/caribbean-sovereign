-- ============================================================================
-- Karibik 1765 — Transfer-Engine (Migration 0002)
-- Atomare, gesicherte Transfers von Schüttgut, Gold und Schiffen.
-- Jede Funktion läuft in EINER Transaktion mit Row-Locks (FOR UPDATE) und
-- schreibt unveränderlich ins Audit-Log (ledger). Verhindert Race Conditions,
-- Doppel-Transfers und das Verschwinden/Verdoppeln von Objekten.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Schüttgut verschieben: menge eines Guts von (from) nach (to).
-- Lockt beide Bestandszeilen in deterministischer Reihenfolge gegen Deadlocks.
-- ---------------------------------------------------------------------------
create or replace function transfer_goods(
  p_from_kind  holder_kind,
  p_from_id    uuid,
  p_to_kind    holder_kind,
  p_to_id      uuid,
  p_good_id    uuid,
  p_quantity   bigint,
  p_reason     ledger_reason,
  p_actor_id   uuid default null
) returns void
language plpgsql
as $$
declare
  v_from_qty bigint;
  v_first    uuid;
begin
  if p_quantity <= 0 then
    raise exception 'Menge muss positiv sein (%).', p_quantity;
  end if;
  if p_from_kind = p_to_kind and p_from_id = p_to_id then
    raise exception 'Quelle und Ziel sind identisch.';
  end if;

  -- Deterministische Lock-Reihenfolge (kleinere uuid zuerst) -> keine Deadlocks
  v_first := least(p_from_id, p_to_id);

  perform 1 from stock
    where good_id = p_good_id
      and holder_id in (p_from_id, p_to_id)
    order by holder_id
    for update;

  -- Quellbestand prüfen & sperren
  select quantity into v_from_qty
    from stock
   where holder_kind = p_from_kind and holder_id = p_from_id and good_id = p_good_id
   for update;

  if v_from_qty is null or v_from_qty < p_quantity then
    raise exception 'Unzureichender Bestand: % vorhanden, % angefordert.',
      coalesce(v_from_qty, 0), p_quantity;
  end if;

  -- Abbuchen
  update stock set quantity = quantity - p_quantity
   where holder_kind = p_from_kind and holder_id = p_from_id and good_id = p_good_id;

  -- Gutschreiben (Zielzeile anlegen falls nötig)
  insert into stock (holder_kind, holder_id, good_id, quantity)
  values (p_to_kind, p_to_id, p_good_id, p_quantity)
  on conflict (holder_kind, holder_id, good_id)
  do update set quantity = stock.quantity + excluded.quantity;

  -- Audit
  insert into ledger (reason, from_kind, from_id, to_kind, to_id, good_id, quantity, actor_id)
  values (p_reason, p_from_kind, p_from_id, p_to_kind, p_to_id, p_good_id, p_quantity, p_actor_id);
end;
$$;

-- ---------------------------------------------------------------------------
-- Gold verschieben zwischen zwei Akteuren (Spieler/KI/Allianz).
-- ---------------------------------------------------------------------------
create or replace function transfer_gold(
  p_from_actor uuid,
  p_to_actor   uuid,
  p_amount     bigint,
  p_reason     ledger_reason,
  p_actor_id   uuid default null
) returns void
language plpgsql
as $$
declare
  v_from_gold bigint;
begin
  if p_amount <= 0 then
    raise exception 'Betrag muss positiv sein (%).', p_amount;
  end if;
  if p_from_actor = p_to_actor then
    raise exception 'Quelle und Ziel sind identisch.';
  end if;

  -- Beide Akteure in deterministischer Reihenfolge sperren
  perform 1 from actors where id in (p_from_actor, p_to_actor) order by id for update;

  select gold into v_from_gold from actors where id = p_from_actor for update;
  if v_from_gold is null then
    raise exception 'Quell-Akteur existiert nicht.';
  end if;
  if v_from_gold < p_amount then
    raise exception 'Unzureichendes Gold: % vorhanden, % angefordert.', v_from_gold, p_amount;
  end if;

  update actors set gold = gold - p_amount where id = p_from_actor;
  update actors set gold = gold + p_amount where id = p_to_actor;

  insert into ledger (reason, from_kind, from_id, to_kind, to_id, gold_amount, actor_id)
  values (p_reason, 'player', p_from_actor, 'player', p_to_actor, p_amount, coalesce(p_actor_id, p_from_actor));
end;
$$;

-- ---------------------------------------------------------------------------
-- Schiff (Stückgut) übertragen: neuer Besitzer und/oder neuer Standort.
-- Sperrt das Schiff -> kein Doppel-Transfer desselben einzigartigen Objekts.
-- ---------------------------------------------------------------------------
create or replace function transfer_ship(
  p_ship_id    uuid,
  p_to_owner   uuid,
  p_to_port    uuid default null,
  p_reason     ledger_reason default 'transfer',
  p_actor_id   uuid default null
) returns void
language plpgsql
as $$
declare
  v_from_owner uuid;
  v_state      ship_state;
begin
  select owner_id, state into v_from_owner, v_state
    from ships where id = p_ship_id for update;

  if v_from_owner is null then
    raise exception 'Schiff existiert nicht.';
  end if;
  if v_state in ('sunk') then
    raise exception 'Versenkte Schiffe können nicht übertragen werden.';
  end if;

  update ships
     set owner_id = p_to_owner,
         location_port = coalesce(p_to_port, location_port),
         fleet_id = null,
         state = case when p_to_port is not null then 'docked' else state end
   where id = p_ship_id;

  insert into ledger (reason, from_kind, from_id, to_kind, to_id, ship_id, actor_id)
  values (p_reason, 'player', v_from_owner, 'player', p_to_owner, p_ship_id, coalesce(p_actor_id, p_to_owner));
end;
$$;

-- ---------------------------------------------------------------------------
-- Schiff bauen (spawn): einzigartiges Objekt wird kontrolliert erzeugt.
-- ---------------------------------------------------------------------------
create or replace function build_ship(
  p_owner_id   uuid,
  p_port_id    uuid,
  p_name       text,
  p_class      text,
  p_cost_gold  bigint,
  p_firepower  integer,
  p_hull       integer,
  p_crew       integer,
  p_capacity   integer
) returns uuid
language plpgsql
as $$
declare
  v_gold bigint;
  v_ship uuid;
begin
  select gold into v_gold from actors where id = p_owner_id for update;
  if v_gold is null then
    raise exception 'Besitzer existiert nicht.';
  end if;
  if v_gold < p_cost_gold then
    raise exception 'Unzureichendes Gold für Schiffbau: % vorhanden, % nötig.', v_gold, p_cost_gold;
  end if;

  update actors set gold = gold - p_cost_gold where id = p_owner_id;

  insert into ships (name, ship_class, owner_id, location_port, state,
                     firepower, hull, hull_max, crew, crew_max, cargo_capacity)
  values (p_name, p_class, p_owner_id, p_port_id, 'docked',
          p_firepower, p_hull, p_hull, p_crew, p_crew, p_capacity)
  returning id into v_ship;

  insert into ledger (reason, to_kind, to_id, ship_id, gold_amount, actor_id)
  values ('spawn', 'player', p_owner_id, v_ship, p_cost_gold, p_owner_id);

  return v_ship;
end;
$$;