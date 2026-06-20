// ============================================================================
//  نواة المنطق المالي لنظام RDI — Restaurant Delivery Intelligence
//  هذا الملف هو جوهر النظام. المنطق مبني على خبرة فعلية في السوق السعودي.
//  لا يُغيَّر إلا بقرار صريح. كل دالة موثّقة بالعربية وتُغطّيها اختبارات.
// ============================================================================

/**
 * @typedef {Object} Item            صنف من قائمة المطعم
 * @property {string} name           اسم الصنف
 * @property {number} food           تكلفة الطعام (ريال)
 * @property {number} pack           تكلفة التغليف (ريال)
 * @property {number} price          سعر المطعم المباشر / الكاش (ريال)
 * @property {number} [appPriceOverride] سعر التطبيق الصريح (اختياري، 0 يعني غير محدد)
 *
 * @typedef {Object} Platform        منصة توصيل
 * @property {string} name           اسم المنصة
 * @property {number} commission     عمولة المنصة %
 * @property {number} serviceFee     رسوم الخدمة % (0 = لا توجد)
 * @property {number} payment        رسوم الدفع الإلكتروني %
 * @property {number} [freeDelivery] حصة المطعم من التوصيل المجاني (ريال ثابت لكل طلب)
 *
 * @typedef {Object} Settings        إعدادات التسعير العامة (قابلة للتعديل من المستخدم)
 * @property {number} appMarkupPct   نسبة رفع سعر التطبيق % (افتراضي 30)
 * @property {number} avgDiscountPct متوسط الخصم المعروض للعميل % (افتراضي 10)
 * @property {boolean} vatOnFees     تطبيق ضريبة القيمة المضافة 15% على الرسوم
 */

/**
 * تحويل آمن لأي قيمة إلى رقم صحيح غير سالب (يحمي الحسابات من القيم الفارغة/التالفة).
 * @returns {number} الرقم أو 0 إن كانت القيمة غير صالحة
 */
export function num(value) {
  const n = typeof value === 'number' ? value : parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

/**
 * سعر التطبيق = السعر الصريح إن وُجد، وإلا سعر المطعم مرفوعاً بنسبة الرفع.
 */
export function listPriceOf(item, settings) {
  const override = num(item.appPriceOverride);
  if (override > 0) return override;
  return num(item.price) * (1 + num(settings.appMarkupPct) / 100);
}

/**
 * تفصيل الرسوم وصافي الربح لصنف على منصة معيّنة (الطبقات السبع).
 * مطابق حرفياً للمواصفة المعتمدة.
 */
export function feeBreakdown(item, platform, settings) {
  // 1. سعر التطبيق (بعد الرفع أو الصريح)
  const listPrice = listPriceOf(item, settings);

  // 2. الخصم المعروض للعميل
  const fullDiscount = listPrice * (num(settings.avgDiscountPct) / 100);
  const customerPays = listPrice - fullDiscount;

  // 3. عمولة التطبيق (تُحسب على ما يدفعه العميل)
  const commission = customerPays * (num(platform.commission) / 100);

  // 4. رسوم الخدمة (بحد أدنى 0.5 وأقصى 2 ريال — فقط على بعض المنصات)
  let serviceFee = 0;
  if (num(platform.serviceFee) > 0) {
    serviceFee = Math.min(2, Math.max(0.5, customerPays * (num(platform.serviceFee) / 100)));
  }

  // 5. رسوم الدفع الإلكتروني (الرسوم الخفية)
  const paymentFee = customerPays * (num(platform.payment) / 100);

  // 6. ضريبة القيمة المضافة 15% على الرسوم (العمولة + الخدمة + الدفع)
  const vat = settings.vatOnFees ? (commission + serviceFee + paymentFee) * 0.15 : 0;

  // 7. حصة المطعم من التوصيل المجاني (مبلغ ثابت لكل طلب)
  const deliveryShare = num(platform.freeDelivery);

  // تكلفة الصنف (طعام + تغليف)
  const cost = num(item.food) + num(item.pack);

  // صافي الربح النهائي
  const net =
    listPrice - fullDiscount - commission - serviceFee - paymentFee - vat - deliveryShare - cost;

  return {
    listPrice,
    fullDiscount,
    customerPays,
    commission,
    serviceFee,
    paymentFee,
    vat,
    deliveryShare,
    cost,
    net,
  };
}

/**
 * ربح المطعم المباشر (بيع كاش بدون أي رسوم منصة).
 */
export function directProfit(item) {
  return num(item.price) - (num(item.food) + num(item.pack));
}

/**
 * الهامش المباشر % = ربح المطعم المباشر ÷ سعر المطعم المباشر × 100.
 * يُستخدم لتحديد "أبطال العروض" (هامش مباشر ≥ 25%).
 */
export function directMargin(item) {
  const p = num(item.price);
  return p > 0 ? (directProfit(item) / p) * 100 : 0;
}

/**
 * الهامش على منصة % = صافي الربح ÷ سعر التطبيق × 100.
 */
export function margin(item, platform, settings) {
  const lp = listPriceOf(item, settings);
  return lp > 0 ? (feeBreakdown(item, platform, settings).net / lp) * 100 : 0;
}

// ----------------------------------------------------------------------------
//  عتبات منطق التحليل
// ----------------------------------------------------------------------------
export const THRESHOLDS = {
  THIN_MARGIN: 8, // هامش رقيق إذا قلّ عن 8%
  OFFER_HERO: 25, // بطل عروض إذا كان الهامش المباشر ≥ 25%
};

/**
 * توليد قائمة المشاكل مرتّبة بالأولوية لكل صنف على كل منصة.
 * - خسارة (أولوية عالية): net < 0
 * - هامش رقيق (أولوية متوسطة): 0 ≤ margin < 8
 * لكل مشكلة توصية عملية (رفع السعر / سحب الصنف / التفاوض على العمولة).
 */
export function analyzeIssues(items, platforms, settings) {
  const issues = [];

  for (const item of items) {
    for (const platform of platforms) {
      const fb = feeBreakdown(item, platform, settings);
      const m = margin(item, platform, settings);
      const lp = fb.listPrice;

      if (fb.net < 0) {
        // كم يجب رفع سعر التطبيق ليصبح صافي الربح = 0 (تغطية الخسارة)؟
        const requiredIncreasePct = lp > 0 ? (Math.abs(fb.net) / lp) * 100 : 0;
        issues.push({
          type: 'loss',
          severity: 'high',
          item: item.name,
          platform: platform.name,
          net: fb.net,
          margin: m,
          requiredIncreasePct,
          recommendations: [
            `ارفع سعر التطبيق بنحو ${requiredIncreasePct.toFixed(1)}% على الأقل لتغطية الخسارة (للوصول لنقطة التعادل).`,
            `أو اسحب الصنف من منصة «${platform.name}» إذا تعذّر رفع السعر.`,
            `أو فاوض «${platform.name}» على خفض العمولة (${num(platform.commission)}%).`,
          ],
        });
      } else if (m < THRESHOLDS.THIN_MARGIN) {
        issues.push({
          type: 'thin',
          severity: 'medium',
          item: item.name,
          platform: platform.name,
          net: fb.net,
          margin: m,
          recommendations: [
            `الهامش رقيق (${m.toFixed(1)}%). راجع التسعير أو التكلفة لرفعه فوق ${THRESHOLDS.THIN_MARGIN}%.`,
            `فكّر في تقليل تكلفة التغليف أو الطعام لهذا الصنف.`,
          ],
        });
      }
    }
  }

  // ترتيب: الخسائر أولاً (الأعلى خسارة)، ثم الهوامش الرقيقة (الأقل هامشاً)
  const rank = { high: 0, medium: 1, low: 2 };
  issues.sort((a, b) => {
    if (rank[a.severity] !== rank[b.severity]) return rank[a.severity] - rank[b.severity];
    return a.net - b.net; // الأكثر سوءاً أولاً
  });

  return issues;
}

/**
 * توليد مقترحات العروض الذكية:
 * - أبطال العروض: أصناف هامشها المباشر ≥ 25%.
 * - أفضل منصة للصنف (الأعلى صافي ربح).
 * - اقتراح كومبو من أكثر صنفين مربحين.
 */
export function buildOffers(items, platforms, settings) {
  const offers = [];

  // 1. أبطال العروض
  const heroes = items
    .filter((it) => directMargin(it) >= THRESHOLDS.OFFER_HERO)
    .sort((a, b) => directMargin(b) - directMargin(a));

  if (heroes.length > 0) {
    offers.push({
      kind: 'hero',
      title: 'أبطال العروض (هامش مرتفع)',
      detail: `هذه الأصناف هامشها المباشر ${THRESHOLDS.OFFER_HERO}% فأكثر — مثالية كعروض جاذبة دون التضحية بالربح:`,
      items: heroes.slice(0, 5).map((it) => ({
        name: it.name,
        directMargin: directMargin(it),
      })),
    });
  }

  // 2. توجيه الطلبات للمنصة الأعلى ربحاً (إجمالاً عبر كل الأصناف)
  if (platforms.length > 1 && items.length > 0) {
    const platformTotals = platforms.map((p) => ({
      name: p.name,
      total: items.reduce((sum, it) => sum + feeBreakdown(it, p, settings).net, 0),
    }));
    platformTotals.sort((a, b) => b.total - a.total);
    offers.push({
      kind: 'routing',
      title: 'وجّه عملاءك للمنصة الأعلى ربحاً',
      detail: `المنصة «${platformTotals[0].name}» تحقق أعلى صافي ربح إجمالي. شجّع الطلب عبرها (مثلاً برمز خصم خاص بها).`,
      items: platformTotals.map((p) => ({ name: p.name, total: p.total })),
    });
  }

  // 3. كومبو من أكثر الأصناف ربحية مباشرة
  const topByProfit = [...items].sort((a, b) => directProfit(b) - directProfit(a)).slice(0, 2);
  if (topByProfit.length === 2) {
    offers.push({
      kind: 'combo',
      title: 'كومبو مقترح',
      detail: `اجمع «${topByProfit[0].name}» مع «${topByProfit[1].name}» في كومبو واحد — كلاهما من الأعلى ربحاً، ما يرفع متوسط قيمة الطلب مع الحفاظ على الهامش.`,
      items: topByProfit.map((it) => ({ name: it.name, profit: directProfit(it) })),
    });
  }

  return offers;
}

/**
 * مؤشرات رئيسية ملخّصة للتقرير.
 */
export function buildKpis(items, platforms, settings) {
  let totalNet = 0;
  let losingCount = 0;
  let thinCount = 0;
  let cells = 0;
  let bestPlatform = null;
  let bestPlatformTotal = -Infinity;

  for (const platform of platforms) {
    let platformNet = 0;
    for (const item of items) {
      const fb = feeBreakdown(item, platform, settings);
      const m = margin(item, platform, settings);
      totalNet += fb.net;
      platformNet += fb.net;
      cells += 1;
      if (fb.net < 0) losingCount += 1;
      else if (m < THRESHOLDS.THIN_MARGIN) thinCount += 1;
    }
    if (platformNet > bestPlatformTotal) {
      bestPlatformTotal = platformNet;
      bestPlatform = platform.name;
    }
  }

  const avgNet = cells > 0 ? totalNet / cells : 0;

  return {
    itemCount: items.length,
    platformCount: platforms.length,
    avgNetPerItem: avgNet, // متوسط صافي الربح للصنف الواحد عبر كل المنصات
    losingCount, // عدد حالات الخسارة (صنف × منصة)
    thinCount, // عدد حالات الهامش الرقيق
    bestPlatform,
    bestPlatformTotal: bestPlatform ? bestPlatformTotal : 0,
  };
}
