import { mock } from 'node:test';

export const useState = mock.fn((initial) => {
  const state = typeof initial === 'function' ? initial() : initial;
  return [state, mock.fn()];
});

export const useEffect = mock.fn((effect) => {
  // Execute effect immediately for testing purposes
  const cleanup = effect();
  if (typeof cleanup === 'function') {
      // Store cleanup if needed? For now just ignore or call if unmount simulated
  }
});

export const useCallback = mock.fn((callback) => callback);

export default { useState, useEffect, useCallback };
