import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, mobile } = body as {
      name?: string;
      email?: string;
      password?: string;
      mobile?: string;
    };

    // Validate required fields
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "الاسم الكامل مطلوب." },
        { status: 400 }
      );
    }
    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { success: false, error: "البريد الإلكتروني مطلوب." },
        { status: 400 }
      );
    }
    const emailLower = email.toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLower)) {
      return NextResponse.json(
        { success: false, error: "صيغة البريد الإلكتروني غير صحيحة." },
        { status: 400 }
      );
    }
    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { success: false, error: "كلمة المرور مطلوبة." },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل." },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existing = await db.user.findUnique({
      where: { email: emailLower },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "البريد الإلكتروني مُسجَّل مسبقاً. يرجى تسجيل الدخول أو استخدام بريد آخر." },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await db.user.create({
      data: {
        name: name.trim(),
        email: emailLower,
        password: hashedPassword,
        mobile: mobile?.trim() ?? null,
      },
    });

    // Create session (sets cookie internally)
    await createSession(user);

    return NextResponse.json(
      {
        success: true,
        user: { id: user.id, name: user.name, email: user.email },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/auth/register]", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ داخلي في الخادم. يرجى المحاولة مجدداً." },
      { status: 500 }
    );
  }
}
