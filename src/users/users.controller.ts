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
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateSelfDto } from './dto/update-self.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { BulkDeleteUsersDto } from './dto/bulk-delete-users.dto';
import { UserListQueryDto } from './dto/user-list-query.dto';
import { CursorPaginatedResponseDto } from './dto/cursor-paginated-response.dto';
import { User } from './entities/user.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from './enums/role.enum';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The user has been successfully created.',
    type: User,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - Admin role required',
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary:
      'Get all users with cursor-based pagination, sorting, and filtering (Admin only)',
    description:
      'Efficient pagination for large datasets. Use nextCursor from response for subsequent requests. Supports sorting by multiple fields and filtering by firstName, lastName, and email.',
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
  @ApiQuery({
    name: 'firstName',
    required: false,
    type: String,
    description: 'Filter by first name (partial match, case-insensitive)',
    example: 'John',
  })
  @ApiQuery({
    name: 'lastName',
    required: false,
    type: String,
    description: 'Filter by last name (partial match, case-insensitive)',
    example: 'Doe',
  })
  @ApiQuery({
    name: 'email',
    required: false,
    type: String,
    description: 'Filter by email (partial match, case-insensitive)',
    example: 'example.com',
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
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - Admin role required',
  })
  async findAll(
    @Query() queryDto: UserListQueryDto,
  ): Promise<CursorPaginatedResponseDto<User>> {
    const filters =
      queryDto.firstName || queryDto.lastName || queryDto.email
        ? {
            firstName: queryDto.firstName,
            lastName: queryDto.lastName,
            email: queryDto.email,
          }
        : undefined;

    return await this.usersService.findAllCursorPaginated(
      queryDto.cursor,
      queryDto.limit,
      queryDto.sortBy,
      queryDto.sortOrder,
      filters,
    );
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the current user.',
    type: User,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  getMe(@CurrentUser() user: User): User {
    return user;
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Get a user by ID (Admin only)',
    description:
      'Users can only view their own profile. Admins can view any user.',
  })
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
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - You can only view your own profile',
  })
  async findOne(@Param('id') id: string): Promise<User> {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  @Patch('me')
  @ApiOperation({
    summary: 'Update current user profile',
    description:
      'Users can update their own firstName, lastName, and birthdate',
  })
  @ApiBody({ type: UpdateSelfDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The user has been successfully updated.',
    type: User,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async updateMe(
    @CurrentUser() currentUser: User,
    @Body() updateSelfDto: UpdateSelfDto,
  ): Promise<User> {
    return await this.usersService.update(currentUser.id, updateSelfDto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Update a user (Admin only)',
    description: 'Admins can update any user field.',
  })
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
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing JWT token',
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

  @Delete('me')
  @ApiOperation({ summary: 'Delete current user account' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Your account has been successfully deleted.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async deleteMe(
    @CurrentUser() currentUser: User,
  ): Promise<{ message: string }> {
    const deleted = await this.usersService.remove(currentUser.id);
    if (!deleted) {
      throw new NotFoundException('User not found');
    }
    return { message: 'Your account has been deleted' };
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Delete a user (Admin only)',
    description: 'Admins can delete any user.',
  })
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
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - You can only delete your own account',
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
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Bulk delete users (Admin only)' })
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
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - Admin role required',
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

  @Patch(':id/role')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a user role (Admin only)' })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({ type: UpdateUserRoleDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The user role has been successfully updated.',
    type: User,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - Admin role required',
  })
  async updateRole(
    @Param('id') id: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ): Promise<User> {
    const user = await this.usersService.updateRole(id, updateUserRoleDto.role);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }
}
