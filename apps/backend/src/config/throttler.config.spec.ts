import { ConfigService } from '@nestjs/config';
import { getThrottlerConfig, THROTTLE_TTL } from './throttler.config';
import { ENV_KEYS } from './config.constants';

describe('ThrottlerConfig', () => {
  let configService: ConfigService;

  beforeEach(() => {
    configService = {
      get: jest.fn(),
    } as unknown as ConfigService;
  });

  describe('THROTTLE_TTL', () => {
    it('should have correct TTL values', () => {
      expect(THROTTLE_TTL.ONE_SECOND).toBe(1000);
      expect(THROTTLE_TTL.TEN_SECONDS).toBe(10000);
      expect(THROTTLE_TTL.ONE_MINUTE).toBe(60000);
    });
  });

  describe('getThrottlerConfig', () => {
    it('should return array of throttle configurations', () => {
      jest.spyOn(configService, 'get').mockImplementation((key: string, defaultValue?: any) => defaultValue);

      const result = getThrottlerConfig(configService);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(3);
    });

    it('should return short throttle config with default values', () => {
      jest.spyOn(configService, 'get').mockImplementation((key: string, defaultValue?: any) => defaultValue);

      const result = getThrottlerConfig(configService);

      expect(result[0]).toEqual({
        name: 'short',
        ttl: THROTTLE_TTL.ONE_SECOND,
        limit: 10,
      });
    });

    it('should return medium throttle config with default values', () => {
      jest.spyOn(configService, 'get').mockImplementation((key: string, defaultValue?: any) => defaultValue);

      const result = getThrottlerConfig(configService);

      expect(result[1]).toEqual({
        name: 'medium',
        ttl: THROTTLE_TTL.TEN_SECONDS,
        limit: 20,
      });
    });

    it('should return long throttle config with default values', () => {
      jest.spyOn(configService, 'get').mockImplementation((key: string, defaultValue?: any) => defaultValue);

      const result = getThrottlerConfig(configService);

      expect(result[2]).toEqual({
        name: 'long',
        ttl: THROTTLE_TTL.ONE_MINUTE,
        limit: 100,
      });
    });

    it('should use custom short limit from config', () => {
      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === ENV_KEYS.THROTTLE_SHORT_LIMIT) return 15;
        return undefined;
      });

      const result = getThrottlerConfig(configService);

      expect(result[0].limit).toBe(15);
    });

    it('should use custom medium limit from config', () => {
      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === ENV_KEYS.THROTTLE_MEDIUM_LIMIT) return 30;
        return undefined;
      });

      const result = getThrottlerConfig(configService);

      expect(result[1].limit).toBe(30);
    });

    it('should use custom long limit from config', () => {
      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === ENV_KEYS.THROTTLE_LONG_LIMIT) return 200;
        return undefined;
      });

      const result = getThrottlerConfig(configService);

      expect(result[2].limit).toBe(200);
    });

    it('should call configService.get for each throttle limit', () => {
      jest.spyOn(configService, 'get').mockReturnValue(undefined);

      getThrottlerConfig(configService);

      expect(configService.get).toHaveBeenCalledTimes(3);
      expect(configService.get).toHaveBeenCalledWith(ENV_KEYS.THROTTLE_SHORT_LIMIT, 10);
      expect(configService.get).toHaveBeenCalledWith(ENV_KEYS.THROTTLE_MEDIUM_LIMIT, 20);
      expect(configService.get).toHaveBeenCalledWith(ENV_KEYS.THROTTLE_LONG_LIMIT, 100);
    });
  });
});

