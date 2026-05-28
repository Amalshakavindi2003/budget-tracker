const {PrismaClient} = require('@prisma/client');
const p = new PrismaClient();
(async ()=>{
  try{
    await p.$connect();
    const c = await p.user.count();
    console.log('CONNECTED users=', c);
  } catch(e){
    console.error('CLIENT_ERROR:', e);
    process.exitCode = 1;
  } finally{
    await p.$disconnect();
  }
})();
