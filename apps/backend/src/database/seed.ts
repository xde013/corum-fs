import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';
import { Role } from '../users/enums/role.enum';
import { ConflictException } from '@nestjs/common';

// Celebrity first names for generating users
const FIRST_NAMES = [
  'Leonardo',
  'Emma',
  'Brad',
  'Scarlett',
  'Tom',
  'Jennifer',
  'Chris',
  'Angelina',
  'Robert',
  'Natalie',
  'Ryan',
  'Meryl',
  'Denzel',
  'Charlize',
  'Will',
  'Cate',
  'Matt',
  'Nicole',
  'Johnny',
  'Margot',
];

// Celebrity last names for generating users
const LAST_NAMES = [
  'DiCaprio',
  'Watson',
  'Pitt',
  'Johansson',
  'Hanks',
  'Lawrence',
  'Evans',
  'Jolie',
  'Downey',
  'Portman',
  'Reynolds',
  'Streep',
  'Washington',
  'Theron',
  'Smith',
  'Blanchett',
  'Damon',
  'Kidman',
  'Depp',
  'Robbie',
];

// Generate a random birthdate between 18 and 80 years ago
function getRandomBirthdate(): string {
  const now = new Date();
  const minAge = 18;
  const maxAge = 80;
  const randomAge = Math.floor(Math.random() * (maxAge - minAge + 1)) + minAge;
  const birthYear = now.getFullYear() - randomAge;
  const birthMonth = Math.floor(Math.random() * 12) + 1;
  const birthDay = Math.floor(Math.random() * 28) + 1; // Use 28 to avoid month-end issues
  return `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`;
}

// Generate a random email based on name
function generateEmail(
  firstName: string,
  lastName: string,
  index: number
): string {
  const base = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
  return `${base}${index > 0 ? index : ''}@example.com`;
}

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);
  const authService = app.get(AuthService);

  console.log('🌱 Starting database seeding...\n');

  try {
    // Seed admin user
    console.log('📝 Seeding admin user...');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123!';
    const adminFirstName = process.env.ADMIN_FIRST_NAME || 'Admin';
    const adminLastName = process.env.ADMIN_LAST_NAME || 'User';
    const adminBirthdate = process.env.ADMIN_BIRTHDATE || '1990-01-01';

    const existingAdmin = await usersService.findByEmail(adminEmail);
    if (existingAdmin) {
      if (existingAdmin.role !== Role.ADMIN) {
        await usersService.updateRole(existingAdmin.id, Role.ADMIN);
        console.log(`✓ User ${adminEmail} promoted to admin`);
      } else {
        console.log(`✓ Admin user already exists: ${adminEmail}`);
      }
    } else {
      try {
        // Register admin as regular user first, then promote to admin
        const result = await authService.register({
          firstName: adminFirstName,
          lastName: adminLastName,
          email: adminEmail,
          password: adminPassword,
          birthdate: adminBirthdate,
        });
        await usersService.updateRole(result.user.id, Role.ADMIN);
        console.log(
          `✓ Admin user created: ${result.user.email} (ID: ${result.user.id})`
        );
      } catch (error) {
        if (error instanceof ConflictException) {
          // User exists but wasn't found by findByEmail - try to promote
          const user = await usersService.findByEmail(adminEmail);
          if (user) {
            await usersService.updateRole(user.id, Role.ADMIN);
            console.log(`✓ User ${adminEmail} promoted to admin`);
          }
        } else {
          throw error;
        }
      }
    }

    // Seed regular users
    console.log('\n📝 Seeding regular users...');
    const numUsers = 20;
    const defaultPassword = 'Password123!';

    let createdCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < numUsers; i++) {
      const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
      const lastName = LAST_NAMES[i % LAST_NAMES.length];
      const email = generateEmail(firstName, lastName, i);
      const birthdate = getRandomBirthdate();

      try {
        const result = await authService.register({
          firstName,
          lastName,
          email,
          password: defaultPassword,
          birthdate,
        });
        createdCount++;
        console.log(
          `  ✓ Created user ${createdCount}/${numUsers}: ${result.user.email}`
        );
      } catch (error) {
        if (error instanceof ConflictException) {
          console.log(`  ⏭️  Skipping ${email} (already exists)`);
          skippedCount++;
        } else {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          console.error(`  ✗ Failed to create user ${email}: ${errorMessage}`);
        }
      }
    }

    console.log(`\n✅ Seeding completed!`);
    console.log(`   - Admin users: 1 (${adminEmail}:${adminPassword})`);
    console.log(`   - Regular users created: ${createdCount}`);
    console.log(`   - Regular users skipped: ${skippedCount}`);
    console.log(`\n⚠️  Default password for all users: ${defaultPassword}`);

    await app.close();
    process.exit(0);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('✗ Seeding failed:', errorMessage);
    await app.close();
    process.exit(1);
  }
}

void seed();
