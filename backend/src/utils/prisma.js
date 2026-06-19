import { PrismaClient } from '@prisma/client';

// Singleton pattern: reuse the same instance across hot-reloads in development.
// In production, global.__prisma is always undefined (new process each time).
const prisma = global.__prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

export default prisma;
