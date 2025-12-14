import { PartialType, PickType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateSelfDto extends PartialType(
  PickType(CreateUserDto, ['firstName', 'lastName', 'birthdate'] as const),
) {}
