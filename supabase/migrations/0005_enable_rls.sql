-- ============================================================================
-- Karibik 1765 — Row Level Security (Migration 0005)
--
-- HINTERGRUND: Nach der Ablösung von Base44 spricht das Frontend Supabase direkt
-- an (Auth + Edge Functions). Der öffentliche anon-Key ist im Browser sichtbar.
-- Ohne RLS könnte damit jeder die Tabellen direkt lesen/schreiben.
--
-- MODELL: Der gesamte Spiel-Datenzugriff läuft ausschließlich über die Edge
-- Functions, die den SERVICE-ROLE-Key benutzen. Der Service-Role-Key umgeht RLS.
-- Deshalb aktivieren wir RLS auf allen Spieltabellen OHNE Policies für anon/
-- authenticated — d. h. Direktzugriffe mit dem anon-Key sind vollständig gesperrt,
-- während die Functions weiterhin uneingeschränkt arbeiten.
--
-- Wer später gezielt Direktzugriffe (z. B. read-only) erlauben will, ergänzt
-- passende `create policy ... to authenticated`-Regeln je Tabelle.
-- ============================================================================

alter table actors                enable row level security;
alter table factions              enable row level security;
alter table ports                 enable row level security;
alter table port_faction_influence enable row level security;
alter table goods                 enable row level security;
alter table stock                 enable row level security;
alter table ships                 enable row level security;
alter table fleets                enable row level security;
alter table voyages               enable row level security;
alter table contracts             enable row level security;
alter table market_prices         enable row level security;
alter table ledger                enable row level security;
alter table messages              enable row level security;
alter table world_state           enable row level security;
alter table player_meta           enable row level security;
