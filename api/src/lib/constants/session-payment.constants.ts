import { SessionStatus } from '@prisma/client';

export const SESSION_CONSTANTS = {
  EXPIRATION_TIME_MS: 60 * 60 * 1000, // 1 hour
  STATUS_POLL_INTERVAL_MS: 2000,
  STATUS_POLL_TIMEOUT_MS: 30000,
} as const;

export const SESSION_STATUSES = {
  ACTIVE: [SessionStatus.opened, SessionStatus.pending],
  TERMINAL: [SessionStatus.completed, SessionStatus.failed],
};
