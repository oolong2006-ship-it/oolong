import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { getSessionTokenFromRequest, verifyToken } from "@/lib/auth"
import { uploadFile, deleteFile } from "@/lib/storage"

const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25 MB

// Allowed MIME types per file type key
const ALLOWED_TYPES: Record<string, string[]> = {
  logo: ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"],
  cr: ["application/pdf", "image/jpeg", "image/jpg", "image/png"],
  trademark: ["application/pdf"],
  license: ["application/pdf"],
  menu: [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "text/csv",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  financial: [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "text/csv",
  ],
  suppliers: [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "text/csv",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  sop: [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  products: ["image/jpeg", "image/jpg", "image/png"],
  branches: ["image/jpeg", "image/jpg", "image/png"],
  pos_export: [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "text/csv",
  ],
}

// ─── Auth Helper ─────────────────────────────────────────────────────────────

async function getAuthenticatedUser(request: NextRequest) {
  const token = getSessionTokenFromRequest(request)
  if (!token) return null
  const payload = verifyToken(token)
  if (!payload) return null
  const session = await db.session.findUnique({
    where: { id: payload.sessionId },
    include: { user: true },
  })
  if (!session || session.expiresAt < new Date()) return null
  if (session.user.deletedAt) return null
  return session.user
}

// ─── GET: List uploaded files ─────────────────────────────────────────────────

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return Response.json({ success: false, error: "غير مصرح" }, { status: 401 })
    }

    const { id } = await params

    const establishment = await db.establishment.findUnique({ where: { id } })
    if (!establishment) {
      return Response.json({ success: false, error: "المشروع غير موجود" }, { status: 404 })
    }

    if (establishment.userId !== user.id && user.role !== "ADMIN") {
      return Response.json({ success: false, error: "غير مصرح" }, { status: 403 })
    }

    const files = await db.uploadedFile.findMany({
      where: { establishmentId: id },
      orderBy: { createdAt: "asc" },
    })

    return Response.json({ success: true, files })
  } catch (error) {
    console.error("[files GET]", error)
    return Response.json({ success: false, error: "حدث خطأ في الخادم" }, { status: 500 })
  }
}

// ─── POST: Upload a file ──────────────────────────────────────────────────────

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return Response.json({ success: false, error: "غير مصرح" }, { status: 401 })
    }

    const { id } = await params

    const establishment = await db.establishment.findUnique({ where: { id } })
    if (!establishment) {
      return Response.json({ success: false, error: "المشروع غير موجود" }, { status: 404 })
    }

    if (establishment.userId !== user.id && user.role !== "ADMIN") {
      return Response.json({ success: false, error: "غير مصرح" }, { status: 403 })
    }

    let formData: FormData
    try {
      formData = await request.formData()
    } catch {
      return Response.json(
        { success: false, error: "تعذّر قراءة البيانات المرفقة" },
        { status: 400 }
      )
    }

    const fileType = formData.get("fileType")
    const file = formData.get("file")

    if (!fileType || typeof fileType !== "string") {
      return Response.json({ success: false, error: "نوع الملف مطلوب" }, { status: 400 })
    }

    if (!file || !(file instanceof File)) {
      return Response.json({ success: false, error: "الملف مطلوب" }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return Response.json(
        {
          success: false,
          error: `حجم الملف يتجاوز الحد الأقصى (${MAX_FILE_SIZE / 1024 / 1024} ميجابايت)`,
        },
        { status: 400 }
      )
    }

    // Validate MIME type
    const allowedMimes = ALLOWED_TYPES[fileType]
    if (!allowedMimes) {
      return Response.json({ success: false, error: "نوع الملف غير معروف" }, { status: 400 })
    }

    if (!allowedMimes.includes(file.type)) {
      return Response.json(
        {
          success: false,
          error: `نوع الملف غير مسموح به. الأنواع المقبولة: ${allowedMimes.join(", ")}`,
        },
        { status: 400 }
      )
    }

    // Map UI file type key to storage FileType
    // We store everything that isn't a standard FileType enum as "other"
    const storageFileTypeMap: Record<string, "commercial_register" | "trademark_certificate" | "financial_statements" | "menu_pricelist" | "brand_assets" | "other"> = {
      logo: "brand_assets",
      cr: "commercial_register",
      trademark: "trademark_certificate",
      license: "other",
      menu: "menu_pricelist",
      financial: "financial_statements",
      suppliers: "other",
      sop: "other",
      products: "brand_assets",
      branches: "brand_assets",
      pos_export: "financial_statements",
    }

    const storageFileType = storageFileTypeMap[fileType] ?? "other"

    const result = await uploadFile({
      establishmentId: id,
      fileType: storageFileType,
      file,
      fileName: file.name,
      mimeType: file.type,
    })

    // Also store the UI-level fileType in the DB record by updating the fileType field
    // The uploadFile creates the record; we patch the fileType to the UI key for retrieval
    await db.uploadedFile.update({
      where: { id: result.fileId },
      data: { fileType },
    })

    return Response.json({
      success: true,
      fileId: result.fileId,
      url: result.publicUrl,
    })
  } catch (error) {
    console.error("[files POST]", error)
    return Response.json({ success: false, error: "حدث خطأ في الخادم" }, { status: 500 })
  }
}

// ─── DELETE: Delete a file ────────────────────────────────────────────────────

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return Response.json({ success: false, error: "غير مصرح" }, { status: 401 })
    }

    const { id } = await params

    const establishment = await db.establishment.findUnique({ where: { id } })
    if (!establishment) {
      return Response.json({ success: false, error: "المشروع غير موجود" }, { status: 404 })
    }

    if (establishment.userId !== user.id && user.role !== "ADMIN") {
      return Response.json({ success: false, error: "غير مصرح" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get("fileId")

    if (!fileId) {
      return Response.json({ success: false, error: "معرّف الملف مطلوب" }, { status: 400 })
    }

    // Verify file belongs to this establishment
    const uploadedFile = await db.uploadedFile.findUnique({ where: { id: fileId } })
    if (!uploadedFile || uploadedFile.establishmentId !== id) {
      return Response.json({ success: false, error: "الملف غير موجود" }, { status: 404 })
    }

    await deleteFile(fileId)

    return Response.json({ success: true })
  } catch (error) {
    console.error("[files DELETE]", error)
    return Response.json({ success: false, error: "حدث خطأ في الخادم" }, { status: 500 })
  }
}
