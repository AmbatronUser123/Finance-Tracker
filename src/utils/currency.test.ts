import { describe, it } from 'node:test';
import assert from 'node:assert';
import { formatRupiah, parseRupiah } from './currency.ts';

describe('Currency Utils', () => {
  it('formatRupiah formats correctly', () => {
    // Note: The space between Rp and the number is a non-breaking space (U+00A0)
    // We can use \u00A0 to represent it in the expected string
    assert.strictEqual(formatRupiah(10000), 'Rp\u00A010.000');
    assert.strictEqual(formatRupiah(0), 'Rp\u00A00');
    assert.strictEqual(formatRupiah(123456), 'Rp\u00A0123.456');
    assert.strictEqual(formatRupiah(1000000), 'Rp\u00A01.000.000');
  });

  it('parseRupiah parses correctly', () => {
    assert.strictEqual(parseRupiah('Rp 10.000'), 10000);
    assert.strictEqual(parseRupiah('Rp 123.456'), 123456);
    assert.strictEqual(parseRupiah('10.000'), 10000);
    assert.strictEqual(parseRupiah(''), 0);
    // parseRupiah implementation: replace(/[^\d,-]/g, '').replace(',', '.')
    // So 'Rp 10.000' -> '10000' (dots removed) -> parseFloat('10000') -> 10000
    // '10,50' -> '10,50' -> '10.50' -> 10.5
    assert.strictEqual(parseRupiah('10,50'), 10.5);
  });
});
