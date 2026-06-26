/**
 * Seed data for Restaurant Profit OS
 * Creates a demo organization with realistic data for a Saudi restaurant chain.
 * Run: npm run db:seed
 */

import { PrismaClient, UserRole, BranchType, StockMovementType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Restaurant Profit OS...')

  // ──────────────────────────────────────────────
  // Organization
  // ──────────────────────────────────────────────
  const org = await prisma.organization.upsert({
    where: { slug: 'demo-chain' },
    update: {},
    create: {
      name: 'Demo Restaurant Chain',
      nameAr: 'سلسلة المطاعم التجريبية',
      slug: 'demo-chain',
      country: 'SA',
      currency: 'SAR',
      vatRate: 0.15,
      timezone: 'Asia/Riyadh',
      fiscalYearStart: 1,
    },
  })
  console.log(`  ✓ Organization: ${org.nameAr}`)

  // ──────────────────────────────────────────────
  // Users
  // ──────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('Demo@1234', 12)

  const owner = await prisma.user.upsert({
    where: { email: 'owner@demo.sa' },
    update: {},
    create: {
      email: 'owner@demo.sa',
      name: 'Ahmad Al-Rashidi',
      nameAr: 'أحمد الراشدي',
      password: passwordHash,
      organizationId: org.id,
      role: UserRole.OWNER,
      isActive: true,
      emailVerified: new Date(),
    },
  })

  const cfo = await prisma.user.upsert({
    where: { email: 'cfo@demo.sa' },
    update: {},
    create: {
      email: 'cfo@demo.sa',
      name: 'Sara Al-Zahrani',
      nameAr: 'سارة الزهراني',
      password: passwordHash,
      organizationId: org.id,
      role: UserRole.CFO,
      isActive: true,
      emailVerified: new Date(),
    },
  })

  await prisma.user.upsert({
    where: { email: 'ops@demo.sa' },
    update: {},
    create: {
      email: 'ops@demo.sa',
      name: 'Faisal Al-Otaibi',
      nameAr: 'فيصل العتيبي',
      password: passwordHash,
      organizationId: org.id,
      role: UserRole.OPERATIONS_MANAGER,
      isActive: true,
      emailVerified: new Date(),
    },
  })

  await prisma.user.upsert({
    where: { email: 'procurement@demo.sa' },
    update: {},
    create: {
      email: 'procurement@demo.sa',
      name: 'Nora Al-Qahtani',
      nameAr: 'نورة القحطاني',
      password: passwordHash,
      organizationId: org.id,
      role: UserRole.PROCUREMENT_MANAGER,
      isActive: true,
      emailVerified: new Date(),
    },
  })

  await prisma.user.upsert({
    where: { email: 'viewer@demo.sa' },
    update: {},
    create: {
      email: 'viewer@demo.sa',
      name: 'Khalid Al-Shehri',
      nameAr: 'خالد الشهري',
      password: passwordHash,
      organizationId: org.id,
      role: UserRole.VIEWER,
      isActive: true,
      emailVerified: new Date(),
    },
  })

  console.log('  ✓ Users (5 accounts)')

  // ──────────────────────────────────────────────
  // Brand
  // ──────────────────────────────────────────────
  const brand = await prisma.restaurantBrand.upsert({
    where: { organizationId_name: { organizationId: org.id, name: 'Tasty Bites' } },
    update: {},
    create: {
      organizationId: org.id,
      name: 'Tasty Bites',
      nameAr: 'تيستي بايتس',
      cuisine: 'Saudi & International',
      cuisineAr: 'سعودي وعالمي',
    },
  })

  // ──────────────────────────────────────────────
  // Branches
  // ──────────────────────────────────────────────
  const branchData = [
    {
      name: 'Riyadh - Olaya',
      nameAr: 'الرياض - العليا',
      type: BranchType.DINE_IN,
      city: 'Riyadh',
      area: 'Olaya',
      seatingCapacity: 80,
    },
    {
      name: 'Riyadh - Malaz',
      nameAr: 'الرياض - الملز',
      type: BranchType.DINE_IN,
      city: 'Riyadh',
      area: 'Malaz',
      seatingCapacity: 60,
    },
    {
      name: 'Jeddah - Corniche',
      nameAr: 'جدة - الكورنيش',
      type: BranchType.DINE_IN,
      city: 'Jeddah',
      area: 'Corniche',
      seatingCapacity: 100,
    },
    {
      name: 'Cloud Kitchen - Riyadh',
      nameAr: 'المطبخ السحابي - الرياض',
      type: BranchType.CLOUD_KITCHEN,
      city: 'Riyadh',
      area: 'Industrial',
      seatingCapacity: 0,
    },
  ]

  const branches = await Promise.all(
    branchData.map((b) =>
      prisma.branch.upsert({
        where: { organizationId_name: { organizationId: org.id, name: b.name } },
        update: {},
        create: {
          organizationId: org.id,
          brandId: brand.id,
          ...b,
          isActive: true,
        },
      })
    )
  )
  console.log(`  ✓ Branches (${branches.length})`)

  // ──────────────────────────────────────────────
  // Warehouse
  // ──────────────────────────────────────────────
  const warehouse = await prisma.warehouse.upsert({
    where: { organizationId_name: { organizationId: org.id, name: 'Central Warehouse' } },
    update: {},
    create: {
      organizationId: org.id,
      name: 'Central Warehouse',
      nameAr: 'المستودع المركزي',
      city: 'Riyadh',
      isActive: true,
    },
  })

  // ──────────────────────────────────────────────
  // Units of Measure
  // ──────────────────────────────────────────────
  const uomData = [
    { name: 'Kilogram', nameAr: 'كيلوغرام', symbol: 'kg', isBase: true },
    { name: 'Gram', nameAr: 'غرام', symbol: 'g', isBase: false },
    { name: 'Liter', nameAr: 'لتر', symbol: 'L', isBase: true },
    { name: 'Milliliter', nameAr: 'مليلتر', symbol: 'mL', isBase: false },
    { name: 'Piece', nameAr: 'قطعة', symbol: 'pcs', isBase: true },
    { name: 'Box', nameAr: 'صندوق', symbol: 'box', isBase: false },
    { name: 'Bag', nameAr: 'كيس', symbol: 'bag', isBase: false },
  ]

  const uoms = await Promise.all(
    uomData.map((u) =>
      prisma.unitOfMeasure.upsert({
        where: { organizationId_symbol: { organizationId: org.id, symbol: u.symbol } },
        update: {},
        create: { organizationId: org.id, ...u },
      })
    )
  )
  const uomMap = Object.fromEntries(uoms.map((u) => [u.symbol, u]))
  console.log('  ✓ Units of Measure')

  // ──────────────────────────────────────────────
  // Suppliers
  // ──────────────────────────────────────────────
  const supplierData = [
    {
      name: 'Al-Marai',
      nameAr: 'المراعي',
      category: 'Dairy',
      contractRate: 0.03,
      rating: 4.8,
    },
    {
      name: 'Savola Foods',
      nameAr: 'سافولا',
      category: 'Oils & Fats',
      contractRate: 0.025,
      rating: 4.5,
    },
    {
      name: 'Saudi Fresh Farms',
      nameAr: 'المزارع السعودية',
      category: 'Produce',
      contractRate: 0.04,
      rating: 4.2,
    },
    {
      name: 'Al-Watania Poultry',
      nameAr: 'الوطنية للدواجن',
      category: 'Poultry',
      contractRate: 0.035,
      rating: 4.6,
    },
    {
      name: 'Nadec',
      nameAr: 'نادك',
      category: 'Dairy & Beverages',
      contractRate: 0.03,
      rating: 4.3,
    },
  ]

  const suppliers = await Promise.all(
    supplierData.map((s) =>
      prisma.supplier.upsert({
        where: { organizationId_name: { organizationId: org.id, name: s.name } },
        update: {},
        create: {
          organizationId: org.id,
          name: s.name,
          nameAr: s.nameAr,
          category: s.category,
          isActive: true,
          rating: s.rating,
          city: 'Riyadh',
          country: 'SA',
          currency: 'SAR',
          paymentTerms: 30,
          leadTimeDays: 3,
        },
      })
    )
  )
  console.log(`  ✓ Suppliers (${suppliers.length})`)

  // ──────────────────────────────────────────────
  // Inventory Items
  // ──────────────────────────────────────────────
  const inventoryData = [
    { name: 'Chicken Breast', nameAr: 'صدر دجاج', category: 'Poultry', unitSymbol: 'kg', cost: 22.5, reorder: 50 },
    { name: 'Whole Chicken', nameAr: 'دجاج كامل', category: 'Poultry', unitSymbol: 'kg', cost: 16, reorder: 30 },
    { name: 'Tomatoes', nameAr: 'طماطم', category: 'Produce', unitSymbol: 'kg', cost: 3.5, reorder: 20 },
    { name: 'Onions', nameAr: 'بصل', category: 'Produce', unitSymbol: 'kg', cost: 2.5, reorder: 15 },
    { name: 'Garlic', nameAr: 'ثوم', category: 'Produce', unitSymbol: 'kg', cost: 12, reorder: 5 },
    { name: 'Sunflower Oil', nameAr: 'زيت عباد الشمس', category: 'Oils', unitSymbol: 'L', cost: 8.5, reorder: 20 },
    { name: 'Flour (All Purpose)', nameAr: 'دقيق أبيض', category: 'Dry Goods', unitSymbol: 'kg', cost: 3, reorder: 50 },
    { name: 'Rice (Basmati)', nameAr: 'أرز بسمتي', category: 'Dry Goods', unitSymbol: 'kg', cost: 9, reorder: 40 },
    { name: 'Full Cream Milk', nameAr: 'حليب كامل الدسم', category: 'Dairy', unitSymbol: 'L', cost: 5.5, reorder: 30 },
    { name: 'Cheddar Cheese', nameAr: 'جبنة شيدر', category: 'Dairy', unitSymbol: 'kg', cost: 35, reorder: 10 },
    { name: 'Eggs', nameAr: 'بيض', category: 'Dairy', unitSymbol: 'pcs', cost: 0.75, reorder: 200 },
    { name: 'Salt', nameAr: 'ملح', category: 'Spices', unitSymbol: 'kg', cost: 1.5, reorder: 5 },
    { name: 'Black Pepper', nameAr: 'فلفل أسود', category: 'Spices', unitSymbol: 'kg', cost: 45, reorder: 2 },
    { name: 'Cumin', nameAr: 'كمون', category: 'Spices', unitSymbol: 'kg', cost: 30, reorder: 2 },
    { name: 'Takeaway Box (Large)', nameAr: 'علبة تيك أواي (كبير)', category: 'Packaging', unitSymbol: 'pcs', cost: 1.5, reorder: 500 },
    { name: 'Takeaway Box (Medium)', nameAr: 'علبة تيك أواي (متوسط)', category: 'Packaging', unitSymbol: 'pcs', cost: 1.0, reorder: 500 },
    { name: 'Paper Bag', nameAr: 'كيس ورقي', category: 'Packaging', unitSymbol: 'pcs', cost: 0.3, reorder: 1000 },
    { name: 'Plastic Cup (500ml)', nameAr: 'كوب بلاستيك 500 مل', category: 'Packaging', unitSymbol: 'pcs', cost: 0.25, reorder: 500 },
  ]

  const inventoryItems = await Promise.all(
    inventoryData.map((item) =>
      prisma.inventoryItem.upsert({
        where: { organizationId_name: { organizationId: org.id, name: item.name } },
        update: { lastCost: item.cost, averageCost: item.cost },
        create: {
          organizationId: org.id,
          name: item.name,
          nameAr: item.nameAr,
          category: item.category,
          unitId: uomMap[item.unitSymbol].id,
          purchaseUnitId: uomMap[item.unitSymbol].id,
          lastCost: item.cost,
          averageCost: item.cost,
          reorderPoint: item.reorder,
          isActive: true,
          isPerishable: ['Poultry', 'Produce', 'Dairy'].includes(item.category),
          trackInventory: true,
        },
      })
    )
  )
  const itemMap = Object.fromEntries(inventoryItems.map((i) => [i.name, i]))
  console.log(`  ✓ Inventory Items (${inventoryItems.length})`)

  // ──────────────────────────────────────────────
  // Menu Categories & Items
  // ──────────────────────────────────────────────
  const menuCatData = [
    { name: 'Grills', nameAr: 'المشويات', sortOrder: 1 },
    { name: 'Rice Dishes', nameAr: 'أطباق الأرز', sortOrder: 2 },
    { name: 'Sandwiches', nameAr: 'السندويشات', sortOrder: 3 },
    { name: 'Salads', nameAr: 'السلطات', sortOrder: 4 },
    { name: 'Beverages', nameAr: 'المشروبات', sortOrder: 5 },
    { name: 'Desserts', nameAr: 'الحلويات', sortOrder: 6 },
  ]

  const menuCategories = await Promise.all(
    menuCatData.map((c) =>
      prisma.menuCategory.upsert({
        where: { organizationId_name: { organizationId: org.id, name: c.name } },
        update: {},
        create: { organizationId: org.id, brandId: brand.id, ...c, isActive: true },
      })
    )
  )
  const catMap = Object.fromEntries(menuCategories.map((c) => [c.name, c]))

  const menuItemData = [
    { name: 'Grilled Chicken Platter', nameAr: 'طبق دجاج مشوي', catName: 'Grills', price: 65, foodCost: 18 },
    { name: 'Mixed Grill Plate', nameAr: 'طبق مشكل مشوي', catName: 'Grills', price: 95, foodCost: 28 },
    { name: 'Lamb Chops', nameAr: 'كستلتة ضأن', catName: 'Grills', price: 120, foodCost: 40 },
    { name: 'Chicken Kabsa', nameAr: 'كبسة دجاج', catName: 'Rice Dishes', price: 55, foodCost: 14 },
    { name: 'Lamb Mandi', nameAr: 'مندي لحم', catName: 'Rice Dishes', price: 75, foodCost: 22 },
    { name: 'Biryani Special', nameAr: 'برياني خاص', catName: 'Rice Dishes', price: 60, foodCost: 16 },
    { name: 'Chicken Shawarma', nameAr: 'شاورما دجاج', catName: 'Sandwiches', price: 22, foodCost: 5.5 },
    { name: 'Kofta Wrap', nameAr: 'راب كفتة', catName: 'Sandwiches', price: 25, foodCost: 6 },
    { name: 'Chicken Burger', nameAr: 'برجر دجاج', catName: 'Sandwiches', price: 35, foodCost: 9 },
    { name: 'Fattoush Salad', nameAr: 'سلطة فتوش', catName: 'Salads', price: 20, foodCost: 5 },
    { name: 'Caesar Salad', nameAr: 'سلطة سيزر', catName: 'Salads', price: 25, foodCost: 7 },
    { name: 'Lemon Mint Juice', nameAr: 'عصير ليمون بالنعنع', catName: 'Beverages', price: 15, foodCost: 3 },
    { name: 'Mango Juice', nameAr: 'عصير مانجو', catName: 'Beverages', price: 18, foodCost: 4 },
    { name: 'Umm Ali', nameAr: 'أم علي', catName: 'Desserts', price: 22, foodCost: 6 },
    { name: 'Kunafa', nameAr: 'كنافة', catName: 'Desserts', price: 28, foodCost: 8 },
  ]

  const menuItems = await Promise.all(
    menuItemData.map((item) =>
      prisma.menuItem.upsert({
        where: { organizationId_name: { organizationId: org.id, name: item.name } },
        update: {},
        create: {
          organizationId: org.id,
          brandId: brand.id,
          categoryId: catMap[item.catName].id,
          name: item.name,
          nameAr: item.nameAr,
          standardFoodCost: item.foodCost,
          isActive: true,
          isSoldOnDelivery: true,
          isSoldDineIn: true,
        },
      })
    )
  )
  console.log(`  ✓ Menu Items (${menuItems.length})`)

  // ──────────────────────────────────────────────
  // Sales Channels & Delivery Platforms
  // ──────────────────────────────────────────────
  const channelData = [
    { name: 'Dine In', nameAr: 'داخل المطعم', type: 'DINE_IN', commissionRate: 0 },
    { name: 'Talabat', nameAr: 'طلبات', type: 'DELIVERY_APP', commissionRate: 0.2 },
    { name: 'Hungerstation', nameAr: 'هنقرستيشن', type: 'DELIVERY_APP', commissionRate: 0.18 },
    { name: 'Jahez', nameAr: 'جاهز', type: 'DELIVERY_APP', commissionRate: 0.16 },
    { name: 'Direct Delivery', nameAr: 'توصيل مباشر', type: 'OWN_DELIVERY', commissionRate: 0.05 },
  ]

  await Promise.all(
    channelData.map((c) =>
      prisma.salesChannel.upsert({
        where: { organizationId_name: { organizationId: org.id, name: c.name } },
        update: {},
        create: {
          organizationId: org.id,
          name: c.name,
          nameAr: c.nameAr,
          type: c.type,
          commissionRate: c.commissionRate,
          isActive: true,
        },
      })
    )
  )

  const platformData = [
    { name: 'Talabat', nameAr: 'طلبات', commissionRate: 0.2, vatOnCommission: 0.15 },
    { name: 'Hungerstation', nameAr: 'هنقرستيشن', commissionRate: 0.18, vatOnCommission: 0.15 },
    { name: 'Jahez', nameAr: 'جاهز', commissionRate: 0.16, vatOnCommission: 0.15 },
  ]

  const platforms = await Promise.all(
    platformData.map((p) =>
      prisma.deliveryPlatform.upsert({
        where: { organizationId_name: { organizationId: org.id, name: p.name } },
        update: {},
        create: {
          organizationId: org.id,
          name: p.name,
          nameAr: p.nameAr,
          commissionRate: p.commissionRate,
          vatOnCommission: p.vatOnCommission,
          isActive: true,
        },
      })
    )
  )
  console.log('  ✓ Sales Channels & Delivery Platforms')

  // ──────────────────────────────────────────────
  // Sales Records (last 30 days, per branch)
  // ──────────────────────────────────────────────
  const today = new Date()
  const salesRecords = []

  const branchDailyTarget: Record<string, number> = {
    'Riyadh - Olaya': 8000,
    'Riyadh - Malaz': 6000,
    'Jeddah - Corniche': 10000,
    'Cloud Kitchen - Riyadh': 5000,
  }

  for (let d = 29; d >= 0; d--) {
    const date = new Date(today)
    date.setDate(today.getDate() - d)
    date.setHours(0, 0, 0, 0)

    for (const branch of branches) {
      const base = branchDailyTarget[branch.name] ?? 5000
      const variance = (Math.random() - 0.5) * 0.3
      const grossSales = Math.round(base * (1 + variance))
      const discounts = Math.round(grossSales * 0.05)
      const netSales = grossSales - discounts
      const vatAmount = Math.round(netSales * 0.15)
      const orderCount = Math.round(grossSales / 55)
      const foodCostTotal = Math.round(netSales * 0.28)
      const packagingCostTotal = Math.round(netSales * 0.03)

      salesRecords.push({
        organizationId: org.id,
        branchId: branch.id,
        saleDate: date,
        grossSales,
        discounts,
        netSales,
        vatAmount,
        orderCount,
        foodCostTotal,
        packagingCostTotal,
        source: 'SEED',
      })
    }
  }

  await prisma.salesRecord.createMany({ data: salesRecords, skipDuplicates: true })
  console.log(`  ✓ Sales Records (${salesRecords.length} days × branches)`)

  // ──────────────────────────────────────────────
  // Purchase Invoices (last 30 days)
  // ──────────────────────────────────────────────
  const purchaseItems = [
    { item: 'Chicken Breast', qty: 200, unitCost: 22.5 },
    { item: 'Whole Chicken', qty: 150, unitCost: 16 },
    { item: 'Rice (Basmati)', qty: 100, unitCost: 9 },
    { item: 'Tomatoes', qty: 80, unitCost: 3.5 },
    { item: 'Sunflower Oil', qty: 60, unitCost: 8.5 },
    { item: 'Flour (All Purpose)', qty: 120, unitCost: 3 },
    { item: 'Cheddar Cheese', qty: 20, unitCost: 35 },
    { item: 'Eggs', qty: 1000, unitCost: 0.75 },
  ]

  for (let week = 0; week < 4; week++) {
    const invoiceDate = new Date(today)
    invoiceDate.setDate(today.getDate() - week * 7 - 2)
    invoiceDate.setHours(0, 0, 0, 0)

    const supplier = suppliers[week % suppliers.length]
    const lineItems = purchaseItems.slice(week % 3, (week % 3) + 3)
    const totalAmount = lineItems.reduce((s, l) => s + l.qty * l.unitCost * (1 + Math.random() * 0.05), 0)

    const invoice = await prisma.purchaseInvoice.create({
      data: {
        organizationId: org.id,
        supplierId: supplier.id,
        branchId: branches[0].id,
        invoiceNumber: `INV-${2026}-${String(week + 1).padStart(4, '0')}`,
        invoiceDate,
        totalAmount: Math.round(totalAmount * 100) / 100,
        vatAmount: Math.round(totalAmount * 0.15 * 100) / 100,
        grandTotal: Math.round(totalAmount * 1.15 * 100) / 100,
        currency: 'SAR',
        status: 'APPROVED',
        paymentStatus: week < 2 ? 'PAID' : 'PENDING',
        isDuplicate: false,
        items: {
          create: lineItems.map((l) => {
            const actualCost = l.unitCost * (1 + (Math.random() - 0.5) * 0.05)
            return {
              organizationId: org.id,
              inventoryItemId: itemMap[l.item].id,
              unitId: itemMap[l.item].unitId,
              description: l.item,
              quantity: l.qty,
              unitCost: Math.round(actualCost * 100) / 100,
              contractPrice: l.unitCost,
              totalCost: Math.round(actualCost * l.qty * 100) / 100,
              priceVariance: Math.round((actualCost - l.unitCost) * l.qty * 100) / 100,
            }
          }),
        },
      },
    })

    // Stock movements for received items
    await prisma.stockMovement.createMany({
      data: lineItems.map((l) => ({
        organizationId: org.id,
        inventoryItemId: itemMap[l.item].id,
        warehouseId: warehouse.id,
        movementType: StockMovementType.PURCHASE_RECEIPT,
        quantity: l.qty,
        unitCost: l.unitCost,
        totalCost: l.qty * l.unitCost,
        movementDate: invoiceDate,
        referenceType: 'PURCHASE_INVOICE',
        referenceId: invoice.id,
        notes: `Receipt from ${supplier.name}`,
      })),
    })
  }
  console.log('  ✓ Purchase Invoices & Stock Movements')

  // ──────────────────────────────────────────────
  // Waste Records (last 14 days)
  // ──────────────────────────────────────────────
  const wasteReasons = ['SPOILAGE', 'OVERPRODUCTION', 'WRONG_PREPARATION', 'PORTIONING_ISSUE', 'EXPIRY']
  const wasteItems = ['Tomatoes', 'Chicken Breast', 'Whole Chicken', 'Full Cream Milk', 'Cheddar Cheese']

  for (let d = 13; d >= 0; d--) {
    const recordDate = new Date(today)
    recordDate.setDate(today.getDate() - d)
    recordDate.setHours(0, 0, 0, 0)

    await prisma.wasteRecord.createMany({
      data: wasteItems.slice(0, 3).map((itemName) => {
        const item = itemMap[itemName]
        const qty = Math.round(Math.random() * 5 + 0.5)
        const cost = qty * (item.averageCost ?? 10)
        return {
          organizationId: org.id,
          branchId: branches[Math.floor(Math.random() * branches.length)].id,
          inventoryItemId: item.id,
          itemName: itemName,
          recordDate,
          quantity: qty,
          unitId: item.unitId,
          unitCost: item.averageCost ?? 10,
          totalCost: Math.round(cost * 100) / 100,
          wasteReason: wasteReasons[Math.floor(Math.random() * wasteReasons.length)],
          notes: 'Auto-seeded waste record',
        }
      }),
      skipDuplicates: false,
    })
  }
  console.log('  ✓ Waste Records')

  // ──────────────────────────────────────────────
  // Quality Issues
  // ──────────────────────────────────────────────
  await prisma.qualityIssue.createMany({
    data: [
      {
        organizationId: org.id,
        branchId: branches[0].id,
        supplierId: suppliers[2].id,
        category: 'Ingredient Quality',
        description: 'Tomatoes delivered were not fresh — signs of spoilage within 24 hours of delivery.',
        issueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7),
        severity: 'HIGH',
        status: 'in_progress',
        estimatedCost: 450,
      },
      {
        organizationId: org.id,
        branchId: branches[1].id,
        supplierId: suppliers[0].id,
        category: 'Packaging',
        description: 'Milk cartons arrived damaged — 12 units unusable.',
        issueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 14),
        severity: 'MEDIUM',
        status: 'resolved',
        estimatedCost: 66,
      },
      {
        organizationId: org.id,
        branchId: branches[2].id,
        supplierId: suppliers[3].id,
        category: 'Temperature Breach',
        description: 'Poultry delivery arrived above safe temperature. Full batch rejected.',
        issueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3),
        severity: 'CRITICAL',
        status: 'open',
        estimatedCost: 2250,
      },
    ],
    skipDuplicates: true,
  })
  console.log('  ✓ Quality Issues')

  // ──────────────────────────────────────────────
  // Supplier Scorecards
  // ──────────────────────────────────────────────
  const scorecardData = [
    { idx: 0, price: 88, quality: 92, delivery: 95, contract: 90, invoice: 96, response: 85 },
    { idx: 1, price: 82, quality: 85, delivery: 88, contract: 85, invoice: 90, response: 80 },
    { idx: 2, price: 70, quality: 75, delivery: 80, contract: 72, invoice: 78, response: 70 },
    { idx: 3, price: 85, quality: 90, delivery: 92, contract: 88, invoice: 92, response: 82 },
    { idx: 4, price: 78, quality: 80, delivery: 85, contract: 80, invoice: 85, response: 75 },
  ]

  await Promise.all(
    scorecardData.map((s) => {
      const overall =
        s.price * 0.25 +
        s.quality * 0.25 +
        s.delivery * 0.2 +
        s.contract * 0.15 +
        s.invoice * 0.1 +
        s.response * 0.05
      return prisma.supplierScorecard.upsert({
        where: {
          organizationId_supplierId_periodStart: {
            organizationId: org.id,
            supplierId: suppliers[s.idx].id,
            periodStart: new Date(today.getFullYear(), today.getMonth() - 1, 1),
          },
        },
        update: {},
        create: {
          organizationId: org.id,
          supplierId: suppliers[s.idx].id,
          periodStart: new Date(today.getFullYear(), today.getMonth() - 1, 1),
          periodEnd: new Date(today.getFullYear(), today.getMonth(), 0),
          priceScore: s.price,
          qualityScore: s.quality,
          deliveryScore: s.delivery,
          contractComplianceScore: s.contract,
          invoiceAccuracyScore: s.invoice,
          responsivenessScore: s.response,
          overallScore: Math.round(overall * 10) / 10,
        },
      })
    })
  )
  console.log('  ✓ Supplier Scorecards')

  // ──────────────────────────────────────────────
  // Alerts
  // ──────────────────────────────────────────────
  await prisma.alert.createMany({
    data: [
      {
        organizationId: org.id,
        branchId: branches[2].id,
        type: 'QUALITY',
        severity: 'CRITICAL',
        title: 'Critical Quality Issue',
        titleAr: 'مشكلة جودة حرجة',
        message: 'Poultry delivery rejected at Jeddah Corniche — batch contamination risk.',
        messageAr: 'تم رفض شحنة الدواجن في جدة الكورنيش — خطر تلوث الدُفعة.',
        isRead: false,
        isResolved: false,
        metadata: { supplierId: suppliers[3].id },
      },
      {
        organizationId: org.id,
        branchId: branches[0].id,
        type: 'PROCUREMENT',
        severity: 'HIGH',
        title: 'Price Variance Detected',
        titleAr: 'تم اكتشاف فارق في الأسعار',
        message: 'Invoice prices from Saudi Fresh Farms exceed contract prices by 8%.',
        messageAr: 'أسعار فاتورة المزارع السعودية تتجاوز الأسعار التعاقدية بنسبة 8٪.',
        isRead: false,
        isResolved: false,
        metadata: {},
      },
      {
        organizationId: org.id,
        type: 'INVENTORY',
        severity: 'MEDIUM',
        title: 'Low Stock: Cheddar Cheese',
        titleAr: 'مخزون منخفض: جبنة الشيدر',
        message: 'Cheddar Cheese stock is below reorder point across 2 branches.',
        messageAr: 'مخزون جبنة الشيدر دون نقطة إعادة الطلب في فرعين.',
        isRead: true,
        isResolved: false,
        metadata: { inventoryItemId: itemMap['Cheddar Cheese'].id },
      },
      {
        organizationId: org.id,
        type: 'DELIVERY',
        severity: 'HIGH',
        title: 'Talabat Margin Below Threshold',
        titleAr: 'هامش طلبات دون الحد المقبول',
        message: 'Effective platform cost on Talabat reached 28% this week — exceeding 25% policy limit.',
        messageAr: 'بلغت التكلفة الفعلية على طلبات 28٪ هذا الأسبوع — تجاوزت حد السياسة 25٪.',
        isRead: false,
        isResolved: false,
        metadata: { platformName: 'Talabat' },
      },
    ],
    skipDuplicates: true,
  })
  console.log('  ✓ Alerts')

  // ──────────────────────────────────────────────
  // Recommendations
  // ──────────────────────────────────────────────
  await prisma.recommendation.createMany({
    data: [
      {
        organizationId: org.id,
        title: 'Renegotiate Talabat Commission',
        titleAr: 'إعادة التفاوض على عمولة طلبات',
        description: 'Effective commission including promotions and bank fees is 28%. Negotiate to 22% or reduce promotion spend by 40%.',
        descriptionAr: 'العمولة الفعلية شاملة العروض والرسوم البنكية 28٪. تفاوض على 22٪ أو خفِّض إنفاق العروض بنسبة 40٪.',
        category: 'DELIVERY',
        potentialSavingMin: 15000,
        potentialSavingMax: 25000,
        priority: 1,
        status: 'NEW',
        effort: 'MEDIUM',
        impact: 'HIGH',
      },
      {
        organizationId: org.id,
        title: 'Price Chicken Kabsa at SAR 60',
        titleAr: 'رفع سعر كبسة الدجاج إلى 60 ريال',
        description: 'Chicken Kabsa has the highest sales volume (STAR) but 25.5% food cost. Increasing price by SAR 5 improves margin by 8.3%.',
        descriptionAr: 'كبسة الدجاج لديها أعلى حجم مبيعات (نجم) لكن تكلفة الغذاء 25.5٪. رفع السعر 5 ريال يحسن الهامش بنسبة 8.3٪.',
        category: 'MENU',
        potentialSavingMin: 8000,
        potentialSavingMax: 12000,
        priority: 2,
        status: 'NEW',
        effort: 'LOW',
        impact: 'MEDIUM',
      },
      {
        organizationId: org.id,
        branchId: branches[1].id,
        title: 'Investigate Malaz Branch Waste Spike',
        titleAr: 'التحقق من ارتفاع الهدر في فرع الملز',
        description: 'Waste at Malaz branch is 4.2% of sales vs 2.1% chain average. Potential recovery of SAR 3,500/month.',
        descriptionAr: 'الهدر في فرع الملز 4.2٪ من المبيعات مقابل 2.1٪ متوسط السلسلة. إمكانية استرداد 3,500 ريال شهرياً.',
        category: 'WASTE',
        potentialSavingMin: 3000,
        potentialSavingMax: 4000,
        priority: 3,
        status: 'IN_PROGRESS',
        effort: 'LOW',
        impact: 'MEDIUM',
      },
    ],
    skipDuplicates: true,
  })
  console.log('  ✓ Recommendations')

  // ──────────────────────────────────────────────
  // Branch Profitability Snapshots
  // ──────────────────────────────────────────────
  const snapshotData = [
    { branch: 0, netSales: 224000, foodCost: 62720, packaging: 6720, platformFees: 11200, waste: 4480, labor: 44800, rent: 18000, utilities: 6000 },
    { branch: 1, netSales: 168000, foodCost: 47040, packaging: 5040, platformFees: 8400, waste: 5040, labor: 35000, rent: 14000, utilities: 4500 },
    { branch: 2, netSales: 280000, foodCost: 78400, packaging: 8400, platformFees: 14000, waste: 5600, labor: 56000, rent: 25000, utilities: 7500 },
    { branch: 3, netSales: 140000, foodCost: 39200, packaging: 5600, platformFees: 21000, waste: 2800, labor: 28000, rent: 8000, utilities: 3000 },
  ]

  const periodStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  const periodEnd = new Date(today.getFullYear(), today.getMonth(), 0)

  await Promise.all(
    snapshotData.map((s) => {
      const contribution = s.netSales - s.foodCost - s.packaging - s.platformFees - s.waste
      const operatingProfit = contribution - s.labor - s.rent - s.utilities
      return prisma.branchProfitabilitySnapshot.upsert({
        where: {
          organizationId_branchId_periodStart_periodEnd: {
            organizationId: org.id,
            branchId: branches[s.branch].id,
            periodStart,
            periodEnd,
          },
        },
        update: {},
        create: {
          organizationId: org.id,
          branchId: branches[s.branch].id,
          periodStart,
          periodEnd,
          netSales: s.netSales,
          foodCostTotal: s.foodCost,
          packagingCostTotal: s.packaging,
          platformFeesTotal: s.platformFees,
          wasteValueTotal: s.waste,
          contributionProfit: contribution,
          contributionMarginPct: Math.round((contribution / s.netSales) * 1000) / 10,
          laborCost: s.labor,
          rentCost: s.rent,
          utilitiesCost: s.utilities,
          operatingProfitEstimate: operatingProfit,
          operatingMarginPct: Math.round((operatingProfit / s.netSales) * 1000) / 10,
        },
      })
    })
  )
  console.log('  ✓ Branch Profitability Snapshots')

  // ──────────────────────────────────────────────
  // Delivery Settlements (last month)
  // ──────────────────────────────────────────────
  const settlementData = [
    { platform: platforms[0], gross: 45000, discount: 2250, commission: 9000, promotion: 1500, bank: 450, delivery: 0, marketing: 900, vatOnFees: 1718, orders: 820, foodCost: 12600, packaging: 1350 },
    { platform: platforms[1], gross: 32000, discount: 1600, commission: 5760, promotion: 800, bank: 320, delivery: 0, marketing: 640, vatOnFees: 1127, orders: 620, foodCost: 8960, packaging: 960 },
    { platform: platforms[2], gross: 18000, discount: 900, commission: 2880, promotion: 360, bank: 180, delivery: 0, marketing: 360, vatOnFees: 567, orders: 380, foodCost: 5040, packaging: 540 },
  ]

  for (const s of settlementData) {
    const netAfterFees = s.gross - s.discount - s.commission - s.promotion - s.bank - s.delivery - s.marketing - s.vatOnFees
    const contributionMargin = netAfterFees - s.foodCost - s.packaging
    await prisma.deliverySettlement.create({
      data: {
        organizationId: org.id,
        platformId: s.platform.id,
        branchId: branches[0].id,
        periodStart,
        periodEnd,
        grossSales: s.gross,
        discounts: s.discount,
        platformCommission: s.commission,
        promotionCost: s.promotion,
        bankFees: s.bank,
        deliveryFees: s.delivery,
        marketingFees: s.marketing,
        vatOnFees: s.vatOnFees,
        netAfterFees,
        estimatedFoodCost: s.foodCost,
        packagingCost: s.packaging,
        contributionMargin,
        contributionMarginPct: Math.round((contributionMargin / s.gross) * 1000) / 10,
        orderCount: s.orders,
        profitPerOrder: Math.round((contributionMargin / s.orders) * 100) / 100,
        effectiveCommissionRate: Math.round(((s.commission + s.promotion + s.bank + s.marketing) / s.gross) * 1000) / 10,
      },
    })
  }
  console.log('  ✓ Delivery Settlements')

  // ──────────────────────────────────────────────
  // Budget Targets
  // ──────────────────────────────────────────────
  const budgetYear = today.getFullYear()
  const budgetMonth = today.getMonth() + 1

  await Promise.all(
    branches.map((b) =>
      prisma.budgetTarget.upsert({
        where: {
          organizationId_branchId_year_month_metricKey: {
            organizationId: org.id,
            branchId: b.id,
            year: budgetYear,
            month: budgetMonth,
            metricKey: 'net_sales',
          },
        },
        update: {},
        create: {
          organizationId: org.id,
          branchId: b.id,
          year: budgetYear,
          month: budgetMonth,
          metricKey: 'net_sales',
          metricLabel: 'صافي المبيعات',
          targetValue: branchDailyTarget[b.name] * 30 ?? 150000,
          currency: 'SAR',
        },
      })
    )
  )
  console.log('  ✓ Budget Targets')

  // ──────────────────────────────────────────────
  // App Settings
  // ──────────────────────────────────────────────
  const appSettings = [
    { key: 'food_cost_target_pct', value: '30', label: 'Food Cost Target %' },
    { key: 'waste_alert_threshold_pct', value: '3', label: 'Waste Alert Threshold %' },
    { key: 'delivery_margin_minimum_pct', value: '25', label: 'Min Delivery Platform Margin %' },
    { key: 'stock_variance_alert_pct', value: '5', label: 'Consumption Variance Alert %' },
    { key: 'low_stock_days_threshold', value: '3', label: 'Low Stock Alert Days' },
  ]

  await Promise.all(
    appSettings.map((s) =>
      prisma.appSetting.upsert({
        where: { organizationId_key: { organizationId: org.id, key: s.key } },
        update: {},
        create: {
          organizationId: org.id,
          key: s.key,
          value: s.value,
          label: s.label,
          isPublic: false,
        },
      })
    )
  )
  console.log('  ✓ App Settings')

  console.log('\n✅ Seed complete!')
  console.log('\n🔑 Demo Credentials:')
  console.log('   Owner:       owner@demo.sa       / Demo@1234')
  console.log('   CFO:         cfo@demo.sa         / Demo@1234')
  console.log('   Operations:  ops@demo.sa         / Demo@1234')
  console.log('   Procurement: procurement@demo.sa / Demo@1234')
  console.log('   Viewer:      viewer@demo.sa      / Demo@1234')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
