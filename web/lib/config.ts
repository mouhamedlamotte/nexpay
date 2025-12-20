export function getRuntimeConfig() {
  if (typeof window !== 'undefined') {
    // Côté client : lire depuis window.__RUNTIME_CONFIG__
    const runtimeConfig = (window as any).__RUNTIME_CONFIG__;
    if (runtimeConfig && process.env.NODE_ENV === 'production') {
      return {
        API_URL: runtimeConfig.NEXT_PUBLIC_API_URL,
        READ_API_KEY: runtimeConfig.NEXT_PUBLIC_READ_API_KEY,
      };
    }
  }
  
  // Fallback sur les variables d'environnement (serveur ou dev)
  return {
    API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9090/api/v1',
    READ_API_KEY: process.env.NEXT_PUBLIC_READ_API_KEY || 'read',
  };
}

export const config = getRuntimeConfig();