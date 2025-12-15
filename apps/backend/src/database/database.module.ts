import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get('NODE_ENV') === 'production';
        const certificatePath = path.join(process.cwd(), 'ca.pem');
        const loadCA = configService.get<string>('LOAD_CA') === 'true';

        return {
          type: 'postgres',
          url: configService.get<string>('DATABASE_URL'),
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          migrations: [__dirname + '/../../migrations/*{.ts,.js}'],
          synchronize: !isProduction,
          logging: !isProduction,
          ssl: loadCA
            ? {
                rejectUnauthorized: true,
                ca: fs.readFileSync(certificatePath).toString(),
              }
            : false,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
