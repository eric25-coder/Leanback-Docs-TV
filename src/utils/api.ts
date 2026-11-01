import { Capacitor } from '@capacitor/core';

export const getApiUrl = (path: string) => {
  const baseUrl = import.meta.env.VITE_APP_URL || '';
  const isNative = Capacitor.isNativePlatform();
  
  if (isNative && baseUrl) {
    // Ensure baseUrl doesn't end with slash and path starts with slash
    const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${normalizedBase}${normalizedPath}`;
  }
  
  return path;
};
