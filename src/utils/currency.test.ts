import { describe, it } from 'node:test';
import assert from 'node:assert';
import { formatRupiah, parseRupiah } from './currency.ts';

describe('formatRupiah', () => {
  it('should format positive integers correctly', () => {
    const result = formatRupiah(10000);
    // Expecting non-breaking space (U+00A0)
    assert.strictEqual(result, 'Rp\u00A010.000');
  });

  it('should format zero correctly', () => {
    const result = formatRupiah(0);
    assert.strictEqual(result, 'Rp\u00A00');
  });

  it('should format negative numbers correctly', () => {
    const result = formatRupiah(-5000);
    assert.strictEqual(result, '-Rp\u00A05.000');
  });

  it('should format large numbers correctly', () => {
    const result = formatRupiah(1000000);
    assert.strictEqual(result, 'Rp\u00A01.000.000');
  });

  it('should handle decimals by rounding', () => {
    const result = formatRupiah(10000.5);
    // 10000.5 -> Rp 10.001
    assert.strictEqual(result, 'Rp\u00A010.001');
  });
});

describe('parseRupiah', () => {
  it('should parse formatted string back to number', () => {
    const result = parseRupiah('Rp 10.000');
    assert.strictEqual(result, 10000);
  });

  it('should parse string with non-breaking space', () => {
    const result = parseRupiah('Rp\u00A010.000');
    assert.strictEqual(result, 10000);
  });

  it('should return 0 for empty input', () => {
    assert.strictEqual(parseRupiah(''), 0);
  });

  it('should handle decimals with comma (Indonesian format)', () => {
    // Current implementation: replaces ',' with '.'
    const result = parseRupiah('10.000,50');
    // 10.000,50 -> remove dots -> 10000,50 -> replace comma with dot -> 10000.50
    assert.strictEqual(result, 10000.5);
  });

  it('should handle negative string', () => {
    const result = parseRupiah('-Rp 5.000');
    assert.strictEqual(result, -5000);
  });
});
