export const CACHE_KEY_PREFIX = 'weg:pay:';

export const CACHE_TTL = {
  DEFAULT: 10 * 60 * 1000, // 10 minutes
  VERY_SHORT: 3 * 60 * 1000, // 1 minute
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 15 * 60 * 1000, // 15 minutes
  LONG: 60 * 60 * 1000, // 1 hour
  VERY_LONG: 24 * 60 * 60 * 1000, // 24 hours
  EXTREMELY_LONG: 7 * 24 * 60 * 60 * 1000, // 7 days
  EXTREMELY_VERY_LONG: 30 * 24 * 60 * 60 * 1000, // 30 days
  PERMANENT: 0,
} as const;
