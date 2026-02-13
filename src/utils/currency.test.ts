import { test } from 'node:test';
import assert from 'node:assert';
import { formatRupiah, parseRupiah } from './currency.ts';

test('formatRupiah formats correctly', () => {
  // Check that the formatted string starts with 'Rp' and ends with '10.000'
  const result = formatRupiah(10000);
  assert.ok(result.startsWith('Rp'));
  assert.ok(result.endsWith('10.000'));

  // Also check for 0
  const zeroResult = formatRupiah(0);
  assert.ok(zeroResult.startsWith('Rp'));
  assert.ok(zeroResult.endsWith('0'));
});

test('parseRupiah parses correctly', () => {
    // 10000
    assert.strictEqual(parseRupiah('Rp 10.000'), 10000);
    assert.strictEqual(parseRupiah('Rp10.000'), 10000);
    assert.strictEqual(parseRupiah('10.000'), 10000);

    // 0
    assert.strictEqual(parseRupiah('0'), 0);
    assert.strictEqual(parseRupiah('Rp 0'), 0);
});
