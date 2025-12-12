import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The user has been successfully created.',
    type: User,
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns all users.',
    type: [User],
  })
  async findAll(): Promise<User[]> {
    return await this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the user.',
    type: User,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found.',
  })
  async findOne(@Param('id') id: string): Promise<User> {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The user has been successfully updated.',
    type: User,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found.',
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.usersService.update(id, updateUserDto);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The user has been successfully deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found.',
  })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    const deleted = await this.usersService.remove(id);
    if (!deleted) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return { message: `User with ID ${id} has been deleted` };
  }
}
