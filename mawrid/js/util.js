/* ============================================================
   util.js — أدوات مساعدة عامة (بدون أي مكتبات خارجية)
   ============================================================ */
window.U = (function () {
  'use strict';

  // إنشاء عنصر DOM بسرعة
  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        if (k === 'class') node.className = attrs[k];
        else if (k === 'html') node.innerHTML = attrs[k];
        else if (k === 'text') node.textContent = attrs[k];
        else if (k.startsWith('on') && typeof attrs[k] === 'function') {
          node.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
        } else if (attrs[k] !== null && attrs[k] !== undefined && attrs[k] !== false) {
          node.setAttribute(k, attrs[k]);
        }
      }
    }
    if (children != null) {
      (Array.isArray(children) ? children : [children]).forEach((c) => {
        if (c == null || c === false) return;
        node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
      });
    }
    return node;
  }

  // تهريب HTML
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // تنسيق الأرقام والعملة
  function fmtNum(n) {
    if (n == null || isNaN(n)) return '—';
    return new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 2 }).format(n);
  }
  function fmtMoney(n, cur) {
    if (n == null || isNaN(n)) return '—';
    return fmtNum(n) + ' ' + (cur || '');
  }
  function fmtPct(n) {
    if (n == null || isNaN(n)) return '—';
    const s = (n > 0 ? '+' : '') + fmtNum(n) + '٪';
    return s;
  }

  // تاريخ مقروء
  function fmtDate(ts) {
    const d = new Date(ts);
    return d.toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' });
  }
  function timeAgo(ts) {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return 'قبل لحظات';
    const m = Math.floor(s / 60); if (m < 60) return `قبل ${m} دقيقة`;
    const h = Math.floor(m / 60); if (h < 24) return `قبل ${h} ساعة`;
    const d = Math.floor(h / 24); return `قبل ${d} يوم`;
  }

  // معرّف قصير
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  // تخزين محلي آمن
  const store = {
    get(key, def) {
      try { const v = localStorage.getItem(key); return v == null ? def : JSON.parse(v); }
      catch (e) { return def; }
    },
    set(key, val) {
      try { localStorage.setItem(key, JSON.stringify(val)); return true; } catch (e) { return false; }
    },
    del(key) { try { localStorage.removeItem(key); } catch (e) {} },
  };

  // ترتيب رقم النجوم كنص
  function stars(r) {
    if (r == null || isNaN(r)) return '—';
    const full = Math.round(r);
    return '★'.repeat(full) + '☆'.repeat(Math.max(0, 5 - full));
  }

  // استخراج نطاق (host) من رابط
  function host(url) {
    try { return new URL(url).hostname.replace(/^www\./, ''); } catch (e) { return url || ''; }
  }

  return { el, esc, fmtNum, fmtMoney, fmtPct, fmtDate, timeAgo, uid, store, stars, host };
})();
