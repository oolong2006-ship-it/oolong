/* ============================================================
   extract.js — استخراج بيانات عروض الأسعار من ملفات PDF
   مساران:
   1) الاستخراج الذكي (Claude API): يُرسل ملف PDF كاملاً إلى النموذج
      claude-opus-4-8 (يدعم قراءة المستندات والصور) ويعيد JSON منظّمًا.
      يعمل حتى مع العروض الممسوحة ضوئيًا.
   2) المحلل المحلي (pdf.js): يستخرج النص ويحاول التعرف على أسطر
      الأصناف بقواعد إرشادية — احتياطي عند عدم توفر مفتاح API.
   ============================================================ */
(function () {
  'use strict';

  const CFG_KEY = 'qc_settings_v1';
  const MODEL = 'claude-opus-4-8';
  const API_URL = 'https://api.anthropic.com/v1/messages';

  function settings() {
    try { return JSON.parse(localStorage.getItem(CFG_KEY)) || {}; } catch (e) { return {}; }
  }
  function saveSettings(patch) {
    const s = { ...settings(), ...patch };
    localStorage.setItem(CFG_KEY, JSON.stringify(s));
    return s;
  }
  function aiEnabled() {
    const s = settings();
    return !!(s.apiKey && s.apiKey.trim()) && s.aiEnabled !== false;
  }

  // ---------- الاستخراج الذكي عبر Claude ----------
  const EXTRACT_PROMPT = `أنت خبير مشتريات محترف. أمامك ملف PDF يحتوي عرض سعر (Quotation) من مورد.
استخرج البيانات التالية وأعدها بصيغة JSON فقط دون أي نص إضافي ودون علامات تنسيق markdown:

{
  "supplier": "اسم المورد أو الشركة كما ورد في العرض",
  "quoteNumber": "رقم العرض إن وجد وإلا null",
  "date": "تاريخ العرض إن وجد وإلا null",
  "currency": "رمز أو اسم العملة المستخدمة (مثل SAR أو ر.س) وإلا null",
  "vatIncluded": true أو false أو null (هل الأسعار شاملة الضريبة؟),
  "items": [
    {
      "name": "اسم الصنف/البند كاملاً",
      "unit": "الوحدة (حبة/كرتون/كجم/خدمة...) وإلا null",
      "qty": الكمية كرقم وإلا 1,
      "unitPrice": سعر الوحدة كرقم,
      "total": الإجمالي للبند كرقم إن وجد وإلا null
    }
  ],
  "subtotal": الإجمالي قبل الضريبة كرقم وإلا null,
  "vat": قيمة الضريبة كرقم وإلا null,
  "grandTotal": الإجمالي النهائي كرقم وإلا null,
  "notes": "أي شروط مهمة (مدة التوريد، الصلاحية، الدفع) باختصار وإلا null"
}

قواعد مهمة:
- استخرج جميع الأصناف دون استثناء وبنفس ترتيبها في العرض.
- إذا وُجد الإجمالي دون سعر الوحدة فاحسب سعر الوحدة = الإجمالي ÷ الكمية.
- الأرقام تكون أرقامًا (numbers) وليست نصوصًا، ولا تستخدم فواصل الآلاف.
- لا تُدرج أسطر المجاميع أو الضريبة أو الخصم ضمن قائمة الأصناف.`;

  async function extractWithAI(file, onStatus) {
    const key = settings().apiKey;
    onStatus && onStatus('جارٍ التحليل بالذكاء الاصطناعي…');
    const b64 = await U.readFileAsBase64(file);
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 8192,
        system: 'أنت مساعد استخراج بيانات دقيق. عندما يُطلب منك JSON أعد JSON صالحًا فقط دون أي نص آخر.',
        messages: [{
          role: 'user',
          content: [
            { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: b64 } },
            { type: 'text', text: EXTRACT_PROMPT },
          ],
        }],
      }),
    });

    if (!res.ok) {
      let msg = `خطأ من الخدمة (${res.status})`;
      try {
        const err = await res.json();
        if (err && err.error && err.error.message) msg += `: ${err.error.message}`;
      } catch (e) { /* تجاهل */ }
      if (res.status === 401) msg = 'مفتاح API غير صالح — راجع الإعدادات';
      if (res.status === 429) msg = 'تم تجاوز حد الطلبات — انتظر قليلاً ثم أعد المحاولة';
      throw new Error(msg);
    }

    const data = await res.json();
    if (data.stop_reason === 'refusal') throw new Error('تعذر تحليل هذا الملف عبر الخدمة');
    const text = (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('\n');
    const parsed = parseJsonLoose(text);
    if (!parsed || !Array.isArray(parsed.items)) throw new Error('لم يُعِد النموذج بيانات صالحة — جرّب المحلل المحلي أو أدخل البيانات يدويًا');
    return normalizeQuote(parsed, file.name);
  }

  function parseJsonLoose(text) {
    if (!text) return null;
    let t = text.trim().replace(/^```(json)?/i, '').replace(/```$/, '').trim();
    try { return JSON.parse(t); } catch (e) { /* محاولة اقتصاص أول كائن JSON */ }
    const start = t.indexOf('{');
    const end = t.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try { return JSON.parse(t.slice(start, end + 1)); } catch (e) { return null; }
    }
    return null;
  }

  // ---------- المحلل المحلي عبر pdf.js ----------
  async function extractTextLines(file) {
    if (!window.pdfjsLib) throw new Error('مكتبة قراءة PDF غير متاحة — أعد تحميل الصفحة');
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'vendor/pdf.worker.min.js';
    const buf = await U.readFileAsArrayBuffer(file);
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
    const lines = [];
    for (let p = 1; p <= pdf.numPages; p++) {
      const page = await pdf.getPage(p);
      const tc = await page.getTextContent();
      // تجميع العناصر حسب الإحداثي الرأسي لإعادة بناء الأسطر
      const rows = new Map();
      for (const it of tc.items) {
        if (!it.str || !it.str.trim()) continue;
        const y = Math.round(it.transform[5] / 3) * 3;
        if (!rows.has(y)) rows.set(y, []);
        rows.get(y).push({ x: it.transform[4], str: it.str });
      }
      const sorted = [...rows.entries()].sort((a, b) => b[0] - a[0]);
      for (const [, parts] of sorted) {
        // ترتيب بصري ثابت (يسار→يمين) — التعرف على الأرقام لاحقًا لا يعتمد على الاتجاه
        parts.sort((a, b) => a.x - b.x);
        lines.push(parts.map((p2) => p2.str).join(' ').replace(/\s+/g, ' ').trim());
      }
    }
    return lines.filter(Boolean);
  }

  const TOTAL_WORDS = /(الاجمالي|الإجمالي|اجمالي|إجمالي|المجموع|مجموع|الضريبه|الضريبة|ضريبة|خصم|صافي|total|subtotal|vat|tax|discount|grand|net)/i;
  // أسطر بيانات وصفية لا تمثل أصنافًا (رقم العرض، التاريخ، بيانات الاتصال...)
  const SKIP_LINE = /(quotation|invoice|فاتورة|عرض\s*سعر|تاريخ|date|رقم\s*(العرض|الفاتوره|الفاتورة)|هاتف|جوال|فاكس|phone|mobile|fax|email|بريد|سجل\s*تجاري|c\.?r\.?\s*(no|:)|vat\s*(no|reg)|الرقم\s*الضريبي|ص\.?\s*ب|p\.?o\.?\s*box|iban|صفحة|page)/i;
  const UNIT_WORDS = ['حبه', 'حبة', 'قطعه', 'قطعة', 'كرتون', 'علبه', 'علبة', 'كجم', 'كيلو', 'جرام', 'لتر', 'متر', 'عبوة', 'كيس', 'شد', 'درزن', 'طقم', 'خدمة', 'شهر', 'سنة', 'pcs', 'pc', 'kg', 'g', 'l', 'ml', 'm', 'box', 'ctn', 'set', 'unit', 'ea'];

  // البحث عن ثلاثية (كمية × سعر وحدة = إجمالي) بين أرقام السطر بغضّ النظر عن ترتيبها
  // — يجعل التحليل مستقلًا عن اتجاه الجدول (عربي RTL أو إنجليزي LTR)
  function findTriple(nums) {
    let best = null;
    for (let i = 0; i < nums.length; i++) {
      for (let j = 0; j < nums.length; j++) {
        if (i === j) continue;
        const q = nums[i], p = nums[j];
        if (q <= 0 || p <= 0 || q > 100000) continue;
        for (let k = 0; k < nums.length; k++) {
          if (k === i || k === j) continue;
          const t = nums[k];
          if (Math.abs(q * p - t) < Math.max(0.02 * Math.abs(t), 0.51)) {
            // نفضل كمية صحيحة صغيرة نسبيًا وسعرًا أكبر من الكمية
            const score = (Number.isInteger(q) ? 2 : 0) + (q <= p ? 1 : 0) + (q <= 10000 ? 1 : 0);
            if (!best || score > best.score || (score === best.score && t > best.t)) {
              best = { q, p, t, score };
            }
          }
        }
      }
    }
    return best;
  }

  function parseLinesHeuristic(lines, fileName) {
    const items = [];
    let supplier = null, grandTotal = null;

    // اسم المورد: أول سطر نصي بارز لا يحتوي كلمات "عرض سعر"
    for (const ln of lines.slice(0, 8)) {
      const t = ln.trim();
      if (!t || /عرض\s*سعر|quotation|invoice|فاتورة|تاريخ|date|رقم/i.test(t)) continue;
      if (U.tokenize(t).length >= 1 && !/^\d+$/.test(U.toEnDigits(t))) { supplier = t.slice(0, 60); break; }
    }

    for (const raw of lines) {
      const ln = U.toEnDigits(raw);
      const nums = (ln.match(/\d[\d,]*(?:\.\d+)?/g) || []).map(U.parseNumber).filter((n) => n != null);
      if (TOTAL_WORDS.test(ln)) {
        if (/(الاجمالي|الإجمالي|grand|net|صافي)/i.test(ln) && nums.length) {
          grandTotal = Math.max(grandTotal || 0, ...nums);
        }
        continue;
      }
      if (SKIP_LINE.test(ln)) continue;
      if (nums.length < 2) continue;
      // النص = السطر بعد إزالة الأرقام
      const name = ln.replace(/\d[\d,]*(?:\.\d+)?/g, ' ').replace(/[|:؛]+/g, ' ').replace(/\s+/g, ' ').trim();
      if (U.tokenize(name).length < 1) continue;
      if (name.length < 3) continue;

      // البحث عن (كمية × سعر = إجمالي) بين أرقام السطر أيًا كان ترتيبها
      let qty = 1, unitPrice = null, total = null;
      const triple = findTriple(nums);
      if (triple) {
        qty = triple.q; unitPrice = triple.p; total = triple.t;
      } else if (nums.length === 2) {
        // سطر بلا إجمالي: الرقم الصحيح الأصغر كمية والآخر سعر الوحدة
        const [a, b] = nums;
        const small = Math.min(a, b), large = Math.max(a, b);
        if (Number.isInteger(small) && small <= 10000) { qty = small; unitPrice = large; }
        else { qty = 1; unitPrice = large; }
      }
      if (unitPrice == null || unitPrice <= 0) continue;

      let unit = null;
      const nTokens = U.tokenize(name);
      for (const u of UNIT_WORDS) { if (nTokens.includes(U.normalizeArabic(u))) { unit = u; break; } }

      items.push({ name: name.slice(0, 120), unit, qty: qty || 1, unitPrice, total: total != null ? total : (qty || 1) * unitPrice });
    }

    return normalizeQuote({
      supplier: supplier || fileName.replace(/\.pdf$/i, ''),
      items, grandTotal,
    }, fileName);
  }

  async function extractLocal(file, onStatus) {
    onStatus && onStatus('جارٍ استخراج النص من الملف…');
    const lines = await extractTextLines(file);
    if (!lines.length) throw new Error('الملف لا يحتوي نصًا قابلًا للقراءة (قد يكون صورة ممسوحة) — فعّل الاستخراج الذكي من الإعدادات');
    const quote = parseLinesHeuristic(lines, file.name);
    if (!quote.items.length) throw new Error('لم يتعرف المحلل المحلي على أصناف — فعّل الاستخراج الذكي أو أدخل البيانات يدويًا');
    return quote;
  }

  // ---------- توحيد شكل العرض المستخرج ----------
  function normalizeQuote(q, fileName) {
    const items = (q.items || []).map((it) => ({
      id: U.uid(),
      name: String(it.name || '').trim(),
      unit: it.unit ? String(it.unit).trim() : '',
      qty: U.parseNumber(it.qty) || 1,
      unitPrice: U.parseNumber(it.unitPrice),
      total: U.parseNumber(it.total),
    })).filter((it) => it.name && it.unitPrice != null && it.unitPrice > 0);
    items.forEach((it) => { if (it.total == null) it.total = +(it.qty * it.unitPrice).toFixed(2); });
    return {
      id: U.uid(),
      supplier: String(q.supplier || fileName || 'مورد').trim(),
      quoteNumber: q.quoteNumber || null,
      date: q.date || null,
      currency: q.currency || null,
      vatIncluded: q.vatIncluded == null ? null : !!q.vatIncluded,
      subtotal: U.parseNumber(q.subtotal),
      vat: U.parseNumber(q.vat),
      grandTotal: U.parseNumber(q.grandTotal),
      notes: q.notes || null,
      fileName: fileName || null,
      items,
    };
  }

  // ---------- الواجهة العامة ----------
  async function extractQuote(file, onStatus) {
    if (aiEnabled()) {
      try {
        return await extractWithAI(file, onStatus);
      } catch (e) {
        onStatus && onStatus('تعذر الاستخراج الذكي — محاولة بالمحلل المحلي…');
        try { return await extractLocal(file, onStatus); }
        catch (e2) { throw e; } // خطأ الذكاء الاصطناعي أوضح للمستخدم
      }
    }
    return extractLocal(file, onStatus);
  }

  window.Extract = { extractQuote, aiEnabled, settings, saveSettings, MODEL };
})();
