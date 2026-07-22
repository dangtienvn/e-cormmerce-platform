const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding test accounts...');

  const rolesToSeed = ['admin', 'manager', 'customer'];
  
  for (const roleName of rolesToSeed) {
    await prisma.roles.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
  }

  const adminRole = await prisma.roles.findUnique({ where: { name: 'admin' } });
  const managerRole = await prisma.roles.findUnique({ where: { name: 'manager' } });
  const customerRole = await prisma.roles.findUnique({ where: { name: 'customer' } });

  const passwordHash = await bcrypt.hash('123456', 10);
  
  const accounts = [
    {
      email: 'admin@ecommerce.com',
      password: passwordHash,
      full_name: 'Super Admin',
      role_id: adminRole.id,
      phone: '0901234567'
    },
    {
      email: 'manager@ecommerce.com',
      password: passwordHash,
      full_name: 'Store Manager',
      role_id: managerRole.id,
      phone: '0911234567'
    },
    {
      email: 'customer@ecommerce.com',
      password: passwordHash,
      full_name: 'John Customer',
      role_id: customerRole.id,
      phone: '0921234567'
    }
  ];

  for (const account of accounts) {
    await prisma.users.upsert({
      where: { email: account.email },
      update: {
        password: account.password,
        full_name: account.full_name,
        role_id: account.role_id,
        phone: account.phone
      },
      create: {
        email: account.email,
        password: account.password,
        full_name: account.full_name,
        role_id: account.role_id,
        status: 'active',
        phone: account.phone
      }
    });
  }

  console.log('Seeding test accounts completed successfully!');
  console.log('--- Account Credentials ---');
  console.log('1. Admin: admin@ecommerce.com / 123456');
  console.log('2. Manager: manager@ecommerce.com / 123456');
  console.log('3. Customer: customer@ecommerce.com / 123456');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
