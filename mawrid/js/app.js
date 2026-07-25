/* ============================================================
   app.js — واجهة تطبيق «مَورِد»: البحث، المقارنة، الفلاتر،
   المتابعة (Watchlist)، التحديث التلقائي، والتنبيهات الذكية.
   ============================================================ */
(function () {
  'use strict';
  const { el, esc, fmtMoney, fmtNum, fmtPct, timeAgo, stars, host } = U;

  const WATCH_KEY = 'mawrid_watch_v1';
  const ALERTS_KEY = 'mawrid_alerts_v1';

  const state = {
    query: '',
    result: null,          // { query, currencyHint, suppliers, searches, source }
    sort: 'price',         // price | rating | lead | value
    filters: { maxPrice: null, minRating: 0, maxLead: null, region: '', match: '' },
    loading: false,
  };

  const content = document.getElementById('content');

  /* ================= أدوات البيانات ================= */
  function watchlist() { return U.store.get(WATCH_KEY, []) || []; }
  function saveWatchlist(w) { U.store.set(WATCH_KEY, w); }
  function alerts() { return U.store.get(ALERTS_KEY, []) || []; }
  function saveAlerts(a) { U.store.set(ALERTS_KEY, a.slice(0, 100)); }

  function pushAlert(a) {
    const list = alerts();
    list.unshift({ id: U.uid(), ts: Date.now(), read: false, ...a });
    saveAlerts(list);
    updateBell();
    if (U.store.get('mawrid_notify', false)) notify(a.title, a.body);
  }

  function notify(title, body) {
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body });
      }
    } catch (e) {}
  }

  /* ================= الفلاتر والترتيب ================= */
  function applyFilters(suppliers) {
    const f = state.filters;
    let out = suppliers.filter((s) => {
      if (f.maxPrice != null && s.price != null && s.price > f.maxPrice) return false;
      if (f.minRating && (s.rating == null || s.rating < f.minRating)) return false;
      if (f.maxLead != null && s.leadTimeDays != null && s.leadTimeDays > f.maxLead) return false;
      if (f.region && !(s.region || '').includes(f.region)) return false;
      if (f.match && s.matchConfidence !== f.match) return false;
      return true;
    });
    out.sort((a, b) => {
      if (state.sort === 'price') return num(a.price, Infinity) - num(b.price, Infinity);
      if (state.sort === 'rating') return num(b.rating, -1) - num(a.rating, -1);
      if (state.sort === 'lead') return num(a.leadTimeDays, Infinity) - num(b.leadTimeDays, Infinity);
      if (state.sort === 'value') return valueScore(b) - valueScore(a);
      return 0;
    });
    return out;
  }
  function num(v, d) { return v == null || isNaN(v) ? d : v; }

  // مؤشر «أفضل قيمة» = تقييم عالٍ + سعر منخفض + توريد أسرع
  function valueScore(s) {
    const priceMax = Math.max(...(state.result.suppliers.map((x) => x.price).filter((p) => p != null)), 1);
    const priceNorm = s.price == null ? 0.5 : 1 - (s.price / priceMax);
    const ratingNorm = (s.rating || 0) / 5;
    const leadNorm = s.leadTimeDays == null ? 0.5 : Math.max(0, 1 - s.leadTimeDays / 60);
    return priceNorm * 0.5 + ratingNorm * 0.35 + leadNorm * 0.15;
  }

  /* ================= الملخّص (بطاقات القرار) ================= */
  function summarize(suppliers) {
    const priced = suppliers.filter((s) => s.price != null);
    const cheapest = priced.slice().sort((a, b) => a.price - b.price)[0];
    const rated = suppliers.filter((s) => s.rating != null).sort((a, b) => b.rating - a.rating)[0];
    const fastest = suppliers.filter((s) => s.leadTimeDays != null).sort((a, b) => a.leadTimeDays - b.leadTimeDays)[0];
    const best = suppliers.slice().sort((a, b) => valueScore(b) - valueScore(a))[0];
    const avg = priced.length ? priced.reduce((s, x) => s + x.price, 0) / priced.length : null;
    return { cheapest, rated, fastest, best, avg, count: suppliers.length, priced: priced.length };
  }

  /* ================= التنفيذ: بحث ================= */
  async function runSearch(product, opts, silent) {
    state.loading = true;
    if (!silent) render();
    try {
      const result = await AI.search(product, opts || currentOpts());
      state.result = result;
      state.query = result.query;
      state.loading = false;
      render();
      return result;
    } catch (e) {
      state.loading = false;
      render();
      toast(e.message || 'حدث خطأ أثناء البحث', 'err');
      throw e;
    }
  }

  function currentOpts() {
    const c = AI.cfg();
    return { currency: c.currency || 'SAR', region: c.region || '' };
  }

  /* ================= المتابعة والتحديث التلقائي ================= */
  function addToWatch() {
    if (!state.result) return;
    const w = watchlist();
    const item = {
      id: U.uid(),
      query: state.query,
      opts: currentOpts(),
      baseline: snapshotFor(state.result.suppliers),
      lastRun: Date.now(),
      lastCount: state.result.suppliers.length,
      bestPrice: bestPrice(state.result.suppliers),
    };
    w.unshift(item);
    saveWatchlist(w);
    toast('تمت إضافة الصنف إلى قائمة المتابعة — سيُنبّهك النظام عند تغيّر الأسعار أو ظهور موردين جدد', 'ok');
    render();
  }

  function snapshotFor(suppliers) {
    // خريطة مورد→سعر لاكتشاف التغيّرات لاحقًا
    const m = {};
    suppliers.forEach((s) => { m[keyOf(s)] = { price: s.price, supplier: s.supplier }; });
    return m;
  }
  function keyOf(s) { return (s.supplier || '').trim().toLowerCase() + '|' + host(s.url); }
  function bestPrice(suppliers) {
    const p = suppliers.map((s) => s.price).filter((x) => x != null);
    return p.length ? Math.min(...p) : null;
  }

  async function refreshWatch(id, silent) {
    const w = watchlist();
    const item = w.find((x) => x.id === id);
    if (!item) return;
    toast('جارٍ تحديث «' + item.query + '» …', 'info');
    let result;
    try { result = await AI.search(item.query, item.opts); }
    catch (e) { toast('تعذّر التحديث: ' + e.message, 'err'); return; }

    // اكتشاف التغييرات مقابل الأساس
    const oldMap = item.baseline || {};
    const newSuppliers = result.suppliers;
    const newKeys = new Set(newSuppliers.map(keyOf));
    const changes = [];
    newSuppliers.forEach((s) => {
      const prev = oldMap[keyOf(s)];
      if (!prev) { changes.push({ type: 'new', s }); return; }
      if (prev.price != null && s.price != null && s.price !== prev.price) {
        const diff = s.price - prev.price;
        const pct = prev.price ? (diff / prev.price) * 100 : 0;
        changes.push({ type: diff < 0 ? 'drop' : 'rise', s, prev: prev.price, diff, pct });
      }
    });

    const newBest = bestPrice(newSuppliers);
    // توليد تنبيهات
    const drops = changes.filter((c) => c.type === 'drop');
    const news = changes.filter((c) => c.type === 'new');
    if (drops.length) {
      const biggest = drops.slice().sort((a, b) => a.pct - b.pct)[0];
      pushAlert({
        kind: 'drop', query: item.query,
        title: '📉 انخفاض سعر — ' + item.query,
        body: `${biggest.s.supplier} خفّض السعر إلى ${fmtMoney(biggest.s.price, biggest.s.currency)} (${fmtPct(biggest.pct)}) — و ${drops.length} انخفاض سعري إجمالًا.`,
      });
    }
    if (news.length) {
      pushAlert({
        kind: 'new', query: item.query,
        title: '🆕 موردون جدد — ' + item.query,
        body: `تم العثور على ${news.length} مورد جديد لهذا المنتج. أفضل سعر متاح الآن: ${fmtMoney(newBest, result.currencyHint)}.`,
      });
    }
    if (item.bestPrice != null && newBest != null && newBest < item.bestPrice) {
      pushAlert({
        kind: 'best', query: item.query,
        title: '⭐ أفضل سعر جديد — ' + item.query,
        body: `أفضل سعر انخفض من ${fmtMoney(item.bestPrice, result.currencyHint)} إلى ${fmtMoney(newBest, result.currencyHint)}.`,
      });
    }

    // تحديث الأساس
    item.baseline = snapshotFor(newSuppliers);
    item.lastRun = Date.now();
    item.lastCount = newSuppliers.length;
    item.bestPrice = newBest;
    saveWatchlist(w);

    if (!changes.length) toast('لا تغييرات جوهرية في «' + item.query + '»', 'ok');
    else toast(`«${item.query}»: ${changes.length} تغيير — راجع التنبيهات`, 'ok');

    // إن كان الصنف معروضًا حاليًا، حدّث العرض
    if (state.query === item.query) { state.result = result; }
    render();
  }

  function removeWatch(id) {
    saveWatchlist(watchlist().filter((x) => x.id !== id));
    render();
  }

  async function refreshAll() {
    const w = watchlist();
    if (!w.length) { toast('قائمة المتابعة فارغة', 'info'); return; }
    for (const item of w) { await refreshWatch(item.id, true); }
    toast('اكتمل تحديث كل الأصناف المتابَعة', 'ok');
  }

  /* ================= التصيير (Render) ================= */
  function render() {
    content.innerHTML = '';
    content.appendChild(renderSearchBar());
    if (state.loading) { content.appendChild(renderLoading()); return; }
    if (state.result) {
      content.appendChild(renderSummary());
      content.appendChild(renderFilters());
      content.appendChild(renderTable());
    } else {
      content.appendChild(renderEmpty());
    }
    if (watchlist().length) content.appendChild(renderWatch());
    updateBell();
    updateModeBadge();
  }

  function renderSearchBar() {
    const input = el('input', {
      class: 'search-input', id: 'q', type: 'text',
      placeholder: 'اكتب اسم الصنف بدقة… مثال: "مضخة مياه غاطسة 1.5 حصان" أو "Dell OptiPlex 7010 i7"',
      value: state.query, autocomplete: 'off',
    });
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(); });
    function doSearch() {
      const v = input.value.trim();
      if (!v) { toast('اكتب اسم الصنف أولاً', 'err'); return; }
      runSearch(v);
    }
    const btn = el('button', { class: 'btn-primary', onClick: doSearch }, '🔎 ابحث عن الموردين');
    const box = el('div', { class: 'search-box' }, [input, btn]);
    const hint = el('p', { class: 'search-hint' },
      'يبحث النظام في المواقع والمتاجر عبر الإنترنت ويجمع الموردين الذين يبيعون هذا المنتج بالضبط، مع مقارنة الأسعار.');
    return el('section', { class: 'search-section' }, [box, hint]);
  }

  function renderLoading() {
    return el('div', { class: 'loading' }, [
      el('div', { class: 'spinner' }),
      el('p', { html: 'جارٍ البحث في الإنترنت عن الموردين لـ <strong>' + esc(state.query) + '</strong> …' }),
      el('p', { class: 'muted small' }, AI.enabled() ? 'يشغّل النظام عدة استعلامات بحث ويحلّل النتائج — قد يستغرق ذلك بضع ثوانٍ.' : 'الوضع التجريبي (بدون مفتاح) — بيانات توضيحية.'),
    ]);
  }

  function renderEmpty() {
    return el('div', { class: 'empty' }, [
      el('div', { class: 'empty-icon' }, '🧭'),
      el('h2', {}, 'ابدأ بالبحث عن صنف'),
      el('p', { class: 'muted' }, 'أدخل اسم المنتج في الأعلى ليجمع النظام كل الموردين المحتملين له من الإنترنت ويقارن أسعارهم وجودتهم ومدة توريدهم.'),
      !AI.hasKey() ? el('p', { class: 'notice' },
        'تعمل الآن في الوضع التجريبي. للبحث الحقيقي عبر الإنترنت أدخل مفتاح Claude API من ⚙️ الإعدادات.') : null,
    ]);
  }

  function renderSummary() {
    const all = state.result.suppliers;
    const s = summarize(all);
    const cur = state.result.currencyHint;
    function card(cls, icon, label, sup, valueHtml) {
      if (!sup) return el('div', { class: 'sumcard ' + cls }, [
        el('div', { class: 'sum-top' }, [el('span', { class: 'sum-icon' }, icon), el('span', { class: 'sum-label' }, label)]),
        el('div', { class: 'sum-empty' }, '—'),
      ]);
      return el('div', { class: 'sumcard ' + cls }, [
        el('div', { class: 'sum-top' }, [el('span', { class: 'sum-icon' }, icon), el('span', { class: 'sum-label' }, label)]),
        el('div', { class: 'sum-value', html: valueHtml }),
        el('div', { class: 'sum-sub' }, sup.supplier),
      ]);
    }
    const cards = el('div', { class: 'summary' }, [
      card('best-price', '💰', 'أفضل سعر', s.cheapest, s.cheapest ? fmtMoney(s.cheapest.price, s.cheapest.currency || cur) : ''),
      card('best-rated', '⭐', 'أعلى تقييم', s.rated, s.rated ? U.stars(s.rated.rating) + ' <small>(' + fmtNum(s.rated.rating) + ')</small>' : ''),
      card('fastest', '⚡', 'أسرع توريد', s.fastest, s.fastest ? fmtNum(s.fastest.leadTimeDays) + ' يوم' : ''),
      card('best-value', '🎯', 'أفضل قيمة', s.best, s.best ? (s.best.price != null ? fmtMoney(s.best.price, s.best.currency || cur) : U.stars(s.best.rating)) : ''),
    ]);
    const meta = el('div', { class: 'result-meta' }, [
      el('div', {}, [
        el('h2', { class: 'result-title' }, [document.createTextNode('نتائج: '), el('span', { class: 'q' }, state.query)]),
        el('p', { class: 'muted small' },
          `${s.count} مورد • ${s.priced} بسعر معلن • متوسط السعر ${fmtMoney(s.avg, cur)} • ` +
          (state.result.source === 'ai' ? `عبر ${state.result.searches} استعلام بحث مباشر` : 'وضع تجريبي')),
      ]),
      el('div', { class: 'result-actions' }, [
        el('button', { class: 'btn-ghost', onClick: () => runSearch(state.query) }, '↻ تحديث'),
        el('button', { class: 'btn-ghost', onClick: addToWatch }, '➕ متابعة الصنف'),
        el('button', { class: 'btn-ghost', onClick: exportCSV }, '⬇️ CSV'),
      ]),
    ]);
    return el('section', { class: 'summary-section' }, [meta, cards]);
  }

  function renderFilters() {
    const f = state.filters;
    function field(label, node) { return el('label', { class: 'filter' }, [el('span', {}, label), node]); }
    const maxPrice = el('input', { type: 'number', min: '0', placeholder: 'بلا حد', value: f.maxPrice ?? '' });
    maxPrice.addEventListener('input', () => { f.maxPrice = maxPrice.value === '' ? null : +maxPrice.value; render(); });

    const minRating = el('select', {});
    [['0', 'الكل'], ['3', '3+'], ['4', '4+'], ['4.5', '4.5+']].forEach(([v, t]) =>
      minRating.appendChild(el('option', { value: v, selected: +v === f.minRating ? 'selected' : null }, t)));
    minRating.addEventListener('change', () => { f.minRating = +minRating.value; render(); });

    const maxLead = el('input', { type: 'number', min: '0', placeholder: 'بلا حد', value: f.maxLead ?? '' });
    maxLead.addEventListener('input', () => { f.maxLead = maxLead.value === '' ? null : +maxLead.value; render(); });

    const region = el('select', {});
    region.appendChild(el('option', { value: '' }, 'كل المناطق'));
    [...new Set(state.result.suppliers.map((s) => s.region).filter(Boolean))].forEach((r) =>
      region.appendChild(el('option', { value: r, selected: r === f.region ? 'selected' : null }, r)));
    region.addEventListener('change', () => { f.region = region.value; render(); });

    const match = el('select', {});
    [['', 'كل مستويات التطابق'], ['عالٍ', 'تطابق عالٍ'], ['متوسط', 'تطابق متوسط'], ['منخفض', 'تطابق منخفض']].forEach(([v, t]) =>
      match.appendChild(el('option', { value: v, selected: v === f.match ? 'selected' : null }, t)));
    match.addEventListener('change', () => { f.match = match.value; render(); });

    const sort = el('select', {});
    [['price', 'الأقل سعرًا'], ['rating', 'الأعلى تقييمًا'], ['lead', 'الأسرع توريدًا'], ['value', 'أفضل قيمة']].forEach(([v, t]) =>
      sort.appendChild(el('option', { value: v, selected: v === state.sort ? 'selected' : null }, t)));
    sort.addEventListener('change', () => { state.sort = sort.value; render(); });

    const reset = el('button', { class: 'btn-ghost small', onClick: () => { state.filters = { maxPrice: null, minRating: 0, maxLead: null, region: '', match: '' }; render(); } }, 'تصفير');

    return el('section', { class: 'filters' }, [
      field('أقصى سعر', maxPrice),
      field('التقييم', minRating),
      field('أقصى مدة توريد (يوم)', maxLead),
      field('المنطقة', region),
      field('التطابق', match),
      field('الترتيب', sort),
      el('div', { class: 'filter reset' }, reset),
    ]);
  }

  function renderTable() {
    const rows = applyFilters(state.result.suppliers);
    const cur = state.result.currencyHint;
    if (!rows.length) return el('div', { class: 'empty small' }, 'لا موردين مطابقين للفلاتر الحالية.');

    const cheapest = rows.filter((s) => s.price != null).sort((a, b) => a.price - b.price)[0];
    const bestVal = rows.slice().sort((a, b) => valueScore(b) - valueScore(a))[0];

    const head = el('tr', {}, ['المورد', 'المنتج المطابق', 'السعر', 'التقييم', 'التوريد', 'المنطقة', 'التوفر', 'التطابق', '']
      .map((h) => el('th', {}, h)));

    const body = rows.map((s) => {
      const badges = [];
      if (cheapest && s.id === cheapest.id) badges.push(el('span', { class: 'tag best' }, 'الأرخص'));
      if (bestVal && s.id === bestVal.id) badges.push(el('span', { class: 'tag value' }, 'أفضل قيمة'));
      const nameCell = el('td', {}, [
        el('div', { class: 'sup-name' }, [document.createTextNode(s.supplier), ...badges]),
        s.notes ? el('div', { class: 'sup-note' }, s.notes) : null,
      ]);
      const link = s.url ? el('a', { href: s.url, target: '_blank', rel: 'noopener', class: 'sup-link' }, host(s.url)) : null;
      return el('tr', {}, [
        nameCell,
        el('td', {}, [el('span', { class: 'prod' }, s.product || '—'), link]),
        el('td', { class: 'price ' + (cheapest && s.id === cheapest.id ? 'is-best' : '') }, fmtMoney(s.price, s.currency || cur)),
        el('td', {}, [el('span', { class: 'rating' }, U.stars(s.rating)), el('small', {}, s.rating != null ? ' ' + fmtNum(s.rating) : '')]),
        el('td', {}, s.leadTimeDays != null ? fmtNum(s.leadTimeDays) + ' يوم' : '—'),
        el('td', {}, s.region || '—'),
        el('td', {}, el('span', { class: 'avail ' + availCls(s.availability) }, s.availability)),
        el('td', {}, el('span', { class: 'match m-' + matchCls(s.matchConfidence) }, s.matchConfidence)),
        el('td', {}, s.url ? el('a', { href: s.url, target: '_blank', rel: 'noopener', class: 'btn-ghost small' }, 'زيارة ↗') : null),
      ]);
    });

    const table = el('table', { class: 'grid' }, [el('thead', {}, head), el('tbody', {}, body)]);
    return el('section', { class: 'table-wrap' }, [table]);
  }
  function availCls(a) { return a === 'متوفر' ? 'ok' : a === 'حسب الطلب' ? 'warn' : 'unk'; }
  function matchCls(m) { return m === 'عالٍ' ? 'hi' : m === 'منخفض' ? 'lo' : 'mid'; }

  function renderWatch() {
    const w = watchlist();
    const items = w.map((it) => el('div', { class: 'watch-item' }, [
      el('div', { class: 'watch-main' }, [
        el('strong', { class: 'link', onClick: () => runSearch(it.query, it.opts) }, it.query),
        el('div', { class: 'muted small' }, `${it.lastCount} مورد • أفضل سعر ${fmtMoney(it.bestPrice, it.opts.currency)} • آخر تحديث ${timeAgo(it.lastRun)}`),
      ]),
      el('div', { class: 'watch-actions' }, [
        el('button', { class: 'btn-ghost small', onClick: () => refreshWatch(it.id) }, '↻ تحديث'),
        el('button', { class: 'btn-ghost small danger', onClick: () => removeWatch(it.id) }, '🗑'),
      ]),
    ]));
    const head = el('div', { class: 'watch-head' }, [
      el('h3', {}, '📌 الأصناف المتابَعة'),
      el('button', { class: 'btn-ghost small', onClick: refreshAll }, '↻ تحديث الكل'),
    ]);
    return el('section', { class: 'watch' }, [head, el('div', { class: 'watch-list' }, items)]);
  }

  /* ================= التصدير ================= */
  function exportCSV() {
    if (!state.result) return;
    const cur = state.result.currencyHint;
    const rows = applyFilters(state.result.suppliers);
    const headers = ['المورد', 'المنتج', 'السعر', 'العملة', 'التقييم', 'مدة التوريد', 'المنطقة', 'التوفر', 'التطابق', 'الرابط'];
    const lines = [headers.join(',')];
    rows.forEach((s) => {
      lines.push([s.supplier, s.product, s.price ?? '', s.currency || cur, s.rating ?? '', s.leadTimeDays ?? '', s.region, s.availability, s.matchConfidence, s.url]
        .map((v) => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"').join(','));
    });
    const blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = el('a', { href: URL.createObjectURL(blob), download: 'موردو-' + state.query + '.csv' });
    document.body.appendChild(a); a.click(); a.remove();
  }

  /* ================= التنبيهات (لوحة) ================= */
  function openAlerts() {
    const list = alerts();
    // وضع علامة مقروء
    const body = el('div', { class: 'alerts-body' });
    if (!list.length) body.appendChild(el('p', { class: 'muted' }, 'لا تنبيهات بعد. أضف أصنافًا إلى المتابعة وحدّثها ليكتشف النظام تغيّرات الأسعار وظهور موردين جدد.'));
    list.forEach((a) => body.appendChild(el('div', { class: 'alert-row k-' + (a.kind || 'info') }, [
      el('div', { class: 'alert-title' }, a.title),
      el('div', { class: 'alert-text' }, a.body),
      el('div', { class: 'alert-time' }, timeAgo(a.ts)),
    ])));
    const foot = el('div', { class: 'alerts-foot' }, [
      el('button', { class: 'btn-ghost small', onClick: () => { saveAlerts([]); closeModal(); updateBell(); } }, 'مسح الكل'),
    ]);
    openModal('🔔 التنبيهات الذكية', [body, foot]);
    // اعتبرها مقروءة
    saveAlerts(list.map((a) => ({ ...a, read: true })));
    updateBell();
  }

  function updateBell() {
    const n = alerts().filter((a) => !a.read).length;
    const badge = document.getElementById('bell-badge');
    if (badge) { badge.textContent = n; badge.style.display = n ? 'inline-flex' : 'none'; }
  }

  /* ================= الإعدادات ================= */
  function openSettings() {
    const c = AI.cfg();
    const key = el('input', { type: 'password', placeholder: 'sk-ant-…', value: c.apiKey || '', class: 'w-full' });
    const model = el('input', { type: 'text', value: c.model || AI.MODEL, class: 'w-full' });
    const currency = el('input', { type: 'text', value: c.currency || 'SAR', class: 'w-full', placeholder: 'SAR' });
    const region = el('input', { type: 'text', value: c.region || '', class: 'w-full', placeholder: 'مثال: السعودية (اختياري)' });
    const notifyChk = el('input', { type: 'checkbox' });
    if (U.store.get('mawrid_notify', false)) notifyChk.checked = true;

    function field(label, node, help) {
      return el('div', { class: 'form-row' }, [el('label', {}, label), node, help ? el('small', { class: 'muted' }, help) : null]);
    }
    const save = el('button', { class: 'btn-primary', onClick: () => {
      AI.setCfg({ apiKey: key.value.trim(), model: model.value.trim() || AI.MODEL, currency: currency.value.trim() || 'SAR', region: region.value.trim(), enabled: true });
      U.store.set('mawrid_notify', notifyChk.checked);
      if (notifyChk.checked && 'Notification' in window && Notification.permission === 'default') Notification.requestPermission();
      closeModal(); toast('تم حفظ الإعدادات', 'ok'); render();
    } }, 'حفظ');

    const body = el('div', { class: 'form' }, [
      el('p', { class: 'muted small' }, 'يُحفظ المفتاح محليًا على جهازك فقط، وتُرسل طلبات البحث مباشرةً إلى خدمة Claude. بدون مفتاح يعمل التطبيق في وضع تجريبي.'),
      field('مفتاح Claude API', key, 'احصل عليه من console.anthropic.com'),
      field('النموذج', model, 'يدعم البحث على الويب (الافتراضي مناسب).'),
      field('العملة الافتراضية', currency),
      field('منطقة التوريد المفضّلة', region),
      el('label', { class: 'form-check' }, [notifyChk, el('span', {}, 'تفعيل إشعارات المتصفح للتنبيهات')]),
      save,
    ]);
    openModal('⚙️ الإعدادات', body);
  }

  function updateModeBadge() {
    const b = document.getElementById('mode-badge');
    if (!b) return;
    if (AI.enabled()) { b.textContent = '● متصل — بحث حي'; b.className = 'mode online'; }
    else { b.textContent = '● وضع تجريبي'; b.className = 'mode demo'; }
  }

  /* ================= نوافذ وتنبيهات واجهة ================= */
  const overlay = document.getElementById('modal-overlay');
  function openModal(title, body) {
    document.getElementById('modal-title').textContent = title;
    const mb = document.getElementById('modal-body');
    mb.innerHTML = '';
    (Array.isArray(body) ? body : [body]).forEach((n) => mb.appendChild(n));
    overlay.classList.remove('hidden');
  }
  function closeModal() { overlay.classList.add('hidden'); }

  let toastTimer;
  function toast(msg, kind) {
    const t = document.getElementById('toast');
    t.textContent = msg; t.className = 'toast show ' + (kind || 'info');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.className = 'toast'; }, 3500);
  }

  /* ================= التهيئة ================= */
  function init() {
    document.getElementById('settings-btn').addEventListener('click', openSettings);
    document.getElementById('bell-btn').addEventListener('click', openAlerts);
    document.getElementById('modal-close').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
    render();
  }
  init();
})();
