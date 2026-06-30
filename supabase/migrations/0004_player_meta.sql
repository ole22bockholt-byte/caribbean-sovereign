-- ============================================================================
-- Karibik 1765 — Spieler-Metadaten (Migration 0004)
-- Speichert spielerspezifische Wahl beim Onboarding: gewählte Fraktion,
-- Kompaniename und Starthafen. Bewusst schlank & variabel gehalten, damit
-- Fraktionen/Häfen jederzeit geändert werden können (nur Text-/UUID-Referenzen).
-- ============================================================================
create table if not exists player_meta (
  actor_id     uuid primary key references actors(id) on delete cascade,
  faction_code text not null,                       -- 'gb' | 'es' | ... (referenziert factions.code)
  company_name text not null,
  home_port    uuid references ports(id),
  created_at   timestamptz not null default now()
);