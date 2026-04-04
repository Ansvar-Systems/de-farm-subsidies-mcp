import { createDatabase, type Database } from '../../src/db.js';

export function createSeededDatabase(dbPath: string): Database {
  const db = createDatabase(dbPath);

  // Schemes
  db.run(
    `INSERT INTO schemes (id, name, scheme_type, authority, status, start_date, description, eligibility_summary, application_window, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['einkommensgrundstuetzung', 'Einkommensgrundstuetzung (EGS)', 'income-support', 'BLE / Laender-Zahlstellen', 'open',
     '2023-01-01', 'Direktzahlung pro Hektar fuer aktive Betriebsinhaber. Konvergiert auf ca. 156 EUR/ha.',
     'Aktiver Betriebsinhaber mit beihilfefaehigen Flaechen. Einhaltung der Konditionalitaet.',
     'Sammelantrag 1. April - 15. Mai', 'DE']
  );
  db.run(
    `INSERT INTO schemes (id, name, scheme_type, authority, status, start_date, description, eligibility_summary, application_window, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['oeko-regelungen', 'Oeko-Regelungen (Eco-Schemes)', 'agri-environment', 'BLE / Laender-Zahlstellen', 'open',
     '2023-01-01', 'Jaehrliche Zahlungen fuer freiwillige Klima- und Umweltmassnahmen (OR1-OR7).',
     'Aktiver Betriebsinhaber. Auswahl einer oder mehrerer OR. Jaehrliche Beantragung im Sammelantrag.',
     'Sammelantrag 1. April - 15. Mai', 'DE']
  );

  // Scheme options
  db.run(
    `INSERT INTO scheme_options (id, scheme_id, code, name, description, payment_rate, payment_unit, eligible_land_types, requirements, duration_years, stacking_rules, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['egs-basis', 'einkommensgrundstuetzung', 'EGS', 'Einkommensgrundstuetzung (nationaler Durchschnitt)',
     'Jaehrliche Flaechenzahlung konvergiert auf ca. 156 EUR/ha.',
     156.00, 'EUR/ha', 'Ackerland, Dauergruenland, Dauerkulturen',
     'Aktiver Betriebsinhaber, beihilfefaehige Flaechen, Sammelantrag, Konditionalitaet',
     1, 'Kumulierbar mit Umverteilungspraemie, Junglandwirtepraemie, Oeko-Regelungen', 'DE']
  );
  db.run(
    `INSERT INTO scheme_options (id, scheme_id, code, name, description, payment_rate, payment_unit, eligible_land_types, requirements, duration_years, stacking_rules, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['or1-nichtproduktive-flaechen', 'oeko-regelungen', 'OR1', 'OR1 — Bereitstellung nichtproduktiver Flaechen',
     'Nichtproduktive Flaechen auf Ackerland ueber GLOZ 8 hinaus. Brache ca. 1.300 EUR/ha.',
     1300.00, 'EUR/ha', 'Ackerland',
     'Nichtproduktive Flaechen ueber GLOZ 8 hinaus. Keine Duengung, kein Pflanzenschutz.',
     1, 'Nicht mit AUKM auf derselben Flaeche kumulierbar', 'DE']
  );
  db.run(
    `INSERT INTO scheme_options (id, scheme_id, code, name, description, payment_rate, payment_unit, eligible_land_types, requirements, duration_years, stacking_rules, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['or4-extensives-gruenland', 'oeko-regelungen', 'OR4', 'OR4 — Extensivierung des gesamten Dauergruenlandes',
     'Extensivierung der gesamten Dauergruenlandflaeche. Ca. 115 EUR/ha. Keine mineralische N-Duengung.',
     115.00, 'EUR/ha', 'Dauergruenland',
     'Keine mineralische N-Duengung auf Dauergruenland. Max. 1,4 RGV/ha. Gesamtbetrieblich.',
     1, 'Kumulierbar mit EGS. Nicht mit OR5 auf derselben Flaeche.', 'DE']
  );

  // Cross-compliance
  db.run(
    `INSERT INTO cross_compliance (id, requirement, category, reference, description, applies_to, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['gloz-4', 'Pufferstreifen entlang von Gewaessern', 'GLOZ',
     'GLOZ 4', 'Mindestens 3 Meter breite Pufferstreifen entlang von Gewaessern. Kein Einsatz von Pflanzenschutzmitteln und Duengemitteln.',
     'Alle Flaechen mit angrenzenden Gewaessern', 'DE']
  );
  db.run(
    `INSERT INTO cross_compliance (id, requirement, category, reference, description, applies_to, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['gab-3', 'Nitratrichtlinie', 'GAB',
     'GAB 3', 'Schutz der Gewaesser vor Verunreinigung durch Nitrate. Umsetzung ueber Duengeverordnung. 170 kg N/ha organisch. Sperrfristen.',
     'Alle Betriebe, verschaerfte Anforderungen in Roten Gebieten', 'DE']
  );

  // FTS5 search index
  db.run(
    `INSERT INTO search_index (title, body, scheme_type, jurisdiction) VALUES (?, ?, ?, ?)`,
    ['Einkommensgrundstuetzung EGS Basispraeemie', 'Einkommensgrundstuetzung EGS Direktzahlung 156 EUR/ha. Sammelantrag InVeKoS. Konditionalitaet GLOZ GAB. Zahlstelle Vorschuss Oktober.', 'income-support', 'DE']
  );
  db.run(
    `INSERT INTO search_index (title, body, scheme_type, jurisdiction) VALUES (?, ?, ?, ?)`,
    ['Oeko-Regelungen OR1 Brache Gruenland', 'Oeko-Regelungen OR1 nichtproduktive Flaechen Brache 1300 EUR/ha. OR4 extensives Dauergruenland 115 EUR/ha. Sammelantrag freiwillig jaehrlich.', 'agri-environment', 'DE']
  );

  return db;
}
