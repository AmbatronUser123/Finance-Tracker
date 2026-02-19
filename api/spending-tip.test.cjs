// Note: This test file uses .cjs extension and vm module to test the api/spending-tip.js file
// because the project is configured as "type": "module" in package.json, but the API handler
// is written in CommonJS (using require/module.exports).

const { test } = require('node:test');
const assert = require('node:assert');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

test('should log error when GoogleGenAI throws', async (t) => {
  const code = fs.readFileSync(path.join(__dirname, 'spending-tip.js'), 'utf8');

  // Mock console.error
  const consoleErrorMock = t.mock.method(console, 'error');

  // Prepare context
  const context = {
    require: (moduleName) => {
      if (moduleName === '@google/genai') {
        return {
          GoogleGenAI: class {
            constructor() {
              this.models = {
                generateContent: async () => {
                  throw new Error('Mocked API Error');
                }
              };
            }
          }
        };
      }
      // Allow relative require if needed, but the file doesn't seem to use any
      throw new Error(`Unexpected require: ${moduleName}`);
    },
    module: { exports: {} },
    process: {
      env: {
        GEMINI_API_KEY: 'test-api-key'
      }
    },
    console: console, // Use the real console (which is mocked by t.mock.method)
  };

  vm.createContext(context);
  vm.runInContext(code, context);

  const handler = context.module.exports;

  const req = {
    method: 'POST',
    body: {
      categoryName: 'Food',
      budget: 1000000,
      spent: 500000
    }
  };

  const res = {
    statusCode: 0,
    headers: {},
    body: '',
    setHeader(name, value) {
      this.headers[name] = value;
    },
    end(chunk) {
      this.body = chunk;
    }
  };

  await handler(req, res);

  assert.strictEqual(res.statusCode, 502);

  // Return the mock for external verification if needed, or assert here
  // We want to assert that initially it fails (0 calls) and later passes (1 call)
  // But for reproduction, we just want to see the count.

  if (consoleErrorMock.mock.calls.length === 0) {
    throw new Error('Expected console.error to be called, but it was not.');
  }

  assert.strictEqual(consoleErrorMock.mock.calls.length, 1);
  const args = consoleErrorMock.mock.calls[0].arguments;
  assert.strictEqual(args[0], 'Error generating spending tip:');
  assert.strictEqual(args[1].message, 'Mocked API Error');
});
