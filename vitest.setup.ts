import '@testing-library/jest-dom/vitest'

// jsdom under this vitest build does not expose a working Storage on
// `localStorage`; provide a minimal in-memory polyfill so browser-storage
// code (lib/wcApi.ts) behaves as it would in a real browser.
if (typeof localStorage === 'undefined' || typeof localStorage.setItem !== 'function') {
  const store = new Map<string, string>()
  const polyfill: Storage = {
    get length() {
      return store.size
    },
    clear: () => store.clear(),
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    key: (i: number) => Array.from(store.keys())[i] ?? null,
    removeItem: (k: string) => {
      store.delete(k)
    },
    setItem: (k: string, v: string) => {
      store.set(k, String(v))
    },
  }
  Object.defineProperty(globalThis, 'localStorage', {
    value: polyfill,
    configurable: true,
  })
  if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'localStorage', {
      value: polyfill,
      configurable: true,
    })
  }
}
