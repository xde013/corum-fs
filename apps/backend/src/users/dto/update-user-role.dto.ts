import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from '../enums/role.enum';

export class UpdateUserRoleDto {
  @ApiProperty({
    example: 'admin',
    description: 'The new role for the user',
    enum: Role,
  })
  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;
}
