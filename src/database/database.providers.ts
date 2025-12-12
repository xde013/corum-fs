import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { DATA_SOURCE } from './database.constants';
import * as path from 'path';
import * as fs from 'fs';

export const databaseProviders = [
  {
    provide: DATA_SOURCE,
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => {
      const isProduction = configService.get('NODE_ENV') === 'production';
      const certificatePath = path.join(process.cwd(), 'ca.pem');

      const dataSource = new DataSource({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: !isProduction,
        logging: !isProduction,
        ssl: {
          rejectUnauthorized: true,
          ca: fs.readFileSync(certificatePath).toString(),
        },
      });

      return dataSource.initialize();
    },
  },
];
