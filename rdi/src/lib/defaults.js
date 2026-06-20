// القيم الافتراضية للمنصات والإعدادات — قابلة للتعديل بالكامل من المستخدم.

// المنصات الافتراضية في السوق السعودي (العمولات تقديرية وتختلف حسب عقد كل مطعم).
export const DEFAULT_PLATFORMS = [
  { name: 'هنقرستيشن', commission: 25, serviceFee: 2, payment: 2.5, freeDelivery: 0 },
  { name: 'جاهز', commission: 22, serviceFee: 0, payment: 2.5, freeDelivery: 0 },
  { name: 'كيتا', commission: 28, serviceFee: 2, payment: 2.5, freeDelivery: 0 },
  { name: 'مرسول', commission: 20, serviceFee: 0, payment: 2.5, freeDelivery: 0 },
];

// إعدادات التسعير العامة الافتراضية.
export const DEFAULT_SETTINGS = {
  appMarkupPct: 30, // نسبة رفع سعر التطبيق %
  avgDiscountPct: 10, // متوسط الخصم المعروض للعميل %
  vatOnFees: true, // تطبيق ضريبة 15% على الرسوم
};

// نسخة عميقة آمنة للقيم الافتراضية (حتى لا يُعدّل المستخدم الثوابت).
export function freshPlatforms() {
  return DEFAULT_PLATFORMS.map((p) => ({ ...p }));
}
export function freshSettings() {
  return { ...DEFAULT_SETTINGS };
}
