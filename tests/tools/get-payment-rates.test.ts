import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { handleGetPaymentRates } from '../../src/tools/get-payment-rates.js';
import { createSeededDatabase } from '../helpers/seed-db.js';
import type { Database } from '../../src/db.js';
import { existsSync, unlinkSync } from 'fs';

const TEST_DB = 'tests/test-payment-rates.db';

describe('get_payment_rates tool', () => {
  let db: Database;

  beforeAll(() => {
    db = createSeededDatabase(TEST_DB);
  });

  afterAll(() => {
    db.close();
    if (existsSync(TEST_DB)) unlinkSync(TEST_DB);
  });

  test('returns all EGS payment rates', () => {
    const result = handleGetPaymentRates(db, { scheme_id: 'einkommensgrundstuetzung' });
    expect(result).toHaveProperty('options_count', 1);
    const options = (result as { options: { payment_rate: number }[] }).options;
    expect(options[0].payment_rate).toBe(156.00);
  });

  test('returns single option when option_id provided', () => {
    const result = handleGetPaymentRates(db, { scheme_id: 'einkommensgrundstuetzung', option_id: 'egs-basis' });
    expect(result).toHaveProperty('options_count', 1);
    const options = (result as { options: { payment_rate: number; payment_unit: string }[] }).options;
    expect(options[0].payment_rate).toBe(156.00);
    expect(options[0].payment_unit).toBe('EUR/ha');
  });

  test('returns not_found for unknown scheme', () => {
    const result = handleGetPaymentRates(db, { scheme_id: 'nonexistent' });
    expect(result).toHaveProperty('error', 'not_found');
  });

  test('returns not_found for unknown option in valid scheme', () => {
    const result = handleGetPaymentRates(db, { scheme_id: 'einkommensgrundstuetzung', option_id: 'egs-99' });
    expect(result).toHaveProperty('error', 'not_found');
  });
});
