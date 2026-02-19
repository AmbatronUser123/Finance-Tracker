import { test, mock, beforeEach, describe } from 'node:test';
import assert from 'node:assert';
import { setMockValue, resetMock, getSetterSpy } from '../test/mocks/useLocalStorage.mjs';

// Setup global mocks for DOM environment
const classListAdd = mock.fn();
const classListRemove = mock.fn();

// Mock window and document
global.window = {
  document: {
    documentElement: {
      classList: {
        add: classListAdd,
        remove: classListRemove,
      },
    },
  },
  localStorage: {
    getItem: mock.fn(),
    setItem: mock.fn(),
  },
  addEventListener: mock.fn(),
  removeEventListener: mock.fn(),
} as any;

global.document = global.window.document;

// Import the hook to test
// Note: We use .ts extension for node loader
import { useDarkMode } from './useDarkMode.ts';

describe('useDarkMode Hook', () => {
  beforeEach(() => {
    // Reset mocks before each test
    resetMock();
    classListAdd.mock.resetCalls();
    classListRemove.mock.resetCalls();
    // Reset global window mocks if needed, but here we just reset spies
    // (mock.fn properties are reset automatically? No, we need to clear calls)
    // Actually mock.fn() keeps history.
    // Re-creating functions might be cleaner but modifying global is messy.
    // mock.resetCalls() or mock.reset() works.
    (global.window.document.documentElement.classList.add as any).mock.resetCalls();
    (global.window.document.documentElement.classList.remove as any).mock.resetCalls();
  });

  test('should initialize with dark mode by default (when storage returns dark)', () => {
    // Setup: storage returns 'dark' (default in our mock)
    setMockValue('dark');

    const [theme] = useDarkMode();

    assert.strictEqual(theme, 'dark', 'Theme should be dark');

    // Verify classList.add('dark') was called
    assert.strictEqual(classListAdd.mock.calls.length, 1, 'classList.add should be called once');
    assert.deepStrictEqual(classListAdd.mock.calls[0].arguments, ['dark'], 'Should add "dark" class');

    // Verify classList.remove('dark') was NOT called
    assert.strictEqual(classListRemove.mock.calls.length, 0, 'classList.remove should not be called');
  });

  test('should initialize with light mode correctly', () => {
    // Setup: storage returns 'light'
    setMockValue('light');

    const [theme] = useDarkMode();

    assert.strictEqual(theme, 'light', 'Theme should be light');

    // Verify classList.remove('dark') was called
    assert.strictEqual(classListRemove.mock.calls.length, 1, 'classList.remove should be called once');
    assert.deepStrictEqual(classListRemove.mock.calls[0].arguments, ['dark'], 'Should remove "dark" class');

    // Verify classList.add('dark') was NOT called
    assert.strictEqual(classListAdd.mock.calls.length, 0, 'classList.add should not be called');
  });

  test('should toggle theme correctly', () => {
    // Setup: start with light
    setMockValue('light');
    const [_, toggleTheme] = useDarkMode();

    // Action: toggle theme
    toggleTheme();

    // Verify: setter from useLocalStorage was called
    const setterSpy = getSetterSpy();
    assert.strictEqual(setterSpy.mock.calls.length, 1, 'setTheme should be called once');

    // Verify: setter called with a function that toggles state
    const updateFn = setterSpy.mock.calls[0].arguments[0];
    assert.strictEqual(typeof updateFn, 'function', 'setTheme should be called with a function');

    // Test the update function logic
    assert.strictEqual(updateFn('light'), 'dark', 'Update function should switch light to dark');
    assert.strictEqual(updateFn('dark'), 'light', 'Update function should switch dark to light');
  });

  test('should update DOM when theme changes (simulated re-render)', () => {
    // 1. Initial render: Light
    setMockValue('light');
    useDarkMode(); // Render 1
    assert.strictEqual(classListRemove.mock.calls.length, 1, 'Initial: remove called');
    assert.strictEqual(classListAdd.mock.calls.length, 0, 'Initial: add not called');

    // 2. Simulate state change to Dark
    setMockValue('dark');

    // 3. Re-render
    useDarkMode(); // Render 2

    // 4. Verify DOM update
    // Note: In real React, useEffect might run cleanups, but here our mock just runs effect.
    // The effect adds 'dark' class.
    assert.strictEqual(classListAdd.mock.calls.length, 1, 'Re-render: add called');
    assert.deepStrictEqual(classListAdd.mock.calls[0].arguments, ['dark'], 'Should add "dark" class on re-render');
  });
});
