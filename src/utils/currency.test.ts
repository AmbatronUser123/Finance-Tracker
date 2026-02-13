import { test } from 'node:test';
import assert from 'node:assert';
import { formatRupiah } from './currency.ts';

test('formatRupiah formats number correctly', () => {
  const value = 1234567;
  // This matches the implementation in CategoryCard.tsx
  const expected = value.toLocaleString('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });

  const result = formatRupiah(value);
  assert.strictEqual(result, expected);
});

test('formatRupiah handles zero', () => {
  const value = 0;
  const expected = value.toLocaleString('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });

  const result = formatRupiah(value);
  assert.strictEqual(result, expected);
});
