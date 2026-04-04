import { buildMeta } from '../metadata.js';
import { SUPPORTED_JURISDICTIONS } from '../jurisdiction.js';

export function handleAbout() {
  return {
    name: 'Germany Farm Subsidies MCP',
    description:
      'Deutsche GAP-Foerderprogramme -- Einkommensgrundstuetzung, Umverteilungspraemie, Junglandwirtepraemie, ' +
      'Oeko-Regelungen (OR1-OR7), Konditionalitaet (GLOZ/GAB), gekoppelte Stuetzung, AUKM, AGZ und AFP. ' +
      'Basierend auf dem GAP-Strategieplan Deutschland 2023-2027, BLE und BMEL-Veroeffentlichungen.',
    version: '0.1.0',
    jurisdiction: [...SUPPORTED_JURISDICTIONS],
    data_sources: [
      'GAP-Strategieplan Deutschland 2023-2027',
      'BLE (Bundesanstalt fuer Landwirtschaft und Ernaehrung)',
      'BMEL (Bundesministerium fuer Ernaehrung und Landwirtschaft)',
      'Laender-Agrarbehoerden und Zahlstellen',
    ],
    tools_count: 10,
    links: {
      homepage: 'https://ansvar.eu/open-agriculture',
      repository: 'https://github.com/ansvar-systems/de-farm-subsidies-mcp',
      mcp_network: 'https://ansvar.ai/mcp',
    },
    _meta: buildMeta(),
  };
}
