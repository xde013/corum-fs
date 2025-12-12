import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CursorPaginatedResponseDto } from './dto/cursor-paginated-response.dto';
import { User } from './entities/user.entity';
import { USER_REPOSITORY } from './users.constants';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create({
      ...createUserDto,
      birthdate: new Date(createUserDto.birthdate),
    });
    return await this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findAllCursorPaginated(
    cursor?: string,
    limit: number = 10,
  ): Promise<CursorPaginatedResponseDto<User>> {
    // Check if there are more results
    const take = limit + 1;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .orderBy('user.createdAt', 'DESC')
      .addOrderBy('user.id', 'DESC')
      .take(take);

    // If cursor is provided, fetch records after that cursor
    if (cursor) {
      const cursorUser = await this.userRepository.findOne({
        where: { id: cursor },
      });

      if (cursorUser) {
        // Use WHERE to handle ties in createdAt (rarely happens)
        // maintain consistent sort order (DESC, DESC)
        queryBuilder.where(
          '(user.createdAt < :cursorDate OR (user.createdAt = :cursorDate AND user.id < :cursorId))',
          {
            cursorDate: cursorUser.createdAt,
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

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    const user = await this.findOne(id);
    if (!user) {
      return null;
    }

    const updatedData = {
      ...updateUserDto,
      ...(updateUserDto.birthdate && {
        birthdate: new Date(updateUserDto.birthdate),
      }),
    };

    await this.userRepository.update(id, updatedData);
    return await this.findOne(id);
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
}
