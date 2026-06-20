/* ============================================================
   ai.js — طبقة الذكاء الاصطناعي (Claude API + محرك احتياطي محلي)
   - تقييم بنود التفتيش وتحديثها
   - تحليل الصور ورصد المخالفات تلقائيًا
   - توليد الإجراء التصحيحي والوقائي
   مدعوم بالمواصفات السعودية والخليجية والعالمية (standards.js)
   ============================================================ */
(function () {
  const CFG_KEY = 'fs_ai_cfg_v1';
  const MODEL = 'claude-opus-4-8'; // أحدث نموذج Claude (رؤية + استدلال)
  const API_URL = 'https://api.anthropic.com/v1/messages';

  function cfg() {
    try { return JSON.parse(localStorage.getItem(CFG_KEY)) || {}; } catch (e) { return {}; }
  }
  function setCfg(patch) {
    const c = { ...cfg(), ...patch };
    localStorage.setItem(CFG_KEY, JSON.stringify(c));
    return c;
  }
  function hasKey() { return !!(cfg().apiKey && cfg().apiKey.trim()); }
  function enabled() {
    // في الوضع السحابي: يُشترط أن تتيح الخطة ميزة الذكاء الاصطناعي
    if (window.Cloud && window.Cloud.active && window.Cloud.active() && !window.Cloud.feature('ai')) return false;
    return hasKey() && cfg().enabled !== false;
  }

  // النظام (System prompt) — يحقن المعرفة بالمواصفات
  function systemPrompt() {
    return `أنت خبير سلامة غذاء و GMP و HACCP معتمد، تعمل ضمن نظام رقابة للمطاعم والكافيهات والمصانع الغذائية في السعودية والخليج.
مهمتك تقييم الامتثال ورصد المخالفات وفق المواصفات السعودية (هيئة الغذاء والدواء SFDA)، والخليجية (هيئة التقييس GSO مثل GSO 1694 و GSO 21 و GSO 2233)، والعالمية (Codex Alimentarius، ISO 22000، HACCP).
استند دائمًا إلى هذه المراجع وحدودها الحرجة:
${window.Standards.knowledgeContext()}

أجب بالعربية الفصحى المهنية، وكن دقيقًا وعمليًا. عند رصد عدم مطابقة قدّم دائمًا إجراءً تصحيحيًا فوريًا وإجراءً وقائيًا لمنع التكرار، مع الإشارة إلى المرجع/المواصفة المناسبة.
عندما يُطلب منك صيغة JSON، أعِد JSON صالحًا فقط دون أي نص إضافي أو علامات تنسيق.`;
  }

  // استدعاء Claude API مباشرة من المتصفح
  async function callClaude(content, { maxTokens = 1500 } = {}) {
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
        max_tokens: maxTokens,
        system: systemPrompt(),
        messages: [{ role: 'user', content }],
      }),
    });
    if (!res.ok) {
      let msg = 'فشل الاتصال بخدمة الذكاء الاصطناعي (' + res.status + ')';
      try { const e = await res.json(); if (e.error && e.error.message) msg += ': ' + e.error.message; } catch (_) {}
      throw new Error(msg);
    }
    const data = await res.json();
    const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n');
    return text;
  }

  // استخراج JSON من رد النموذج بأمان
  function parseJSON(text) {
    if (!text) return null;
    let t = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/,'').trim();
    const s = t.indexOf('{'), s2 = t.indexOf('[');
    let start = (s === -1) ? s2 : (s2 === -1 ? s : Math.min(s, s2));
    const e = Math.max(t.lastIndexOf('}'), t.lastIndexOf(']'));
    if (start > -1 && e > -1) t = t.slice(start, e + 1);
    try { return JSON.parse(t); } catch (err) { return null; }
  }

  /* ============ 1) توليد الإجراء التصحيحي والوقائي ============ */
  async function generateCapa(violationText) {
    if (enabled()) {
      try {
        const text = await callClaude(
          `رُصدت حالة عدم مطابقة في منشأة غذائية: "${violationText}".
أعِد JSON فقط بالشكل:
{"severity":"حرجة|عالية|متوسطة|منخفضة","category":"تصنيف موجز","rootCause":"السبب الجذري المحتمل","corrective":"الإجراء التصحيحي الفوري","preventive":"الإجراء الوقائي لمنع التكرار","reference":"المواصفة/المرجع"}`,
          { maxTokens: 900 }
        );
        const j = parseJSON(text);
        if (j && j.corrective) return { ...j, source: 'ai' };
      } catch (e) { /* تجاوز للمحرك المحلي */ }
    }
    // محرك احتياطي محلي
    const m = window.Standards.matchCapa(violationText);
    return { severity: m.severity, category: m.category, rootCause: '', corrective: m.corrective, preventive: m.preventive, reference: m.ref, source: 'local' };
  }

  /* ============ 2) تقييم بند تفتيش وتحديثه ============ */
  async function evaluateItem(itemText) {
    if (enabled()) {
      try {
        const text = await callClaude(
          `قيّم بند التفتيش التالي في قائمة تدقيق GMP: "${itemText}".
أعِد JSON فقط:
{"clarity":"تقييم وضوح البند","risk":"عالٍ|متوسط|منخفض","improved":"صياغة محسّنة وأدق للبند قابلة للقياس","guidance":"إرشاد للمفتش حول كيفية التحقق","reference":"المرجع"}`,
          { maxTokens: 700 }
        );
        const j = parseJSON(text);
        if (j) return { ...j, source: 'ai' };
      } catch (e) { /* تجاوز */ }
    }
    const m = window.Standards.matchCapa(itemText);
    return {
      clarity: 'يُنصح بجعل البند قابلًا للقياس (رقم/حد واضح).',
      risk: m.severity === 'حرجة' ? 'عالٍ' : m.severity === 'عالية' ? 'متوسط' : 'منخفض',
      improved: itemText + ' — مع تحديد الحد المرجعي وآلية التحقق.',
      guidance: 'تحقق ميدانيًا وسجّل القراءة/الدليل الموضوعي.',
      reference: m.ref, source: 'local',
    };
  }

  /* ============ 3) تحليل صورة ورصد المخالفات ============ */
  // image: { data: base64 (بدون بادئة), mediaType }
  async function analyzePhoto(image, note) {
    if (enabled()) {
      try {
        const content = [
          { type: 'image', source: { type: 'base64', media_type: image.mediaType, data: image.data } },
          { type: 'text', text:
            `حلّل هذه الصورة من منشأة غذائية ورصد أي مخالفات لسلامة الغذاء و GMP.${note ? ' ملاحظة المفتش: ' + note : ''}
أعِد JSON فقط بالشكل:
{"summary":"وصف عام موجز للمشهد","violations":[{"title":"المخالفة المرصودة","severity":"حرجة|عالية|متوسطة|منخفضة","corrective":"الإجراء التصحيحي الفوري","preventive":"الإجراء الوقائي لمنع التكرار","reference":"المواصفة/المرجع"}]}
إن لم توجد مخالفات اجعل القائمة فارغة.` },
        ];
        const text = await callClaude(content, { maxTokens: 1800 });
        const j = parseJSON(text);
        if (j && Array.isArray(j.violations)) return { ...j, source: 'ai' };
      } catch (e) {
        return { summary: '', violations: [], error: e.message, source: 'ai' };
      }
    }
    // محرك احتياطي: لا يمكن رؤية الصورة فعليًا دون مفتاح — يعتمد على ملاحظة المفتش
    if (note && note.trim()) {
      const m = window.Standards.matchCapa(note);
      return {
        summary: 'تحليل مبني على ملاحظة المفتش (الوضع المحلي — لرصد آلي من الصورة فعّل خدمة الذكاء الاصطناعي).',
        violations: [{ title: note, severity: m.severity, corrective: m.corrective, preventive: m.preventive, reference: m.ref }],
        source: 'local',
      };
    }
    return {
      summary: '', violations: [], needsKey: true, source: 'local',
      hint: 'الرصد الآلي للمخالفات من الصور يتطلب تفعيل خدمة الذكاء الاصطناعي من الإعدادات. يمكنك حاليًا إدخال ملاحظة نصية ليقترح النظام الإجراءات.',
    };
  }

  window.AI = { cfg, setCfg, hasKey, enabled, MODEL, generateCapa, evaluateItem, analyzePhoto };
})();
