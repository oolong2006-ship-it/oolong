/* ============================================================
   util.js — أدوات مساعدة: تطبيع النص العربي، تشابه الأسماء،
   تنسيق الأرقام والعملات، وأدوات DOM بسيطة
   ============================================================ */
(function () {
  'use strict';

  // ---------- تطبيع النص العربي لمطابقة أسماء الأصناف ----------
  const AR_DIAC = /[ً-ْٰـ]/g; // تشكيل + تطويل
  const AR_DIGITS = { '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9' };

  function toEnDigits(s) {
    return String(s || '').replace(/[٠-٩]/g, (d) => AR_DIGITS[d]);
  }

  function normalizeArabic(s) {
    return toEnDigits(String(s || ''))
      .replace(AR_DIAC, '')
      .replace(/[أإآٱ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ؤ/g, 'و')
      .replace(/ئ/g, 'ي')
      .replace(/ة/g, 'ه')
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  // ---------- إصلاح النص العربي المستخرج من PDF ----------
  // كثير من ملفات PDF تخزّن العربية بأشكال الحروف المرسومة (Presentation Forms)
  // وبترتيب بصري معكوس، فيخرج النص مقلوبًا ومفككًا عند الاستخراج.
  const AR_PRESENTATION = /[ﭐ-﷿ﹰ-﻿]/;
  const AR_ANY = /[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/;

  function hasArabic(s) { return AR_ANY.test(String(s || '')); }

  // يُطبَّق على كل مقطع نصي مستخرج من PDF:
  // 1) NFKC يحوّل أشكال الحروف المرسومة إلى حروف عربية قياسية (ﻛ → ك، ﻻ → لا)
  // 2) إن كان المقطع مخزّنًا بترتيب بصري معكوس، نعكس المقاطع العربية لإعادة
  //    الترتيب المنطقي مع إبقاء الأرقام والحروف اللاتينية كما هي
  function fixArabicText(s) {
    s = String(s || '');
    if (!AR_PRESENTATION.test(s)) return s; // نص سليم (مخزَّن منطقيًا) — لا نلمسه
    // نعكس أولًا (والحروف ما تزال بأشكالها المرسومة كي تبقى الوصلات مثل ﻷ وحدة واحدة)
    // ثم نحوّلها بـ NFKC إلى حروف قياسية بالترتيب المنطقي الصحيح
    const runs = s.match(/(?:[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]+|[^؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]+)/g) || [s];
    return runs
      .reverse()
      .map((r) => (AR_ANY.test(r) ? [...r].reverse().join('') : r))
      .join('')
      .normalize('NFKC');
  }

  // كلمات شائعة لا تميز الصنف (وحدات/أحجام تبقى مهمة فلا نحذفها)
  const STOP_WORDS = new Set(['من', 'مع', 'او', 'أو', 'and', 'or', 'of', 'the', 'a', 'عدد']);

  function tokenize(s) {
    return normalizeArabic(s).split(' ').filter((t) => t && !STOP_WORDS.has(t));
  }

  // تشابه Dice على مستوى الكلمات + ثنائيات الحروف للكلمات المفردة
  function similarity(a, b) {
    const ta = tokenize(a), tb = tokenize(b);
    if (!ta.length || !tb.length) return 0;
    const sa = new Set(ta), sb = new Set(tb);
    let inter = 0;
    sa.forEach((t) => { if (sb.has(t)) inter++; });
    const tokenScore = (2 * inter) / (sa.size + sb.size);
    // دعم إضافي بالحروف الثنائية لالتقاط اختلافات إملائية بسيطة
    const bg = (s) => {
      const j = tokenize(s).join(' ');
      const set = new Set();
      for (let i = 0; i < j.length - 1; i++) set.add(j.slice(i, i + 2));
      return set;
    };
    const ba = bg(a), bb = bg(b);
    let bi = 0;
    ba.forEach((g) => { if (bb.has(g)) bi++; });
    const bigramScore = ba.size && bb.size ? (2 * bi) / (ba.size + bb.size) : 0;
    return Math.max(tokenScore, bigramScore);
  }

  // ---------- الأرقام والعملة ----------
  function parseNumber(v) {
    if (typeof v === 'number') return isFinite(v) ? v : null;
    let s = toEnDigits(String(v || '')).replace(/[^\d.,\-]/g, '');
    if (!s) return null;
    // 1,234.56 → إزالة فواصل الآلاف؛ 1.234,56 (نمط أوروبي) → تحويل
    if (/,\d{1,2}$/.test(s) && s.includes('.')) s = s.replace(/\./g, '').replace(',', '.');
    else s = s.replace(/,/g, '');
    const n = parseFloat(s);
    return isFinite(n) ? n : null;
  }

  function fmtMoney(n, currency) {
    if (n == null || !isFinite(n)) return '—';
    const s = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
    return `${s} ${currency || ''}`.trim();
  }

  function fmtNum(n, digits = 2) {
    if (n == null || !isFinite(n)) return '—';
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: digits }).format(n);
  }

  function fmtPct(n, digits = 1) {
    if (n == null || !isFinite(n)) return '—';
    return `${fmtNum(n, digits)}%`;
  }

  // ---------- DOM ----------
  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (k === 'class') node.className = v;
        else if (k === 'html') node.innerHTML = v;
        else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
        else if (v != null) node.setAttribute(k, v);
      }
    }
    (children || []).forEach((c) => {
      if (c == null) return;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function uid() {
    return 'id_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  }

  function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result).split(',')[1]);
      r.onerror = () => reject(new Error('تعذر قراءة الملف'));
      r.readAsDataURL(file);
    });
  }

  function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = () => reject(new Error('تعذر قراءة الملف'));
      r.readAsArrayBuffer(file);
    });
  }

  window.U = {
    normalizeArabic, tokenize, similarity, toEnDigits, hasArabic, fixArabicText,
    parseNumber, fmtMoney, fmtNum, fmtPct,
    el, esc, uid, readFileAsBase64, readFileAsArrayBuffer,
  };
})();
