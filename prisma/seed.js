// File: prisma/seed.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { PrismaClient as PrismaClientForDB } from '@prisma/client';

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

// Initialize Prisma client with the connection pooler URL
const prisma = new PrismaClientForDB({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function main() {
  console.log("Starting the seeding process...");

  // Hash the admin password
  const password = await bcrypt.hash('Sti@2025!', 10);

  // Use upsert to create or update the admin user
  // This is idempotent, so it won't fail if the admin user already exists
  await prisma.user.upsert({
    where: { email: 'admin@helpdesk.com' },
    update: {},
    create: {
      email: 'admin@helpdesk.com',
      password,
      name: 'Super Admin',
      role: 'ADMIN',
      approved: true,
    },
  });

  console.log("✅ Admin user seeded successfully!");
}

main()
  .catch((e) => {
    console.error("An error occurred during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    // Disconnect from the database
    await prisma.$disconnect();
    console.log("Disconnected from the database.");
  });

