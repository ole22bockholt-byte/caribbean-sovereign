-- ============================================================================
-- OPTIONAL — Welt-Tick automatisch per pg_cron ausführen.
--
-- Diese Datei ist BEWUSST KEINE Migration (läuft nicht bei `supabase db push`),
-- weil pg_cron je nach Projekt erst aktiviert werden muss. Führe den Inhalt bei
-- Bedarf einmalig im Supabase SQL-Editor aus.
--
-- Vorteil: Der Tick läuft vollständig autonom in der Datenbank — ohne externen
-- Scheduler und ohne Auth (world_tick() ist eine SQL-Funktion, siehe 0003).
-- ============================================================================

-- 1) pg_cron aktivieren (alternativ: Dashboard > Database > Extensions > pg_cron).
create extension if not exists pg_cron;

-- 2) Vorhandenen Job gleichen Namens entfernen (idempotent), dann neu planen.
do $$
begin
  perform cron.unschedule('karibik-world-tick');
exception when others then
  -- Job existierte noch nicht — ignorieren.
  null;
end $$;

-- 3) Alle 10 Minuten einen Welt-Tick ausführen (Intervall frei anpassbar).
select cron.schedule(
  'karibik-world-tick',
  '*/10 * * * *',
  $$select world_tick();$$
);

-- Kontrolle: select * from cron.job;
