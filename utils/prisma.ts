import { PrismaClient } from "../prisma/generated";
const prisma = new PrismaClient({datasourceUrl: process.env.DATABASE_URL})
export default prisma