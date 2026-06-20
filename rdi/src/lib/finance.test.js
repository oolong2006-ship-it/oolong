import { describe, it, expect } from 'vitest';
import {
  num,
  listPriceOf,
  feeBreakdown,
  directProfit,
  directMargin,
  margin,
  analyzeIssues,
  buildOffers,
  buildKpis,
} from './finance.js';

// إعدادات قياسية للاختبار (القيم الافتراضية المعتمدة)
const settings = { appMarkupPct: 30, avgDiscountPct: 10, vatOnFees: true };

// منصة اختبار: هنقرستيشن (عمولة 25، خدمة 2، دفع 2.5)
const hunger = { name: 'هنقرستيشن', commission: 25, serviceFee: 2, payment: 2.5, freeDelivery: 0 };
// منصة بلا رسوم خدمة: جاهز
const jahez = { name: 'جاهز', commission: 22, serviceFee: 0, payment: 2.5, freeDelivery: 0 };

describe('num — التحويل الآمن للأرقام', () => {
  it('يحوّل النص الرقمي', () => expect(num('12.5')).toBe(12.5));
  it('يعيد 0 للقيم التالفة', () => {
    expect(num('abc')).toBe(0);
    expect(num(null)).toBe(0);
    expect(num(undefined)).toBe(0);
    expect(num(NaN)).toBe(0);
  });
});

describe('listPriceOf — سعر التطبيق', () => {
  it('يطبّق نسبة الرفع 30% عند غياب السعر الصريح', () => {
    expect(listPriceOf({ price: 100 }, settings)).toBeCloseTo(130, 10);
  });
  it('يستخدم السعر الصريح إن وُجد', () => {
    expect(listPriceOf({ price: 100, appPriceOverride: 150 }, settings)).toBe(150);
  });
  it('يتجاهل السعر الصريح إذا كان 0', () => {
    expect(listPriceOf({ price: 100, appPriceOverride: 0 }, settings)).toBeCloseTo(130, 10);
  });
});

describe('feeBreakdown — الطبقات السبع (تحقق يدوي رقمي)', () => {
  // مثال محسوب يدوياً: صنف سعره 100، طعام 30، تغليف 5، على هنقرستيشن
  const item = { name: 'برجر', food: 30, pack: 5, price: 100 };
  const fb = feeBreakdown(item, hunger, settings);

  it('سعر التطبيق = 130', () => expect(fb.listPrice).toBeCloseTo(130, 6));
  it('الخصم = 13 (10% من 130)', () => expect(fb.fullDiscount).toBeCloseTo(13, 6));
  it('ما يدفعه العميل = 117', () => expect(fb.customerPays).toBeCloseTo(117, 6));
  it('العمولة = 29.25 (25% من 117)', () => expect(fb.commission).toBeCloseTo(29.25, 6));
  // رسوم الخدمة: 2% من 117 = 2.34 → يتجاوز الحد الأقصى 2 → 2
  it('رسوم الخدمة محدودة بـ 2 ريال', () => expect(fb.serviceFee).toBeCloseTo(2, 6));
  it('رسوم الدفع = 2.925 (2.5% من 117)', () => expect(fb.paymentFee).toBeCloseTo(2.925, 6));
  // الضريبة = 15% × (29.25 + 2 + 2.925) = 15% × 34.175 = 5.12625
  it('الضريبة على الرسوم = 5.12625', () => expect(fb.vat).toBeCloseTo(5.12625, 6));
  it('التكلفة = 35', () => expect(fb.cost).toBeCloseTo(35, 6));
  // الصافي = 130 - 13 - 29.25 - 2 - 2.925 - 5.12625 - 0 - 35 = 42.69875
  it('صافي الربح = 42.69875', () => expect(fb.net).toBeCloseTo(42.69875, 6));
});

describe('feeBreakdown — الحد الأدنى لرسوم الخدمة', () => {
  // صنف رخيص: customerPays صغير بحيث 2% منه < 0.5 → يُرفع للحد الأدنى 0.5
  const cheap = { name: 'ماء', food: 1, pack: 0.5, price: 5 };
  const fb = feeBreakdown(cheap, hunger, settings);
  it('رسوم الخدمة لا تقل عن 0.5', () => {
    // customerPays = 5*1.3*0.9 = 5.85 ؛ 2% = 0.117 → يُرفع لـ 0.5
    expect(fb.serviceFee).toBeCloseTo(0.5, 6);
  });
});

describe('feeBreakdown — منصة بلا رسوم خدمة', () => {
  const item = { name: 'برجر', food: 30, pack: 5, price: 100 };
  const fb = feeBreakdown(item, jahez, settings);
  it('لا رسوم خدمة عندما serviceFee = 0', () => expect(fb.serviceFee).toBe(0));
});

describe('feeBreakdown — إيقاف الضريبة', () => {
  const item = { name: 'برجر', food: 30, pack: 5, price: 100 };
  const fb = feeBreakdown(item, hunger, { ...settings, vatOnFees: false });
  it('الضريبة = 0 عند الإيقاف', () => expect(fb.vat).toBe(0));
});

describe('feeBreakdown — حصة التوصيل المجاني', () => {
  const item = { name: 'برجر', food: 30, pack: 5, price: 100 };
  const platform = { ...hunger, freeDelivery: 7 };
  const fb = feeBreakdown(item, platform, settings);
  it('تُخصم حصة التوصيل من الصافي', () => {
    expect(fb.deliveryShare).toBe(7);
    expect(fb.net).toBeCloseTo(42.69875 - 7, 6);
  });
});

describe('directProfit & directMargin — الربح المباشر', () => {
  const item = { name: 'برجر', food: 30, pack: 5, price: 100 };
  it('الربح المباشر = 65', () => expect(directProfit(item)).toBe(65));
  it('الهامش المباشر = 65%', () => expect(directMargin(item)).toBeCloseTo(65, 6));
  it('الهامش المباشر = 0 عند سعر 0', () =>
    expect(directMargin({ food: 1, pack: 1, price: 0 })).toBe(0));
});

describe('margin — الهامش على المنصة', () => {
  const item = { name: 'برجر', food: 30, pack: 5, price: 100 };
  it('الهامش = الصافي ÷ سعر التطبيق × 100', () => {
    // 42.69875 / 130 * 100 ≈ 32.845
    expect(margin(item, hunger, settings)).toBeCloseTo(32.845, 3);
  });
});

describe('analyzeIssues — كشف المشاكل', () => {
  // صنف خاسر: سعر منخفض جداً مقابل تكلفة عالية
  const losing = { name: 'وجبة خاسرة', food: 90, pack: 10, price: 100 };
  // صنف رابح
  const winning = { name: 'برجر', food: 30, pack: 5, price: 100 };

  it('يرصد الخسارة كأولوية عالية', () => {
    const issues = analyzeIssues([losing], [hunger], settings);
    expect(issues.length).toBe(1);
    expect(issues[0].type).toBe('loss');
    expect(issues[0].severity).toBe('high');
    expect(issues[0].net).toBeLessThan(0);
    expect(issues[0].requiredIncreasePct).toBeGreaterThan(0);
  });

  it('لا يرصد مشكلة للصنف الرابح ذي الهامش الجيد', () => {
    const issues = analyzeIssues([winning], [hunger], settings);
    expect(issues.length).toBe(0);
  });

  it('يرتّب الخسائر قبل الهوامش الرقيقة', () => {
    const issues = analyzeIssues([losing, winning], [hunger, jahez], settings);
    if (issues.length > 1) {
      expect(issues[0].severity).toBe('high');
    }
  });
});

describe('buildOffers — مقترحات العروض', () => {
  const items = [
    { name: 'برجر', food: 30, pack: 5, price: 100 }, // هامش مباشر 65% → بطل
    { name: 'بطاطس', food: 5, pack: 2, price: 20 }, // هامش مباشر 65% → بطل
    { name: 'ماء', food: 1, pack: 0.5, price: 2 }, // هامش مباشر 25% → بطل بالضبط
  ];
  it('يحدد أبطال العروض (هامش ≥ 25%)', () => {
    const offers = buildOffers(items, [hunger, jahez], settings);
    const hero = offers.find((o) => o.kind === 'hero');
    expect(hero).toBeTruthy();
    expect(hero.items.length).toBeGreaterThan(0);
  });
  it('يقترح المنصة الأعلى ربحاً عند تعدد المنصات', () => {
    const offers = buildOffers(items, [hunger, jahez], settings);
    expect(offers.find((o) => o.kind === 'routing')).toBeTruthy();
  });
  it('يقترح كومبو من صنفين', () => {
    const offers = buildOffers(items, [hunger], settings);
    expect(offers.find((o) => o.kind === 'combo')).toBeTruthy();
  });
});

describe('buildKpis — المؤشرات الرئيسية', () => {
  const items = [
    { name: 'برجر', food: 30, pack: 5, price: 100 },
    { name: 'وجبة خاسرة', food: 90, pack: 10, price: 100 },
  ];
  const kpis = buildKpis(items, [hunger, jahez], settings);
  it('يحسب عدد الأصناف والمنصات', () => {
    expect(kpis.itemCount).toBe(2);
    expect(kpis.platformCount).toBe(2);
  });
  it('يرصد حالات الخسارة', () => {
    expect(kpis.losingCount).toBeGreaterThan(0);
  });
  it('يحدد أفضل منصة', () => {
    expect(kpis.bestPlatform).toBeTruthy();
  });
});
