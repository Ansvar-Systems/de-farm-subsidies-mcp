import { buildMeta } from '../metadata.js';
import type { Database } from '../db.js';

interface Source {
  name: string;
  authority: string;
  official_url: string;
  retrieval_method: string;
  update_frequency: string;
  license: string;
  coverage: string;
  last_retrieved?: string;
}

export function handleListSources(db: Database): { sources: Source[]; _meta: ReturnType<typeof buildMeta> } {
  const lastIngest = db.get<{ value: string }>('SELECT value FROM db_metadata WHERE key = ?', ['last_ingest']);

  const sources: Source[] = [
    {
      name: 'GAP-Strategieplan Deutschland 2023-2027',
      authority: 'BMEL (Bundesministerium fuer Ernaehrung und Landwirtschaft)',
      official_url: 'https://www.bmel.de/DE/themen/landwirtschaft/eu-agrarpolitik-und-foerderung/gap/gap-strategieplan.html',
      retrieval_method: 'PDF_EXTRACT',
      update_frequency: 'annual',
      license: 'Amtliche Veroeffentlichung',
      coverage: 'Direktzahlungen, Oeko-Regelungen, ELER-Massnahmen, Konditionalitaet, Zahlungsrahmen',
      last_retrieved: lastIngest?.value,
    },
    {
      name: 'BLE Foerderinformationen',
      authority: 'BLE (Bundesanstalt fuer Landwirtschaft und Ernaehrung)',
      official_url: 'https://www.ble.de/DE/Themen/Landwirtschaft/landwirtschaft_node.html',
      retrieval_method: 'HTML_SCRAPE',
      update_frequency: 'quarterly',
      license: 'Amtliche Veroeffentlichung',
      coverage: 'Bundesprogramme, InVeKoS-Antragstellung, Zahlungsverfahren, Kontrollsystem',
      last_retrieved: lastIngest?.value,
    },
    {
      name: 'GAK-Rahmenplan',
      authority: 'BMEL / Laender',
      official_url: 'https://www.bmel.de/DE/themen/laendliche-regionen/foerderung/gak/gak_node.html',
      retrieval_method: 'PDF_EXTRACT',
      update_frequency: 'annual',
      license: 'Amtliche Veroeffentlichung',
      coverage: 'AFP (Agrarinvestitionsfoerderung), AUKM, AGZ, Foerdersaetze nach Bundesland',
      last_retrieved: lastIngest?.value,
    },
    {
      name: 'Konditionalitaet (GLOZ/GAB)',
      authority: 'BMEL / BLE / Laender-Kontrollbehoerden',
      official_url: 'https://www.bmel.de/DE/themen/landwirtschaft/eu-agrarpolitik-und-foerderung/gap/konditionalitaet.html',
      retrieval_method: 'HTML_SCRAPE',
      update_frequency: 'annual',
      license: 'Amtliche Veroeffentlichung',
      coverage: 'GLOZ 1-9 Standards, GAB 1-11 Grundanforderungen, Sanktionssystem, Kontrollverfahren',
      last_retrieved: lastIngest?.value,
    },
  ];

  return {
    sources,
    _meta: buildMeta({ source_url: 'https://www.bmel.de/DE/themen/landwirtschaft/eu-agrarpolitik-und-foerderung/gap/gap-strategieplan.html' }),
  };
}
