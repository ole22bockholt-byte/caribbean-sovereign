-- ============================================================================
-- Karibik 1765 — Migration 0007: physischer Laderaum (Tonnen)
-- Waren erhalten ein Gewicht in Tonnen je Einheit; die vorhandene Spalte
-- ships.cargo_capacity wird als Maximalkapazität in Tonnen interpretiert.
-- Zusammen bilden sie den „physischen" Laderaum: Ladung belegt Platz nach
-- Gewicht (Bestände liegen als stock-Zeilen mit holder_kind='ship').
-- Additiv & idempotent.
-- ============================================================================

alter table goods add column if not exists weight_tons numeric not null default 1;

comment on column goods.weight_tons is 'Gewicht je Einheit in Tonnen (physischer Laderaum)';
comment on column ships.cargo_capacity is 'Maximale Laderaum-Kapazität in Tonnen';

update goods set weight_tons = case code
  when 'spices'  then 0.3
  when 'cotton'  then 0.6
  when 'coffee'  then 0.7
  when 'tobacco' then 0.8
  when 'rum'     then 1.0
  when 'sugar'   then 1.0
  when 'powder'  then 1.2
  when 'timber'  then 1.5
  else 1.0
end;
