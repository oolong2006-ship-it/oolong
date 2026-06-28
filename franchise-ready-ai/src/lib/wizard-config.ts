export interface WizardQuestion {
  key: string
  labelAr: string
  helpAr?: string
  type: 'text' | 'number' | 'boolean' | 'select' | 'textarea'
  options?: string[]
  required?: boolean
  unit?: string
}

export interface WizardSection {
  key: string
  titleAr: string
  descriptionAr: string
  icon: string
  questions: WizardQuestion[]
}

export const WIZARD_SECTIONS: WizardSection[] = [
  {
    key: 'general',
    titleAr: 'المعلومات العامة',
    descriptionAr: 'معلومات أساسية عن منشأتك التجارية',
    icon: '🏢',
    questions: [
      { key: 'nameAr', labelAr: 'اسم المنشأة بالعربية', type: 'text', required: true },
      { key: 'nameEn', labelAr: 'اسم المنشأة بالإنجليزية', type: 'text', required: true },
      {
        key: 'activityType',
        labelAr: 'نوع النشاط',
        type: 'select',
        options: ['مطعم', 'كافيه', 'مخبز', 'حلويات', 'وجبات سريعة', 'مطعم فاخر', 'خدمات أخرى'],
        required: true,
      },
      { key: 'city', labelAr: 'المدينة', type: 'text', required: true },
      { key: 'foundingYear', labelAr: 'سنة التأسيس', type: 'number', required: true },
      { key: 'branchCount', labelAr: 'عدد الفروع الحالية', type: 'number', required: true },
      { key: 'fullyOwned', labelAr: 'هل جميع الفروع مملوكة بالكامل؟', type: 'boolean', required: true },
      { key: 'trademarkReg', labelAr: 'هل العلامة التجارية مسجلة؟', type: 'boolean', required: true },
      { key: 'crNumber', labelAr: 'رقم السجل التجاري', type: 'text', required: false },
      { key: 'descriptionAr', labelAr: 'وصف مختصر للمنشأة', type: 'textarea', required: true },
    ],
  },
  {
    key: 'identity',
    titleAr: 'الهوية والعلامة التجارية',
    descriptionAr: 'هوية علامتك التجارية وحضورها الرقمي',
    icon: '🎨',
    questions: [
      { key: 'websiteUrl', labelAr: 'رابط الموقع الإلكتروني', type: 'text', required: false },
      { key: 'instagramUrl', labelAr: 'حساب إنستغرام', type: 'text', required: false },
      { key: 'brandColors', labelAr: 'ألوان العلامة التجارية', type: 'text', required: false },
      { key: 'uniquePoints', labelAr: 'نقاط التميز والاختلاف عن المنافسين', type: 'textarea', required: true },
    ],
  },
  {
    key: 'products',
    titleAr: 'المنتجات والخدمات',
    descriptionAr: 'تفاصيل منتجاتك وخدماتك المقدمة',
    icon: '🍽️',
    questions: [
      { key: 'mainProducts', labelAr: 'المنتجات والخدمات الرئيسية', type: 'textarea', required: true },
      { key: 'bestSeller', labelAr: 'المنتج الأكثر مبيعاً', type: 'text', required: true },
      { key: 'avgPrice', labelAr: 'متوسط سعر المنتج', type: 'number', unit: 'ريال', required: true },
      { key: 'hasDocRecipes', labelAr: 'هل لديك وصفات موثقة؟', type: 'boolean', required: true },
      { key: 'qualityReplicable', labelAr: 'هل يمكن تكرار الجودة في فروع أخرى؟', type: 'boolean', required: true },
    ],
  },
  {
    key: 'market',
    titleAr: 'السوق والعملاء',
    descriptionAr: 'معلومات عن السوق المستهدف وبيئة التنافس',
    icon: '📊',
    questions: [
      { key: 'targetCustomer', labelAr: 'العميل المستهدف', type: 'textarea', required: true },
      { key: 'competitors', labelAr: 'المنافسون الرئيسيون', type: 'textarea', required: true },
      { key: 'expansionCities', labelAr: 'المدن المستهدفة للتوسع', type: 'textarea', required: true },
      {
        key: 'demandStrength',
        labelAr: 'قوة الطلب على منتجاتك',
        type: 'select',
        options: ['ضعيف', 'متوسط', 'قوي', 'استثنائي'],
        required: true,
      },
      { key: 'seasonality', labelAr: 'هل يتأثر الطلب بالموسمية؟ كيف؟', type: 'textarea', required: false },
    ],
  },
  {
    key: 'financials',
    titleAr: 'المالية والأرقام',
    descriptionAr: 'المؤشرات المالية والأداء الاقتصادي للمنشأة',
    icon: '💰',
    questions: [
      {
        key: 'avgMonthlySales',
        labelAr: 'متوسط المبيعات الشهرية',
        type: 'number',
        unit: 'ريال',
        required: true,
        helpAr: 'يمكنك إدخال تقديرات تقريبية إذا لم تكن لديك أرقام دقيقة',
      },
      {
        key: 'avgDailyOrders',
        labelAr: 'متوسط الطلبات اليومية',
        type: 'number',
        required: true,
        helpAr: 'يمكنك إدخال تقديرات تقريبية إذا لم تكن لديك أرقام دقيقة',
      },
      {
        key: 'avgInvoiceValue',
        labelAr: 'متوسط قيمة الفاتورة',
        type: 'number',
        unit: 'ريال',
        required: true,
        helpAr: 'يمكنك إدخال تقديرات تقريبية إذا لم تكن لديك أرقام دقيقة',
      },
      {
        key: 'cogs',
        labelAr: 'تكلفة البضاعة المباعة (COGS)',
        type: 'number',
        unit: '%',
        required: true,
        helpAr: 'يمكنك إدخال تقديرات تقريبية إذا لم تكن لديك أرقام دقيقة',
      },
      {
        key: 'rent',
        labelAr: 'الإيجار الشهري',
        type: 'number',
        unit: 'ريال',
        required: true,
        helpAr: 'يمكنك إدخال تقديرات تقريبية إذا لم تكن لديك أرقام دقيقة',
      },
      {
        key: 'salaries',
        labelAr: 'الرواتب الشهرية',
        type: 'number',
        unit: 'ريال',
        required: true,
        helpAr: 'يمكنك إدخال تقديرات تقريبية إذا لم تكن لديك أرقام دقيقة',
      },
      {
        key: 'opExpenses',
        labelAr: 'المصاريف التشغيلية الأخرى',
        type: 'number',
        unit: 'ريال',
        required: true,
        helpAr: 'يمكنك إدخال تقديرات تقريبية إذا لم تكن لديك أرقام دقيقة',
      },
      {
        key: 'netProfit',
        labelAr: 'صافي الربح الشهري',
        type: 'number',
        unit: 'ريال',
        required: true,
        helpAr: 'يمكنك إدخال تقديرات تقريبية إذا لم تكن لديك أرقام دقيقة',
      },
      {
        key: 'newBranchCost',
        labelAr: 'تكلفة فتح فرع جديد',
        type: 'number',
        unit: 'ريال',
        required: true,
        helpAr: 'يمكنك إدخال تقديرات تقريبية إذا لم تكن لديك أرقام دقيقة',
      },
      {
        key: 'paybackPeriod',
        labelAr: 'فترة استرداد الاستثمار المتوقعة',
        type: 'text',
        required: false,
        helpAr: 'يمكنك إدخال تقديرات تقريبية إذا لم تكن لديك أرقام دقيقة',
      },
    ],
  },
  {
    key: 'operations',
    titleAr: 'التشغيل والأنظمة',
    descriptionAr: 'الأنظمة والإجراءات التشغيلية المعمول بها',
    icon: '⚙️',
    questions: [
      { key: 'hasSOPs', labelAr: 'هل لديك إجراءات تشغيلية موثقة (SOPs)؟', type: 'boolean', required: true },
      { key: 'hasPOS', labelAr: 'هل تستخدم نظام نقاط البيع (POS)؟', type: 'boolean', required: true },
      { key: 'hasERP', labelAr: 'هل لديك نظام تخطيط موارد (ERP)؟', type: 'boolean', required: true },
      { key: 'hasOpsManual', labelAr: 'هل لديك دليل تشغيل مكتوب؟', type: 'boolean', required: true },
      { key: 'hasTrainingManual', labelAr: 'هل لديك دليل تدريب للموظفين؟', type: 'boolean', required: true },
      { key: 'qualityControl', labelAr: 'كيف تضمن جودة المنتج والخدمة؟', type: 'textarea', required: true },
      { key: 'complaintProcess', labelAr: 'كيف تتعامل مع شكاوى العملاء؟', type: 'textarea', required: true },
      { key: 'hasInternalAudit', labelAr: 'هل لديك نظام تدقيق داخلي؟', type: 'boolean', required: true },
    ],
  },
  {
    key: 'hr',
    titleAr: 'الموارد البشرية',
    descriptionAr: 'هيكل الفريق وبرامج التدريب والتطوير',
    icon: '👥',
    questions: [
      { key: 'employeesPerBranch', labelAr: 'عدد الموظفين في الفرع الواحد', type: 'number', required: true },
      { key: 'orgStructure', labelAr: 'الهيكل التنظيمي للمنشأة', type: 'textarea', required: true },
      { key: 'trainingDuration', labelAr: 'مدة التدريب للموظف الجديد', type: 'text', required: true },
      { key: 'hasInternalTrainer', labelAr: 'هل لديك مدرب داخلي متخصص؟', type: 'boolean', required: true },
      { key: 'easyToReplicate', labelAr: 'هل يمكن تكرار الفريق بسهولة في فروع جديدة؟', type: 'boolean', required: true },
    ],
  },
  {
    key: 'supply',
    titleAr: 'سلسلة التوريد',
    descriptionAr: 'الموردون وسلسلة الإمداد والمواصفات',
    icon: '🔗',
    questions: [
      { key: 'mainSuppliers', labelAr: 'الموردون الرئيسيون', type: 'textarea', required: true },
      { key: 'hasSupplierContracts', labelAr: 'هل لديك عقود موثقة مع الموردين؟', type: 'boolean', required: true },
      { key: 'hasMaterialSpecs', labelAr: 'هل لديك مواصفات محددة للمواد الخام؟', type: 'boolean', required: true },
      { key: 'hasCentralKitchen', labelAr: 'هل لديك مطبخ مركزي؟', type: 'boolean', required: true },
      { key: 'hasCentralWarehouse', labelAr: 'هل لديك مستودع مركزي؟', type: 'boolean', required: true },
      { key: 'canMandateSuppliers', labelAr: 'هل يمكنك إلزام المنتسبين بموردين محددين؟', type: 'boolean', required: true },
    ],
  },
  {
    key: 'franchise',
    titleAr: 'أهداف الفرنشايز',
    descriptionAr: 'خطتك وأهدافك في التوسع عبر نظام الامتياز التجاري',
    icon: '🌟',
    questions: [
      { key: 'franchiseWhy', labelAr: 'لماذا تريد التوسع عبر نظام الفرنشايز؟', type: 'textarea', required: true },
      { key: 'targetBranchCount', labelAr: 'عدد الفروع المستهدف خلال 5 سنوات', type: 'number', required: true },
      {
        key: 'expansionScope',
        labelAr: 'نطاق التوسع المستهدف',
        type: 'select',
        options: ['داخل المدينة', 'داخل المملكة', 'الخليج والعالم العربي', 'دولي'],
        required: true,
      },
      { key: 'proposedFees', labelAr: 'رسوم الانضمام المقترحة', type: 'number', unit: 'ريال', required: false },
      { key: 'proposedRoyalty', labelAr: 'نسبة الإتاوة المقترحة', type: 'number', unit: '%', required: false },
      { key: 'franchiseeSupport', labelAr: 'ما الدعم الذي ستقدمه للمنتسبين؟', type: 'textarea', required: true },
    ],
  },
]

export function calculateCompletion(answers: Record<string, unknown>): number {
  const requiredQuestions = WIZARD_SECTIONS.flatMap((section) =>
    // required: false means explicitly optional; required: true or undefined means required
    section.questions.filter((q) => q.required !== false)
  )

  if (requiredQuestions.length === 0) return 0

  const answeredCount = requiredQuestions.filter((q) => {
    const value = answers[q.key]
    if (value === null || value === undefined || value === '') return false
    return true
  }).length

  return Math.round((answeredCount / requiredQuestions.length) * 100)
}
