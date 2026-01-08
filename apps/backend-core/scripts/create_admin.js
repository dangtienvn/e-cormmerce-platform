const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@example.com';
  
  // Create admin role if it doesn't exist
  let adminRole = await prisma.roles.findFirst({ where: { name: 'admin' } });
  if (!adminRole) {
    adminRole = await prisma.roles.create({ data: { name: 'admin' } });
  }

  const existingUser = await prisma.users.findFirst({ where: { email } });
  
  if (existingUser) {
    console.log('Admin user already exists');
    return;
  }

  const hashedPassword = await bcrypt.hash('password123', 10);
  
  await prisma.users.create({
    data: {
      email,
      password: hashedPassword,
      full_name: 'Admin User',
      role_id: adminRole.id
    }
  });
  
  console.log('Admin user created successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
