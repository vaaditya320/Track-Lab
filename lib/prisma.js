import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' 
      ? ['error']  // Only log errors in production
      : ['warn', 'error'],  // Log warnings and errors in development
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma; 