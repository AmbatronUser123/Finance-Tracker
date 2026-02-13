import { test, describe } from 'node:test';
import assert from 'node:assert';
import { parseRupiah } from './currency.ts';

describe('parseRupiah', () => {
  test('should parse basic Rupiah format', () => {
    assert.strictEqual(parseRupiah('Rp 1.000'), 1000);
    assert.strictEqual(parseRupiah('Rp 10.000'), 10000);
    assert.strictEqual(parseRupiah('Rp 1.000.000'), 1000000);
  });

  test('should handle decimal values with comma', () => {
    assert.strictEqual(parseRupiah('Rp 1.234,56'), 1234.56);
    assert.strictEqual(parseRupiah('1.234,50'), 1234.5);
    assert.strictEqual(parseRupiah('0,75'), 0.75);
  });

  test('should handle negative values', () => {
    assert.strictEqual(parseRupiah('-Rp 1.000'), -1000);
    assert.strictEqual(parseRupiah('Rp -1.000'), -1000);
    assert.strictEqual(parseRupiah('-1000'), -1000);
  });

  test('should return 0 for empty or null-ish strings', () => {
    assert.strictEqual(parseRupiah(''), 0);
    // @ts-ignore - testing runtime behavior for non-string input
    assert.strictEqual(parseRupiah(null), 0);
    // @ts-ignore
    assert.strictEqual(parseRupiah(undefined), 0);
  });

  test('should handle strings with mixed characters', () => {
    assert.strictEqual(parseRupiah('Amount is Rp 5.000'), 5000);
    assert.strictEqual(parseRupiah('5.000IDR'), 5000);
  });

  test('should return 0 for non-numeric strings', () => {
    assert.strictEqual(parseRupiah('abc'), 0);
    assert.strictEqual(parseRupiah('---'), 0);
  });

  test('should handle already parsed numbers as strings', () => {
    assert.strictEqual(parseRupiah('1000'), 1000);
    // Note: In Rupiah context, dot is often a thousands separator and is removed.
    // Comma is used for decimals.
    assert.strictEqual(parseRupiah('1000,50'), 1000.5);
  });
});
