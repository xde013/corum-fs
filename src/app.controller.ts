import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get hello corum' })
  @ApiResponse({ status: 200, description: 'Returns a hello corum' })
  getHello(): string {
    return this.appService.getHello();
  }
}
