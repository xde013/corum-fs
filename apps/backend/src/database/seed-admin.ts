import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import { Role } from '../users/enums/role.enum';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

async function seedAdmin() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);
  const userRepository = app.get<Repository<User>>(getRepositoryToken(User));

  // Check if any admin exists
  const admins = await userRepository.find({
    where: { role: Role.ADMIN },
  });

  if (admins.length > 0) {
    console.log('Admin user(s) already exist. Skipping seed.');
    console.log(`Found ${admins.length} admin(s):`);
    admins.forEach((admin) => {
      console.log(`  - ${admin.email} (${admin.id})`);
    });
    await app.close();
    process.exit(0);
  }

  // Get admin credentials from environment variables
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123!';
  const adminFirstName = process.env.ADMIN_FIRST_NAME || 'Admin';
  const adminLastName = process.env.ADMIN_LAST_NAME || 'User';
  const adminBirthdate = process.env.ADMIN_BIRTHDATE || '1990-01-01';

  // Check if user with this email already exists
  const existingUser = await usersService.findByEmail(adminEmail);
  if (existingUser) {
    console.log(
      `User with email ${adminEmail} already exists. Updating to admin role...`,
    );
    await usersService.updateRole(existingUser.id, Role.ADMIN);
    console.log(`✓ User ${adminEmail} has been promoted to admin`);
    await app.close();
    process.exit(0);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  // Create admin user
  try {
    const admin = await usersService.create({
      firstName: adminFirstName,
      lastName: adminLastName,
      email: adminEmail,
      password: hashedPassword,
      birthdate: adminBirthdate,
      role: Role.ADMIN,
    });

    console.log('✓ First admin user created successfully!');
    console.log(`  Email: ${admin.email}`);
    console.log(`  ID: ${admin.id}`);
    console.log(`  Role: ${admin.role}`);
    console.log(
      '\n⚠️  IMPORTANT: Change the default password after first login!',
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('✗ Failed to create admin user:', errorMessage);
    await app.close();
    process.exit(1);
  }

  await app.close();
  process.exit(0);
}

void seedAdmin();
