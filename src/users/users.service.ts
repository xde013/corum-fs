import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
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
