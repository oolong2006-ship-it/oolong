import { PrismaClient } from '@prisma/client'

// Lazy singleton — PrismaClient is only constructed when first accessed,
// not at module evaluation time. This avoids build-time errors when
// DATABASE_URL / adapter is not configured.

const globalForPrisma = globalThis as unknown as {
  _prismaInstance: PrismaClient | undefined
}

function getPrisma(): PrismaClient {
  if (!globalForPrisma._prismaInstance) {
    globalForPrisma._prismaInstance = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    })
  }
  return globalForPrisma._prismaInstance
}

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return getPrisma()[prop as keyof PrismaClient]
  },
})
