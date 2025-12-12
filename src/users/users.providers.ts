import { DataSource } from 'typeorm';
import { DATA_SOURCE } from '../database/database.constants';
import { User } from './entities/user.entity';
import { USER_REPOSITORY } from './users.constants';

export const usersProviders = [
  {
    provide: USER_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(User),
    inject: [DATA_SOURCE],
  },
];
