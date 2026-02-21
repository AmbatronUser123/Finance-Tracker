declare module 'virtual:pwa-register' {
  export function registerSW(options?: any): (reloadCallback?: () => void) => void;
}
