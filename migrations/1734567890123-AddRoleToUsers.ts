import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddRoleToUsers1734567890123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type if it doesn't exist
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "users_role_enum" AS ENUM('user', 'admin');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Add role column
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'role',
        type: 'enum',
        enumName: 'users_role_enum',
        default: "'user'",
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'role');
    await queryRunner.query(`DROP TYPE IF EXISTS "users_role_enum"`);
  }
}

