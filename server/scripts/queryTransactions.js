const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async ()=> {
  try {
    const tx = await prisma.transaction.findMany({ orderBy: { createdAt: 'desc' } });
    console.log('TRANSACTIONS:', JSON.stringify(tx, null, 2));
    const count = await prisma.transaction.count();
    console.log('COUNT:', count);
    const users = await prisma.user.findMany({ select: { id: true, email: true } });
    console.log('USERS:', JSON.stringify(users, null, 2));
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
