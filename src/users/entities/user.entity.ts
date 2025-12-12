import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
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

  @ApiProperty({
    example: 'hashed_password',
    description: 'The hashed password of the user',
  })
  @Column()
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
