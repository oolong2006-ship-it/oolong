/**
 * NextAuth Configuration
 * Credentials provider with bcrypt password hashing.
 * JWT strategy with organizationId and role in token.
 */

import { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        organizationSlug: { label: 'Organization', type: 'text' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) {
          throw new Error('Invalid credentials format')
        }

        const { email, password } = parsed.data

        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            memberships: {
              where: { isActive: true },
              include: {
                organization: true,
              },
              orderBy: { createdAt: 'asc' },
              take: 1,
            },
          },
        })

        if (!user || !user.hashedPassword) {
          throw new Error('Invalid email or password')
        }

        if (!user.isActive) {
          throw new Error('Account is deactivated')
        }

        const isPasswordValid = await bcrypt.compare(password, user.hashedPassword)
        if (!isPasswordValid) {
          throw new Error('Invalid email or password')
        }

        const membership = user.memberships[0]
        if (!membership) {
          throw new Error('No organization membership found')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          organizationId: membership.organizationId,
          organizationName: membership.organization.name,
          role: membership.role,
          branchId: membership.branchId,
          isSuperAdmin: user.isSuperAdmin,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.organizationId = (user as never as { organizationId: string }).organizationId
        token.organizationName = (user as never as { organizationName: string }).organizationName
        token.role = (user as never as { role: string }).role
        token.branchId = (user as never as { branchId: string | null }).branchId
        token.isSuperAdmin = (user as never as { isSuperAdmin: boolean }).isSuperAdmin
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.organizationId = token.organizationId as string
        session.user.organizationName = token.organizationName as string
        session.user.role = token.role as string
        session.user.branchId = token.branchId as string | null
        session.user.isSuperAdmin = token.isSuperAdmin as boolean
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
