// Production-safe seed — runs with plain `node` (no tsx dependency).
// Idempotent: safe to run on every startup.
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database (production startup)...")

  const adminHash = await bcrypt.hash("Admin@1234!", 12)
  const admin = await prisma.user.upsert({
    where: { email: "admin@franchise-ready.ai" },
    update: {},
    create: {
      name: "مدير النظام",
      email: "admin@franchise-ready.ai",
      password: adminHash,
      role: "ADMIN",
    },
  })
  console.log("✅ Admin user ready:", admin.email)

  const userHash = await bcrypt.hash("Test@1234!", 12)
  const testUser = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      name: "محمد الاختبار",
      email: "test@example.com",
      mobile: "0501234567",
      password: userHash,
      role: "USER",
    },
  })
  console.log("✅ Test user ready:", testUser.email)

  const existingCredit = await prisma.projectCredit.findFirst({
    where: { userId: testUser.id, used: false },
  })
  if (!existingCredit) {
    await prisma.projectCredit.create({
      data: { userId: testUser.id, used: false },
    })
    console.log("✅ Free credit added for test user")
  }

  console.log("🎉 Seeding complete!")
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
