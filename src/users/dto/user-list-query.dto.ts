import { IntersectionType } from '@nestjs/swagger';
import { CursorPaginationDto } from './cursor-pagination.dto';
import { UserFiltersDto } from './user-filters.dto';

export class UserListQueryDto extends IntersectionType(
  CursorPaginationDto,
  UserFiltersDto,
) {}
