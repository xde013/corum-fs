import type { ThrottlerModuleOptions } from '@nestjs/throttler';
import { ENV_KEYS } from './config.constants';
import { ConfigService } from '@nestjs/config';

// Throttle TTL values (in milliseconds)
export const THROTTLE_TTL = {
  ONE_SECOND: 1_000,
  TEN_SECONDS: 10_000,
  ONE_MINUTE: 60_000,
} as const;

// Default throttle values
const DEFAULT_THROTTLE_VALUES = {
  SHORT_LIMIT: 10,
  MEDIUM_LIMIT: 20,
  LONG_LIMIT: 100,
} as const;

// Global throttler configuration
export const getThrottlerConfig = (
  configService: ConfigService,
): ThrottlerModuleOptions => {
  return [
    {
      name: 'short',
      ttl: THROTTLE_TTL.ONE_SECOND,
      limit: configService.get(
        ENV_KEYS.THROTTLE_SHORT_LIMIT,
        DEFAULT_THROTTLE_VALUES.SHORT_LIMIT,
      ),
    },
    {
      name: 'medium',
      ttl: THROTTLE_TTL.TEN_SECONDS,
      limit: configService.get(
        ENV_KEYS.THROTTLE_MEDIUM_LIMIT,
        DEFAULT_THROTTLE_VALUES.MEDIUM_LIMIT,
      ),
    },
    {
      name: 'long',
      ttl: THROTTLE_TTL.ONE_MINUTE,
      limit: configService.get(
        ENV_KEYS.THROTTLE_LONG_LIMIT,
        DEFAULT_THROTTLE_VALUES.LONG_LIMIT,
      ),
    },
  ];
};
