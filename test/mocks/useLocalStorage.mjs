import { mock } from 'node:test';

let storedValue = 'dark';
let setterSpy = mock.fn();

export function setMockValue(val) {
  storedValue = val;
}

export function getSetterSpy() {
  return setterSpy;
}

export function resetMock() {
  storedValue = 'dark';
  setterSpy = mock.fn();
  // Reset usage history of useLocalStorage
  if (useLocalStorage.mock.resetCalls) {
      useLocalStorage.mock.resetCalls();
  } else {
      // Fallback if resetCalls not available (older node versions)
      // but usually mock.reset() does it.
      // mock.reset() also resets implementation if not configured?
      // Docs: mock.reset() Resets the mock function's history.
      // Implementation is preserved if using mock.fn(impl).
      useLocalStorage.mock.reset();
  }
}

export const useLocalStorage = mock.fn(() => {
  return [storedValue, setterSpy];
});
