const { test, describe, afterEach, mock } = require('node:test');
const assert = require('node:assert');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

// Helper to load the handler in a sandbox
function loadHandler(mockGoogleGenAI, envOverride = {}) {
  const filePath = path.join(__dirname, 'spending-tip.js');
  const code = fs.readFileSync(filePath, 'utf8');

  const sandbox = {
    require: (name) => {
      if (name === '@google/genai') {
        return { GoogleGenAI: mockGoogleGenAI };
      }
      throw new Error(`Unexpected require: ${name}`);
    },
    process: {
      env: { ...process.env, ...envOverride },
    },
    module: {},
    console: console, // Allow logging
  };

  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);
  return sandbox.module.exports;
}

// Mock Response Helper
function createMockRes() {
  const res = {
    statusCode: 200,
    headers: {},
    body: '',
    setHeader(key, value) {
      this.headers[key] = value;
    },
    end(data) {
      this.body = data;
    },
  };
  return res;
}

describe('spending-tip API handler', () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
    mock.restoreAll();
  });

  test('returns 405 if method is not POST', async () => {
    const handler = loadHandler(class Mock {});
    const req = { method: 'GET' };
    const res = createMockRes();

    await handler(req, res);

    assert.strictEqual(res.statusCode, 405);
    const body = JSON.parse(res.body);
    assert.strictEqual(body.error, 'Method Not Allowed');
  });

  test('returns 500 if GEMINI_API_KEY is not configured', async () => {
    const handler = loadHandler(class Mock {}, { GEMINI_API_KEY: '' });
    const req = { method: 'POST' };
    const res = createMockRes();

    await handler(req, res);

    assert.strictEqual(res.statusCode, 500);
    const body = JSON.parse(res.body);
    assert.strictEqual(body.error, 'GEMINI_API_KEY is not configured');
  });

  test('returns 400 if request body is invalid', async () => {
    const handler = loadHandler(class Mock {}, { GEMINI_API_KEY: 'test-key' });
    const res = createMockRes();

    // Missing categoryName
    await handler({ method: 'POST', body: { budget: 100, spent: 50 } }, res);
    assert.strictEqual(res.statusCode, 400);

    // Missing budget
    await handler({ method: 'POST', body: { categoryName: 'Food', spent: 50 } }, res);
    assert.strictEqual(res.statusCode, 400);

    // Missing spent
    await handler({ method: 'POST', body: { categoryName: 'Food', budget: 100 } }, res);
    assert.strictEqual(res.statusCode, 400);
  });

  test('returns 200 with a tip on success', async () => {
    const mockTip = 'Spend less on coffee.';
    class MockGoogleGenAI {
      constructor(config) {
        this.apiKey = config.apiKey;
        this.models = {
          generateContent: async () => ({ text: mockTip }),
        };
      }
    }

    const handler = loadHandler(MockGoogleGenAI, { GEMINI_API_KEY: 'test-key' });
    const req = {
      method: 'POST',
      body: {
        categoryName: 'Coffee',
        budget: 500000,
        spent: 200000,
      },
    };
    const res = createMockRes();

    await handler(req, res);

    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.strictEqual(body.tip, mockTip);
  });

  test('returns 502 if model response is empty', async () => {
    class MockGoogleGenAI {
      constructor() {
        this.models = {
          generateContent: async () => ({ text: '' }),
        };
      }
    }

    const handler = loadHandler(MockGoogleGenAI, { GEMINI_API_KEY: 'test-key' });
    const req = {
      method: 'POST',
      body: {
        categoryName: 'Coffee',
        budget: 500000,
        spent: 200000,
      },
    };
    const res = createMockRes();

    await handler(req, res);

    assert.strictEqual(res.statusCode, 502);
    const body = JSON.parse(res.body);
    assert.strictEqual(body.error, 'Empty response from model');
  });

  test('returns 502 if model throws error', async () => {
    class MockGoogleGenAI {
      constructor() {
        this.models = {
          generateContent: async () => {
            throw new Error('API Error');
          },
        };
      }
    }

    const handler = loadHandler(MockGoogleGenAI, { GEMINI_API_KEY: 'test-key' });
    const req = {
      method: 'POST',
      body: {
        categoryName: 'Coffee',
        budget: 500000,
        spent: 200000,
      },
    };
    const res = createMockRes();

    await handler(req, res);

    assert.strictEqual(res.statusCode, 502);
    const body = JSON.parse(res.body);
    assert.strictEqual(body.error, 'Failed to fetch tip');
  });
});
