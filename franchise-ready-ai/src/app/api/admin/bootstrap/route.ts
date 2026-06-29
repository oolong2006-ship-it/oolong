import { NextRequest } from "next/server"
import { db } from "@/lib/db"

// One-time bootstrap endpoint to promote a specific account to ADMIN.
// Protected by a secret key. Safe to remove after first use.
const BOOTSTRAP_KEY = "fra-bootstrap-2026-x7k9"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get("key")
  const email = searchParams.get("email")?.trim().toLowerCase()

  if (key !== BOOTSTRAP_KEY) {
    return Response.json({ success: false, error: "غير مصرح" }, { status: 401 })
  }

  if (!email) {
    return Response.json(
      { success: false, error: "أضف البريد في الرابط: &email=بريدك" },
      { status: 400 }
    )
  }

  const user = await db.user.findUnique({ where: { email } })
  if (!user) {
    return Response.json(
      {
        success: false,
        error: `لا يوجد حساب بالبريد ${email}. سجّل حسابًا أولًا ثم افتح هذا الرابط.`,
      },
      { status: 404 }
    )
  }

  await db.user.update({ where: { email }, data: { role: "ADMIN" } })

  return Response.json({
    success: true,
    message: `تم ترقية ${email} إلى مدير بنجاح ✅ — افتح /admin الآن وسجّل الدخول.`,
  })
}
