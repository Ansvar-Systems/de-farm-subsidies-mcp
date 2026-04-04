/**
 * Germany Farm Subsidies MCP — Data Ingestion Script
 *
 * Ingests German GAP/CAP subsidy data from BLE, BMEL and Laender sources:
 *  - Einkommensgrundstuetzung (EGS) — basic income support ~156 EUR/ha
 *  - Umverteilungspraemie — top-up on first 60 hectares ~69 EUR/ha
 *  - Junglandwirtepraemie — young farmer payment ~134 EUR/ha
 *  - Oeko-Regelungen (OR1-OR7) — eco-schemes
 *  - Konditionalitaet — GLOZ 1-9, GAB 1-11
 *  - Gekoppelte Stuetzung — Mutterkuhpraemie, Schaf/Ziegen
 *  - InVeKoS — application calendar and deadlines
 *  - ELER 2. Saule — AGZ, AUKM by Bundesland
 *  - GAP-Strategieplan Deutschland 2023-2027
 *
 * Usage: npm run ingest
 */

import { createDatabase } from '../src/db.js';
import { mkdirSync, writeFileSync } from 'fs';

mkdirSync('data', { recursive: true });
const db = createDatabase('data/database.db');

const now = new Date().toISOString().split('T')[0];

// ──────────────────────────────────────────
// Clear existing data for clean re-ingest
// ──────────────────────────────────────────
db.run('DELETE FROM scheme_options');
db.run('DELETE FROM schemes');
db.run('DELETE FROM cross_compliance');
db.run('DELETE FROM search_index');

// ──────────────────────────────────────────
// 1. Schemes
// ──────────────────────────────────────────

const schemes = [
  {
    id: 'einkommensgrundstuetzung',
    name: 'Einkommensgrundstuetzung (EGS)',
    scheme_type: 'income-support',
    authority: 'BLE (Bundesanstalt fuer Landwirtschaft und Ernaehrung) / Laender-Zahlstellen',
    status: 'open',
    start_date: '2023-01-01',
    description:
      'Die Einkommensgrundstuetzung fuer Nachhaltigkeit (EGS) ist die wichtigste Direktzahlung im Rahmen der GAP 2023-2027. Sie ersetzt die bisherige Basispraeemie und wird als einheitlicher Betrag pro beihilfefaehigem Hektar gezahlt. Der Betrag konvergiert auf einen nationalen Durchschnittswert von ca. 156 EUR/ha. Alle Betriebsinhaber, die landwirtschaftliche Flaechen bewirtschaften, koennen die EGS beantragen. Die Zahlung ist an die Einhaltung der Konditionalitaet (GLOZ-Standards und GAB) geknuepft.',
    eligibility_summary:
      'Aktiver Betriebsinhaber mit beihilfefaehigen landwirtschaftlichen Flaechen. Einhaltung der Konditionalitaet (GLOZ 1-9 und GAB 1-11). Flaechenantrag ueber InVeKoS bis 15. Mai.',
    application_window: 'Flaechenantrag (Sammelantrag) ueber InVeKoS: 1. April - 15. Mai (jaehrlich)',
    jurisdiction: 'DE',
  },
  {
    id: 'umverteilungspraemie',
    name: 'Umverteilungspraemie (UEP)',
    scheme_type: 'income-support',
    authority: 'BLE / Laender-Zahlstellen',
    status: 'open',
    start_date: '2023-01-01',
    description:
      'Ergaenzende Einkommensstuetzung zur Umverteilung zugunsten kleinerer und mittlerer Betriebe. Es wird ein Zuschlag von ca. 69 EUR/ha fuer die ersten 60 Hektar jedes Betriebes gezahlt. Der genaue Betrag wird jaehrlich angepasst. Die Umverteilungspraemie soll die hoehere Arbeitsintensitaet und geringere Skaleneffekte kleiner Betriebe ausgleichen. Keine gesonderte Antragstellung erforderlich — die Berechnung erfolgt automatisch auf Basis des Sammelantrags.',
    eligibility_summary:
      'Jeder Betriebsinhaber mit EGS-Anspruch. Zahlung automatisch fuer die ersten 60 ha. Keine zusaetzlichen Bedingungen ueber die EGS-Voraussetzungen hinaus.',
    application_window: 'Automatisch ueber Sammelantrag (1. April - 15. Mai)',
    jurisdiction: 'DE',
  },
  {
    id: 'junglandwirtepraemie',
    name: 'Junglandwirtepraemie (JLP)',
    scheme_type: 'income-support',
    authority: 'BLE / Laender-Zahlstellen',
    status: 'open',
    start_date: '2023-01-01',
    description:
      'Ergaenzende Einkommensstuetzung fuer Junglandwirte. Der Zuschlag betraegt ca. 134 EUR/ha fuer bis zu 120 ha und wird maximal 5 Jahre lang gezahlt. Ziel ist die Unterstuetzung der Existenzgruendung und Hofuebernahme durch junge Landwirte. Der Antragsteller darf zum Zeitpunkt der erstmaligen Antragstellung nicht aelter als 40 Jahre sein und muss sich erstmals als Betriebsinhaber niedergelassen haben.',
    eligibility_summary:
      'Betriebsinhaber unter 41 Jahre bei Erstantragstellung. Erstmalige Niederlassung als Betriebsinhaber. Berufliche Qualifikation (landwirtschaftliche Ausbildung oder Studium). Max. 120 ha, max. 5 Jahre.',
    application_window: 'Sammelantrag ueber InVeKoS: 1. April - 15. Mai (jaehrlich)',
    jurisdiction: 'DE',
  },
  {
    id: 'oeko-regelungen',
    name: 'Oeko-Regelungen (Eco-Schemes)',
    scheme_type: 'agri-environment',
    authority: 'BLE / Laender-Zahlstellen',
    status: 'open',
    start_date: '2023-01-01',
    description:
      'Jaehrliche Zahlungen fuer freiwillige Klima- und Umweltmassnahmen im Rahmen der 1. Saule der GAP. Es gibt 7 Oeko-Regelungen (OR1-OR7) mit unterschiedlichen Praemiensaetzen. Die Teilnahme ist freiwillig und wird jaehrlich beantragt. Die Oeko-Regelungen ersetzen teilweise das bisherige Greening. Betriebsinhaber koennen mehrere OR kombinieren, sofern sie auf unterschiedlichen Flaechen bzw. bei unterschiedlichen Massnahmen angewendet werden.',
    eligibility_summary:
      'Aktiver Betriebsinhaber mit beihilfefaehigen Flaechen. Auswahl einer oder mehrerer OR je Flaeche. Jaehrliche Beantragung im Sammelantrag. Einhaltung der jeweiligen Auflagen.',
    application_window: 'Sammelantrag ueber InVeKoS: 1. April - 15. Mai (jaehrlich)',
    jurisdiction: 'DE',
  },
  {
    id: 'gekoppelte-stuetzung',
    name: 'Gekoppelte Einkommensstuetzung',
    scheme_type: 'coupled-support',
    authority: 'BLE / Laender-Zahlstellen',
    status: 'open',
    start_date: '2023-01-01',
    description:
      'Gekoppelte Stuetzungszahlungen fuer bestimmte Tierhaltungssektoren. Deutschland nutzt die Option der fakultativen gekoppelten Stuetzung fuer Mutterkuehe und Mutterschafe/-ziegen. Die Mutterkuhpraemie betraegt ca. 78 EUR/Tier (ab 2024), die Schaf- und Ziegenpraemie ca. 34 EUR/Tier. Ziel ist die Stuetzung der extensiven Weidehaltung und die Erhaltung der Offenlandschaft.',
    eligibility_summary:
      'Halter von Mutterkuehen: Mindestbestandsgroesse, Kuehe muessen im Kalenderjahr mindestens ein Kalb gesaeugt haben. Halter von Schafen/Ziegen: Mindestbestandsgroesse, weibliche Zuchttiere. Tiere in HI-Tier gemeldet.',
    application_window: 'Tierbestandsmeldung ueber InVeKoS: Stichtag 1. Januar (Antrag bis 15. Mai)',
    jurisdiction: 'DE',
  },
  {
    id: 'konditionalitaet',
    name: 'Konditionalitaet (Cross-Compliance)',
    scheme_type: 'cross-compliance',
    authority: 'BMEL / BLE / Laender-Kontrollbehoerden',
    status: 'active',
    start_date: '2023-01-01',
    description:
      'Die Konditionalitaet umfasst die Grundanforderungen, die jeder Empfaenger von GAP-Direktzahlungen einhalten muss. Sie besteht aus 9 GLOZ-Standards (Guter landwirtschaftlicher und oekologischer Zustand) und 11 GAB (Grundanforderungen an die Betriebsfuehrung). Die GLOZ-Standards betreffen Bodenschutz, Wasser, Biodiversitaet und Klima. Die GAB beziehen sich auf EU-Richtlinien zu Umwelt, Lebensmittel- und Futtermittelsicherheit, Tiergesundheit und Tierschutz. Verstoesse fuehren zu Kuerzungen der Direktzahlungen.',
    eligibility_summary:
      'Pflicht fuer alle Empfaenger von GAP-Direktzahlungen und ELER-Massnahmen. Keine gesonderte Beantragung. Einhaltung wird kontrolliert (1-5% der Betriebe jaehrlich).',
    application_window: 'Nicht anwendbar (verpflichtend, kein Antrag)',
    jurisdiction: 'DE',
  },
  {
    id: 'agz',
    name: 'Ausgleichszulage fuer benachteiligte Gebiete (AGZ)',
    scheme_type: 'area-payment',
    authority: 'Laender-Agrarbehoerden / ELER',
    status: 'open',
    start_date: '2023-01-01',
    description:
      'Flaechenbezogene Ausgleichszulage fuer landwirtschaftliche Betriebe in benachteiligten Gebieten (Berggebiete, sonstige benachteiligte Gebiete, Gebiete mit spezifischen Nachteilen). Die AGZ soll Einkommensnachteile ausgleichen, die durch natuerliche Standortbedingungen entstehen. Die Hoehe variiert nach Bundesland und Gebietskulisse (25-200 EUR/ha). Finanzierung ueber ELER (2. Saule) und GAK. Degressiv gestaffelt nach Flaechengroesse.',
    eligibility_summary:
      'Betrieb liegt in einem als benachteiligt eingestuften Gebiet (nach EU-Abgrenzung). Mindest-LF in benachteiligtem Gebiet (laenderabhaengig). Einhaltung der Konditionalitaet. Nachweis der landwirtschaftlichen Taetigkeit.',
    application_window: 'Sammelantrag ueber InVeKoS: 1. April - 15. Mai (jaehrlich, laenderabhaengig)',
    jurisdiction: 'DE',
  },
  {
    id: 'aukm',
    name: 'Agrarumwelt- und Klimamassnahmen (AUKM)',
    scheme_type: 'agri-environment',
    authority: 'Laender-Agrarbehoerden / ELER',
    status: 'open',
    start_date: '2023-01-01',
    description:
      'Freiwillige Agrarumwelt- und Klimamassnahmen im Rahmen der 2. Saule der GAP (ELER). Die konkreten Massnahmen und Praemiensaetze werden von den Bundeslaendern festgelegt und variieren stark. Typische Programme: FAKT (Baden-Wuerttemberg), KULAP (Bayern), HALM (Hessen), NiB-AUM (Niedersachsen), AUK (Brandenburg). Verpflichtungszeitraum in der Regel 5 Jahre. Finanzierung ueber ELER (EU) und GAK (Bund/Laender).',
    eligibility_summary:
      'Landwirtschaftlicher Betrieb im jeweiligen Bundesland. Einhaltung der programmspezifischen Auflagen ueber den Verpflichtungszeitraum (5 Jahre). Antragstellung bei der zustaendigen Landesbehoerde.',
    application_window: 'Laenderabhaengig — in der Regel im Herbst des Vorjahres oder im Fruehjahr mit dem Sammelantrag',
    jurisdiction: 'DE',
  },
  {
    id: 'afp',
    name: 'Agrarinvestitionsfoerderungsprogramm (AFP)',
    scheme_type: 'investment',
    authority: 'Laender-Agrarbehoerden / GAK',
    status: 'open',
    start_date: '2023-01-01',
    description:
      'Investitionsfoerderung fuer landwirtschaftliche Betriebe im Rahmen der GAK (Gemeinschaftsaufgabe Agrarstruktur und Kuestenschutz). Zuschuss von 20-40% der foerderfaehigen Investitionskosten. Tierwohl-Bonus: bis zu +10%. Junglandwirte-Bonus: bis zu +10%. Die konkreten Foerdersaetze und Schwerpunkte variieren nach Bundesland. Typische Investitionen: Stallneubauten, Lagererweiterungen, Milchviehanlagen, Biogasanlagen-Ergaenzungen.',
    eligibility_summary:
      'Landwirtschaftlicher Unternehmer. Nachweis der beruflichen Faehigkeiten. Wirtschaftliches Betriebskonzept. Investition in Deutschland. Mindestinvestitionsvolumen (laenderabhaengig, oft 20.000 EUR). Foerderhoechstbetrag laenderabhaengig (oft 1,5-2 Mio EUR).',
    application_window: 'Laenderabhaengig — jaehrliche Antragsfenster oder Stichtagsverfahren',
    jurisdiction: 'DE',
  },
  {
    id: 'gap-strategieplan',
    name: 'GAP-Strategieplan Deutschland 2023-2027',
    scheme_type: 'framework',
    authority: 'BMEL (Bundesministerium fuer Ernaehrung und Landwirtschaft) / EU',
    status: 'active',
    start_date: '2023-01-01',
    description:
      'Der GAP-Strategieplan ist der nationale Rahmen fuer die Umsetzung der Gemeinsamen Agrarpolitik 2023-2027 in Deutschland. Er umfasst: 1. Saule (Direktzahlungen, ca. 4,9 Mrd EUR/Jahr): EGS, Umverteilungspraemie, Junglandwirtepraemie, Oeko-Regelungen, Gekoppelte Stuetzung. 2. Saule (ELER, ca. 1,2 Mrd EUR/Jahr): AGZ, AUKM, Oekologischer Landbau, AFP, EIP-Agri, LEADER. Gesamtbudget ca. 30 Mrd EUR (2023-2027). 25% der Direktzahlungen sind fuer Oeko-Regelungen reserviert.',
    eligibility_summary:
      'Rahmenwerk fuer die gesamte GAP-Umsetzung. Einzelne Interventionen haben eigene Zugangsvoraussetzungen.',
    application_window: 'Nicht anwendbar (Rahmenwerk, kein individueller Antrag)',
    jurisdiction: 'DE',
  },
  {
    id: 'oekologischer-landbau',
    name: 'Foerderung des oekologischen Landbaus',
    scheme_type: 'agri-environment',
    authority: 'Laender-Agrarbehoerden / ELER',
    status: 'open',
    start_date: '2023-01-01',
    description:
      'Flaechenpraemie fuer oekologisch wirtschaftende Betriebe im Rahmen der 2. Saule (ELER). Umstellungspraemie (5 Jahre): Ackerland 350-520 EUR/ha, Gruenland 250-350 EUR/ha, Gemuese 500-900 EUR/ha, Dauerkulturen 750-1.300 EUR/ha (je nach Bundesland). Beibehaltungspraemie: Ackerland 230-300 EUR/ha, Gruenland 200-260 EUR/ha. Die Praemiensaetze variieren erheblich nach Bundesland. Ziel der Bundesregierung: 30% Bio-Flaeche bis 2030 (aktuell ca. 14%).',
    eligibility_summary:
      'Zertifizierung nach EU-Oeko-Verordnung 2018/848 durch zugelassene Kontrollstelle. Gesamtbetriebsumstellung (bei Verbandsbio) oder Teilbetriebsumstellung (EU-Bio). Verpflichtungszeitraum 5 Jahre.',
    application_window: 'Laenderabhaengig — oft Herbst des Vorjahres oder Fruehjahr mit Sammelantrag',
    jurisdiction: 'DE',
  },
  {
    id: 'invekos-kalender',
    name: 'InVeKoS-Antragskalender und Zahlungstermine',
    scheme_type: 'application-guidance',
    authority: 'BLE / Laender-Zahlstellen',
    status: 'active',
    start_date: '2023-01-01',
    description:
      'Der InVeKoS-Kalender (Integriertes Verwaltungs- und Kontrollsystem) regelt die Fristen fuer den Sammelantrag und die Auszahlung der GAP-Direktzahlungen. Sammelantrag: 1. April bis 15. Mai. Aenderungen ohne Kuerzung: bis 31. Mai. Verspaetete Einreichung: 1% Kuerzung pro Arbeitstag (max. 25 Kalendertage). Vorabzahlung (Vorschuss): ab 16. Oktober (bis 75% der Direktzahlungen). Restzahlung: ab 1. Dezember bis 30. Juni des Folgejahres. AUKM/AGZ: Zahlungstermine laenderabhaengig. Vor-Ort-Kontrollen: Mai bis Oktober.',
    eligibility_summary:
      'Alle Antragsteller von GAP-Direktzahlungen und ELER-Massnahmen.',
    application_window: 'Sammelantrag: 1. April - 15. Mai | Vorabzahlung: ab 16. Oktober | Restzahlung: ab 1. Dezember',
    jurisdiction: 'DE',
  },
];

const insertScheme = db.instance.prepare(
  `INSERT INTO schemes (id, name, scheme_type, authority, status, start_date, description, eligibility_summary, application_window, jurisdiction)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
);

for (const s of schemes) {
  insertScheme.run(s.id, s.name, s.scheme_type, s.authority, s.status, s.start_date, s.description, s.eligibility_summary, s.application_window, s.jurisdiction);
}
console.log(`Inserted ${schemes.length} schemes.`);

// ──────────────────────────────────────────
// 2. Scheme options
// ──────────────────────────────────────────

const schemeOptions = [
  // ────────────────────────────────────────
  // EGS — Einkommensgrundstuetzung
  // ────────────────────────────────────────
  {
    id: 'egs-basis',
    scheme_id: 'einkommensgrundstuetzung',
    code: 'EGS',
    name: 'Einkommensgrundstuetzung (nationaler Durchschnitt)',
    description: 'Jaehrliche Flaechenzahlung fuer alle beihilfefaehigen Hektare. Der Wert konvergiert auf ca. 156 EUR/ha im Jahr 2026. Die Konvergenz erfolgt schrittweise — Betriebe mit historisch hohen Zahlungsanspruechen erhalten weniger, Betriebe mit niedrigen erhalten mehr. Ab 2026 einheitlicher Wert.',
    payment_rate: 156.0,
    payment_unit: 'EUR/ha',
    eligible_land_types: 'Ackerland, Dauergruenland, Dauerkulturen',
    requirements: 'Aktiver Betriebsinhaber, beihilfefaehige Flaechen, Sammelantrag, Konditionalitaet einhalten',
    duration_years: 1,
    stacking_rules: 'Kumulierbar mit Umverteilungspraemie, Junglandwirtepraemie, Oeko-Regelungen und gekoppelter Stuetzung',
    jurisdiction: 'DE',
  },

  // ────────────────────────────────────────
  // Umverteilungspraemie
  // ────────────────────────────────────────
  {
    id: 'uep-60ha',
    scheme_id: 'umverteilungspraemie',
    code: 'UEP-60',
    name: 'Umverteilungspraemie fuer die ersten 60 Hektar',
    description: 'Zuschlag von ca. 69 EUR/ha fuer die ersten 60 Hektar jedes Betriebs. Berechnung erfolgt automatisch durch die Zahlstelle. Keine zusaetzliche Antragstellung noetig. Der genaue Betrag wird jaehrlich anhand des verfuegbaren Budgets festgelegt.',
    payment_rate: 69.0,
    payment_unit: 'EUR/ha (erste 60 ha)',
    eligible_land_types: 'alle beihilfefaehigen Flaechen (erste 60 ha)',
    requirements: 'EGS-Anspruch, Sammelantrag eingereicht',
    duration_years: 1,
    stacking_rules: 'Kumulierbar mit EGS, Junglandwirtepraemie, Oeko-Regelungen',
    jurisdiction: 'DE',
  },

  // ────────────────────────────────────────
  // Junglandwirtepraemie
  // ────────────────────────────────────────
  {
    id: 'jlp-120ha',
    scheme_id: 'junglandwirtepraemie',
    code: 'JLP',
    name: 'Ergaenzende Einkommensstuetzung fuer Junglandwirte',
    description: 'Zuschlag von ca. 134 EUR/ha fuer bis zu 120 Hektar. Maximal 5 Jahre ab erstmaliger Niederlassung. Jaehrliche Beantragung im Sammelantrag. In Deutschland an berufliche Qualifikation geknuepft (landwirtschaftliche Ausbildung oder vergleichbar).',
    payment_rate: 134.0,
    payment_unit: 'EUR/ha (max. 120 ha)',
    eligible_land_types: 'alle beihilfefaehigen Flaechen (max. 120 ha)',
    requirements: 'Unter 41 Jahre bei Erstantrag. Erstmalige Niederlassung als Betriebsinhaber. Berufliche Qualifikation. Max. 5 Jahre.',
    duration_years: 5,
    stacking_rules: 'Kumulierbar mit EGS, Umverteilungspraemie, Oeko-Regelungen, gekoppelter Stuetzung',
    jurisdiction: 'DE',
  },

  // ────────────────────────────────────────
  // Oeko-Regelungen OR1-OR7
  // ────────────────────────────────────────
  {
    id: 'or1-nichtproduktive-flaechen',
    scheme_id: 'oeko-regelungen',
    code: 'OR1',
    name: 'OR1 — Bereitstellung nichtproduktiver Flaechen auf Ackerland',
    description: 'Freiwillige Bereitstellung von zusaetzlichen nichtproduktiven Flaechen ueber die Konditionalitaet (GLOZ 8) hinaus. Praemie ca. 1.300 EUR/ha fuer Brache, ca. 150 EUR/ha fuer Bluehstreifen/-flaechen auf Ackerland. Mindestgroesse 0,1 ha, Mindestbreite 5 m fuer Streifen. Kein Einsatz von Pflanzenschutz- und Duengemitteln.',
    payment_rate: 1300.0,
    payment_unit: 'EUR/ha (Brache) / 150 EUR/ha (Bluehstreifen)',
    eligible_land_types: 'Ackerland',
    requirements: 'Nichtproduktive Flaechen ueber GLOZ 8 hinaus. Keine Duengung, kein Pflanzenschutz. Mindestgroesse 0,1 ha.',
    duration_years: 1,
    stacking_rules: 'Nicht mit AUKM auf derselben Flaeche kumulierbar. Kumulierbar mit EGS.',
    jurisdiction: 'DE',
  },
  {
    id: 'or2-vielfaeltige-kulturen',
    scheme_id: 'oeko-regelungen',
    code: 'OR2',
    name: 'OR2 — Anbau vielfaeltiger Kulturen mit Leguminosen',
    description: 'Anbau von mindestens 5 verschiedenen Hauptfruchtarten auf Ackerland, davon mindestens 10% Leguminosen. Keine Frucht ueber 30% der Ackerflaeche (ausgenommen Dauergruenland). Praemie ca. 45 EUR/ha. Foerdert Fruchtfolgevielfalt und biologische Stickstofffixierung.',
    payment_rate: 45.0,
    payment_unit: 'EUR/ha',
    eligible_land_types: 'Ackerland',
    requirements: 'Mindestens 5 Hauptfruchtarten. Mindestens 10% Leguminosen. Keine Frucht ueber 30% der Ackerflaeche.',
    duration_years: 1,
    stacking_rules: 'Kumulierbar mit EGS, OR1 (auf verschiedenen Flaechen)',
    jurisdiction: 'DE',
  },
  {
    id: 'or3-agroforstsysteme',
    scheme_id: 'oeko-regelungen',
    code: 'OR3',
    name: 'OR3 — Beibehaltung von Agroforstsystemen auf Ackerland und Dauergruenland',
    description: 'Praemie fuer die Beibehaltung von anerkannten Agroforstsystemen (Kombination von Baeumen/Strauchern mit landwirtschaftlicher Nutzung). Ca. 200 EUR/ha Gehoelzstreifen. Mindestens 2 und hoechstens 35 Gehoelzstreifen pro Schlag. Streifenbreite 3-25 m. Abstand zwischen Streifen 20-100 m.',
    payment_rate: 200.0,
    payment_unit: 'EUR/ha (Gehoelzstreifenflaeche)',
    eligible_land_types: 'Ackerland, Dauergruenland mit Agroforstsystem',
    requirements: 'Anerkanntes Agroforstsystem nach Direktzahlungen-Durchfuehrungsverordnung. 2-35 Gehoelzstreifen pro Schlag.',
    duration_years: 1,
    stacking_rules: 'Kumulierbar mit EGS. Gehoelzstreifenflaeche zaehlt zur beihilfefaehigen Flaeche.',
    jurisdiction: 'DE',
  },
  {
    id: 'or4-extensives-gruenland',
    scheme_id: 'oeko-regelungen',
    code: 'OR4',
    name: 'OR4 — Extensivierung des gesamten Dauergruenlandes',
    description: 'Extensivierung der gesamten Dauergruenlandflaeche des Betriebes. Praemie ca. 115 EUR/ha. Keine mineralische Stickstoffduengung auf Dauergruenland. Viehbesatzdichte maximal 1,4 RGV/ha Dauergruenland (Rauhfutterfressende Grossvieheinheiten). Betriebsbezogene Massnahme — gilt fuer das gesamte Dauergruenland.',
    payment_rate: 115.0,
    payment_unit: 'EUR/ha Dauergruenland',
    eligible_land_types: 'Dauergruenland (gesamter Betrieb)',
    requirements: 'Keine mineralische N-Duengung auf Dauergruenland. Max. 1,4 RGV/ha Dauergruenland. Gesamtbetrieblich.',
    duration_years: 1,
    stacking_rules: 'Kumulierbar mit EGS. Nicht mit OR5 auf derselben Flaeche kumulierbar.',
    jurisdiction: 'DE',
  },
  {
    id: 'or5-kennarten-gruenland',
    scheme_id: 'oeko-regelungen',
    code: 'OR5',
    name: 'OR5 — Ergebnisorientierte extensive Bewirtschaftung von Dauergruenland mit Nachweis von Kennarten',
    description: 'Praemie fuer extensives Gruenland mit Nachweis von mindestens 4 regionalen Kennarten (Pflanzenarten, die extensives Gruenland anzeigen). Praemie ca. 240 EUR/ha (4+ Kennarten) bis 360 EUR/ha (6+ Kennarten). Kontrolle ueber Kennartenfeststellung durch geschultes Personal. Ergebnisorientiert — nicht vorgeschriebene Massnahmen, sondern Ergebnisnachweis.',
    payment_rate: 240.0,
    payment_unit: 'EUR/ha (4 Kennarten) / 360 EUR/ha (6+ Kennarten)',
    eligible_land_types: 'Dauergruenland',
    requirements: 'Mindestens 4 regionale Kennarten auf der Flaeche. Keine Nachsaat mit nicht-regionalem Saatgut. Kennartenfeststellung durch Fachpersonal.',
    duration_years: 1,
    stacking_rules: 'Kumulierbar mit EGS. Nicht mit OR4 auf derselben Flaeche kumulierbar.',
    jurisdiction: 'DE',
  },
  {
    id: 'or6-verzicht-pflanzenschutz',
    scheme_id: 'oeko-regelungen',
    code: 'OR6',
    name: 'OR6 — Verzicht auf chemisch-synthetische Pflanzenschutzmittel',
    description: 'Vollstaendiger Verzicht auf chemisch-synthetische Pflanzenschutzmittel auf der beantragten Flaeche. Praemie variiert nach Kultur: ca. 130 EUR/ha Ackerland, ca. 50 EUR/ha Dauergruenland, ca. 100 EUR/ha Leguminosen, bis zu 300-500 EUR/ha Dauerkulturen (Obst, Wein, Hopfen). Biologische und mechanische Verfahren bleiben erlaubt.',
    payment_rate: 130.0,
    payment_unit: 'EUR/ha Ackerland (50-500 EUR/ha je Nutzung)',
    eligible_land_types: 'Ackerland, Dauergruenland, Dauerkulturen',
    requirements: 'Vollstaendiger Verzicht auf chemisch-synthetische PSM auf der beantragten Flaeche. Biologischer Pflanzenschutz erlaubt.',
    duration_years: 1,
    stacking_rules: 'Kumulierbar mit EGS und OR2. Nicht doppelt foerderbar mit Oeko-Landbau fuer dieselbe Flaeche.',
    jurisdiction: 'DE',
  },
  {
    id: 'or7-praezisionslandwirtschaft',
    scheme_id: 'oeko-regelungen',
    code: 'OR7',
    name: 'OR7 — Anwendung von durch Sensortechnik gestuetzten Verfahren zur Pflanzenschutzmittelausbringung',
    description: 'Praemie fuer den Einsatz von teilflaechenspezifischer Pflanzenschutz-Ausbringung mittels Sensortechnik (z.B. Spotspraying, Bandspritzen mit Kameraerkennung). Ca. 30-50 EUR/ha. Die Technik muss nachweislich den Pflanzenschutzmitteleinsatz reduzieren. Nur auf Dauerkulturen (Obst, Wein, Hopfen) oder Ackerland mit Reihenkulturen anwendbar.',
    payment_rate: 45.0,
    payment_unit: 'EUR/ha',
    eligible_land_types: 'Dauerkulturen, Ackerland mit Reihenkulturen',
    requirements: 'Einsatz von Sensortechnik zur teilflaechenspezifischen PSM-Ausbringung. Nachweis der Technik und Anwendung.',
    duration_years: 1,
    stacking_rules: 'Kumulierbar mit EGS. Kumulierbar mit OR6 (sofern die OR6-Flaechen PSM-frei und OR7 auf anderen Flaechen).',
    jurisdiction: 'DE',
  },

  // ────────────────────────────────────────
  // Gekoppelte Stuetzung
  // ────────────────────────────────────────
  {
    id: 'mutterkuhpraemie',
    scheme_id: 'gekoppelte-stuetzung',
    code: 'MKP',
    name: 'Mutterkuhpraemie',
    description: 'Gekoppelte Stuetzung fuer Muttertierhaltung Rind. Ca. 78 EUR pro Mutterkuh (ab 2024, jaehrlich angepasst). Mutterkuh: weibliches Rind, das im Kalenderjahr mindestens ein Kalb gesaeugt hat und einer Rasse oder Kreuzung des Fleisch- oder Zweinutzungstyps angehoert. Meldung ueber HI-Tier.',
    payment_rate: 78.0,
    payment_unit: 'EUR/Tier',
    eligible_land_types: 'nicht flaechengebunden (Mutterkuhbestand)',
    requirements: 'Mindestbestandsgroesse (3 Mutterkuehe). Kuehe muessen Kalb gesaeugt haben. Fleisch-/Zweinutzungsrasse. HI-Tier-Meldung.',
    duration_years: 1,
    stacking_rules: 'Kumulierbar mit EGS, Umverteilungspraemie, Oeko-Regelungen. Nicht mit Milchkuhbestand fuer dasselbe Tier.',
    jurisdiction: 'DE',
  },
  {
    id: 'schaf-ziegen-praemie',
    scheme_id: 'gekoppelte-stuetzung',
    code: 'SZP',
    name: 'Schaf- und Ziegenpraemie',
    description: 'Gekoppelte Stuetzung fuer Mutterschafe und -ziegen. Ca. 34 EUR pro weibliches Zuchttier (ab 2024, jaehrlich angepasst). Ziel: Erhalt der Schafs- und Ziegenhaltung als Beitrag zur Landschaftspflege und Offenhaltung. Tiere muessen in HI-Tier registriert sein. Stichtagsbezogen.',
    payment_rate: 34.0,
    payment_unit: 'EUR/Tier',
    eligible_land_types: 'nicht flaechengebunden (Mutterschaf-/Ziegenbestand)',
    requirements: 'Mindestbestandsgroesse (6 Mutterschafe/-ziegen). Weibliche Zuchttiere. HI-Tier-Meldung. Stichtagshaltung.',
    duration_years: 1,
    stacking_rules: 'Kumulierbar mit EGS, Umverteilungspraemie, Oeko-Regelungen, AGZ.',
    jurisdiction: 'DE',
  },

  // ────────────────────────────────────────
  // AGZ — nach Gebietskulisse
  // ────────────────────────────────────────
  {
    id: 'agz-berggebiet',
    scheme_id: 'agz',
    code: 'AGZ-BERG',
    name: 'Ausgleichszulage Berggebiete',
    description: 'Hoechste Stufe der Ausgleichszulage fuer Betriebe in als Berggebiet eingestuften Regionen (z.B. Alpenraum in Bayern, Schwarzwald, Mittelgebirge). Typisch 150-200 EUR/ha (laenderabhaengig). Degressiv gestaffelt: voller Satz auf den ersten 100 ha, danach abnehmend.',
    payment_rate: 200.0,
    payment_unit: 'EUR/ha (Berggebiet, laenderabhaengig)',
    eligible_land_types: 'landwirtschaftliche Flaechen in Berggebieten',
    requirements: 'Betrieb in anerkanntem Berggebiet. Nachweis landwirtschaftlicher Taetigkeit. Konditionalitaet einhalten.',
    duration_years: 1,
    stacking_rules: 'Kumulierbar mit EGS, Oeko-Regelungen, AUKM.',
    jurisdiction: 'DE',
  },
  {
    id: 'agz-benachteiligt',
    scheme_id: 'agz',
    code: 'AGZ-BEN',
    name: 'Ausgleichszulage sonstige benachteiligte Gebiete',
    description: 'Ausgleichszulage fuer Betriebe in sonstigen benachteiligten Gebieten (nicht Berggebiet). Typisch 50-150 EUR/ha (laenderabhaengig). Kriterien: biophysikalische Nachteile (Boden, Klima, Hangneigung) nach EU-Abgrenzung. Degressiv gestaffelt.',
    payment_rate: 100.0,
    payment_unit: 'EUR/ha (sonstige benachteiligte Gebiete, laenderabhaengig)',
    eligible_land_types: 'landwirtschaftliche Flaechen in sonstigen benachteiligten Gebieten',
    requirements: 'Betrieb in anerkanntem benachteiligtem Gebiet. Nachweis landwirtschaftlicher Taetigkeit.',
    duration_years: 1,
    stacking_rules: 'Kumulierbar mit EGS, Oeko-Regelungen, AUKM.',
    jurisdiction: 'DE',
  },

  // ────────────────────────────────────────
  // AUKM — Laenderbeispiele
  // ────────────────────────────────────────
  {
    id: 'aukm-fakt-bw',
    scheme_id: 'aukm',
    code: 'FAKT-BW',
    name: 'FAKT II (Baden-Wuerttemberg) — Foerderprogramm fuer Agrarumwelt, Klimaschutz und Tierwohl',
    description: 'Landesspezifisches AUKM-Programm in Baden-Wuerttemberg. Umfasst Massnahmen wie: Fruchtartendiversifizierung (70 EUR/ha), Bluehflaechen (710 EUR/ha), Herbizidverzicht im Ackerbau (80 EUR/ha), extensive Gruenlandnutzung (150 EUR/ha), Brachebegruenung (100 EUR/ha). 5-jaehriger Verpflichtungszeitraum.',
    payment_rate: 70.0,
    payment_unit: 'EUR/ha (variiert je Massnahme: 70-710 EUR/ha)',
    eligible_land_types: 'Ackerland, Gruenland (je Massnahme verschieden)',
    requirements: 'Betrieb in Baden-Wuerttemberg. 5-jaehriger Verpflichtungszeitraum. Einhaltung der massnahmenspezifischen Auflagen.',
    duration_years: 5,
    stacking_rules: 'Teilweise mit Oeko-Regelungen kumulierbar (Doppelfoerderung ausgeschlossen, Anrechnung).',
    jurisdiction: 'DE',
  },
  {
    id: 'aukm-kulap-by',
    scheme_id: 'aukm',
    code: 'KULAP-BY',
    name: 'KULAP (Bayern) — Kulturlandschaftsprogramm',
    description: 'Bayerisches AUKM-Programm. Massnahmen: Oekologischer Landbau Gesamtbetrieb (350 EUR/ha Ackerland, 280 EUR/ha Gruenland Beibehaltung), Extensive Gruenlandnutzung (250 EUR/ha), Bluehflaechen (500 EUR/ha), Umweltgerechter Ackerbau (50 EUR/ha), Emissionsarme Ausbringung Wirtschaftsduenger (2 EUR/m3). 5-jaehriger Verpflichtungszeitraum.',
    payment_rate: 350.0,
    payment_unit: 'EUR/ha (variiert je Massnahme: 50-500 EUR/ha)',
    eligible_land_types: 'Ackerland, Gruenland (je Massnahme verschieden)',
    requirements: 'Betrieb in Bayern. 5-jaehriger Verpflichtungszeitraum. Einhaltung der massnahmenspezifischen Auflagen.',
    duration_years: 5,
    stacking_rules: 'Teilweise mit Oeko-Regelungen kumulierbar (Anrechnung bei Doppelfoerderung).',
    jurisdiction: 'DE',
  },
  {
    id: 'aukm-halm-he',
    scheme_id: 'aukm',
    code: 'HALM-HE',
    name: 'HALM (Hessen) — Hessisches Programm fuer Agrarumwelt- und Landschaftspflege-Massnahmen',
    description: 'Hessisches AUKM-Programm. Massnahmen: Oekologischer Landbau (370 EUR/ha Umstellung Acker, 260 EUR/ha Beibehaltung Acker), Vielfaeltige Fruchtfolge (90 EUR/ha), Bluehflaechen (700 EUR/ha), Gruenlandextensivierung (200 EUR/ha), Gewaeeserschutz (50 EUR/ha). 5-jaehriger Verpflichtungszeitraum.',
    payment_rate: 370.0,
    payment_unit: 'EUR/ha (variiert je Massnahme: 50-700 EUR/ha)',
    eligible_land_types: 'Ackerland, Gruenland (je Massnahme verschieden)',
    requirements: 'Betrieb in Hessen. 5-jaehriger Verpflichtungszeitraum. Einhaltung der massnahmenspezifischen Auflagen.',
    duration_years: 5,
    stacking_rules: 'Teilweise mit Oeko-Regelungen kumulierbar (Anrechnung bei Doppelfoerderung).',
    jurisdiction: 'DE',
  },
  {
    id: 'aukm-nib-aum-ni',
    scheme_id: 'aukm',
    code: 'NiB-AUM-NI',
    name: 'NiB-AUM (Niedersachsen/Bremen) — Niedersaechsische und Bremer Agrarumweltmassnahmen',
    description: 'AUKM-Programm Niedersachsen/Bremen. Massnahmen: Bluehstreifen (900 EUR/ha), Gruenlandextensivierung (250 EUR/ha), Anbau vielfaeltiger Kulturen (75 EUR/ha), Winterbegruenung (100 EUR/ha), Wiesenvoegel-Gebiete (350 EUR/ha). 5-jaehriger Verpflichtungszeitraum.',
    payment_rate: 250.0,
    payment_unit: 'EUR/ha (variiert je Massnahme: 75-900 EUR/ha)',
    eligible_land_types: 'Ackerland, Gruenland (je Massnahme verschieden)',
    requirements: 'Betrieb in Niedersachsen oder Bremen. 5-jaehriger Verpflichtungszeitraum. Einhaltung der massnahmenspezifischen Auflagen.',
    duration_years: 5,
    stacking_rules: 'Teilweise mit Oeko-Regelungen kumulierbar (Anrechnung bei Doppelfoerderung).',
    jurisdiction: 'DE',
  },

  // ────────────────────────────────────────
  // Oekologischer Landbau — Praemien nach Nutzungstyp
  // ────────────────────────────────────────
  {
    id: 'oekolandbau-umstellung-acker',
    scheme_id: 'oekologischer-landbau',
    code: 'OEL-UM-ACK',
    name: 'Umstellungspraemie Oekologischer Landbau — Ackerland',
    description: 'Umstellungspraemie fuer die Umstellung von konventionellem auf oekologischen Landbau auf Ackerflaechen. Typisch 350-520 EUR/ha (laenderabhaengig). Verpflichtungszeitraum 5 Jahre. Umstellungszeitraum: 2 Jahre Ackerland.',
    payment_rate: 420.0,
    payment_unit: 'EUR/ha (laenderabhaengig, Spanne 350-520 EUR/ha)',
    eligible_land_types: 'Ackerland in Umstellung auf oekologischen Landbau',
    requirements: 'Zertifizierung nach EU-Oeko-VO 2018/848. Zugelassene Kontrollstelle. 5 Jahre Verpflichtung.',
    duration_years: 5,
    stacking_rules: 'Kumulierbar mit OR4/OR5 auf Gruenland (Anrechnung). Eco-Regime OR6 nicht doppelt foerderbar.',
    jurisdiction: 'DE',
  },
  {
    id: 'oekolandbau-umstellung-gruenland',
    scheme_id: 'oekologischer-landbau',
    code: 'OEL-UM-GL',
    name: 'Umstellungspraemie Oekologischer Landbau — Gruenland',
    description: 'Umstellungspraemie fuer die Umstellung auf oekologischen Landbau auf Gruenland. Typisch 250-350 EUR/ha (laenderabhaengig). Verpflichtungszeitraum 5 Jahre.',
    payment_rate: 300.0,
    payment_unit: 'EUR/ha (laenderabhaengig, Spanne 250-350 EUR/ha)',
    eligible_land_types: 'Dauergruenland in Umstellung auf oekologischen Landbau',
    requirements: 'Zertifizierung nach EU-Oeko-VO 2018/848. Zugelassene Kontrollstelle. 5 Jahre Verpflichtung.',
    duration_years: 5,
    stacking_rules: 'Kumulierbar mit AGZ. Eco-Regime OR4/OR5 mit Anrechnung.',
    jurisdiction: 'DE',
  },
  {
    id: 'oekolandbau-beibehaltung-acker',
    scheme_id: 'oekologischer-landbau',
    code: 'OEL-BB-ACK',
    name: 'Beibehaltungspraemie Oekologischer Landbau — Ackerland',
    description: 'Beibehaltungspraemie fuer bereits oekologisch wirtschaftende Betriebe auf Ackerflaechen. Typisch 230-300 EUR/ha (laenderabhaengig). Geringerer Satz als Umstellung, da die schwierigste Phase (Ertragsverluste bei Umstellung) abgeschlossen ist.',
    payment_rate: 260.0,
    payment_unit: 'EUR/ha (laenderabhaengig, Spanne 230-300 EUR/ha)',
    eligible_land_types: 'Ackerland, oekologisch zertifiziert',
    requirements: 'Gueltige EU-Bio-Zertifizierung. Zugelassene Kontrollstelle. 5 Jahre Verpflichtung.',
    duration_years: 5,
    stacking_rules: 'Kumulierbar mit EGS, Umverteilungspraemie.',
    jurisdiction: 'DE',
  },
  {
    id: 'oekolandbau-beibehaltung-gruenland',
    scheme_id: 'oekologischer-landbau',
    code: 'OEL-BB-GL',
    name: 'Beibehaltungspraemie Oekologischer Landbau — Gruenland',
    description: 'Beibehaltungspraemie fuer oekologischen Landbau auf Gruenland. Typisch 200-260 EUR/ha (laenderabhaengig).',
    payment_rate: 230.0,
    payment_unit: 'EUR/ha (laenderabhaengig, Spanne 200-260 EUR/ha)',
    eligible_land_types: 'Dauergruenland, oekologisch zertifiziert',
    requirements: 'Gueltige EU-Bio-Zertifizierung. Zugelassene Kontrollstelle. 5 Jahre Verpflichtung.',
    duration_years: 5,
    stacking_rules: 'Kumulierbar mit EGS, AGZ.',
    jurisdiction: 'DE',
  },

  // ────────────────────────────────────────
  // AFP — Investitionsfoerderung
  // ────────────────────────────────────────
  {
    id: 'afp-stallbau',
    scheme_id: 'afp',
    code: 'AFP-STALL',
    name: 'AFP — Stallbau und Stallmodernisierung',
    description: 'Investitionsfoerderung fuer Stallneubauten und -modernisierungen. Zuschuss 20-40% der foerderfaehigen Kosten (laenderabhaengig). Tierwohl-Bonus: bis +10%. Junglandwirte-Bonus: bis +10%. Foerderhoechstbetrag typisch 1,5-2 Mio EUR je Betrieb und Foerderzeitraum.',
    payment_rate: 0.0,
    payment_unit: 'EUR (20-40% Zuschuss der foerderfaehigen Kosten)',
    eligible_land_types: 'nicht flaechengebunden',
    requirements: 'Landwirtschaftlicher Unternehmer. Betriebswirtschaftliches Konzept. Baugenehmigung. Mindestinvestition (laenderabhaengig, oft 20.000 EUR).',
    duration_years: 1,
    stacking_rules: 'Nicht mit anderen ELER-Investitionsfoerderungen fuer dasselbe Vorhaben kumulierbar. AFP-Bonus kumulierbar.',
    jurisdiction: 'DE',
  },

  // ────────────────────────────────────────
  // InVeKoS-Kalender — Termine
  // ────────────────────────────────────────
  {
    id: 'invekos-sammelantrag',
    scheme_id: 'invekos-kalender',
    code: 'INV-SA',
    name: 'InVeKoS Sammelantrag (Flaechenantrag)',
    description: 'Der Sammelantrag ist der zentrale Antrag fuer alle flaechenbezogenen GAP-Zahlungen (EGS, Umverteilung, JLP, Oeko-Regelungen, AGZ, AUKM). Elektronische Einreichung ueber das Antragsportal des jeweiligen Bundeslandes. Frist: 15. Mai. Aenderungen ohne Sanktion bis 31. Mai. Verspaetete Einreichung: 1% Kuerzung pro Arbeitstag (max. 25 Kalendertage nach Fristende).',
    payment_rate: 0.0,
    payment_unit: 'Frist/Termin',
    eligible_land_types: 'alle beihilfefaehigen Flaechen',
    requirements: 'Elektronische Einreichung. Digitale Flaechenidentifizierung. Betriebsnummer.',
    duration_years: 1,
    stacking_rules: 'Zentraler Antrag fuer alle 1.-Saule-Zahlungen und viele 2.-Saule-Massnahmen.',
    jurisdiction: 'DE',
  },
  {
    id: 'invekos-vorabzahlung',
    scheme_id: 'invekos-kalender',
    code: 'INV-VZ',
    name: 'Vorabzahlung (Vorschuss) Direktzahlungen',
    description: 'Vorschuss auf die Direktzahlungen ab 16. Oktober (bis 75% des geschaetzten Betrages). Der genaue Auszahlungstermin variiert nach Bundesland. Bedingung: Verwaltungs- und Vor-Ort-Kontrollen muessen abgeschlossen sein. Restzahlung ab 1. Dezember.',
    payment_rate: 0.0,
    payment_unit: 'Auszahlungstermin',
    eligible_land_types: 'alle beihilfefaehigen Flaechen',
    requirements: 'Sammelantrag bewilligt. Kontrollen abgeschlossen.',
    duration_years: 1,
    stacking_rules: 'Gilt fuer EGS, Umverteilung, JLP, Oeko-Regelungen, gekoppelte Stuetzung.',
    jurisdiction: 'DE',
  },
  {
    id: 'invekos-restzahlung',
    scheme_id: 'invekos-kalender',
    code: 'INV-RZ',
    name: 'Restzahlung Direktzahlungen',
    description: 'Restzahlung der Direktzahlungen ab 1. Dezember bis spaetestens 30. Juni des Folgejahres. Abzug der bereits geleisteten Vorabzahlung. Endgueltige Berechnung nach Abschluss aller Kontrollen und Kuerzungsverfahren. Konditionalitaetsverstoesse werden hier verrechnet.',
    payment_rate: 0.0,
    payment_unit: 'Auszahlungstermin',
    eligible_land_types: 'alle beihilfefaehigen Flaechen',
    requirements: 'Alle Kontrollen abgeschlossen. Kuerzungen verrechnet.',
    duration_years: 1,
    stacking_rules: 'Gilt fuer alle Direktzahlungen der 1. Saule.',
    jurisdiction: 'DE',
  },
];

const insertOption = db.instance.prepare(
  `INSERT INTO scheme_options (id, scheme_id, code, name, description, payment_rate, payment_unit, eligible_land_types, requirements, duration_years, stacking_rules, jurisdiction)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
);

for (const o of schemeOptions) {
  insertOption.run(o.id, o.scheme_id, o.code, o.name, o.description, o.payment_rate, o.payment_unit, o.eligible_land_types, o.requirements, o.duration_years, o.stacking_rules, o.jurisdiction);
}
console.log(`Inserted ${schemeOptions.length} scheme options.`);

// ──────────────────────────────────────────
// 3. Cross-compliance (Konditionalitaet)
// ──────────────────────────────────────────

const crossCompliance = [
  // ────────────────────────────────────────
  // GLOZ (Guter landwirtschaftlicher und oekologischer Zustand)
  // ────────────────────────────────────────
  {
    id: 'gloz-1',
    requirement: 'Erhaltung von Dauergruenland — Gesamtverhaeltnis',
    category: 'GLOZ',
    reference: 'GLOZ 1',
    description: 'Anteil des Dauergruenlandes an der gesamten landwirtschaftlichen Flaeche darf national nicht um mehr als 5% gegenueber dem Referenzjahr sinken. Bei Ueberschreitung: individuelle Pflicht zur Rueckumwandlung in Dauergruenland. Genehmigungspflicht fuer Umbruch von Dauergruenland in einigen Bundeslaendern. Kontrolle auf nationaler und regionaler Ebene.',
    applies_to: 'Alle Betriebe mit Dauergruenland',
    jurisdiction: 'DE',
  },
  {
    id: 'gloz-2',
    requirement: 'Schutz von Feuchtgebieten und Mooren',
    category: 'GLOZ',
    reference: 'GLOZ 2',
    description: 'Schutz von kohlenstoffreichen Boeden, insbesondere Feuchtgebieten und Mooren. Keine Entwaesserung oder Umwandlung. Verbot der Neuanlage von Draenagen in Moorboeden. Schrittweise Umsetzung in Deutschland (ab 2024 vollstaendig). Die Kulisse wird laenderspezifisch festgelegt. Betrifft organische Boeden mit mindestens 7,5% organischer Substanz.',
    applies_to: 'Betriebe mit Flaechen auf organischen Boeden, Feuchtgebieten oder Mooren',
    jurisdiction: 'DE',
  },
  {
    id: 'gloz-3',
    requirement: 'Verbot des Abbrennens von Stoppelfeldern',
    category: 'GLOZ',
    reference: 'GLOZ 3',
    description: 'Verbot des Abbrennens von Ackerstoppeln auf Ackerflaechen. Ausnahmen nur aus phytosanitaeren Gruenden mit Genehmigung der zustaendigen Behoerde. In Deutschland traditionell kaum praktiziert, aber explizit verboten. Verstoesse: 1-3% Kuerzung der Direktzahlungen.',
    applies_to: 'Alle Ackerbaubetriebe',
    jurisdiction: 'DE',
  },
  {
    id: 'gloz-4',
    requirement: 'Pufferstreifen entlang von Gewaessern',
    category: 'GLOZ',
    reference: 'GLOZ 4',
    description: 'Mindestens 3 Meter breite Pufferstreifen entlang von Gewaessern (Fliessgewaesser und stehende Gewaesser). Kein Einsatz von Pflanzenschutzmitteln und Duengemitteln im Pufferstreifen. Einige Bundeslaender schreiben breitere Streifen vor (z.B. Baden-Wuerttemberg: 5 m). Gewaesserrandstreifen nach WHG §38 gehen teilweise darueber hinaus.',
    applies_to: 'Alle Flaechen mit angrenzenden Gewaessern',
    jurisdiction: 'DE',
  },
  {
    id: 'gloz-5',
    requirement: 'Mindestbodenbedeckung zur Vermeidung von Erosion',
    category: 'GLOZ',
    reference: 'GLOZ 5',
    description: 'Mindestbodenbedeckung in den erosionsgefaehrdeten Zeitraeumen. Auf Ackerland: Bodenbedeckung vom 15. November bis 15. Januar (Zwischenfruechte, Mulch, Erntereste). Auf Dauerkulturen: Begruenung der Fahrgassen. Erosionsschutzklassen CCWasser und CCWind je Feldblock (vom Bundesland festgelegt). Bei CCWasser1/CCWind1: kein Pfluegen zwischen 1.12. und 15.2., bei CCWasser2: Pfluegen verboten ab Ernte bis 15.2.',
    applies_to: 'Alle Ackerflaechen und Dauerkulturen, insbesondere erosionsgefaehrdete Standorte',
    jurisdiction: 'DE',
  },
  {
    id: 'gloz-6',
    requirement: 'Mindestbodenbedeckung in sensiblen Zeitraeumen',
    category: 'GLOZ',
    reference: 'GLOZ 6',
    description: 'Mindestbodenbedeckung zum Schutz des Bodens waehrend empfindlicher Perioden. Auf Ackerland nach der Ernte der Hauptkultur: Begruenung (Zwischenfruechte, Untersaaten), Belassen von Ernteresten (Stoppeln), Mulchsaat. Verbindung mit GLOZ 5. Gilt laenderuebergreifend, Details in den Landesverordnungen.',
    applies_to: 'Alle Ackerbaubetriebe',
    jurisdiction: 'DE',
  },
  {
    id: 'gloz-7',
    requirement: 'Fruchtwechsel auf Ackerland',
    category: 'GLOZ',
    reference: 'GLOZ 7',
    description: 'Pflicht zum Fruchtwechsel auf Ackerland. Auf jedem Schlag muss im Vergleich zum Vorjahr ein Wechsel der Hauptkultur stattfinden (oder Anbau einer Zwischenfrucht/Untersaat). Ausnahmen: Betriebe mit weniger als 10 ha Ackerland, Betriebe mit mehr als 75% Dauergruenland, Betriebe mit mehr als 75% Leguminosen oder Ackerfutter. In Deutschland teilweise ausgesetzt in 2023, vollstaendig ab 2024.',
    applies_to: 'Betriebe mit mehr als 10 ha Ackerland',
    jurisdiction: 'DE',
  },
  {
    id: 'gloz-8',
    requirement: 'Mindestanteil nichtproduktiver Flaechen und Landschaftselemente',
    category: 'GLOZ',
    reference: 'GLOZ 8',
    description: 'Mindestens 4% der Ackerflaeche als nichtproduktive Flaechen oder Landschaftselemente: Brache, Hecken, Feldgehoelze, Einzelbaeume, Soelle, Steinruecken, Trockenmauern. Alternative: 7% einschliesslich Zwischenfruechte und stickstoffbindende Pflanzen (davon mindestens 3% nichtproduktiv). Ausnahmen: Betriebe unter 10 ha Ackerland, oekologisch wirtschaftende Betriebe. Teilweise Aussetzung in Krisenjahren (z.B. 2023 wegen Ukraine-Krise).',
    applies_to: 'Betriebe mit mehr als 10 ha Ackerland (ausgenommen Bio-Betriebe)',
    jurisdiction: 'DE',
  },
  {
    id: 'gloz-9',
    requirement: 'Verbot des Umbrechens von Dauergruenland in Natura-2000-Gebieten',
    category: 'GLOZ',
    reference: 'GLOZ 9',
    description: 'Absolutes Umbruch- und Umwandlungsverbot fuer Dauergruenland in Natura-2000-Gebieten (FFH-Gebiete und Vogelschutzgebiete). Kein Pfluegen, keine Umnutzung, keine Entwaesserung. Gilt unabhaengig von der Groesse des Betriebes. Verstoesse: mindestens 5% Kuerzung der Direktzahlungen, bei Vorsatz bis zu 100%.',
    applies_to: 'Dauergruenland in Natura-2000-Gebieten',
    jurisdiction: 'DE',
  },

  // ────────────────────────────────────────
  // GAB (Grundanforderungen an die Betriebsfuehrung)
  // ────────────────────────────────────────
  {
    id: 'gab-1',
    requirement: 'Vogelschutzrichtlinie',
    category: 'GAB',
    reference: 'GAB 1 (Richtlinie 2009/147/EG)',
    description: 'Schutz wildlebender Vogelarten und ihrer Lebensraeume. Verbot der Zerstoerung von Nestern und Eiern. Verbot des absichtlichen Fangens und Toetens. Umsetzung in Deutschland ueber BNatSchG. Besonderer Schutz in SPA-Gebieten (Vogelschutzgebiete). Beruecksichtigung der Brutzeiten bei landwirtschaftlichen Arbeiten.',
    applies_to: 'Alle landwirtschaftlichen Flaechen',
    jurisdiction: 'DE',
  },
  {
    id: 'gab-2',
    requirement: 'FFH-Richtlinie (Fauna-Flora-Habitat)',
    category: 'GAB',
    reference: 'GAB 2 (Richtlinie 92/43/EWG)',
    description: 'Erhaltung natuerlicher Lebensraeume und wildlebender Tier- und Pflanzenarten. FFH-Vertraeglichkeitspruefung bei Projekten in oder nahe Natura-2000-Gebieten. Schutz von Anhang-IV-Arten (streng geschuetzt) auch ausserhalb von Schutzgebieten. Umsetzung ueber BNatSchG, Landesgesetze und Schutzgebietsverordnungen.',
    applies_to: 'Betriebe in oder nahe Natura-2000-Gebieten, Betriebe mit Vorkommen geschuetzter Arten',
    jurisdiction: 'DE',
  },
  {
    id: 'gab-3',
    requirement: 'Nitratrichtlinie',
    category: 'GAB',
    reference: 'GAB 3 (Richtlinie 91/676/EWG)',
    description: 'Schutz der Gewaesser vor Verunreinigung durch Nitrate aus landwirtschaftlichen Quellen. Umsetzung in Deutschland ueber die Duengeverordnung (DueV). Obergrenze 170 kg N/ha organisch. Sperrfristen: Ackerland 01.10.-31.01. (Rote Gebiete ab 01.10., Gruenland ab 01.11.). In Roten Gebieten: 20% unter Bedarf, 9 Monate Lagerkapazitaet. Duengebedarfsermittlung verpflichtend.',
    applies_to: 'Alle Betriebe, verschaerfte Anforderungen in Roten und Gelben Gebieten',
    jurisdiction: 'DE',
  },
  {
    id: 'gab-4',
    requirement: 'Schutz des Grundwassers',
    category: 'GAB',
    reference: 'GAB 4 (Richtlinie 2006/118/EG)',
    description: 'Verhinderung der Verschmutzung von Grundwasser durch gefaehrliche Stoffe. Verbot direkter Einleitungen in das Grundwasser. Besonderer Schutz in Wasserschutzgebieten (Trinkwassergewinnung). Auflagen bei Lagerung und Ausbringung von Pflanzenschutzmitteln und Duengemitteln in der Naehe von Brunnen und Quellen.',
    applies_to: 'Alle Betriebe, verschaerfte Auflagen in Wasserschutzgebieten',
    jurisdiction: 'DE',
  },
  {
    id: 'gab-5',
    requirement: 'Wasserrahmenrichtlinie',
    category: 'GAB',
    reference: 'GAB 5 (Richtlinie 2000/60/EG)',
    description: 'Erreichung und Erhaltung des guten oekologischen und chemischen Zustands der Gewaesser. Einhaltung der Bewirtschaftungsplaene der Flussgebietseinheiten. Gewaesserrandstreifen nach WHG §38 (5 m, in einigen Laendern mehr). Beschraenkungen fuer Duengung und Pflanzenschutz in Naehe von Oberflaechen- und Grundwasserkoerpern.',
    applies_to: 'Alle landwirtschaftlichen Betriebe',
    jurisdiction: 'DE',
  },
  {
    id: 'gab-6',
    requirement: 'Nachhaltige Verwendung von Pflanzenschutzmitteln',
    category: 'GAB',
    reference: 'GAB 6 (Richtlinie 2009/128/EG)',
    description: 'Nachhaltige Verwendung von Pflanzenschutzmitteln. Sachkundenachweis (Pflanzenschutz-Sachkundeausweis) verpflichtend fuer alle Anwender. Fortbildungspflicht alle 3 Jahre. Geraetepruefung alle 3 Jahre (Pruefplakette). Integrierter Pflanzenschutz (IPS) als Grundsatz. Dokumentationspflicht jeder Anwendung. Abstandsauflagen (NW-Auflagen) zu Gewaessern.',
    applies_to: 'Alle Anwender von Pflanzenschutzmitteln',
    jurisdiction: 'DE',
  },
  {
    id: 'gab-7',
    requirement: 'Lebensmittelsicherheit und Rueckverfolgbarkeit',
    category: 'GAB',
    reference: 'GAB 7 (Verordnung (EG) 178/2002)',
    description: 'Lebensmittelsicherheit und Rueckverfolgbarkeit auf Stufe der Primaerproduktion. Dokumentation von Zukauf und Abgabe. Meldepflicht bei Verdacht auf gesundheitsschaedliche Produkte. Einhaltung von Wartezeiten nach Pflanzenschutzmittel- und Tierarzneimittelanwendung. Umsetzung ueber LFGB und VO (EG) 852/2004.',
    applies_to: 'Alle landwirtschaftlichen Erzeuger',
    jurisdiction: 'DE',
  },
  {
    id: 'gab-8',
    requirement: 'Verbot von Hormonen und Wachstumsfoerderern',
    category: 'GAB',
    reference: 'GAB 8 (Richtlinie 96/22/EG)',
    description: 'Verbot der Verwendung von Hormonen, beta-Agonisten und anabolen Substanzen in der Tierhaltung. Kontrolle durch amtliche Veterinaeruntersuchungen. Probenahmen im Rahmen des Nationalen Rueckstandskontrollplans (NRKP). Verstoesse: strafrechtliche Konsequenzen und Kuerzung der Direktzahlungen.',
    applies_to: 'Alle Tierhalter',
    jurisdiction: 'DE',
  },
  {
    id: 'gab-9',
    requirement: 'Kennzeichnung und Registrierung von Tieren',
    category: 'GAB',
    reference: 'GAB 9 (Verordnungen (EG) 1760/2000, 21/2004)',
    description: 'Pflicht zur Kennzeichnung und Registrierung von Rindern, Schafen und Ziegen. Rinder: Ohrmarken, Rinderpass, Meldung an HI-Tier innerhalb 7 Tagen. Schafe/Ziegen: elektronische Ohrmarke, Bestandsregister, Meldung an HI-Tier. Schweine: Bestandsregister, Ohrmarke (national). Kontrolle durch Veterinaeramt und HI-Tier-Datenbank.',
    applies_to: 'Alle Halter von Rindern, Schafen, Ziegen und Schweinen',
    jurisdiction: 'DE',
  },
  {
    id: 'gab-10',
    requirement: 'Tierschutz (Nutztierhaltung)',
    category: 'GAB',
    reference: 'GAB 10 (Richtlinien 98/58/EG, 2008/119/EG, 2008/120/EG)',
    description: 'Mindestanforderungen an den Schutz landwirtschaftlicher Nutztiere. Umsetzung ueber TierSchG und TierSchNutztV. Platzangebot, Licht, Lueftung, Futter und Wasser. Besondere Vorschriften: Kaelber (Gruppenhaltung ab 8 Wochen), Schweine (Gruppenhaltung Sauen ab 2029, Beschaeftigungsmaterial, Kastration nur mit Betaeubung), Legehennen (Mindestkaefigroesse, Kleingruppenkaefige auslaufend). Tierhaltungskennzeichnung (5 Stufen, ab 2024 fuer Schweinefleisch).',
    applies_to: 'Alle Tierhalter',
    jurisdiction: 'DE',
  },
  {
    id: 'gab-11',
    requirement: 'Tiergesundheit (Tierseuchenrecht)',
    category: 'GAB',
    reference: 'GAB 11 (Verordnung (EU) 2016/429)',
    description: 'Praevention und Bekaempfung uebertragbarer Tierkrankheiten. Meldepflicht fuer anzeigepflichtige Tierseuchen (z.B. MKS, ASP, Aviare Influenza). Biosicherheitsmassnahmen. Impfpflichten (BHV1-Sanierung, BVD-Bekaempfung ueber Ohrstanzen). ASP-Praevention: Wildschweinbarrieren, Biosicherheit Schweinehaltung (SchwHaltHygV). Kontrolle durch Veterinaeramt und Tierseuchenkasse.',
    applies_to: 'Alle Tierhalter',
    jurisdiction: 'DE',
  },

  // ────────────────────────────────────────
  // Sanktionen und Kontrollen
  // ────────────────────────────────────────
  {
    id: 'sanktionen-konditionalitaet',
    requirement: 'Sanktionsregelung bei Verstoessen gegen die Konditionalitaet',
    category: 'Sanktion',
    reference: 'Art. 84-86 Verordnung (EU) 2021/2116',
    description: 'Bei Verstoessen gegen GLOZ oder GAB werden die GAP-Direktzahlungen gekuerzt. Fahrlassigkeit: 1-3% Kuerzung (Regelfall 3%). Wiederholter Verstoss: Verdreifachung (max. 10%). Vorsatz: 15-100% Kuerzung. Die Kuerzung wird auf die Summe aller Direktzahlungen angewandt (EGS + Umverteilung + JLP + Oeko-Regelungen + gekoppelte Stuetzung). Vor-Ort-Kontrollen bei 1-5% der Betriebe jaehrlich. Fernerkundung (Satellitenkontrolle) flaechendeckend.',
    applies_to: 'Alle Empfaenger von GAP-Direktzahlungen',
    jurisdiction: 'DE',
  },
  {
    id: 'kontrollen-invekos',
    requirement: 'Kontrollsystem und Pruefverfahren',
    category: 'Kontrolle',
    reference: 'InVeKoS-Kontrollsystem Deutschland',
    description: 'Mehrstufiges Kontrollsystem: (1) Verwaltungskontrolle aller Antraege (100%), (2) Vor-Ort-Kontrollen bei 1-5% der Betriebe (risikobasierte Stichprobe), (3) Flaechen-Monitoring-System (Satellitenkontrolle) fuer flaechenbezogene Massnahmen, (4) Cross-Check mit HI-Tier (Tierbestandsdaten), (5) Abgleich mit anderen Datenbanken (Duengebehoerde, Pflanzenschutzmittelhandel). Kontrollen von Mai bis Oktober. Ergebnisse werden in InVeKoS dokumentiert.',
    applies_to: 'Alle GAP-Antragsteller',
    jurisdiction: 'DE',
  },
  {
    id: 'widerspruch-sanktionen',
    requirement: 'Rechtsbehelfe gegen Sanktionen',
    category: 'Verfahren',
    reference: 'VwGO, VwVfG',
    description: 'Bei Kuerzungen oder Ablehnungen von GAP-Zahlungen stehen folgende Rechtsbehelfe zur Verfuegung: (1) Widerspruch bei der zustaendigen Behoerde (Zahlstelle) innerhalb eines Monats nach Zustellung des Bescheides. (2) Klage beim Verwaltungsgericht innerhalb eines Monats nach Widerspruchsbescheid. (3) Antrag auf einstweiligen Rechtsschutz bei Eilbeduerftigkeit. Kosten: Widerspruchsverfahren kostenfrei, Klageverfahren gerichtskostenpflichtig.',
    applies_to: 'Alle Antragsteller, die von Kuerzungen oder Ablehnungen betroffen sind',
    jurisdiction: 'DE',
  },
];

const insertCC = db.instance.prepare(
  `INSERT INTO cross_compliance (id, requirement, category, reference, description, applies_to, jurisdiction)
   VALUES (?, ?, ?, ?, ?, ?, ?)`
);

for (const cc of crossCompliance) {
  insertCC.run(cc.id, cc.requirement, cc.category, cc.reference, cc.description, cc.applies_to, cc.jurisdiction);
}
console.log(`Inserted ${crossCompliance.length} cross-compliance requirements.`);

// ──────────────────────────────────────────
// 4. FTS5 Search Index
// ──────────────────────────────────────────

const searchEntries = [
  // Scheme overviews
  {
    title: 'Einkommensgrundstuetzung EGS Basispraeemie',
    body: 'Einkommensgrundstuetzung EGS Basispraeemie Direktzahlung 156 EUR/ha. Konvergenz nationaler Durchschnitt. Sammelantrag InVeKoS April Mai. Aktiver Betriebsinhaber beihilfefaehige Flaechen. Konditionalitaet GLOZ GAB. Zahlstelle Vorschuss Oktober Restzahlung Dezember.',
    scheme_type: 'income-support',
    jurisdiction: 'DE',
  },
  {
    title: 'Umverteilungspraemie erste 60 Hektar',
    body: 'Umverteilungspraemie Zuschlag 69 EUR/ha fuer die ersten 60 Hektar. Kleine und mittlere Betriebe foerdern. Automatische Berechnung durch Zahlstelle. Kumulierbar mit EGS Junglandwirtepraemie Oeko-Regelungen. Sammelantrag InVeKoS.',
    scheme_type: 'income-support',
    jurisdiction: 'DE',
  },
  {
    title: 'Junglandwirtepraemie JLP Existenzgruendung',
    body: 'Junglandwirtepraemie JLP 134 EUR/ha bis 120 Hektar maximal 5 Jahre. Unter 41 Jahre erstmalige Niederlassung Betriebsinhaber. Berufliche Qualifikation landwirtschaftliche Ausbildung. Kumulierbar EGS Umverteilungspraemie Oeko-Regelungen.',
    scheme_type: 'income-support',
    jurisdiction: 'DE',
  },
  {
    title: 'Oeko-Regelungen OR1 bis OR7 Eco-Schemes',
    body: 'Oeko-Regelungen Eco-Schemes 7 Massnahmen OR1 bis OR7. OR1 nichtproduktive Flaechen Brache 1300 EUR/ha Bluehstreifen 150 EUR/ha. OR2 vielfaeltige Kulturen Leguminosen 45 EUR/ha. OR3 Agroforstsysteme 200 EUR/ha. OR4 extensives Dauergruenland 115 EUR/ha. OR5 Kennarten Gruenland 240-360 EUR/ha. OR6 Verzicht Pflanzenschutz 130 EUR/ha Ackerland. OR7 Praezisionslandwirtschaft Sensortechnik 45 EUR/ha. Freiwillig jaehrlich Sammelantrag.',
    scheme_type: 'agri-environment',
    jurisdiction: 'DE',
  },
  {
    title: 'Gekoppelte Stuetzung Mutterkuhpraemie Schaf Ziegen',
    body: 'Gekoppelte Stuetzung Mutterkuhpraemie 78 EUR/Tier Mutterkuh Fleischrasse Zweinutzung. Schaf- und Ziegenpraemie 34 EUR/Tier weibliche Zuchttiere. HI-Tier Meldung Stichtag. Weidehaltung Landschaftspflege Offenhaltung. Kumulierbar EGS Umverteilung Oeko-Regelungen.',
    scheme_type: 'coupled-support',
    jurisdiction: 'DE',
  },
  {
    title: 'Konditionalitaet GLOZ und GAB Uebersicht',
    body: 'Konditionalitaet Cross-Compliance GLOZ guter landwirtschaftlicher oekologischer Zustand GAB Grundanforderungen Betriebsfuehrung. GLOZ 1 Dauergruenland Verhaeltnis. GLOZ 2 Feuchtgebiete Moore. GLOZ 3 Stoppelbrennen verboten. GLOZ 4 Pufferstreifen Gewaesser. GLOZ 5 Erosionsschutz Bodenbedeckung. GLOZ 6 Mindestbodenbedeckung. GLOZ 7 Fruchtwechsel. GLOZ 8 nichtproduktive Flaechen 4%. GLOZ 9 Natura 2000 Dauergruenland. GAB 1-11 Vogelschutz FFH Nitrat Grundwasser Wasserrahmenrichtlinie Pflanzenschutz Lebensmittelsicherheit Hormone Tierkennzeichnung Tierschutz Tiergesundheit.',
    scheme_type: 'cross-compliance',
    jurisdiction: 'DE',
  },
  {
    title: 'Ausgleichszulage AGZ benachteiligte Gebiete Berggebiet',
    body: 'Ausgleichszulage AGZ benachteiligte Gebiete Berggebiete Mittelgebirge Alpenraum. Berggebiet 150-200 EUR/ha sonstige benachteiligte Gebiete 50-150 EUR/ha. ELER 2. Saule GAK. Laenderabhaengig degressiv gestaffelt. Natuerliche Standortnachteile Klima Boden Hangneigung. Kumulierbar EGS Oeko-Regelungen AUKM.',
    scheme_type: 'area-payment',
    jurisdiction: 'DE',
  },
  {
    title: 'AUKM Agrarumwelt- und Klimamassnahmen Laenderprogramme',
    body: 'AUKM Agrarumwelt Klimamassnahmen ELER 2. Saule GAK. Laenderprogramme FAKT Baden-Wuerttemberg KULAP Bayern HALM Hessen NiB-AUM Niedersachsen AUK Brandenburg. Bluehstreifen Gruenlandextensivierung Fruchtartendiversifizierung Herbizidverzicht Wiesenvoegel. 5 Jahre Verpflichtungszeitraum. 50-900 EUR/ha je Massnahme. FEADER EU Bund Laender Kofinanzierung.',
    scheme_type: 'agri-environment',
    jurisdiction: 'DE',
  },
  {
    title: 'Foerderung oekologischer Landbau Umstellung Beibehaltung',
    body: 'Oekologischer Landbau Foerderung Umstellung Beibehaltung. Umstellungspraemie Ackerland 350-520 EUR/ha Gruenland 250-350 EUR/ha Gemuese 500-900 EUR/ha Dauerkulturen 750-1300 EUR/ha. Beibehaltungspraemie Ackerland 230-300 EUR/ha Gruenland 200-260 EUR/ha. EU-Oeko-Verordnung 2018/848. Kontrollstelle Zertifizierung. 5 Jahre Verpflichtung. Ziel 30% Bio-Flaeche 2030.',
    scheme_type: 'agri-environment',
    jurisdiction: 'DE',
  },
  {
    title: 'AFP Agrarinvestitionsfoerderungsprogramm Stallbau',
    body: 'AFP Agrarinvestitionsfoerderung Stallbau Stallmodernisierung. 20-40% Zuschuss foerderfaehige Kosten. Tierwohl-Bonus +10%. Junglandwirte-Bonus +10%. GAK Gemeinschaftsaufgabe Agrarstruktur. Laenderabhaengig Antragsfenster Foerderhoechstbetrag 1,5-2 Mio EUR. Betriebswirtschaftliches Konzept Baugenehmigung.',
    scheme_type: 'investment',
    jurisdiction: 'DE',
  },
  {
    title: 'GAP-Strategieplan Deutschland 2023-2027',
    body: 'GAP-Strategieplan Deutschland 2023-2027 Gemeinsame Agrarpolitik. 1. Saule Direktzahlungen 4,9 Mrd EUR/Jahr: EGS Umverteilung Junglandwirte Oeko-Regelungen Gekoppelte Stuetzung. 2. Saule ELER 1,2 Mrd EUR/Jahr: AGZ AUKM Oekologischer Landbau AFP EIP-Agri LEADER. Gesamtbudget 30 Mrd EUR. 25% Direktzahlungen fuer Oeko-Regelungen reserviert. BMEL BLE Laender-Zahlstellen.',
    scheme_type: 'framework',
    jurisdiction: 'DE',
  },
  {
    title: 'InVeKoS Sammelantrag Termine Zahlungskalender',
    body: 'InVeKoS Integriertes Verwaltungs- und Kontrollsystem Sammelantrag Flaechenantrag. Antragsfrist 1. April bis 15. Mai. Aenderungen ohne Kuerzung bis 31. Mai. Verspaetete Einreichung 1% Kuerzung pro Arbeitstag. Vorabzahlung Vorschuss ab 16. Oktober bis 75%. Restzahlung ab 1. Dezember bis 30. Juni. Vor-Ort-Kontrollen Mai bis Oktober. Satellitenkontrolle Fernerkundung.',
    scheme_type: 'application-guidance',
    jurisdiction: 'DE',
  },
  {
    title: 'Sanktionen Konditionalitaet Kuerzungen Kontrollen',
    body: 'Sanktionen Konditionalitaet Kuerzung Direktzahlungen. Fahrlassigkeit 1-3% Kuerzung. Wiederholung Verdreifachung max 10%. Vorsatz 15-100% Kuerzung. Kontrolle Vor-Ort 1-5% risikobasiert. Fernerkundung Satellit flaechendeckend. Verwaltungskontrolle 100%. Widerspruch Zahlstelle 1 Monat Klage Verwaltungsgericht.',
    scheme_type: 'cross-compliance',
    jurisdiction: 'DE',
  },

  // Detailed eco-scheme entries
  {
    title: 'OR1 Nichtproduktive Flaechen Brache Bluehstreifen',
    body: 'Oeko-Regelung OR1 nichtproduktive Flaechen Ackerland ueber GLOZ 8 hinaus. Brache 1300 EUR/ha Bluehstreifen 150 EUR/ha. Mindestgroesse 0,1 ha Mindestbreite 5 m. Kein Pflanzenschutz keine Duengung. Biodiversitaet Insekten Bestaeubung.',
    scheme_type: 'agri-environment',
    jurisdiction: 'DE',
  },
  {
    title: 'OR4 OR5 Extensives Gruenland Kennarten',
    body: 'Oeko-Regelung OR4 extensives Dauergruenland Gesamtbetrieb 115 EUR/ha. Keine mineralische N-Duengung max 1,4 RGV/ha. OR5 ergebnisorientiert Kennarten Gruenland 4 Kennarten 240 EUR/ha 6 Kennarten 360 EUR/ha. Artenreichtum extensive Bewirtschaftung.',
    scheme_type: 'agri-environment',
    jurisdiction: 'DE',
  },
  {
    title: 'OR6 Verzicht Pflanzenschutzmittel nach Kultur',
    body: 'Oeko-Regelung OR6 Verzicht chemisch-synthetische Pflanzenschutzmittel. Ackerland 130 EUR/ha Dauergruenland 50 EUR/ha Leguminosen 100 EUR/ha Obstbau 300 EUR/ha Weinbau 500 EUR/ha Hopfen 400 EUR/ha. Biologischer mechanischer Pflanzenschutz erlaubt.',
    scheme_type: 'agri-environment',
    jurisdiction: 'DE',
  },
  {
    title: 'Rote Gebiete Nitratbelastung Duengeverordnung',
    body: 'Rote Gebiete nitratbelastet Duengeverordnung DueV verschaerfte Anforderungen. 20% unter Duengebedarf Stickstoff. Sperrfrist Ackerland ab 1. Oktober Gruenland ab 1. November. Lagerkapazitaet 9 Monate statt 6. Binnendifferenzierung AVV GeA. Pflanzenschutz Gewaesserrandstreifen 5 Meter.',
    scheme_type: 'cross-compliance',
    jurisdiction: 'DE',
  },
  {
    title: 'Antragstellung Sammelantrag Schritt fuer Schritt',
    body: 'Antragstellung Sammelantrag InVeKoS Schritt fuer Schritt. Elektronische Einreichung Antragsportal Bundesland. Betriebsnummer Registrierung Digitale Flaechenidentifizierung. Parzellen einzeichnen Kulturen angeben. Oeko-Regelungen auswaehlen. Tiere melden HI-Tier. Unterschrift einreichen Frist 15. Mai. Kontrolle Zahlstelle Bewilligung.',
    scheme_type: 'application-guidance',
    jurisdiction: 'DE',
  },
  {
    title: 'AUKM Laenderprogramme FAKT KULAP HALM NiB-AUM Detail',
    body: 'FAKT II Baden-Wuerttemberg Fruchtartendiversifizierung 70 EUR/ha Bluehflaechen 710 EUR/ha Herbizidverzicht 80 EUR/ha. KULAP Bayern Oeko-Landbau 350 EUR/ha Extensive Gruenlandnutzung 250 EUR/ha. HALM Hessen Oeko-Landbau 370 EUR/ha Vielfaeltige Fruchtfolge 90 EUR/ha. NiB-AUM Niedersachsen Bremen Bluehstreifen 900 EUR/ha Wiesenvoegel 350 EUR/ha.',
    scheme_type: 'agri-environment',
    jurisdiction: 'DE',
  },
  {
    title: 'Mutterkuhpraemie Detail Rassen Bedingungen',
    body: 'Mutterkuhpraemie 78 EUR/Tier. Mutterkuh weibliches Rind Kalb gesaeugt Fleischrasse Zweinutzung. Rassen Charolais Limousin Angus Hereford Fleckvieh Zweinutzung Braunvieh Gelbvieh. Mindestens 3 Mutterkuehe. HI-Tier Registrierung Ohrmarken. Kumulierbar EGS Umverteilung. Nicht fuer Milchkuehe.',
    scheme_type: 'coupled-support',
    jurisdiction: 'DE',
  },
  {
    title: 'Oekologischer Landbau Umstellungspraemie Bundeslaender',
    body: 'Umstellungspraemie oekologischer Landbau nach Bundesland. Bayern KULAP Ackerland 420 EUR/ha Gruenland 300 EUR/ha. Baden-Wuerttemberg FAKT 350 EUR/ha. Hessen HALM 370 EUR/ha. Niedersachsen 390 EUR/ha. Gemuese Dauerkulturen Sonderkulturen hoeherer Satz. EU-Oeko-Verordnung 2018/848 Kontrollstelle 5 Jahre.',
    scheme_type: 'agri-environment',
    jurisdiction: 'DE',
  },
];

const insertFts = db.instance.prepare(
  `INSERT INTO search_index (title, body, scheme_type, jurisdiction)
   VALUES (?, ?, ?, ?)`
);

for (const entry of searchEntries) {
  insertFts.run(entry.title, entry.body, entry.scheme_type, entry.jurisdiction);
}
console.log(`Inserted ${searchEntries.length} search index entries.`);

// ──────────────────────────────────────────
// 5. Metadata
// ──────────────────────────────────────────

const totalRows = schemes.length + schemeOptions.length + crossCompliance.length + searchEntries.length;

db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('last_ingest', ?)", [now]);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('build_date', ?)", [now]);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('scheme_count', ?)", [String(schemes.length)]);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('option_count', ?)", [String(schemeOptions.length)]);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('cross_compliance_count', ?)", [String(crossCompliance.length)]);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('search_index_count', ?)", [String(searchEntries.length)]);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('total_rows', ?)", [String(totalRows)]);

// ──────────────────────────────────────────
// 6. Coverage report
// ──────────────────────────────────────────

writeFileSync('data/coverage.json', JSON.stringify({
  mcp_name: 'Germany Farm Subsidies MCP',
  jurisdiction: 'DE',
  build_date: now,
  status: 'populated',
  schemes: schemes.length,
  scheme_options: schemeOptions.length,
  cross_compliance_requirements: crossCompliance.length,
  search_index_entries: searchEntries.length,
  total_rows: totalRows,
  data_sources: [
    'BLE (Bundesanstalt fuer Landwirtschaft und Ernaehrung)',
    'BMEL (Bundesministerium fuer Ernaehrung und Landwirtschaft)',
    'GAP-Strategieplan Deutschland 2023-2027',
    'InVeKoS (Integriertes Verwaltungs- und Kontrollsystem)',
    'Laender-Zahlstellen und Agrarbehoerden',
    'GAK-Rahmenplan (Gemeinschaftsaufgabe Agrarstruktur und Kuestenschutz)',
    'EU-Verordnungen 2021/2115, 2021/2116',
    'Deutscher Bauernverband / Landwirtschaftskammern',
    'Duengeverordnung (DueV) / Pflanzenschutzgesetz (PflSchG)',
  ],
}, null, 2));

db.close();

console.log('\nIngestion complete:');
console.log(`  ${schemes.length} schemes`);
console.log(`  ${schemeOptions.length} scheme options`);
console.log(`  ${crossCompliance.length} cross-compliance requirements`);
console.log(`  ${searchEntries.length} search index entries`);
console.log(`  ${totalRows} total rows`);
console.log(`  Build date: ${now}`);
