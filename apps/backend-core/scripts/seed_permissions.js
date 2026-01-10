const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed permissions...');

  // Các quyền (permissions) mẫu cho hệ thống
  const predefinedPermissions = [
    // Quản lý người dùng
    { name: 'view_users', description: 'Xem danh sách người dùng', module: 'users' },
    { name: 'create_user', description: 'Tạo người dùng mới', module: 'users' },
    { name: 'edit_user', description: 'Chỉnh sửa người dùng', module: 'users' },
    { name: 'delete_user', description: 'Xóa người dùng', module: 'users' },

    // Quản lý sản phẩm
    { name: 'view_products', description: 'Xem danh sách sản phẩm', module: 'products' },
    { name: 'create_product', description: 'Tạo sản phẩm mới', module: 'products' },
    { name: 'edit_product', description: 'Chỉnh sửa sản phẩm', module: 'products' },
    { name: 'delete_product', description: 'Xóa sản phẩm', module: 'products' },

    // Quản lý đơn hàng
    { name: 'view_orders', description: 'Xem danh sách đơn hàng', module: 'orders' },
    { name: 'edit_order', description: 'Chỉnh sửa trạng thái đơn hàng', module: 'orders' },
  ];

  // 1. Tạo các permissions nếu chưa có
  for (const perm of predefinedPermissions) {
    await prisma.permissions.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
  }
  console.log('Permissions seeded successfully.');

  // 2. Lấy tất cả các permissions
  const allPermissions = await prisma.permissions.findMany();

  // 3. Phân quyền cho Admin (Tất cả quyền)
  let adminRole = await prisma.roles.findUnique({ where: { name: 'admin' } });
  if (!adminRole) {
    adminRole = await prisma.roles.create({ data: { name: 'admin' } });
  }
  
  if (adminRole) {
    for (const perm of allPermissions) {
      await prisma.role_permissions.upsert({
        where: { role_id_permission_id: { role_id: adminRole.id, permission_id: perm.id } },
        update: {},
        create: { role_id: adminRole.id, permission_id: perm.id },
      });
    }
    console.log('Admin role permissions seeded.');
  }

  // 4. Phân quyền cho Editor (Chỉ được quản lý sản phẩm, đơn hàng và xem user)
  let editorRole = await prisma.roles.findUnique({ where: { name: 'editor' } });
  if (!editorRole) {
    editorRole = await prisma.roles.create({ data: { name: 'editor' } });
  }

  if (editorRole) {
    const editorPermissions = allPermissions.filter(p => 
      p.module === 'products' || 
      p.module === 'orders' || 
      p.name === 'view_users'
    );
    for (const perm of editorPermissions) {
      await prisma.role_permissions.upsert({
        where: { role_id_permission_id: { role_id: editorRole.id, permission_id: perm.id } },
        update: {},
        create: { role_id: editorRole.id, permission_id: perm.id },
      });
    }
    console.log('Editor role permissions seeded.');
  }

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
