
import { describe, it, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import { fetchSpendingTip } from './geminiService.ts';

describe('fetchSpendingTip', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    // Restore the original fetch implementation
    global.fetch = originalFetch;
    mock.reset();
  });

  const categoryName = 'Food';
  const budget = 500;
  const spent = 450;
  const fallback = `It looks like you're getting close to your budget for ${categoryName}. Try to review your recent expenses to see where you can save.`;

  it('should return a tip when API call is successful', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({ tip: 'Spend less on snacks!' }),
    };

    global.fetch = mock.fn(async () => mockResponse as any);

    const result = await fetchSpendingTip(categoryName, budget, spent);

    assert.strictEqual(result, 'Spend less on snacks!');
    assert.strictEqual((global.fetch as any).mock.callCount(), 1);
  });

  it('should return fallback message when API call fails (network error)', async () => {
    global.fetch = mock.fn(async () => {
      throw new Error('Network error');
    });

    const result = await fetchSpendingTip(categoryName, budget, spent);

    assert.strictEqual(result, fallback);
  });

  it('should return fallback message when API returns error status', async () => {
    const mockResponse = {
      ok: false,
      status: 500,
    };

    global.fetch = mock.fn(async () => mockResponse as any);

    const result = await fetchSpendingTip(categoryName, budget, spent);

    assert.strictEqual(result, fallback);
  });

  it('should return fallback message when API returns invalid JSON', async () => {
    const mockResponse = {
      ok: true,
      json: async () => {
        throw new Error('Invalid JSON');
      },
    };

    global.fetch = mock.fn(async () => mockResponse as any);

    const result = await fetchSpendingTip(categoryName, budget, spent);

    assert.strictEqual(result, fallback);
  });

  it('should return fallback message when API returns empty tip', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({ tip: '' }),
    };

    global.fetch = mock.fn(async () => mockResponse as any);

    const result = await fetchSpendingTip(categoryName, budget, spent);

    assert.strictEqual(result, fallback);
  });

  it('should return fallback message when API returns missing tip field', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({}),
    };

    global.fetch = mock.fn(async () => mockResponse as any);

    const result = await fetchSpendingTip(categoryName, budget, spent);

    assert.strictEqual(result, fallback);
  });
});
