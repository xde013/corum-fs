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
  HttpCode,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { BulkDeleteUsersDto } from './dto/bulk-delete-users.dto';
import { CursorPaginationDto } from './dto/cursor-pagination.dto';
import { CursorPaginatedResponseDto } from './dto/cursor-paginated-response.dto';
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
  @ApiOperation({
    summary: 'Get all users with cursor-based pagination and sorting',
    description:
      'Efficient pagination for large datasets. Use nextCursor from response for subsequent requests. Supports sorting by multiple fields.',
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    type: String,
    description: 'Cursor (user ID) to start from. Omit for first page.',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items to return (max 100)',
    example: 10,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: [
      'createdAt',
      'updatedAt',
      'firstName',
      'lastName',
      'email',
      'birthdate',
    ],
    description: 'Field to sort by',
    example: 'createdAt',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['ASC', 'DESC'],
    description: 'Sort order',
    example: 'DESC',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns cursor-paginated users.',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/User' },
        },
        meta: {
          type: 'object',
          properties: {
            nextCursor: {
              type: 'string',
              nullable: true,
              example: '550e8400-e29b-41d4-a716-446655440001',
              description: 'Use this cursor for the next request',
            },
            hasMore: {
              type: 'boolean',
              example: true,
              description: 'Whether more items are available',
            },
            count: {
              type: 'number',
              example: 10,
              description: 'Number of items in this response',
            },
            limit: {
              type: 'number',
              example: 10,
              description: 'Requested limit',
            },
          },
        },
      },
    },
  })
  async findAll(
    @Query() paginationDto: CursorPaginationDto,
  ): Promise<CursorPaginatedResponseDto<User>> {
    return await this.usersService.findAllCursorPaginated(
      paginationDto.cursor,
      paginationDto.limit,
      paginationDto.sortBy,
      paginationDto.sortOrder,
    );
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

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk delete users' })
  @ApiBody({ type: BulkDeleteUsersDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Users have been bulk deleted.',
    schema: {
      type: 'object',
      properties: {
        deleted: {
          type: 'number',
          example: 5,
          description: 'Number of users successfully deleted',
        },
        failed: {
          type: 'array',
          items: { type: 'string' },
          example: ['550e8400-e29b-41d4-a716-446655440000'],
          description: 'Array of user IDs that failed to delete',
        },
        message: {
          type: 'string',
          example: 'Successfully deleted 5 user(s)',
        },
      },
    },
  })
  async bulkRemove(
    @Body() bulkDeleteUsersDto: BulkDeleteUsersDto,
  ): Promise<{ deleted: number; failed: string[]; message: string }> {
    const result = await this.usersService.bulkRemove(bulkDeleteUsersDto.ids);
    return {
      ...result,
      message: `Successfully deleted ${result.deleted} user(s)`,
    };
  }
}
