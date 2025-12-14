import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { SortField, SortOrder } from './dto/cursor-pagination.dto';
import { Role } from './enums/role.enum';

describe('UsersService', () => {
  let service: UsersService;
  let mockRepository: any;

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
    {
      id: '3',
      firstName: 'Charlie',
      lastName: 'Clark',
      email: 'charlie@example.com',
      password: 'hashedpassword3',
      birthdate: new Date('1992-03-03'),
      role: Role.USER,
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-03'),
    },
  ];

  beforeEach(async () => {
    const mockQueryBuilder = {
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(mockUsers),
    };

    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllCursorPaginated', () => {
    it('should return paginated users with default sorting (createdAt DESC)', async () => {
      const queryBuilder = mockRepository.createQueryBuilder();
      queryBuilder.getMany.mockResolvedValue(mockUsers.slice(0, 2));

      const result = await service.findAllCursorPaginated(undefined, 2);

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(queryBuilder.orderBy).toHaveBeenCalledWith(
        'user.createdAt',
        'DESC',
      );
      expect(queryBuilder.addOrderBy).toHaveBeenCalledWith('user.id', 'DESC');
      expect(queryBuilder.take).toHaveBeenCalledWith(3); // limit + 1
      expect(result.data).toHaveLength(2);
      expect(result.meta.limit).toBe(2);
    });

    it('should sort by firstName in ascending order', async () => {
      const queryBuilder = mockRepository.createQueryBuilder();
      queryBuilder.getMany.mockResolvedValue(mockUsers);

      await service.findAllCursorPaginated(
        undefined,
        10,
        SortField.FIRST_NAME,
        SortOrder.ASC,
      );

      expect(queryBuilder.orderBy).toHaveBeenCalledWith(
        'user.firstName',
        'ASC',
      );
      expect(queryBuilder.addOrderBy).toHaveBeenCalledWith('user.id', 'ASC');
    });

    it('should sort by lastName in descending order', async () => {
      const queryBuilder = mockRepository.createQueryBuilder();
      queryBuilder.getMany.mockResolvedValue(mockUsers);

      await service.findAllCursorPaginated(
        undefined,
        10,
        SortField.LAST_NAME,
        SortOrder.DESC,
      );

      expect(queryBuilder.orderBy).toHaveBeenCalledWith(
        'user.lastName',
        'DESC',
      );
      expect(queryBuilder.addOrderBy).toHaveBeenCalledWith('user.id', 'DESC');
    });

    it('should sort by email in ascending order', async () => {
      const queryBuilder = mockRepository.createQueryBuilder();
      queryBuilder.getMany.mockResolvedValue(mockUsers);

      await service.findAllCursorPaginated(
        undefined,
        10,
        SortField.EMAIL,
        SortOrder.ASC,
      );

      expect(queryBuilder.orderBy).toHaveBeenCalledWith('user.email', 'ASC');
      expect(queryBuilder.addOrderBy).toHaveBeenCalledWith('user.id', 'ASC');
    });

    it('should sort by birthdate in descending order', async () => {
      const queryBuilder = mockRepository.createQueryBuilder();
      queryBuilder.getMany.mockResolvedValue(mockUsers);

      await service.findAllCursorPaginated(
        undefined,
        10,
        SortField.BIRTHDATE,
        SortOrder.DESC,
      );

      expect(queryBuilder.orderBy).toHaveBeenCalledWith(
        'user.birthdate',
        'DESC',
      );
      expect(queryBuilder.addOrderBy).toHaveBeenCalledWith('user.id', 'DESC');
    });

    it('should sort by updatedAt in ascending order', async () => {
      const queryBuilder = mockRepository.createQueryBuilder();
      queryBuilder.getMany.mockResolvedValue(mockUsers);

      await service.findAllCursorPaginated(
        undefined,
        10,
        SortField.UPDATED_AT,
        SortOrder.ASC,
      );

      expect(queryBuilder.orderBy).toHaveBeenCalledWith(
        'user.updatedAt',
        'ASC',
      );
      expect(queryBuilder.addOrderBy).toHaveBeenCalledWith('user.id', 'ASC');
    });

    it('should apply cursor-based pagination with DESC sort order', async () => {
      const cursorUser = mockUsers[0];
      mockRepository.findOne.mockResolvedValue(cursorUser);

      const queryBuilder = mockRepository.createQueryBuilder();
      queryBuilder.getMany.mockResolvedValue(mockUsers.slice(1));

      await service.findAllCursorPaginated(
        '1',
        10,
        SortField.CREATED_AT,
        SortOrder.DESC,
      );

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        '(user.createdAt < :cursorValue OR (user.createdAt = :cursorValue AND user.id < :cursorId))',
        {
          cursorValue: cursorUser.createdAt,
          cursorId: '1',
        },
      );
    });

    it('should apply cursor-based pagination with ASC sort order', async () => {
      const cursorUser = mockUsers[0];
      mockRepository.findOne.mockResolvedValue(cursorUser);

      const queryBuilder = mockRepository.createQueryBuilder();
      queryBuilder.getMany.mockResolvedValue(mockUsers.slice(1));

      await service.findAllCursorPaginated(
        '1',
        10,
        SortField.FIRST_NAME,
        SortOrder.ASC,
      );

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        '(user.firstName > :cursorValue OR (user.firstName = :cursorValue AND user.id > :cursorId))',
        {
          cursorValue: cursorUser.firstName,
          cursorId: '1',
        },
      );
    });

    it('should handle cursor with email sorting in DESC order', async () => {
      const cursorUser = mockUsers[1];
      mockRepository.findOne.mockResolvedValue(cursorUser);

      const queryBuilder = mockRepository.createQueryBuilder();
      queryBuilder.getMany.mockResolvedValue([mockUsers[0]]);

      await service.findAllCursorPaginated(
        '2',
        10,
        SortField.EMAIL,
        SortOrder.DESC,
      );

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        '(user.email < :cursorValue OR (user.email = :cursorValue AND user.id < :cursorId))',
        {
          cursorValue: cursorUser.email,
          cursorId: '2',
        },
      );
    });

    it('should indicate hasMore when results exceed limit', async () => {
      const queryBuilder = mockRepository.createQueryBuilder();
      // Return limit + 1 results to indicate more pages
      queryBuilder.getMany.mockResolvedValue(mockUsers);

      const result = await service.findAllCursorPaginated(undefined, 2);

      expect(result.meta.hasMore).toBe(true);
      expect(result.data).toHaveLength(2); // Should slice to limit
      expect(result.meta.nextCursor).toBe(mockUsers[1].id);
    });

    it('should indicate no more results when results equal or less than limit', async () => {
      const queryBuilder = mockRepository.createQueryBuilder();
      queryBuilder.getMany.mockResolvedValue(mockUsers.slice(0, 2));

      const result = await service.findAllCursorPaginated(undefined, 10);

      expect(result.meta.hasMore).toBe(false);
      expect(result.data).toHaveLength(2);
      expect(result.meta.nextCursor).toBeNull();
    });

    it('should not apply cursor filter when cursor user is not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const queryBuilder = mockRepository.createQueryBuilder();
      queryBuilder.getMany.mockResolvedValue(mockUsers);

      await service.findAllCursorPaginated('nonexistent', 10);

      expect(queryBuilder.andWhere).not.toHaveBeenCalled();
    });

    it('should handle empty results', async () => {
      const queryBuilder = mockRepository.createQueryBuilder();
      queryBuilder.getMany.mockResolvedValue([]);

      const result = await service.findAllCursorPaginated(undefined, 10);

      expect(result.data).toHaveLength(0);
      expect(result.meta.hasMore).toBe(false);
      expect(result.meta.nextCursor).toBeNull();
      expect(result.meta.count).toBe(0);
    });

    it('should filter by firstName', async () => {
      const queryBuilder = mockRepository.createQueryBuilder();
      queryBuilder.getMany.mockResolvedValue([mockUsers[0]]);

      await service.findAllCursorPaginated(
        undefined,
        10,
        SortField.CREATED_AT,
        SortOrder.DESC,
        { firstName: 'Alice' },
      );

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'LOWER(user.firstName) LIKE LOWER(:firstName)',
        { firstName: '%Alice%' },
      );
    });

    it('should filter by lastName', async () => {
      const queryBuilder = mockRepository.createQueryBuilder();
      queryBuilder.getMany.mockResolvedValue([mockUsers[1]]);

      await service.findAllCursorPaginated(
        undefined,
        10,
        SortField.CREATED_AT,
        SortOrder.DESC,
        { lastName: 'Brown' },
      );

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'LOWER(user.lastName) LIKE LOWER(:lastName)',
        { lastName: '%Brown%' },
      );
    });

    it('should filter by email', async () => {
      const queryBuilder = mockRepository.createQueryBuilder();
      queryBuilder.getMany.mockResolvedValue([mockUsers[0]]);

      await service.findAllCursorPaginated(
        undefined,
        10,
        SortField.CREATED_AT,
        SortOrder.DESC,
        { email: 'alice' },
      );

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'LOWER(user.email) LIKE LOWER(:email)',
        { email: '%alice%' },
      );
    });

    it('should apply multiple filters', async () => {
      const queryBuilder = mockRepository.createQueryBuilder();
      queryBuilder.getMany.mockResolvedValue([mockUsers[0]]);

      await service.findAllCursorPaginated(
        undefined,
        10,
        SortField.CREATED_AT,
        SortOrder.DESC,
        { firstName: 'Alice', lastName: 'Anderson', email: 'example' },
      );

      expect(queryBuilder.andWhere).toHaveBeenCalledTimes(3);
    });

    it('should combine filters with cursor pagination', async () => {
      const cursorUser = mockUsers[0];
      mockRepository.findOne.mockResolvedValue(cursorUser);
      const queryBuilder = mockRepository.createQueryBuilder();
      queryBuilder.getMany.mockResolvedValue([mockUsers[1]]);

      await service.findAllCursorPaginated(
        '1',
        10,
        SortField.CREATED_AT,
        SortOrder.DESC,
        { firstName: 'Bob' },
      );

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'LOWER(user.firstName) LIKE LOWER(:firstName)',
        { firstName: '%Bob%' },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('user.createdAt'),
        expect.any(Object),
      );
    });

    it('should search across email, firstName, and lastName when search parameter is provided', async () => {
      const queryBuilder = mockRepository.createQueryBuilder();
      queryBuilder.getMany.mockResolvedValue([mockUsers[0]]);

      await service.findAllCursorPaginated(
        undefined,
        10,
        SortField.CREATED_AT,
        SortOrder.DESC,
        { search: 'alice' },
      );

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        '(LOWER(user.email) LIKE LOWER(:search) OR LOWER(user.firstName) LIKE LOWER(:search) OR LOWER(user.lastName) LIKE LOWER(:search))',
        { search: '%alice%' },
      );
    });

    it('should ignore individual filters when search parameter is provided', async () => {
      const queryBuilder = mockRepository.createQueryBuilder();
      queryBuilder.getMany.mockResolvedValue([mockUsers[0]]);

      await service.findAllCursorPaginated(
        undefined,
        10,
        SortField.CREATED_AT,
        SortOrder.DESC,
        {
          search: 'alice',
          firstName: 'Bob',
          lastName: 'Brown',
          email: 'test',
        },
      );

      // Should only call andWhere once with the search query
      expect(queryBuilder.andWhere).toHaveBeenCalledTimes(1);
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        '(LOWER(user.email) LIKE LOWER(:search) OR LOWER(user.firstName) LIKE LOWER(:search) OR LOWER(user.lastName) LIKE LOWER(:search))',
        { search: '%alice%' },
      );
    });

    it('should combine search with cursor pagination', async () => {
      const cursorUser = mockUsers[0];
      mockRepository.findOne.mockResolvedValue(cursorUser);
      const queryBuilder = mockRepository.createQueryBuilder();
      queryBuilder.getMany.mockResolvedValue([mockUsers[1]]);

      await service.findAllCursorPaginated(
        '1',
        10,
        SortField.CREATED_AT,
        SortOrder.DESC,
        { search: 'bob' },
      );

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        '(LOWER(user.email) LIKE LOWER(:search) OR LOWER(user.firstName) LIKE LOWER(:search) OR LOWER(user.lastName) LIKE LOWER(:search))',
        { search: '%bob%' },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('user.createdAt'),
        expect.any(Object),
      );
    });

    it('should handle case-insensitive search', async () => {
      const queryBuilder = mockRepository.createQueryBuilder();
      queryBuilder.getMany.mockResolvedValue([mockUsers[0]]);

      await service.findAllCursorPaginated(
        undefined,
        10,
        SortField.CREATED_AT,
        SortOrder.DESC,
        { search: 'ALICE' },
      );

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        '(LOWER(user.email) LIKE LOWER(:search) OR LOWER(user.firstName) LIKE LOWER(:search) OR LOWER(user.lastName) LIKE LOWER(:search))',
        { search: '%ALICE%' },
      );
    });
  });

  describe('create', () => {
    it('should create a user with default USER role', async () => {
      const createUserDto = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123',
        birthdate: '1990-01-01',
      };

      const savedUser = {
        ...mockUsers[0],
        ...createUserDto,
        role: Role.USER,
      };
      mockRepository.create.mockReturnValue(savedUser);
      mockRepository.save.mockResolvedValue(savedUser);

      const result = await service.create(createUserDto);

      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(savedUser);
      expect(result.role).toBe(Role.USER);
    });

    it('should create a user with specified role', async () => {
      const createUserDto = {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'password123',
        birthdate: '1990-01-01',
        role: Role.ADMIN,
      };

      const savedUser = {
        ...mockUsers[0],
        ...createUserDto,
        role: Role.ADMIN,
      };
      mockRepository.create.mockReturnValue(savedUser);
      mockRepository.save.mockResolvedValue(savedUser);

      const result = await service.create(createUserDto);

      expect(result.role).toBe(Role.ADMIN);
    });
  });

  describe('update', () => {
    it('should update a user and return the updated user', async () => {
      const updateUserDto = {
        firstName: 'Updated',
        lastName: 'Name',
      };
      const updatedUser = { ...mockUsers[0], ...updateUserDto };

      mockRepository.findOne
        .mockResolvedValueOnce(mockUsers[0]) // First call for checking existence
        .mockResolvedValueOnce(updatedUser); // Second call after update

      mockRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.update('1', updateUserDto);

      expect(mockRepository.update).toHaveBeenCalledWith('1', {
        ...updateUserDto,
      });
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { firstName: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle birthdate conversion', async () => {
      const updateUserDto = {
        birthdate: '1995-05-15',
      };
      const updatedUser = {
        ...mockUsers[0],
        birthdate: new Date('1995-05-15'),
      };

      mockRepository.findOne
        .mockResolvedValueOnce(mockUsers[0])
        .mockResolvedValueOnce(updatedUser);
      mockRepository.update.mockResolvedValue({ affected: 1 });

      await service.update('1', updateUserDto);

      expect(mockRepository.update).toHaveBeenCalledWith('1', {
        birthdate: new Date('1995-05-15'),
      });
    });
  });

  describe('updateRole', () => {
    it('should update user role', async () => {
      const updatedUser = { ...mockUsers[0], role: Role.ADMIN };

      mockRepository.findOne
        .mockResolvedValueOnce(mockUsers[0])
        .mockResolvedValueOnce(updatedUser);
      mockRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.updateRole('1', Role.ADMIN);

      expect(mockRepository.update).toHaveBeenCalledWith('1', {
        role: Role.ADMIN,
      });
      expect(result).toEqual(updatedUser);
    });

    it('should return null when user does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.updateRole('nonexistent', Role.ADMIN);

      expect(result).toBeNull();
    });
  });

  describe('findOne', () => {
    it('should find a user by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockUsers[0]);

      const result = await service.findOne('1');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(mockUsers[0]);
    });

    it('should return null when user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne('nonexistent');

      expect(result).toBeNull();
    });
  });
});
