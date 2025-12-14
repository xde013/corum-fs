import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateSelfDto } from './dto/update-self.dto';
import { CursorPaginatedResponseDto } from './dto/cursor-paginated-response.dto';
import { SortField, SortOrder } from './dto/cursor-pagination.dto';
import { User } from './entities/user.entity';
import { Role } from './enums/role.enum';
import { UserFiltersDto } from './dto/user-filters.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create({
      ...createUserDto,
      birthdate: new Date(createUserDto.birthdate),
      role: createUserDto.role || Role.USER,
    });
    return await this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findAllCursorPaginated(
    cursor?: string,
    limit: number = 10,
    sortBy: SortField = SortField.CREATED_AT,
    sortOrder: SortOrder = SortOrder.DESC,
    filters?: UserFiltersDto,
  ): Promise<CursorPaginatedResponseDto<User>> {
    // Check if there are more results
    const take = limit + 1;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .orderBy(`user.${sortBy}`, sortOrder)
      .addOrderBy('user.id', sortOrder)
      .take(take);

    // Apply filters
    if (filters) {
      // Unified search across email, firstName, and lastName
      if (filters.search) {
        queryBuilder.andWhere(
          '(LOWER(user.email) LIKE LOWER(:search) OR LOWER(user.firstName) LIKE LOWER(:search) OR LOWER(user.lastName) LIKE LOWER(:search))',
          {
            search: `%${filters.search}%`,
          },
        );
      } else {
        // Individual filters (only apply if search is not provided)
        if (filters.firstName) {
          queryBuilder.andWhere(
            'LOWER(user.firstName) LIKE LOWER(:firstName)',
            {
              firstName: `%${filters.firstName}%`,
            },
          );
        }
        if (filters.lastName) {
          queryBuilder.andWhere('LOWER(user.lastName) LIKE LOWER(:lastName)', {
            lastName: `%${filters.lastName}%`,
          });
        }
        if (filters.email) {
          queryBuilder.andWhere('LOWER(user.email) LIKE LOWER(:email)', {
            email: `%${filters.email}%`,
          });
        }
      }
    }

    // If cursor is provided, fetch records after that cursor
    if (cursor) {
      const cursorUser = await this.userRepository.findOne({
        where: { id: cursor },
      });

      if (cursorUser) {
        // Build the WHERE clause based on sort order and field
        const cursorValue = cursorUser[sortBy];
        const operator = sortOrder === SortOrder.DESC ? '<' : '>';

        // Handle ties in sortBy field by using id as tiebreaker
        queryBuilder.andWhere(
          `(user.${sortBy} ${operator} :cursorValue OR (user.${sortBy} = :cursorValue AND user.id ${operator} :cursorId))`,
          {
            cursorValue,
            cursorId: cursor,
          },
        );
      }
    }

    const results = await queryBuilder.getMany();
    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;

    return new CursorPaginatedResponseDto<User>(
      data,
      hasMore,
      limit,
      (user: User) => user.id,
    );
  }

  async findOne(id: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async findByResetToken(token: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { passwordResetToken: token },
    });
  }

  async updatePasswordResetToken(
    id: string,
    token: string | null,
    expires: Date | null,
  ): Promise<void> {
    await this.userRepository.update(id, {
      passwordResetToken: token ?? undefined,
      passwordResetExpires: expires ?? undefined,
    });
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto | UpdateSelfDto,
  ): Promise<User> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const updatedData = {
      ...updateUserDto,
      ...(updateUserDto.birthdate && {
        birthdate: new Date(updateUserDto.birthdate),
      }),
    };

    await this.userRepository.update(id, updatedData);
    const updatedUser = await this.findOne(id);
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found after update`);
    }
    return updatedUser;
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.userRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async bulkRemove(
    ids: string[],
  ): Promise<{ deleted: number; failed: string[] }> {
    if (!ids || ids.length === 0) {
      return { deleted: 0, failed: [] };
    }

    const result = await this.userRepository.delete(ids);
    const deletedCount = result.affected ?? 0;

    // Calculate which IDs failed to delete
    const failed: string[] = [];
    if (deletedCount < ids.length) {
      // Find which ones still exist
      const remainingUsers = await this.userRepository.find({
        where: ids.map((id) => ({ id })),
        select: ['id'],
      });
      failed.push(...remainingUsers.map((user) => user.id));
    }

    return {
      deleted: deletedCount,
      failed,
    };
  }

  async updateRole(id: string, role: Role): Promise<User | null> {
    const user = await this.findOne(id);
    if (!user) {
      return null;
    }

    await this.userRepository.update(id, { role });
    return await this.findOne(id);
  }
}
