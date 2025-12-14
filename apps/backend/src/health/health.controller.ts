import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  HealthCheckService,
  HealthCheck,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { Public } from 'src/auth/decorators/public.decorator';

@Public()
@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Check the health of the application' })
  @ApiResponse({
    status: 200,
    description: 'Returns the health of the application',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['up', 'down'] },
      },
      required: ['status'],
      example: {
        status: 'up',
      },
    },
  })
  @HealthCheck()
  check() {
    return this.health.check([
      // Database health check
      () => this.db.pingCheck('database'),
      // Memory health check - warn if heap usage exceeds 300MB
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
      // Memory health check - warn if RSS usage exceeds 500MB
      () => this.memory.checkRSS('memory_rss', 500 * 1024 * 1024),
    ]);
  }

  @ApiOperation({ summary: 'Check the liveness of the application' })
  @ApiResponse({
    status: 200,
    description: 'Returns the liveness of the application',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['up', 'down'] },
      },
    },
  })
  @Get('liveness')
  @HealthCheck()
  liveness() {
    return this.health.check([() => this.db.pingCheck('database')]);
  }

  @ApiOperation({ summary: 'Check the readiness of the application' })
  @ApiResponse({
    status: 200,
    description: 'Returns the readiness of the application',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['up', 'down'] },
      },
      required: ['status'],
      example: {
        status: 'up',
      },
    },
  })
  @HealthCheck()
  @Get('readiness')
  readiness() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
    ]);
  }
}
