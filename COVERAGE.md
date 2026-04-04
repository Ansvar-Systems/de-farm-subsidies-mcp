# Coverage

## What Is Included

- **Einkommensgrundstuetzung (EGS)** -- basic income support ~156 EUR/ha
- **Umverteilungspraemie** -- top-up for first 60 hectares ~69 EUR/ha
- **Junglandwirtepraemie** -- young farmer payment ~134 EUR/ha for up to 120 ha
- **Oeko-Regelungen (OR1-OR7)** -- eco-schemes with rates per measure
- **Gekoppelte Stuetzung** -- Mutterkuhpraemie (78 EUR/Tier), Schaf-/Ziegenpraemie (34 EUR/Tier)
- **Konditionalitaet** -- 9 GLOZ standards, 11 GAB requirements, sanctions regime
- **InVeKoS-Kalender** -- application deadlines, payment schedule
- **AGZ (Ausgleichszulage)** -- area payments for disadvantaged areas by zone type
- **AUKM** -- agri-environment measures by Bundesland (FAKT, KULAP, HALM, NiB-AUM)
- **Oekologischer Landbau** -- conversion and maintenance premiums by land use type
- **AFP** -- agricultural investment grants (20-40% subsidy)
- **GAP-Strategieplan** -- framework overview with budget figures

## Jurisdictions

| Code | Country | Status |
|------|---------|--------|
| DE | Germany | Supported |

## What Is NOT Included

- **Individual Bundesland AUKM programmes in full detail** -- only selected examples (BW, BY, HE, NI)
- **Historical CAP data** -- only GAP 2023-2027 period
- **Individual farm eligibility calculations** -- this is reference data, not an eligibility calculator
- **Actual application forms** -- links to InVeKoS portals provided in guidance
- **Detailed premium DB calculations** -- per-hectare convergence values are averages
- **LEADER programme details** -- regional development projects are locally managed
- **Beratungsfoerderung (advisory funding)** -- varies by Bundesland
- **EIP-Agri innovation partnerships** -- project-based, not systematically tracked

## Known Gaps

1. Payment rates change annually depending on budget and number of applicants -- check `check_data_freshness`
2. Bundesland-specific AUKM rates are representative examples, not exhaustive
3. Eco-scheme stacking rules between OR and 2nd pillar measures are complex and partially modelled
4. Rote Gebiete (nitrate-vulnerable zones) boundaries change with each designation cycle
5. FTS5 search quality varies with query phrasing -- use scheme codes (e.g. OR1, EGS) for precise results

## Data Freshness

Run `check_data_freshness` to see when data was last updated. The ingestion pipeline runs on a schedule; manual triggers available via `gh workflow run ingest.yml`.
