import { NextRequest } from "next/server"
import { Prisma } from "@prisma/client"
import { db } from "@/lib/db"
import { getSessionTokenFromRequest, verifyToken } from "@/lib/auth"
import { WIZARD_SECTIONS } from "@/lib/wizard-config"

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

// ─── Completion Calculator ────────────────────────────────────────────────────

function calculateCompletion(answers: Array<{ questionKey: string; answerValue: string | null; answerJson: unknown }>): number {
  const requiredQuestions = WIZARD_SECTIONS.flatMap((s) =>
    s.questions.filter((q) => q.required !== false).map((q) => q.key)
  )
  if (requiredQuestions.length === 0) return 0

  const answeredKeys = new Set(
    answers
      .filter((a) => {
        const val = a.answerJson ?? a.answerValue
        return val !== null && val !== undefined && val !== ""
      })
      .map((a) => a.questionKey)
  )

  const answered = requiredQuestions.filter((k) => answeredKeys.has(k)).length
  return Math.round((answered / requiredQuestions.length) * 100)
}

// ─── POST/PATCH: Save answers ─────────────────────────────────────────────────

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

    // Verify ownership
    const establishment = await db.establishment.findUnique({
      where: { id },
      include: { answers: true },
    })

    if (!establishment) {
      return Response.json({ success: false, error: "المشروع غير موجود" }, { status: 404 })
    }

    if (establishment.userId !== user.id && user.role !== "ADMIN") {
      return Response.json({ success: false, error: "غير مصرح" }, { status: 403 })
    }

    const body = await request.json() as { section: string; answers: Record<string, unknown> }
    const { section, answers } = body

    if (!section || typeof answers !== "object" || answers === null) {
      return Response.json(
        { success: false, error: "البيانات غير صالحة" },
        { status: 400 }
      )
    }

    // Validate section exists
    const sectionConfig = WIZARD_SECTIONS.find((s) => s.key === section)
    if (!sectionConfig) {
      return Response.json(
        { success: false, error: "القسم غير موجود" },
        { status: 400 }
      )
    }

    // Upsert each answer
    const upsertPromises = Object.entries(answers).map(([questionKey, value]) => {
      const isJson =
        typeof value === "boolean" || typeof value === "number" || value === null

      return db.questionnaireAnswer.upsert({
        where: {
          establishmentId_section_questionKey: {
            establishmentId: id,
            section,
            questionKey,
          },
        },
        create: {
          establishmentId: id,
          section,
          questionKey,
          answerValue: isJson ? null : String(value ?? ""),
          answerJson: isJson && value !== null && value !== undefined ? (value as Prisma.InputJsonValue) : Prisma.JsonNull,
          completedAt: new Date(),
        },
        update: {
          answerValue: isJson ? null : String(value ?? ""),
          answerJson: isJson && value !== null && value !== undefined ? (value as Prisma.InputJsonValue) : Prisma.JsonNull,
          completedAt: new Date(),
        },
      })
    })

    await Promise.all(upsertPromises)

    // Also update top-level Establishment fields for commonly used ones
    const fieldMap: Record<string, string> = {
      nameAr: "nameAr",
      nameEn: "nameEn",
      activityType: "activityType",
      city: "city",
      foundingYear: "foundingYear",
      branchCount: "branchCount",
      fullyOwned: "fullyOwned",
      trademarkReg: "trademarkReg",
      crNumber: "crNumber",
      descriptionAr: "descriptionAr",
      websiteUrl: "websiteUrl",
      instagramUrl: "instagramUrl",
      brandColors: "brandColors",
      uniquePoints: "uniquePoints",
      mainProducts: "mainProducts",
      bestSeller: "bestSeller",
      avgPrice: "avgPrice",
      hasDocRecipes: "hasDocRecipes",
      qualityReplicable: "qualityReplicable",
      targetCustomer: "targetCustomer",
      competitors: "competitors",
      expansionCities: "expansionCities",
      demandStrength: "demandStrength",
      seasonality: "seasonality",
      avgMonthlySales: "avgMonthlySales",
      avgDailyOrders: "avgDailyOrders",
      avgInvoiceValue: "avgInvoiceValue",
      cogs: "cogs",
      rent: "rent",
      salaries: "salaries",
      opExpenses: "opExpenses",
      netProfit: "netProfit",
      newBranchCost: "newBranchCost",
      paybackPeriod: "paybackPeriod",
      hasSOPs: "hasSOPs",
      hasPOS: "hasPOS",
      hasERP: "hasERP",
      hasOpsManual: "hasOpsManual",
      hasTrainingManual: "hasTrainingManual",
      qualityControl: "qualityControl",
      complaintProcess: "complaintProcess",
      hasInternalAudit: "hasInternalAudit",
      employeesPerBranch: "employeesPerBranch",
      orgStructure: "orgStructure",
      trainingDuration: "trainingDuration",
      hasInternalTrainer: "hasInternalTrainer",
      easyToReplicate: "easyToReplicate",
      mainSuppliers: "mainSuppliers",
      hasSupplierContracts: "hasSupplierContracts",
      hasMaterialSpecs: "hasMaterialSpecs",
      hasCentralKitchen: "hasCentralKitchen",
      hasCentralWarehouse: "hasCentralWarehouse",
      canMandateSuppliers: "canMandateSuppliers",
      franchiseWhy: "franchiseWhy",
      targetBranchCount: "targetBranchCount",
      expansionScope: "expansionScope",
      proposedFees: "proposedFees",
      proposedRoyalty: "proposedRoyalty",
      franchiseeSupport: "franchiseeSupport",
    }

    const establishmentUpdate: Record<string, unknown> = {}
    for (const [questionKey, value] of Object.entries(answers)) {
      if (fieldMap[questionKey]) {
        establishmentUpdate[fieldMap[questionKey]] = value
      }
    }

    // Re-fetch all answers to recalculate completion
    const allAnswers = await db.questionnaireAnswer.findMany({
      where: { establishmentId: id },
    })

    const completion = calculateCompletion(allAnswers)

    // Determine new status
    const allRequired = WIZARD_SECTIONS.flatMap((s) =>
      s.questions.filter((q) => q.required !== false).map((q) => q.key)
    )
    const answeredSet = new Set(
      allAnswers
        .filter((a: { questionKey: string; answerValue: string | null; answerJson: unknown }) => {
          const val = a.answerJson ?? a.answerValue
          return val !== null && val !== undefined && val !== ""
        })
        .map((a: { questionKey: string }) => a.questionKey)
    )
    const allComplete = allRequired.every((k) => answeredSet.has(k))

    const newStatus =
      allComplete && establishment.status === "draft" ? "data_completed" : establishment.status

    await db.establishment.update({
      where: { id },
      data: {
        ...establishmentUpdate,
        dataCompletion: completion,
        ...(newStatus !== establishment.status ? { status: newStatus } : {}),
        updatedAt: new Date(),
      },
    })

    return Response.json({ success: true, completion, status: newStatus })
  } catch (error) {
    console.error("[answers POST]", error)
    return Response.json(
      { success: false, error: "حدث خطأ في الخادم" },
      { status: 500 }
    )
  }
}

export { POST as PATCH }
