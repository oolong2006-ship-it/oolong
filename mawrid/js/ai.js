/* ============================================================
   ai.js — محرك البحث عن الموردين عبر الإنترنت
   يستخدم Claude مع أداة البحث على الويب (web_search) للعثور
   فعلياً على جميع الموردين الذين يبيعون منتجًا محددًا بأفضل الأسعار.
   - الوضع المتصل: استدعاء Claude API مباشرة من المتصفح.
   - الوضع التجريبي: بيانات نموذجية عند غياب مفتاح API (لاستكشاف الواجهة).
   ============================================================ */
window.AI = (function () {
  'use strict';

  const CFG_KEY = 'mawrid_cfg_v1';
  const MODEL = 'claude-opus-4-8';                 // نموذج يدعم البحث على الويب مع التصفية الديناميكية
  const API_URL = 'https://api.anthropic.com/v1/messages';
  const SEARCH_TOOL = 'web_search_20260209';       // أداة البحث على الويب

  function cfg() { return U.store.get(CFG_KEY, {}) || {}; }
  function setCfg(patch) { const c = { ...cfg(), ...patch }; U.store.set(CFG_KEY, c); return c; }
  function hasKey() { const c = cfg(); return !!(c.apiKey && c.apiKey.trim()); }
  function enabled() { return hasKey() && cfg().enabled !== false; }

  // ---------- بناء التوجيه (Prompt) ----------
  function systemPrompt() {
    return `أنت مساعد بحث مشتريات خبير يعمل لصالح مدير مشتريات. مهمتك: عند إعطائك اسم صنف/منتج،
تبحث في الإنترنت (باستخدام أداة البحث على الويب) للعثور على أكبر عدد ممكن من الموردين/المتاجر/المصنّعين
الذين يبيعون هذا المنتج **بالضبط** (نفس المنتج ونفس المواصفات قدر الإمكان)، ثم تجمع لكل مورد:
اسم المورد، وصف المنتج المطابق، السعر والعملة، الدولة/منطقة التوريد، رابط الصفحة، حالة التوفر،
مدة التوريد التقديرية بالأيام، وتقييم تقديري لموثوقية/جودة المورد (0 إلى 5)، ومستوى تطابق المنتج.

قواعد مهمة:
- ابحث بعدة صيغ واستعلامات متنوّعة (بالعربية والإنجليزية) لتغطية أكبر عدد من المصادر المحلية والإقليمية والعالمية.
- أدرج فقط الموردين الذين يعرضون المنتج المطلوب فعليًا؛ إن كان التطابق غير مؤكد اذكر ذلك في matchConfidence.
- أزل التكرار (نفس المورد ونفس المنتج مرة واحدة).
- لا تخترع أسعارًا؛ إن لم يظهر السعر ضع price = null واذكر السبب في notes.
- استخرج العملة كما هي (مثل SAR أو USD أو AED …). إن لم تُذكر، استنتجها من الدولة إن أمكن.

أعِد **في رسالتك النهائية JSON صالحًا فقط** دون أي نص إضافي أو أسيجة تنسيق، بالشكل:
{
  "query": "اسم الصنف كما بحثت عنه",
  "currencyHint": "العملة الغالبة (مثل SAR)",
  "suppliers": [
    {
      "supplier": "اسم المورد",
      "product": "وصف المنتج المطابق",
      "price": 0,
      "currency": "SAR",
      "region": "الدولة/المنطقة",
      "url": "https://...",
      "availability": "متوفر|حسب الطلب|غير معروف",
      "leadTimeDays": 0,
      "rating": 0,
      "matchConfidence": "عالٍ|متوسط|منخفض",
      "notes": "ملاحظات موجزة"
    }
  ]
}`;
  }

  function userPrompt(product, opts) {
    opts = opts || {};
    let extra = '';
    if (opts.region) extra += `\nركّز على الموردين في: ${opts.region} (مع إمكانية إضافة موردين دوليين يشحنون إليها).`;
    if (opts.currency) extra += `\nيفضّل عرض الأسعار بعملة: ${opts.currency} إن توفّر.`;
    return `ابحث في الإنترنت عن جميع الموردين المتاحين للمنتج التالي بأفضل الأسعار: «${product}».${extra}
اجمع أكبر عدد ممكن (10 موردين أو أكثر إن وُجدوا) ثم أعِد النتيجة بصيغة JSON المطلوبة فقط.`;
  }

  // ---------- استخراج JSON من نص ----------
  function parseJSON(text) {
    if (!text) return null;
    let t = String(text).trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
    const s = t.indexOf('{'); const e = t.lastIndexOf('}');
    if (s > -1 && e > -1) t = t.slice(s, e + 1);
    try { return JSON.parse(t); } catch (err) { return null; }
  }

  // ---------- تطبيع نتيجة مورد ----------
  function normalize(list) {
    if (!Array.isArray(list)) return [];
    return list.map((s) => ({
      id: U.uid(),
      supplier: s.supplier || s.name || 'مورد غير مسمّى',
      product: s.product || '',
      price: (s.price === '' || s.price == null || isNaN(+s.price)) ? null : +s.price,
      currency: s.currency || '',
      region: s.region || '',
      url: s.url || '',
      availability: s.availability || 'غير معروف',
      leadTimeDays: (s.leadTimeDays == null || isNaN(+s.leadTimeDays)) ? null : +s.leadTimeDays,
      rating: (s.rating == null || isNaN(+s.rating)) ? null : Math.max(0, Math.min(5, +s.rating)),
      matchConfidence: s.matchConfidence || 'متوسط',
      notes: s.notes || '',
    }));
  }

  // ---------- استدعاء Claude مع البحث على الويب ----------
  async function callClaude(product, opts) {
    const c = cfg();
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': c.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: c.model || MODEL,
        max_tokens: 4096,
        system: systemPrompt(),
        tools: [{ type: SEARCH_TOOL, name: 'web_search', max_uses: 8 }],
        messages: [{ role: 'user', content: userPrompt(product, opts) }],
      }),
    });
    if (!res.ok) {
      let msg = 'تعذّر الاتصال بخدمة البحث (' + res.status + ')';
      try { const e = await res.json(); if (e.error && e.error.message) msg += ': ' + e.error.message; } catch (_) {}
      throw new Error(msg);
    }
    const data = await res.json();
    // جمع نص الرد النهائي + عدد استعلامات البحث المنفّذة
    const blocks = data.content || [];
    const text = blocks.filter((b) => b.type === 'text').map((b) => b.text).join('\n');
    const searches = blocks.filter((b) => b.type === 'server_tool_use' && b.name === 'web_search').length;
    const parsed = parseJSON(text);
    if (!parsed || !parsed.suppliers) {
      throw new Error('لم يُرجع النموذج نتائج قابلة للقراءة. حاول تبسيط اسم الصنف.');
    }
    return {
      query: parsed.query || product,
      currencyHint: parsed.currencyHint || opts.currency || '',
      suppliers: normalize(parsed.suppliers),
      searches,
      source: 'ai',
    };
  }

  // ---------- الوضع التجريبي (بدون مفتاح) ----------
  function demoSearch(product, opts) {
    const cur = (opts && opts.currency) || 'SAR';
    const base = 400 + Math.floor(Math.random() * 600);
    const regions = ['السعودية', 'الإمارات', 'الصين', 'ألمانيا', 'تركيا', 'مصر', 'الهند', 'الولايات المتحدة'];
    const names = ['الرواد للتوريدات', 'Gulf Supply Co', 'MegaParts', 'شركة الإمداد الحديثة',
      'EuroTrade GmbH', 'Anadolu Tedarik', 'النيل للتجارة', 'Bharat Industrial', 'Prime Sourcing LLC', 'الخليج الصناعي'];
    const n = 8 + Math.floor(Math.random() * 4);
    const suppliers = [];
    for (let i = 0; i < n; i++) {
      const price = Math.round((base * (0.75 + Math.random() * 0.7)) * 100) / 100;
      suppliers.push({
        id: U.uid(),
        supplier: names[i % names.length] + (i >= names.length ? ' ٢' : ''),
        product: product + ' — مطابق للمواصفات',
        price,
        currency: cur,
        region: regions[i % regions.length],
        url: 'https://example.com/' + encodeURIComponent(product).slice(0, 20) + '/' + i,
        availability: ['متوفر', 'متوفر', 'حسب الطلب'][i % 3],
        leadTimeDays: [3, 7, 14, 21, 30][i % 5],
        rating: Math.round((3 + Math.random() * 2) * 10) / 10,
        matchConfidence: ['عالٍ', 'عالٍ', 'متوسط'][i % 3],
        notes: 'بيانات تجريبية توضيحية',
      });
    }
    return Promise.resolve({
      query: product, currencyHint: cur, suppliers, searches: 0, source: 'demo',
    });
  }

  // ---------- الواجهة العامة ----------
  async function search(product, opts) {
    opts = opts || {};
    if (!product || !product.trim()) throw new Error('أدخل اسم الصنف أولاً.');
    if (enabled()) return await callClaude(product.trim(), opts);
    return await demoSearch(product.trim(), opts);
  }

  return { search, cfg, setCfg, hasKey, enabled, MODEL };
})();
