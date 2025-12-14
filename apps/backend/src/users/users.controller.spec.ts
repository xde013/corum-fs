import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { SortField, SortOrder } from './dto/cursor-pagination.dto';
import { UserListQueryDto } from './dto/user-list-query.dto';
import { CursorPaginatedResponseDto } from './dto/cursor-paginated-response.dto';
import { Role } from './enums/role.enum';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsers: User[] = [
    {
      id: '1',
      firstName: 'Alice',
      lastName: 'Anderson',
      email: 'alice@example.com',
      password: 'hashedpassword1',
      birthdate: new Date('1990-01-01'),
      role: Role.USER,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: '2',
      firstName: 'Bob',
      lastName: 'Brown',
      email: 'bob@example.com',
      password: 'hashedpassword2',
      birthdate: new Date('1991-02-02'),
      role: Role.USER,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    },
  ];

  const mockPaginatedResponse: CursorPaginatedResponseDto<User> = {
    data: mockUsers,
    meta: {
      nextCursor: null,
      hasMore: false,
      count: 2,
      limit: 10,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAllCursorPaginated: jest
              .fn()
              .mockResolvedValue(mockPaginatedResponse),
            create: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            updateRole: jest.fn(),
            remove: jest.fn(),
            bulkRemove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated users with default parameters', async () => {
      const queryDto: UserListQueryDto = {
        limit: 10,
        sortBy: SortField.CREATED_AT,
        sortOrder: SortOrder.DESC,
      };

      const result = await controller.findAll(queryDto);

      expect(service.findAllCursorPaginated).toHaveBeenCalledWith(
        undefined,
        10,
        SortField.CREATED_AT,
        SortOrder.DESC,
        undefined
      );
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should pass cursor parameter to service', async () => {
      const queryDto: UserListQueryDto = {
        cursor: 'some-uuid',
        limit: 10,
        sortBy: SortField.CREATED_AT,
        sortOrder: SortOrder.DESC,
      };

      await controller.findAll(queryDto);

      expect(service.findAllCursorPaginated).toHaveBeenCalledWith(
        'some-uuid',
        10,
        SortField.CREATED_AT,
        SortOrder.DESC,
        undefined
      );
    });

    it('should pass custom limit to service', async () => {
      const queryDto: UserListQueryDto = {
        limit: 25,
        sortBy: SortField.CREATED_AT,
        sortOrder: SortOrder.DESC,
      };

      await controller.findAll(queryDto);

      expect(service.findAllCursorPaginated).toHaveBeenCalledWith(
        undefined,
        25,
        SortField.CREATED_AT,
        SortOrder.DESC,
        undefined
      );
    });

    it('should pass sortBy firstName to service', async () => {
      const queryDto: UserListQueryDto = {
        limit: 10,
        sortBy: SortField.FIRST_NAME,
        sortOrder: SortOrder.DESC,
      };

      await controller.findAll(queryDto);

      expect(service.findAllCursorPaginated).toHaveBeenCalledWith(
        undefined,
        10,
        SortField.FIRST_NAME,
        SortOrder.DESC,
        undefined
      );
    });

    it('should pass sortBy lastName to service', async () => {
      const queryDto: UserListQueryDto = {
        limit: 10,
        sortBy: SortField.LAST_NAME,
        sortOrder: SortOrder.DESC,
      };

      await controller.findAll(queryDto);

      expect(service.findAllCursorPaginated).toHaveBeenCalledWith(
        undefined,
        10,
        SortField.LAST_NAME,
        SortOrder.DESC,
        undefined
      );
    });

    it('should pass sortBy email to service', async () => {
      const queryDto: UserListQueryDto = {
        limit: 10,
        sortBy: SortField.EMAIL,
        sortOrder: SortOrder.DESC,
      };

      await controller.findAll(queryDto);

      expect(service.findAllCursorPaginated).toHaveBeenCalledWith(
        undefined,
        10,
        SortField.EMAIL,
        SortOrder.DESC,
        undefined
      );
    });

    it('should pass sortBy birthdate to service', async () => {
      const queryDto: UserListQueryDto = {
        limit: 10,
        sortBy: SortField.BIRTHDATE,
        sortOrder: SortOrder.DESC,
      };

      await controller.findAll(queryDto);

      expect(service.findAllCursorPaginated).toHaveBeenCalledWith(
        undefined,
        10,
        SortField.BIRTHDATE,
        SortOrder.DESC,
        undefined
      );
    });

    it('should pass sortBy updatedAt to service', async () => {
      const queryDto: UserListQueryDto = {
        limit: 10,
        sortBy: SortField.UPDATED_AT,
        sortOrder: SortOrder.DESC,
      };

      await controller.findAll(queryDto);

      expect(service.findAllCursorPaginated).toHaveBeenCalledWith(
        undefined,
        10,
        SortField.UPDATED_AT,
        SortOrder.DESC,
        undefined
      );
    });

    it('should pass sortOrder ASC to service', async () => {
      const queryDto: UserListQueryDto = {
        limit: 10,
        sortBy: SortField.FIRST_NAME,
        sortOrder: SortOrder.ASC,
      };

      await controller.findAll(queryDto);

      expect(service.findAllCursorPaginated).toHaveBeenCalledWith(
        undefined,
        10,
        SortField.FIRST_NAME,
        SortOrder.ASC,
        undefined
      );
    });

    it('should pass sortOrder DESC to service', async () => {
      const queryDto: UserListQueryDto = {
        limit: 10,
        sortBy: SortField.FIRST_NAME,
        sortOrder: SortOrder.DESC,
      };

      await controller.findAll(queryDto);

      expect(service.findAllCursorPaginated).toHaveBeenCalledWith(
        undefined,
        10,
        SortField.FIRST_NAME,
        SortOrder.DESC,
        undefined
      );
    });

    it('should pass all parameters including cursor and custom sort options', async () => {
      const queryDto: UserListQueryDto = {
        cursor: 'cursor-123',
        limit: 50,
        sortBy: SortField.EMAIL,
        sortOrder: SortOrder.ASC,
      };

      await controller.findAll(queryDto);

      expect(service.findAllCursorPaginated).toHaveBeenCalledWith(
        'cursor-123',
        50,
        SortField.EMAIL,
        SortOrder.ASC,
        undefined
      );
    });

    it('should pass firstName filter to service', async () => {
      const queryDto: UserListQueryDto = {
        limit: 10,
        sortBy: SortField.CREATED_AT,
        sortOrder: SortOrder.DESC,
        firstName: 'Alice',
      };

      await controller.findAll(queryDto);

      expect(service.findAllCursorPaginated).toHaveBeenCalledWith(
        undefined,
        10,
        SortField.CREATED_AT,
        SortOrder.DESC,
        {
          search: undefined,
          firstName: 'Alice',
          lastName: undefined,
          email: undefined,
        }
      );
    });

    it('should pass lastName filter to service', async () => {
      const queryDto: UserListQueryDto = {
        limit: 10,
        sortBy: SortField.CREATED_AT,
        sortOrder: SortOrder.DESC,
        lastName: 'Brown',
      };

      await controller.findAll(queryDto);

      expect(service.findAllCursorPaginated).toHaveBeenCalledWith(
        undefined,
        10,
        SortField.CREATED_AT,
        SortOrder.DESC,
        {
          search: undefined,
          firstName: undefined,
          lastName: 'Brown',
          email: undefined,
        }
      );
    });

    it('should pass email filter to service', async () => {
      const queryDto: UserListQueryDto = {
        limit: 10,
        sortBy: SortField.CREATED_AT,
        sortOrder: SortOrder.DESC,
        email: 'example.com',
      };

      await controller.findAll(queryDto);

      expect(service.findAllCursorPaginated).toHaveBeenCalledWith(
        undefined,
        10,
        SortField.CREATED_AT,
        SortOrder.DESC,
        {
          search: undefined,
          firstName: undefined,
          lastName: undefined,
          email: 'example.com',
        }
      );
    });

    it('should pass multiple filters to service', async () => {
      const queryDto: UserListQueryDto = {
        limit: 10,
        sortBy: SortField.CREATED_AT,
        sortOrder: SortOrder.DESC,
        firstName: 'John',
        lastName: 'Doe',
        email: 'gmail',
      };

      await controller.findAll(queryDto);

      expect(service.findAllCursorPaginated).toHaveBeenCalledWith(
        undefined,
        10,
        SortField.CREATED_AT,
        SortOrder.DESC,
        {
          search: undefined,
          firstName: 'John',
          lastName: 'Doe',
          email: 'gmail',
        }
      );
    });

    it('should pass undefined filters when no filter parameters provided', async () => {
      const queryDto: UserListQueryDto = {
        limit: 10,
        sortBy: SortField.CREATED_AT,
        sortOrder: SortOrder.DESC,
      };

      await controller.findAll(queryDto);

      expect(service.findAllCursorPaginated).toHaveBeenCalledWith(
        undefined,
        10,
        SortField.CREATED_AT,
        SortOrder.DESC,
        undefined
      );
    });

    it('should pass search parameter to service', async () => {
      const queryDto: UserListQueryDto = {
        limit: 10,
        sortBy: SortField.CREATED_AT,
        sortOrder: SortOrder.DESC,
        search: 'john',
      };

      await controller.findAll(queryDto);

      expect(service.findAllCursorPaginated).toHaveBeenCalledWith(
        undefined,
        10,
        SortField.CREATED_AT,
        SortOrder.DESC,
        {
          search: 'john',
          firstName: undefined,
          lastName: undefined,
          email: undefined,
        }
      );
    });

    it('should pass search parameter with other filters to service', async () => {
      const queryDto: UserListQueryDto = {
        limit: 10,
        sortBy: SortField.CREATED_AT,
        sortOrder: SortOrder.DESC,
        search: 'alice',
        firstName: 'John',
        lastName: 'Doe',
        email: 'test',
      };

      await controller.findAll(queryDto);

      expect(service.findAllCursorPaginated).toHaveBeenCalledWith(
        undefined,
        10,
        SortField.CREATED_AT,
        SortOrder.DESC,
        {
          search: 'alice',
          firstName: 'John',
          lastName: 'Doe',
          email: 'test',
        }
      );
    });

    it('should pass search parameter with cursor to service', async () => {
      const queryDto: UserListQueryDto = {
        cursor: 'cursor-123',
        limit: 10,
        sortBy: SortField.CREATED_AT,
        sortOrder: SortOrder.DESC,
        search: 'bob',
      };

      await controller.findAll(queryDto);

      expect(service.findAllCursorPaginated).toHaveBeenCalledWith(
        'cursor-123',
        10,
        SortField.CREATED_AT,
        SortOrder.DESC,
        {
          search: 'bob',
          firstName: undefined,
          lastName: undefined,
          email: undefined,
        }
      );
    });
  });
});
