import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Role } from '../enums/role.enum';

@Entity('users')
// Composite index for admin queries (role + createdAt)
@Index('IDX_users_role_created_at', ['role', 'createdAt'])
// PostgreSQL can use leading columns)
@Index('IDX_users_created_at_id', ['createdAt', 'id'])
@Index('IDX_users_updated_at_id', ['updatedAt', 'id'])
@Index('IDX_users_first_name_id', ['firstName', 'id'])
@Index('IDX_users_last_name_id', ['lastName', 'id'])
@Index('IDX_users_email_id', ['email', 'id'])
@Index('IDX_users_birthdate_id', ['birthdate', 'id'])
export class User {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'The unique identifier of the user',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'John',
    description: 'The first name of the user',
  })
  @Column()
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'The last name of the user',
  })
  @Column()
  lastName: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'The email address of the user',
  })
  @Column({ unique: true })
  email: string;

  @ApiHideProperty()
  @Column()
  @Exclude()
  password: string;

  @ApiProperty({
    example: '1990-01-01',
    description: 'The birthdate of the user',
    type: String,
    format: 'date',
  })
  @Column({ type: 'date' })
  birthdate: Date;

  @ApiProperty({
    example: 'user',
    description: 'The role of the user',
    enum: Role,
    default: Role.USER,
  })
  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'The date the user was created',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'The date the user was last updated',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
