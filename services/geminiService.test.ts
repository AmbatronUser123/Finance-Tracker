import { test, describe, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import { fetchSpendingTip } from './geminiService.ts';

describe('fetchSpendingTip', () => {
  let originalFetch: typeof global.fetch;
  let consoleErrorMock: any;

  beforeEach(() => {
    originalFetch = global.fetch;
    // Mock fetch to throw an error by default
    global.fetch = async () => {
      throw new Error('Network error');
    };

    // Spy on console.error
    consoleErrorMock = mock.method(console, 'error', () => {});
  });

  afterEach(() => {
    global.fetch = originalFetch;
    consoleErrorMock.mock.restore();
  });

  test('should log error when fetch fails', async () => {
    const result = await fetchSpendingTip('Food', 1000, 500);

    // Check fallback message
    assert.match(result, /It looks like you're getting close to your budget/);

    // Check if console.error was called
    // This assertion should fail initially because the current implementation does not log errors
    assert.strictEqual(consoleErrorMock.mock.callCount(), 1, 'Expected console.error to be called once');

    const callArgs = consoleErrorMock.mock.calls[0].arguments;
    assert.strictEqual(callArgs[0], 'Failed to fetch spending tip:');
    assert.strictEqual(callArgs[1].message, 'Network error');
  });
});
