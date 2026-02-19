import { fileURLToPath } from 'url';
import path from 'path';

export async function resolve(specifier, context, nextResolve) {
  const { parentURL } = context;

  // Mock react
  if (specifier === 'react') {
    return {
      shortCircuit: true,
      url: new URL('./mocks/react.mjs', import.meta.url).href,
    };
  }

  // Mock useLocalStorage relative import
  // Check if we are importing from hooks/useDarkMode.ts
  if (specifier === './useLocalStorage' && parentURL && parentURL.endsWith('/hooks/useDarkMode.ts')) {
     return {
      shortCircuit: true,
      url: new URL('./mocks/useLocalStorage.mjs', import.meta.url).href,
    };
  }

  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  return nextLoad(url, context);
}
