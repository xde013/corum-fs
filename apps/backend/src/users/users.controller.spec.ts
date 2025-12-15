import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { SortField, SortOrder } from './dto/cursor-pagination.dto';
import { UserListQueryDto } from './dto/user-list-query.dto';
import { CursorPaginatedResponseDto } from './dto/cursor-paginated-response.dto';
import { Role } from './enums/role.enum';
import { NotFoundException } from '@nestjs/common';

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

  describe('create', () => {
    it('should call UsersService.create with DTO and return created user', async () => {
      const createUserDto = {
        firstName: 'Charlie',
        lastName: 'Clark',
        email: 'charlie@example.com',
        password: 'Password123!',
        birthdate: '1992-03-03',
      };
      const createdUser = { ...mockUsers[0], ...createUserDto };
      (service.create as jest.Mock).mockResolvedValue(createdUser);

      const result = await controller.create(createUserDto as any);

      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(createdUser);
    });
  });

  describe('findOne', () => {
    it('should return user when found', async () => {
      (service.findOne as jest.Mock).mockResolvedValue(mockUsers[0]);

      const result = await controller.findOne('1');

      expect(service.findOne).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockUsers[0]);
    });

    it('should throw NotFoundException when user is not found', async () => {
      (service.findOne as jest.Mock).mockResolvedValue(null);

      await expect(controller.findOne('missing')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('update', () => {
    it('should return updated user when service returns a user', async () => {
      const updateUserDto = { firstName: 'Updated' };
      const updatedUser = { ...mockUsers[0], ...updateUserDto };
      (service.update as jest.Mock).mockResolvedValue(updatedUser);

      const result = await controller.update('1', updateUserDto as any);

      expect(service.update).toHaveBeenCalledWith('1', updateUserDto);
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException when service returns null', async () => {
      const updateUserDto = { firstName: 'Updated' };
      (service.update as jest.Mock).mockResolvedValue(null);

      await expect(
        controller.update('missing', updateUserDto as any)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateMe', () => {
    it('should call update with current user id and dto', async () => {
      const currentUser = mockUsers[0];
      const updateSelfDto = { firstName: 'SelfUpdated' };
      const updatedUser = { ...currentUser, ...updateSelfDto };
      (service.update as jest.Mock).mockResolvedValue(updatedUser);

      const result = await controller.updateMe(
        currentUser,
        updateSelfDto as any
      );

      expect(service.update).toHaveBeenCalledWith(
        currentUser.id,
        updateSelfDto
      );
      expect(result).toEqual(updatedUser);
    });
  });

  describe('deleteMe', () => {
    it('should return success message when user is deleted', async () => {
      const currentUser = mockUsers[0];
      (service.remove as jest.Mock).mockResolvedValue(true);

      const result = await controller.deleteMe(currentUser);

      expect(service.remove).toHaveBeenCalledWith(currentUser.id);
      expect(result).toEqual({ message: 'Your account has been deleted' });
    });

    it('should throw NotFoundException when user is not found', async () => {
      const currentUser = mockUsers[0];
      (service.remove as jest.Mock).mockResolvedValue(false);

      await expect(controller.deleteMe(currentUser)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('remove', () => {
    it('should return success message when user is deleted', async () => {
      (service.remove as jest.Mock).mockResolvedValue(true);

      const result = await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith('1');
      expect(result).toEqual({ message: 'User with ID 1 has been deleted' });
    });

    it('should throw NotFoundException when user is not found', async () => {
      (service.remove as jest.Mock).mockResolvedValue(false);

      await expect(controller.remove('missing')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('bulkRemove', () => {
    it('should delegate to UsersService.bulkRemove and wrap message', async () => {
      (service.bulkRemove as jest.Mock).mockResolvedValue({
        deleted: 2,
        failed: ['3'],
      });

      const dto = { ids: ['1', '2', '3'] };
      const result = await controller.bulkRemove(dto as any);

      expect(service.bulkRemove).toHaveBeenCalledWith(dto.ids);
      expect(result).toEqual({
        deleted: 2,
        failed: ['3'],
        message: 'Successfully deleted 2 user(s)',
      });
    });
  });

  describe('updateRole', () => {
    it('should return updated user when service returns a user', async () => {
      const updatedUser = { ...mockUsers[0], role: Role.ADMIN };
      (service.updateRole as jest.Mock).mockResolvedValue(updatedUser);

      const result = await controller.updateRole('1', { role: Role.ADMIN });

      expect(service.updateRole).toHaveBeenCalledWith('1', Role.ADMIN);
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException when service returns null', async () => {
      (service.updateRole as jest.Mock).mockResolvedValue(null);

      await expect(
        controller.updateRole('missing', { role: Role.ADMIN })
      ).rejects.toThrow(NotFoundException);
    });
  });
});
