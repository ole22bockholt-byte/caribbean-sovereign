-- ============================================================================
-- Karibik 1765 — Datenbankschema (Migration 0001)
-- Geteilte, persistente Welt (Modell A + C) mit "physischen" einzigartigen Objekten.
-- Ausführen im Supabase SQL Editor.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- ENUMs
-- ---------------------------------------------------------------------------
create type owner_kind   as enum ('player', 'ai_nation', 'alliance', 'port');
create type holder_kind  as enum ('player', 'ai_nation', 'alliance', 'port', 'ship');
create type port_status  as enum ('neutral_zone', 'controllable', 'fort');
create type ship_state   as enum ('docked', 'sailing', 'in_battle', 'sunk', 'captured');
create type voyage_state as enum ('planned', 'sailing', 'arrived', 'intercepted', 'cancelled');
create type ledger_reason as enum ('trade', 'tax', 'donation', 'craft', 'spawn', 'loot', 'transfer', 'tick_economy');

-- ---------------------------------------------------------------------------
-- AKTEURE: Spieler, KI-Nationen, Allianzen werden einheitlich als "owner" referenziert.
-- Ein Akteur = eine Zeile in actors. owner_kind unterscheidet Mensch/KI/Allianz.
-- ---------------------------------------------------------------------------
create table actors (
  id            uuid primary key default gen_random_uuid(),
  kind          owner_kind not null,
  display_name  text not null,
  -- nur bei kind='player': Verknüpfung zum App-Login (Base44 user id)
  app_user_id   text unique,
  gold          bigint not null default 0 check (gold >= 0),
  influence     integer not null default 0,
  alliance_id   uuid references actors(id),   -- Mitgliedschaft (player -> alliance)
  is_alliance_leader boolean not null default false,
  created_at    timestamptz not null default now()
);
create index on actors (kind);
create index on actors (alliance_id);

-- ---------------------------------------------------------------------------
-- GROSSFRAKTIONEN (Großbritannien, Spanien, Frankreich, Niederlande, Piraten ...)
-- ---------------------------------------------------------------------------
create table factions (
  id        uuid primary key default gen_random_uuid(),
  code      text unique not null,      -- 'gb', 'es', 'fr', 'nl', 'pirate', 'neutral'
  name      text not null,
  color     text not null              -- Hex für UI-Flaggen
);

-- ---------------------------------------------------------------------------
-- HÄFEN — feste Weltpunkte. Kontrolle kann wechseln (player/ai_nation/alliance).
-- ---------------------------------------------------------------------------
create table ports (
  id                uuid primary key default gen_random_uuid(),
  code              text unique not null,   -- 'port_royal', 'havana' ...
  name              text not null,
  x                 numeric not null,       -- Kartenposition (0..100)
  y                 numeric not null,
  status            port_status not null default 'controllable',
  controlling_actor uuid references actors(id),
  controlling_faction uuid references factions(id),
  security          integer not null default 50 check (security between 0 and 100),
  created_at        timestamptz not null default now()
);

-- Fraktionseinfluss pro Hafen (mehrere Fraktionen je Hafen)
create table port_faction_influence (
  port_id    uuid not null references ports(id) on delete cascade,
  faction_id uuid not null references factions(id) on delete cascade,
  influence  integer not null default 0 check (influence between 0 and 100),
  primary key (port_id, faction_id)
);

-- ---------------------------------------------------------------------------
-- WARENARTEN (Schüttgut-Definitionen: Rum, Zucker, Pulver ...)
-- ---------------------------------------------------------------------------
create table goods (
  id     uuid primary key default gen_random_uuid(),
  code   text unique not null,
  name   text not null,
  base_price integer not null
);

-- ---------------------------------------------------------------------------
-- BESTÄNDE (Schüttgut) — "physisch" als Bestandszeile (holder, gut, menge).
-- holder = wer/wo das Gut liegt. EINE Zeile je (holder, holder_id, gut).
-- Transfer = atomares Verschieben der Menge zwischen zwei Bestandszeilen.
-- ---------------------------------------------------------------------------
create table stock (
  id          uuid primary key default gen_random_uuid(),
  holder_kind holder_kind not null,
  holder_id   uuid not null,           -- actor.id, port.id oder ship.id
  good_id     uuid not null references goods(id),
  quantity    bigint not null default 0 check (quantity >= 0),
  unique (holder_kind, holder_id, good_id)
);
create index on stock (holder_kind, holder_id);

-- ---------------------------------------------------------------------------
-- SCHIFFE (Stückgut) — jedes Schiff ist einzigartig, genau ein Halter.
-- ---------------------------------------------------------------------------
create table ships (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  ship_class   text not null,          -- 'sloop', 'brig', 'frigate', 'galleon' ...
  owner_id     uuid not null references actors(id),
  location_port uuid references ports(id),  -- gesetzt wenn 'docked'
  state        ship_state not null default 'docked',
  fleet_id     uuid,                   -- optionale Flottenzugehörigkeit
  -- Kampf-/Zustandswerte
  firepower    integer not null default 10,
  hull         integer not null default 100,  -- Rumpfstärke (aktuell)
  hull_max     integer not null default 100,
  sails        integer not null default 100,  -- Segelzustand
  crew         integer not null default 50,
  crew_max     integer not null default 50,
  morale       integer not null default 100,
  ammo         integer not null default 100,
  supply       integer not null default 100,
  cargo_capacity integer not null default 200,
  created_at   timestamptz not null default now()
);
create index on ships (owner_id);
create index on ships (location_port);
create index on ships (fleet_id);

-- ---------------------------------------------------------------------------
-- FLOTTEN — Gruppierung von Schiffen, mit Kommandeur (Erfahrung als Multiplikator).
-- ---------------------------------------------------------------------------
create table fleets (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  owner_id       uuid not null references actors(id),
  commander_exp  integer not null default 0,
  created_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- REISEN — laufende Bewegung von Schiffen/Flotten zwischen Häfen (timerbasiert).
-- ---------------------------------------------------------------------------
create table voyages (
  id            uuid primary key default gen_random_uuid(),
  actor_id      uuid not null references actors(id),
  ship_id       uuid references ships(id),
  fleet_id      uuid references fleets(id),
  from_port     uuid not null references ports(id),
  to_port       uuid not null references ports(id),
  state         voyage_state not null default 'sailing',
  departed_at   timestamptz not null default now(),
  arrives_at    timestamptz not null,
  created_at    timestamptz not null default now()
);
create index on voyages (state);
create index on voyages (arrives_at);

-- ---------------------------------------------------------------------------
-- AUFTRÄGE / VERTRÄGE — lokale Aufträge an Häfen.
-- ---------------------------------------------------------------------------
create table contracts (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  contract_type text not null,         -- 'transport', 'escort', 'bounty' ...
  port_id     uuid references ports(id),
  issuer_id   uuid references actors(id),
  reward_gold bigint not null default 0,
  notes       text,
  taken_by    uuid references actors(id),
  completed   boolean not null default false,
  created_at  timestamptz not null default now()
);
create index on contracts (port_id);
create index on contracts (taken_by);

-- ---------------------------------------------------------------------------
-- MARKTPREISE pro Hafen & Gut (dynamisch, vom Welt-Tick aktualisiert).
-- ---------------------------------------------------------------------------
create table market_prices (
  port_id     uuid not null references ports(id) on delete cascade,
  good_id     uuid not null references goods(id) on delete cascade,
  price       integer not null,
  trend       integer not null default 0,   -- -1 / 0 / +1 für UI-Pfeile
  updated_at  timestamptz not null default now(),
  primary key (port_id, good_id)
);

-- ---------------------------------------------------------------------------
-- AUDIT-LOG (Hauptbuch) — unveränderlich, vollständige Transferhistorie.
-- Jede Bewegung von Gold, Schüttgut oder Stückgut wird hier verbucht.
-- ---------------------------------------------------------------------------
create table ledger (
  id            bigint generated always as identity primary key,
  reason        ledger_reason not null,
  -- Quelle / Ziel als generische (kind,id)-Paare
  from_kind     holder_kind,
  from_id       uuid,
  to_kind       holder_kind,
  to_id         uuid,
  -- Was bewegt wurde: entweder Schüttgut (good+menge), Gold, oder ein Schiff
  good_id       uuid references goods(id),
  quantity      bigint,
  gold_amount   bigint,
  ship_id       uuid references ships(id),
  -- Kontext
  actor_id      uuid references actors(id),  -- Auslöser
  meta          jsonb,
  created_at    timestamptz not null default now()
);
create index on ledger (created_at);
create index on ledger (actor_id);
create index on ledger (ship_id);

-- ---------------------------------------------------------------------------
-- NACHRICHTEN — Spielernachrichten / Systembenachrichtigungen.
-- ---------------------------------------------------------------------------
create table messages (
  id          uuid primary key default gen_random_uuid(),
  to_actor    uuid references actors(id),
  subject     text not null,
  body        text,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);
create index on messages (to_actor, read);

-- ---------------------------------------------------------------------------
-- WELTZUSTAND — Singleton-Zeile: aktuelles Spieldatum & letzter Welt-Tick.
-- ---------------------------------------------------------------------------
create table world_state (
  id          boolean primary key default true check (id),  -- nur eine Zeile
  game_date   date not null default '1765-01-01',
  tick_number bigint not null default 0,
  last_tick_at timestamptz not null default now()
);
insert into world_state (id) values (true) on conflict do nothing;