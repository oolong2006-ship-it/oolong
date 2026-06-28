import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // Admin user
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
  console.log("✅ Admin user:", admin.email)

  // Test user
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
  console.log("✅ Test user:", testUser.email)

  // Give test user 1 free credit
  const existingCredit = await prisma.projectCredit.findFirst({
    where: { userId: testUser.id, used: false },
  })

  if (!existingCredit) {
    await prisma.projectCredit.create({
      data: {
        userId: testUser.id,
        used: false,
      },
    })
    console.log("✅ Free credit added for test user")
  }

  // Sample establishment for demo
  const existingEstablishment = await prisma.establishment.findFirst({
    where: { userId: testUser.id },
  })

  if (!existingEstablishment) {
    const credit = await prisma.projectCredit.findFirst({
      where: { userId: testUser.id, used: false },
    })

    if (credit) {
      await prisma.establishment.create({
        data: {
          userId: testUser.id,
          creditId: credit.id,
          status: "draft",
          dataCompletion: 0,
          nameAr: "مطعم الأصالة",
          activityType: "مطعم",
          city: "الرياض",
          country: "SA",
          foundingYear: 2019,
          branchCount: 3,
          fullyOwned: true,
          trademarkReg: false,
          descriptionAr: "مطعم متخصص في الأكلات الشعبية السعودية التراثية بأعلى معايير الجودة",
        },
      })

      await prisma.projectCredit.update({
        where: { id: credit.id },
        data: { used: true, usedAt: new Date() },
      })

      console.log("✅ Sample establishment created")
    }
  }

  console.log("\n🎉 Seeding complete!")
  console.log("\n📋 Login credentials:")
  console.log("  Admin: admin@franchise-ready.ai / Admin@1234!")
  console.log("  User:  test@example.com / Test@1234!")
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
