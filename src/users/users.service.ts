import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private users: User[] = [];
  private currentId = 1;

  create(createUserDto: CreateUserDto): User {
    const user: User = {
      id: this.currentId++,
      ...createUserDto,
      birthdate: new Date(createUserDto.birthdate),
    };
    this.users.push(user);
    return user;
  }

  findAll(): User[] {
    return this.users;
  }

  findOne(id: number): User | undefined {
    return this.users.find((user) => user.id === id);
  }

  update(id: number, updateUserDto: UpdateUserDto): User | undefined {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      return undefined;
    }

    const updatedUser = {
      ...this.users[userIndex],
      ...updateUserDto,
      ...(updateUserDto.birthdate && {
        birthdate: new Date(updateUserDto.birthdate),
      }),
    };

    this.users[userIndex] = updatedUser;
    return updatedUser;
  }

  remove(id: number): boolean {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      return false;
    }

    this.users.splice(userIndex, 1);
    return true;
  }
}
