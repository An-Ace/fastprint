import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({ datasourceUrl: process.env.DATABASE_URL });
const prisma$1 = prisma;

export { prisma$1 as p };
//# sourceMappingURL=index.mjs.map
