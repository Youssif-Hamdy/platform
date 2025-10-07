// Lightweight runtime fetch wrapper to ensure production requests hit the real API
// rather than being rewritten by static hosting to index.html

const API_BASE_URL: string | undefined = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '/api' : undefined);
const IS_PRODUCTION: boolean = Boolean(import.meta.env.PROD);

function isRelativeApiPath(input: RequestInfo | URL): boolean {
  if (typeof input === 'string') {
    return input.startsWith('/') && !input.startsWith('//');
  }
  if (input instanceof URL) {
    return false;
  }
  return false;
}

export function installFetchBasePrefix(): void {
  // Only enable in production builds where a base URL is configured
  if (!IS_PRODUCTION || !API_BASE_URL) {
    // No base URL configured; do nothing
    return;
  }

  const originalFetch = window.fetch.bind(window);

  window.fetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    try {
      if (isRelativeApiPath(input)) {
        const prefixed = API_BASE_URL.replace(/\/$/, '') + String(input);
        return originalFetch(prefixed, init);
      }
      return originalFetch(input, init);
    } catch (e) {
      return originalFetch(input, init);
    }
  };
}


