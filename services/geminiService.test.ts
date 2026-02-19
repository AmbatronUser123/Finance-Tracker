import { test, describe, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import { fetchSpendingTip } from './geminiService.ts';

describe('fetchSpendingTip', () => {
  let originalFetch: typeof global.fetch;
  let consoleErrorMock: ReturnType<typeof mock.method>;

  beforeEach(() => {
    // Store original fetch
    originalFetch = global.fetch;

    // Mock fetch to throw
    global.fetch = mock.fn(async () => {
      throw new Error('Network error');
    }) as unknown as typeof global.fetch;

    // Mock console.error
    consoleErrorMock = mock.method(console, 'error', () => {});
  });

  afterEach(() => {
    // Restore original fetch
    global.fetch = originalFetch;

    // Restore console.error
    consoleErrorMock.mock.restore();
  });

  test('should return fallback and log error when fetch throws', async () => {
    const result = await fetchSpendingTip('Food', 1000, 500);

    // Verify fallback message
    assert.match(result, /It looks like you're getting close to your budget/);

    // Verify console.error was called
    assert.strictEqual(consoleErrorMock.mock.calls.length, 1, 'console.error should be called once');

    const callArgs = consoleErrorMock.mock.calls[0].arguments;
    assert.strictEqual(callArgs[0], 'Failed to fetch spending tip:', 'Error message prefix should match');
    assert.ok(callArgs[1] instanceof Error, 'Second argument should be an Error object');
    assert.strictEqual(callArgs[1].message, 'Network error', 'Error message should match');
  });
});
