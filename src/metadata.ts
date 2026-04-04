export interface Meta {
  disclaimer: string;
  data_age: string;
  source_url: string;
  copyright: string;
  server: string;
  version: string;
}

const DISCLAIMER =
  'Diese Daten dienen ausschliesslich zu Informationszwecken. Sie stellen keine professionelle ' +
  'landwirtschaftliche, finanzielle oder rechtliche Beratung dar. Foerderprogramme, Praemiensaetze ' +
  'und Foerdervoraussetzungen aendern sich -- pruefen Sie stets die aktuellen Informationen von ' +
  'BLE, BMEL und den Laender-Agrarbehoerden, bevor Sie Antraege stellen oder Bewirtschaftungsentscheidungen ' +
  'treffen. Datenquellen: amtliche Veroeffentlichungen zum GAP-Strategieplan Deutschland 2023-2027.';

export function buildMeta(overrides?: Partial<Meta>): Meta {
  return {
    disclaimer: DISCLAIMER,
    data_age: overrides?.data_age ?? 'unknown',
    source_url: overrides?.source_url ?? 'https://www.bmel.de/DE/themen/landwirtschaft/eu-agrarpolitik-und-foerderung/gap/gap-strategieplan.html',
    copyright: 'Daten: Amtliche Veroeffentlichungen BMEL/BLE. Server: Apache-2.0 Ansvar Systems.',
    server: 'de-farm-subsidies-mcp',
    version: '0.1.0',
    ...overrides,
  };
}
