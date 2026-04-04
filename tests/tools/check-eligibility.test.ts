import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { handleCheckEligibility } from '../../src/tools/check-eligibility.js';
import { createSeededDatabase } from '../helpers/seed-db.js';
import type { Database } from '../../src/db.js';
import { existsSync, unlinkSync } from 'fs';

const TEST_DB = 'tests/test-eligibility.db';

describe('check_eligibility tool', () => {
  let db: Database;

  beforeAll(() => {
    db = createSeededDatabase(TEST_DB);
  });

  afterAll(() => {
    db.close();
    if (existsSync(TEST_DB)) unlinkSync(TEST_DB);
  });

  test('finds options for Ackerland', () => {
    const result = handleCheckEligibility(db, { land_type: 'Ackerland' });
    expect(result).toHaveProperty('matches_count');
    expect((result as { matches_count: number }).matches_count).toBeGreaterThan(0);
  });

  test('finds options matching Gruenland', () => {
    const result = handleCheckEligibility(db, { land_type: 'Dauergruenland' });
    expect((result as { matches_count: number }).matches_count).toBeGreaterThan(0);
  });

  test('returns empty for non-matching criteria', () => {
    const result = handleCheckEligibility(db, { land_type: 'Wueste' });
    expect((result as { matches_count: number }).matches_count).toBe(0);
  });

  test('rejects unsupported jurisdiction', () => {
    const result = handleCheckEligibility(db, { land_type: 'Ackerland', jurisdiction: 'FR' });
    expect(result).toHaveProperty('error', 'jurisdiction_not_supported');
  });

  test('returns all options when no filters given', () => {
    const result = handleCheckEligibility(db, {});
    expect((result as { matches_count: number }).matches_count).toBe(3);
  });
});
