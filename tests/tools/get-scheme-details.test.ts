import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { handleGetSchemeDetails } from '../../src/tools/get-scheme-details.js';
import { createSeededDatabase } from '../helpers/seed-db.js';
import type { Database } from '../../src/db.js';
import { existsSync, unlinkSync } from 'fs';

const TEST_DB = 'tests/test-scheme-details.db';

describe('get_scheme_details tool', () => {
  let db: Database;

  beforeAll(() => {
    db = createSeededDatabase(TEST_DB);
  });

  afterAll(() => {
    db.close();
    if (existsSync(TEST_DB)) unlinkSync(TEST_DB);
  });

  test('returns EGS scheme with options', () => {
    const result = handleGetSchemeDetails(db, { scheme_id: 'einkommensgrundstuetzung' });
    expect(result).toHaveProperty('name', 'Einkommensgrundstuetzung (EGS)');
    expect(result).toHaveProperty('scheme_type', 'income-support');
    expect((result as { options_count: number }).options_count).toBe(1);
    expect(result).toHaveProperty('_meta');
  });

  test('returns not_found for unknown scheme', () => {
    const result = handleGetSchemeDetails(db, { scheme_id: 'nonexistent-scheme' });
    expect(result).toHaveProperty('error', 'not_found');
  });

  test('rejects unsupported jurisdiction', () => {
    const result = handleGetSchemeDetails(db, { scheme_id: 'einkommensgrundstuetzung', jurisdiction: 'FR' });
    expect(result).toHaveProperty('error', 'jurisdiction_not_supported');
  });

  test('returns oeko-regelungen scheme', () => {
    const result = handleGetSchemeDetails(db, { scheme_id: 'oeko-regelungen' });
    expect(result).toHaveProperty('name', 'Oeko-Regelungen (Eco-Schemes)');
    expect((result as { options_count: number }).options_count).toBe(2);
  });
});
