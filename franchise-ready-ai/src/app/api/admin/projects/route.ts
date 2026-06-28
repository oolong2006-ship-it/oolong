import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"

type ProjectStatus = "draft" | "data_completed" | "ai_generated" | "preview_ready" | "final_issued" | "locked"
const VALID_STATUSES: ProjectStatus[] = [
  "draft",
  "data_completed",
  "ai_generated",
  "preview_ready",
  "final_issued",
  "locked",
]

async function requireAdmin() {
  const session = await getSession()
  if (!session) return { error: "غير مصرح", status: 401 }
  if (session.role !== "ADMIN") return { error: "ممنوع — صلاحيات مدير مطلوبة", status: 403 }
  return { session }
}

// GET /api/admin/projects — list all projects with user info
export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
    const limit = Math.min(100, parseInt(searchParams.get("limit") ?? "20", 10))
    const statusParam = searchParams.get("status")

    const where = {
      ...(statusParam && VALID_STATUSES.includes(statusParam as ProjectStatus)
        ? { status: statusParam as ProjectStatus }
        : {}),
    }

    const [projects, total] = await Promise.all([
      db.establishment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { name: true, email: true } },
          reports: {
            where: { isFinal: true },
            orderBy: { generatedAt: "desc" },
            take: 1,
            select: { readinessScore: true, publicUrl: true },
          },
        },
      }),
      db.establishment.count({ where }),
    ])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapped = projects.map((e: any) => ({
      id: e.id,
      nameAr: e.nameAr,
      nameEn: e.nameEn,
      activityType: e.activityType,
      city: e.city,
      status: e.status,
      dataCompletion: e.dataCompletion,
      readinessScore: e.reports[0]?.readinessScore ?? null,
      reportUrl: e.reports[0]?.publicUrl ?? null,
      userId: e.userId,
      userName: e.user.name,
      userEmail: e.user.email,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
    }))

    return NextResponse.json({
      projects: mapped,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("[admin/projects GET] error:", error)
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 })
  }
}

// PATCH /api/admin/projects?projectId=xxx — lock/unlock or update status
export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin()
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("projectId")
    if (!projectId) {
      return NextResponse.json({ error: "projectId مطلوب" }, { status: 400 })
    }

    const body = await request.json() as { status?: string }

    const project = await db.establishment.findUnique({ where: { id: projectId } })
    if (!project) {
      return NextResponse.json({ error: "المشروع غير موجود" }, { status: 404 })
    }

    if (body.status) {
      if (!VALID_STATUSES.includes(body.status as ProjectStatus)) {
        return NextResponse.json({ error: "حالة غير صالحة" }, { status: 400 })
      }
      const updateData: Record<string, unknown> = { status: body.status }
      if (body.status === "locked") {
        updateData.lockedAt = new Date()
      } else if (body.status === "final_issued") {
        updateData.finalIssuedAt = new Date()
      }
      await db.establishment.update({
        where: { id: projectId },
        data: updateData,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[admin/projects PATCH] error:", error)
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 })
  }
}
