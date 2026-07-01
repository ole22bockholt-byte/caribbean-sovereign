-- ============================================================================
-- Karibik 1765 — Migration 0005: historische Häfen (Stand ~1765)
-- Bringt die Häfen auf den erweiterten, geografisch korrekten Satz. x/y sind
-- Kartenkoordinaten (0..100) und liegen deckungsgleich zu den Landmassen in
-- src/lib/mapGeography.js. Idempotent (upsert auf ports.code); bestehende
-- Kontrolle/Einfluss bleiben erhalten, es werden nur Position/Name/Status
-- sowie fehlender Grund-Einfluss der kontrollierenden Fraktion gesetzt.
-- ============================================================================

with data(code, name, x, y, fac, status, security) as (
  values
    ('port_royal',    'Port Royal',        42.0, 45.5, 'gb',      'fort'::port_status,         75),
    ('kingston',      'Kingston',          44.5, 46.5, 'gb',      'controllable'::port_status, 55),
    ('havana',        'Havanna',           24.0, 20.0, 'es',      'fort'::port_status,         75),
    ('santiago',      'Santiago de Cuba',  47.0, 34.5, 'es',      'controllable'::port_status, 55),
    ('cartagena',     'Cartagena',         40.0, 82.0, 'es',      'fort'::port_status,         75),
    ('tortuga',       'Tortuga',           54.5, 32.4, 'pirate',  'controllable'::port_status, 40),
    ('petit_goave',   'Petit-Goâve',       51.5, 45.0, 'fr',      'controllable'::port_status, 55),
    ('willemstad',    'Willemstad',        60.5, 73.5, 'nl',      'controllable'::port_status, 55),
    ('nassau',        'Nassau',            60.0, 11.0, 'neutral', 'neutral_zone'::port_status, 30),
    ('cap_francais',  'Cap-Français',      53.0, 34.6, 'fr',      'fort'::port_status,         75),
    ('san_juan',      'San Juan',          77.0, 39.3, 'es',      'fort'::port_status,         75),
    ('santo_domingo', 'Santo Domingo',     64.0, 45.5, 'es',      'controllable'::port_status, 55),
    ('bridgetown',    'Bridgetown',        94.0, 63.0, 'gb',      'controllable'::port_status, 55),
    ('fort_royal',    'Fort-Royal',        89.5, 58.0, 'fr',      'fort'::port_status,         75),
    ('basse_terre',   'Basse-Terre',       88.0, 51.5, 'fr',      'controllable'::port_status, 55),
    ('oranjestad',    'Oranjestad',        86.0, 45.8, 'nl',      'controllable'::port_status, 50),
    ('portobelo',     'Portobelo',         24.0, 79.0, 'es',      'fort'::port_status,         75),
    ('port_of_spain', 'Port of Spain',     88.0, 76.0, 'es',      'controllable'::port_status, 55),
    ('campeche',      'Campeche',           9.5, 25.0, 'es',      'controllable'::port_status, 55)
)
insert into ports (code, name, x, y, controlling_faction, status, security)
select d.code, d.name, d.x, d.y, f.id, d.status, d.security
from data d
join factions f on f.code = d.fac
on conflict (code) do update
  set name = excluded.name,
      x = excluded.x,
      y = excluded.y,
      status = excluded.status;

-- Grund-Einfluss der kontrollierenden Fraktion je Hafen sicherstellen.
with data(code, fac) as (
  values
    ('port_royal','gb'),('kingston','gb'),('havana','es'),('santiago','es'),
    ('cartagena','es'),('tortuga','pirate'),('petit_goave','fr'),('willemstad','nl'),
    ('nassau','neutral'),('cap_francais','fr'),('san_juan','es'),('santo_domingo','es'),
    ('bridgetown','gb'),('fort_royal','fr'),('basse_terre','fr'),('oranjestad','nl'),
    ('portobelo','es'),('port_of_spain','es'),('campeche','es')
)
insert into port_faction_influence (port_id, faction_id, influence)
select p.id, f.id, 70
from data d
join ports p on p.code = d.code
join factions f on f.code = d.fac
on conflict (port_id, faction_id) do nothing;
