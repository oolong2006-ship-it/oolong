import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import type { User } from "@prisma/client";

const SALT_ROUNDS = 12;
const TOKEN_EXPIRY = "30d";
const COOKIE_NAME = "session_token";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  sessionId: string;
}

export function createToken(payload: TokenPayload): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET environment variable is not set");

  return jwt.sign(payload, secret, {
    expiresIn: TOKEN_EXPIRY,
    issuer: "franchise-ready-ai",
    audience: "franchise-ready-ai-users",
  });
}

export function verifyToken(token: string): TokenPayload | null {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET environment variable is not set");

  try {
    const payload = jwt.verify(token, secret, {
      issuer: "franchise-ready-ai",
      audience: "franchise-ready-ai-users",
    }) as TokenPayload;
    return payload;
  } catch {
    return null;
  }
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  sessionId: string;
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  // Verify session still exists in DB
  const session = await db.session.findUnique({
    where: { id: payload.sessionId },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await db.session.delete({ where: { id: session.id } });
    }
    return null;
  }

  if (session.user.deletedAt) return null;

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role,
    sessionId: session.id,
  };
}

export async function createSession(user: User): Promise<string> {
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  // Create session record in DB
  const session = await db.session.create({
    data: {
      userId: user.id,
      token: crypto.randomUUID(),
      expiresAt,
    },
  });

  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    sessionId: session.id,
  };

  const token = createToken(payload);

  // Set cookie
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });

  return token;
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      await db.session
        .delete({ where: { id: payload.sessionId } })
        .catch(() => {});
    }
  }

  cookieStore.delete(COOKIE_NAME);
}

export function getSessionTokenFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((c) => c.trim());
  const sessionCookie = cookies.find((c) =>
    c.startsWith(`${COOKIE_NAME}=`)
  );
  if (!sessionCookie) return null;

  return sessionCookie.slice(COOKIE_NAME.length + 1);
}
