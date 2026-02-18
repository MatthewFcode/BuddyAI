// prismaClient.ts
import { PrismaClient } from '@prisma/client'
import path from 'path'

// prevent multiple instances in dev
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'error'],
    engine: {
      type: 'binary', // forces Prisma to use local SQLite binary engine
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
