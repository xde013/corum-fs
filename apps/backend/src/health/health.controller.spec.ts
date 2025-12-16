import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import {
  HealthCheckService,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: HealthCheckService;
  let typeOrmHealthIndicator: TypeOrmHealthIndicator;
  let memoryHealthIndicator: MemoryHealthIndicator;
  let diskHealthIndicator: DiskHealthIndicator;

  const mockHealthCheckResult = {
    status: 'ok',
    info: {
      database: { status: 'up' },
      memory_heap: { status: 'up' },
      memory_rss: { status: 'up' },
    },
    error: {},
    details: {
      database: { status: 'up' },
      memory_heap: { status: 'up' },
      memory_rss: { status: 'up' },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: {
            check: jest.fn(),
          },
        },
        {
          provide: TypeOrmHealthIndicator,
          useValue: {
            pingCheck: jest.fn(),
          },
        },
        {
          provide: MemoryHealthIndicator,
          useValue: {
            checkHeap: jest.fn(),
            checkRSS: jest.fn(),
          },
        },
        {
          provide: DiskHealthIndicator,
          useValue: {
            checkStorage: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthCheckService = module.get<HealthCheckService>(HealthCheckService);
    typeOrmHealthIndicator = module.get<TypeOrmHealthIndicator>(
      TypeOrmHealthIndicator
    );
    memoryHealthIndicator = module.get<MemoryHealthIndicator>(
      MemoryHealthIndicator
    );
    diskHealthIndicator = module.get<DiskHealthIndicator>(
      DiskHealthIndicator
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should return health check result', async () => {
      jest
        .spyOn(healthCheckService, 'check')
        .mockResolvedValue(mockHealthCheckResult);

      const result = await controller.check();

      expect(healthCheckService.check).toHaveBeenCalled();
      expect(result).toEqual(mockHealthCheckResult);
      expect(result.status).toBe('ok');
    });

    it('should check database health', async () => {
      jest
        .spyOn(healthCheckService, 'check')
        .mockResolvedValue(mockHealthCheckResult);

      await controller.check();

      expect(healthCheckService.check).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.any(Function), // database ping check
        ])
      );
    });

    it('should check memory heap health', async () => {
      jest
        .spyOn(healthCheckService, 'check')
        .mockResolvedValue(mockHealthCheckResult);

      await controller.check();

      expect(healthCheckService.check).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.any(Function), // memory heap check
        ])
      );
    });

    it('should check memory RSS health', async () => {
      jest
        .spyOn(healthCheckService, 'check')
        .mockResolvedValue(mockHealthCheckResult);

      await controller.check();

      expect(healthCheckService.check).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.any(Function), // memory RSS check
        ])
      );
    });

    it('should execute all three health checks', async () => {
      jest
        .spyOn(healthCheckService, 'check')
        .mockResolvedValue(mockHealthCheckResult);

      await controller.check();

      const callArgs = (healthCheckService.check as jest.Mock).mock.calls[0][0];
      expect(callArgs).toHaveLength(3);
    });
  });

  describe('liveness', () => {
    const mockLivenessResult = {
      status: 'ok',
      info: {
        database: { status: 'up' },
      },
      error: {},
      details: {
        database: { status: 'up' },
      },
    };

    it('should return liveness check result', async () => {
      jest
        .spyOn(healthCheckService, 'check')
        .mockResolvedValue(mockLivenessResult);

      const result = await controller.liveness();

      expect(healthCheckService.check).toHaveBeenCalled();
      expect(result).toEqual(mockLivenessResult);
      expect(result.status).toBe('ok');
    });

    it('should check only database health', async () => {
      jest
        .spyOn(healthCheckService, 'check')
        .mockResolvedValue(mockLivenessResult);

      await controller.liveness();

      const callArgs = (healthCheckService.check as jest.Mock).mock.calls[0][0];
      expect(callArgs).toHaveLength(1);
    });

    it('should use database ping check', async () => {
      jest
        .spyOn(healthCheckService, 'check')
        .mockResolvedValue(mockLivenessResult);

      await controller.liveness();

      expect(healthCheckService.check).toHaveBeenCalledWith([
        expect.any(Function),
      ]);
    });
  });

  describe('readiness', () => {
    const mockReadinessResult = {
      status: 'ok',
      info: {
        database: { status: 'up' },
        memory_heap: { status: 'up' },
      },
      error: {},
      details: {
        database: { status: 'up' },
        memory_heap: { status: 'up' },
      },
    };

    it('should return readiness check result', async () => {
      jest
        .spyOn(healthCheckService, 'check')
        .mockResolvedValue(mockReadinessResult);

      const result = await controller.readiness();

      expect(healthCheckService.check).toHaveBeenCalled();
      expect(result).toEqual(mockReadinessResult);
      expect(result.status).toBe('ok');
    });

    it('should check database and memory heap health', async () => {
      jest
        .spyOn(healthCheckService, 'check')
        .mockResolvedValue(mockReadinessResult);

      await controller.readiness();

      const callArgs = (healthCheckService.check as jest.Mock).mock.calls[0][0];
      expect(callArgs).toHaveLength(2);
    });

    it('should use database ping check and memory heap check', async () => {
      jest
        .spyOn(healthCheckService, 'check')
        .mockResolvedValue(mockReadinessResult);

      await controller.readiness();

      expect(healthCheckService.check).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.any(Function), // database ping check
          expect.any(Function), // memory heap check
        ])
      );
    });
  });

  describe('health check failures', () => {
    it('should handle database health check failure', async () => {
      const mockFailureResult = {
        status: 'error',
        info: {},
        error: {
          database: { status: 'down', message: 'Connection failed' },
        },
        details: {
          database: { status: 'down', message: 'Connection failed' },
        },
      };

      jest
        .spyOn(healthCheckService, 'check')
        .mockResolvedValue(mockFailureResult);

      const result = await controller.check();

      expect(result.status).toBe('error');
      expect(result.error.database).toBeDefined();
    });

    it('should handle memory health check failure', async () => {
      const mockFailureResult = {
        status: 'error',
        info: {},
        error: {
          memory_heap: {
            status: 'down',
            message: 'Memory usage exceeds threshold',
          },
        },
        details: {
          memory_heap: {
            status: 'down',
            message: 'Memory usage exceeds threshold',
          },
        },
      };

      jest
        .spyOn(healthCheckService, 'check')
        .mockResolvedValue(mockFailureResult);

      const result = await controller.check();

      expect(result.status).toBe('error');
      expect(result.error.memory_heap).toBeDefined();
    });
  });
});

