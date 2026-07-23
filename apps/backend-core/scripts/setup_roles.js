(async () => {
  try {
    const { prisma } = require('../src/config/database');
    const roles = ['admin','editor','customer'];
    for (const name of roles) {
      const exists = await prisma.roles.findFirst({ where: { name } });
      if (!exists) {
        await prisma.roles.create({ data: { name } });
        console.log('Created role', name);
      } else {
        console.log('Role exists', name);
      }
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
