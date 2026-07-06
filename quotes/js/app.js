/* ============================================================
   app.js — واجهة التطبيق وإدارة الحالة
   الخطوات: 1) رفع العروض  2) مراجعة البيانات  3) التحليل والمقارنة
   ============================================================ */
(function () {
  'use strict';

  const SAVED_KEY = 'qc_saved_v1';
  const { el, esc, fmtMoney, fmtNum, fmtPct } = U;

  const state = {
    step: 1,
    uploads: [],   // { id, file, name, size, status: wait|work|ok|err, message, quote }
    quotes: [],    // العروض المعتمدة للمراجعة والتحليل
    currency: 'ر.س',
    analysis: null,
    title: '',
  };

  const content = document.getElementById('content');

  // ================= التنقل بين الخطوات =================
  function goStep(n) {
    if (n === 2 && !state.quotes.length) { toast('ارفع عرضًا واحدًا على الأقل أولاً', 'err'); return; }
    if (n === 3) {
      if (state.quotes.length < 2) { toast('المقارنة تتطلب عرضين على الأقل — يمكنك إضافة مورد يدويًا من خطوة المراجعة', 'err'); return; }
      state.analysis = Analyze.analyze(state.quotes, { currency: state.currency });
    }
    state.step = n;
    render();
  }

  function renderSteps() {
    document.querySelectorAll('.step').forEach((b) => {
      const s = +b.dataset.step;
      b.classList.toggle('active', s === state.step);
      b.classList.toggle('done', s < state.step);
    });
  }

  // ================= الخطوة 1: رفع العروض =================
  function renderUpload() {
    const ai = Extract.aiEnabled();
    const banner = el('div', { class: `mode-banner ${ai ? 'ai' : 'local'}` }, []);
    banner.innerHTML = ai
      ? `🤖 <div><strong>الاستخراج الذكي مفعّل</strong> — تُقرأ ملفات PDF (بما فيها الممسوحة ضوئيًا) عبر Claude ويُستخرج منها الموردون والأصناف والأسعار تلقائيًا.</div>`
      : `⚡ <div><strong>وضع المحلل المحلي</strong> — يعمل بدون إنترنت لملفات PDF النصية، وقد يحتاج تدقيقًا يدويًا. لنتائج أدق مع العروض الممسوحة ضوئيًا <a id="open-settings-link">فعّل الاستخراج الذكي من الإعدادات</a>.</div>`;

    const dz = el('div', { class: 'dropzone', id: 'dropzone' });
    dz.innerHTML = `<span class="dz-icon">📄</span>
      <strong>اسحب ملفات عروض الأسعار هنا أو انقر للاختيار</strong>
      <p>ملف PDF لكل مورد — يمكنك رفع عدة ملفات دفعة واحدة</p>`;

    const fileInput = el('input', { type: 'file', accept: 'application/pdf', multiple: '', hidden: '' });
    dz.addEventListener('click', () => fileInput.click());
    dz.addEventListener('dragover', (e) => { e.preventDefault(); dz.classList.add('drag'); });
    dz.addEventListener('dragleave', () => dz.classList.remove('drag'));
    dz.addEventListener('drop', (e) => {
      e.preventDefault(); dz.classList.remove('drag');
      handleFiles([...e.dataTransfer.files]);
    });
    fileInput.addEventListener('change', () => { handleFiles([...fileInput.files]); fileInput.value = ''; });

    const list = el('div', { class: 'upload-list', id: 'upload-list' });
    state.uploads.forEach((u) => list.appendChild(uploadRow(u)));

    const okCount = state.uploads.filter((u) => u.status === 'ok').length;
    const card = el('div', { class: 'card' }, [
      el('h2', {}, ['رفع عروض الأسعار']),
      el('p', { class: 'hint' }, ['ارفع عرض سعر واحدًا (PDF) لكل مورد. بعد الاستخراج يمكنك تدقيق البيانات وتعديلها قبل التحليل.']),
      banner, dz, fileInput, list,
      el('div', { class: 'actions-row' }, [
        el('button', {
          class: 'btn btn-light',
          onclick: () => { commitUploads(); if (!state.quotes.length) addManualSupplier(); state.step = 2; render(); },
        }, ['✍️ إدخال عرض يدويًا']),
        el('button', {
          class: 'btn btn-primary',
          disabled: okCount ? null : '',
          onclick: () => { commitUploads(); goStep(2); },
        }, [`متابعة إلى المراجعة (${okCount} ${okCount === 1 ? 'عرض' : 'عروض'}) ←`]),
      ]),
    ]);

    content.replaceChildren(card);
    const link = document.getElementById('open-settings-link');
    if (link) link.addEventListener('click', openSettings);
  }

  function uploadRow(u) {
    const chipClass = { wait: 'wait', work: 'work', ok: 'ok', err: 'err' }[u.status];
    const chipText = u.status === 'ok' ? `تم — ${u.quote.items.length} صنفًا`
      : u.status === 'err' ? 'فشل'
      : u.status === 'work' ? (u.message || 'جارٍ المعالجة…') : 'بالانتظار';

    const row = el('div', { class: 'upload-item' }, [
      el('span', { class: 'fi' }, ['📑']),
      el('div', { class: 'meta' }, [
        el('strong', {}, [u.name]),
        el('small', {}, [`${(u.size / 1024).toFixed(0)} ك.ب${u.status === 'err' && u.message ? ' — ' + u.message : ''}`]),
      ]),
    ]);

    if (u.status === 'ok') {
      const inp = el('input', { class: 'supplier-name', value: u.quote.supplier, title: 'اسم المورد (قابل للتعديل)' });
      inp.addEventListener('input', () => { u.quote.supplier = inp.value; });
      row.appendChild(inp);
    }
    row.appendChild(el('span', { class: `status-chip ${chipClass}` }, [chipText]));
    if (u.status === 'err') {
      row.appendChild(el('button', { class: 'btn btn-light btn-sm', onclick: () => retryUpload(u) }, ['إعادة المحاولة']));
    }
    row.appendChild(el('button', { class: 'icon-btn', title: 'إزالة', onclick: () => { state.uploads = state.uploads.filter((x) => x.id !== u.id); render(); } }, ['🗑️']));
    return row;
  }

  async function handleFiles(files) {
    const pdfs = files.filter((f) => /\.pdf$/i.test(f.name) || f.type === 'application/pdf');
    if (!pdfs.length) { toast('يُقبل فقط ملفات PDF', 'err'); return; }
    for (const f of pdfs) {
      const u = { id: U.uid(), file: f, name: f.name, size: f.size, status: 'wait', message: '', quote: null };
      state.uploads.push(u);
    }
    render();
    for (const u of state.uploads.filter((x) => x.status === 'wait')) await processUpload(u);
  }

  async function processUpload(u) {
    u.status = 'work'; u.message = 'جارٍ المعالجة…'; render();
    try {
      u.quote = await Extract.extractQuote(u.file, (msg) => { u.message = msg; render(); });
      u.status = 'ok'; u.message = '';
    } catch (e) {
      u.status = 'err'; u.message = e.message || 'خطأ غير معروف';
    }
    render();
  }

  async function retryUpload(u) {
    u.status = 'wait'; render();
    await processUpload(u);
  }

  function commitUploads() {
    // اعتماد العروض الناجحة (مع تفادي التكرار عند العودة للخطوة 1)
    state.uploads.filter((u) => u.status === 'ok').forEach((u) => {
      if (!state.quotes.some((q) => q.id === u.quote.id)) state.quotes.push(u.quote);
    });
    const detected = state.quotes.map((q) => q.currency).find(Boolean);
    if (detected) state.currency = detected;
  }

  // ================= الخطوة 2: مراجعة البيانات =================
  function renderReview() {
    const wrap = el('div', {});

    const head = el('div', { class: 'card' }, [
      el('h2', {}, ['مراجعة البيانات المستخرجة']),
      el('p', { class: 'hint' }, ['دقّق أسماء الأصناف والكميات والأسعار وعدّلها عند الحاجة. تُطابَق الأصناف بين الموردين تلقائيًا حسب الاسم — كلما تطابقت المسميات كانت المقارنة أدق.']),
      el('div', { class: 'form-group', style: 'max-width:260px' }, [
        el('label', {}, ['العملة']),
        (() => {
          const inp = el('input', { value: state.currency });
          inp.addEventListener('input', () => { state.currency = inp.value; });
          return inp;
        })(),
      ]),
    ]);
    wrap.appendChild(head);

    state.quotes.forEach((q) => wrap.appendChild(supplierEditor(q)));

    wrap.appendChild(el('div', { class: 'actions-row' }, [
      el('button', { class: 'btn btn-light', onclick: () => addManualSupplier() }, ['+ إضافة مورد يدويًا']),
      el('button', { class: 'btn btn-light', onclick: () => goStep(1) }, ['→ رجوع للرفع']),
      el('button', { class: 'btn btn-primary', onclick: () => goStep(3) }, ['تحليل ومقارنة العروض ←']),
    ]));

    content.replaceChildren(wrap);
  }

  function supplierEditor(q) {
    const card = el('div', { class: 'card review-supplier' });

    const nameInp = el('input', { class: 'sup-name', value: q.supplier });
    nameInp.addEventListener('input', () => { q.supplier = nameInp.value; });

    const headRow = el('div', { class: 'review-supplier-head' }, [
      el('span', { style: 'font-size:22px' }, ['🏢']),
      nameInp,
      el('span', { class: 'badge blue' }, [`${q.items.length} صنفًا`]),
      q.fileName ? el('small', { style: 'color:var(--muted)' }, [q.fileName]) : null,
      el('span', { style: 'flex:1' }),
      el('button', { class: 'btn btn-light btn-sm', onclick: () => { addItemRow(q); render(); } }, ['+ صنف']),
      el('button', {
        class: 'btn btn-danger-soft btn-sm',
        onclick: () => {
          if (!confirm(`حذف عرض «${q.supplier}» بالكامل؟`)) return;
          state.quotes = state.quotes.filter((x) => x.id !== q.id);
          render();
        },
      }, ['حذف المورد']),
    ]);
    card.appendChild(headRow);

    const table = el('table', { class: 'review-table' });
    table.appendChild(el('thead', {}, [el('tr', {}, [
      el('th', { style: 'width:36px' }, ['#']),
      el('th', {}, ['الصنف / البند']),
      el('th', { style: 'width:110px' }, ['الوحدة']),
      el('th', { style: 'width:100px' }, ['الكمية']),
      el('th', { style: 'width:120px' }, ['سعر الوحدة']),
      el('th', { style: 'width:130px' }, ['الإجمالي']),
      el('th', { style: 'width:44px' }, ['']),
    ])]));

    const tbody = el('tbody');
    q.items.forEach((it, idx) => {
      const totalCell = el('td', { class: 'num' }, [fmtNum(it.qty * (it.unitPrice || 0))]);
      const mkNum = (field, cls) => {
        const inp = el('input', { class: `n ${cls || ''}`, value: it[field] != null ? it[field] : '' });
        inp.addEventListener('input', () => {
          it[field] = U.parseNumber(inp.value);
          it.total = +(((it.qty || 0) * (it.unitPrice || 0)).toFixed(2));
          totalCell.textContent = fmtNum(it.total);
        });
        return inp;
      };
      const nameInpI = el('input', { class: 'item-name', value: it.name });
      nameInpI.addEventListener('input', () => { it.name = nameInpI.value; });
      const unitInp = el('input', { value: it.unit || '' });
      unitInp.addEventListener('input', () => { it.unit = unitInp.value; });

      tbody.appendChild(el('tr', {}, [
        el('td', { style: 'color:var(--muted)' }, [String(idx + 1)]),
        el('td', {}, [nameInpI]),
        el('td', {}, [unitInp]),
        el('td', {}, [mkNum('qty')]),
        el('td', {}, [mkNum('unitPrice')]),
        totalCell,
        el('td', {}, [el('button', {
          class: 'icon-btn', title: 'حذف الصنف',
          onclick: () => { q.items = q.items.filter((x) => x.id !== it.id); render(); },
        }, ['✕'])]),
      ]));
    });
    table.appendChild(tbody);
    card.appendChild(el('div', { class: 'table-wrap' }, [table]));
    return card;
  }

  function addItemRow(q) {
    q.items.push({ id: U.uid(), name: '', unit: '', qty: 1, unitPrice: null, total: 0 });
  }

  function addManualSupplier() {
    const q = {
      id: U.uid(), supplier: `مورد ${state.quotes.length + 1}`, quoteNumber: null, date: null,
      currency: null, vatIncluded: null, subtotal: null, vat: null, grandTotal: null,
      notes: null, fileName: null, items: [],
    };
    addItemRow(q);
    state.quotes.push(q);
    render();
  }

  // ================= الخطوة 3: التحليل والمقارنة =================
  function renderAnalysis() {
    const a = state.analysis;
    if (!a) { goStep(2); return; }
    const cur = a.currency;
    const wrap = el('div', {});

    // ترويسة الطباعة
    const ph = el('div', { class: 'print-header' });
    ph.innerHTML = `<h1>تقرير مقارنة عروض الأسعار${state.title ? ' — ' + esc(state.title) : ''}</h1>
      <p>عدد الموردين: ${a.quotes.length} · عدد الأصناف: ${a.totalItems} · التاريخ: ${new Date().toLocaleDateString('ar-SA')}</p>`;
    wrap.appendChild(ph);

    // ---- بطاقات الملخص ----
    const grid = el('div', { class: 'summary-grid' });
    grid.appendChild(statCard('عدد الموردين', String(a.quotes.length), `${a.totalItems} صنفًا (${a.sharedItems} مشتركًا)`, ''));
    grid.appendChild(statCard('أفضل مورد إجمالاً', a.bestSupplier ? a.bestSupplier.supplier : '—',
      a.bestSupplier && a.bestSupplier.fullCoverage ? `الإجمالي: ${fmtMoney(a.bestSupplier.basketTotal, cur)}` : `تغطية ${fmtPct(a.bestSupplier ? a.bestSupplier.coveragePct : 0)}`, 'gold'));
    grid.appendChild(statCard('السلة المثلى (أفضل سعر لكل صنف)', fmtMoney(a.optimalTotal, cur),
      `موزعة على ${a.optimalShare.length} ${a.optimalShare.length === 1 ? 'مورد' : 'موردين'}`, 'green'));
    grid.appendChild(statCard('الوفر المحتمل من التقسيم',
      a.savings != null ? fmtMoney(a.savings, cur) : '—',
      a.savingsPct != null ? `${fmtPct(a.savingsPct)} مقارنة بأفضل مورد واحد` : 'لا يوجد مورد واحد كامل التغطية', 'green'));
    wrap.appendChild(grid);

    // ---- التوصيات ----
    wrap.appendChild(el('div', { class: 'card' }, [
      el('h2', {}, ['📌 خلاصة الدراسة والتوصيات']),
      el('ul', { class: 'reco-list' }, a.recommendations.map((r) =>
        el('li', {}, [el('span', { class: 'ri' }, [r.icon]), el('span', {}, [r.text])]))),
    ]));

    // ---- ترتيب الموردين ----
    wrap.appendChild(supplierRankCard(a));

    // ---- مصفوفة المقارنة ----
    wrap.appendChild(matrixCard(a));

    // ---- السلة المثلى ----
    wrap.appendChild(basketCard(a));

    // ---- أزرار الإجراءات ----
    wrap.appendChild(el('div', { class: 'actions-row no-print' }, [
      el('button', { class: 'btn btn-light', onclick: () => goStep(2) }, ['→ تعديل البيانات']),
      el('button', { class: 'btn btn-light', onclick: exportCSV }, ['⬇️ تصدير CSV']),
      el('button', { class: 'btn btn-light', onclick: () => window.print() }, ['🖨️ طباعة / PDF']),
      el('button', { class: 'btn btn-primary', onclick: saveComparison }, ['💾 حفظ المقارنة']),
    ]));

    content.replaceChildren(wrap);
  }

  function statCard(label, value, sub, cls) {
    return el('div', { class: `stat ${cls || ''}` }, [
      el('div', { class: 'stat-label' }, [label]),
      el('div', { class: 'stat-value' }, [value]),
      el('div', { class: 'stat-sub' }, [sub || '']),
    ]);
  }

  function supplierRankCard(a) {
    const cur = a.currency;
    const table = el('table');
    table.appendChild(el('thead', {}, [el('tr', {}, [
      el('th', {}, ['الترتيب']), el('th', {}, ['المورد']),
      el('th', { class: 'num' }, ['إجمالي العرض']),
      el('th', {}, ['التغطية']),
      el('th', {}, ['أصناف بأفضل سعر']),
      el('th', {}, ['متوسط الارتفاع عن أفضل سعر']),
    ])]));
    const tbody = el('tbody');
    a.supplierStats.forEach((s, i) => {
      tbody.appendChild(el('tr', {}, [
        el('td', {}, [i === 0 ? el('span', { class: 'badge gold' }, ['🥇 الأفضل']) : el('span', {}, [String(i + 1)])]),
        el('td', {}, [el('strong', {}, [s.supplier])]),
        el('td', { class: 'num' }, [fmtMoney(s.quotedTotal, cur)]),
        el('td', {}, [
          el('span', { class: `badge ${s.fullCoverage ? 'green' : 'blue'}` },
            [s.fullCoverage ? 'كاملة' : `${s.covered}/${a.totalItems} (${fmtPct(s.coveragePct, 0)})`]),
        ]),
        el('td', {}, [el('span', { class: s.wins ? 'badge green' : 'badge' }, [`${s.wins} من ${s.covered}`])]),
        el('td', {}, [s.avgDeviationPct < 0.005
          ? el('span', { class: 'badge green' }, ['الأفضل دائمًا'])
          : el('span', { class: s.avgDeviationPct > 15 ? 'badge red' : 'badge' }, [`+${fmtPct(s.avgDeviationPct)}`])]),
      ]));
    });
    table.appendChild(tbody);
    return el('div', { class: 'card' }, [
      el('h2', {}, ['🏢 ترتيب الموردين']),
      el('p', { class: 'hint' }, ['إجمالي العرض كما ورد من المورد. التغطية = نسبة الأصناف المسعّرة لديه من إجمالي أصناف المقارنة.']),
      el('div', { class: 'table-wrap' }, [table]),
    ]);
  }

  function matrixCard(a) {
    const cur = a.currency;
    const table = el('table');
    const headRow = el('tr', {}, [
      el('th', {}, ['الصنف']),
      el('th', {}, ['الوحدة']),
      el('th', { class: 'num' }, ['الكمية']),
    ]);
    a.quotes.forEach((q) => headRow.appendChild(el('th', { class: 'num' }, [q.supplier])));
    headRow.appendChild(el('th', {}, ['أفضل سعر لدى']));
    headRow.appendChild(el('th', { class: 'num' }, ['فرق الأسعار']));
    table.appendChild(el('thead', {}, [headRow]));

    const tbody = el('tbody');
    a.rows.forEach((r) => {
      const tr = el('tr', {}, [
        el('td', { style: 'white-space:normal;min-width:180px' }, [r.name]),
        el('td', {}, [r.unit || '—']),
        el('td', { class: 'num' }, [fmtNum(r.refQty)]),
      ]);
      a.quotes.forEach((q) => {
        const offer = r.offers.find((o) => o.quoteId === q.id);
        if (!offer) { tr.appendChild(el('td', { class: 'cell-missing' }, ['—'])); return; }
        const p = offer.item.unitPrice;
        const isBest = r.bestQuoteIds.includes(q.id);
        const isWorst = r.coverage > 1 && p === r.maxPrice && !isBest;
        const cell = el('td', { class: `num ${isBest ? 'cell-best' : ''} ${isWorst ? 'cell-worst' : ''}` }, [fmtNum(p)]);
        if (!isBest && r.minPrice > 0) {
          cell.appendChild(el('span', { class: 'cell-sub' }, [`+${fmtPct(((p - r.minPrice) / r.minPrice) * 100, 0)}`]));
        } else if (isBest && r.coverage > 1) {
          cell.appendChild(el('span', { class: 'cell-sub' }, ['✓ الأفضل']));
        }
        tr.appendChild(cell);
      });
      const winners = r.bestQuoteIds.map((id) => (a.quotes.find((q) => q.id === id) || {}).supplier).filter(Boolean);
      tr.appendChild(el('td', {}, [el('span', { class: 'badge green' }, [winners.join('، ') || '—'])]));
      tr.appendChild(el('td', { class: 'num' }, [r.coverage > 1 ? fmtPct(r.spreadPct, 0) : '—']));
      tbody.appendChild(tr);
    });

    // صف الإجماليات على الكميات المرجعية
    const totRow = el('tr', { style: 'background:#f8fafc;font-weight:800' }, [
      el('td', {}, ['الإجمالي (على الكميات المرجعية)']), el('td', {}, ['']), el('td', {}, ['']),
    ]);
    a.quotes.forEach((q) => {
      const s = a.supplierStats.find((x) => x.quoteId === q.id);
      const isBest = a.bestSingle && s && a.bestSingle.quoteId === s.quoteId;
      totRow.appendChild(el('td', { class: `num ${isBest ? 'cell-best' : ''}` }, [
        s && s.covered ? fmtNum(s.basketTotal) + (s.fullCoverage ? '' : ' *') : '—',
      ]));
    });
    totRow.appendChild(el('td', {}, [el('span', { class: 'badge gold' }, [`السلة المثلى: ${fmtMoney(a.optimalTotal, cur)}`])]));
    totRow.appendChild(el('td', {}, ['']));
    tbody.appendChild(totRow);
    table.appendChild(tbody);

    return el('div', { class: 'card' }, [
      el('h2', {}, [`⚖️ مصفوفة مقارنة أسعار الوحدة (${cur})`]),
      el('p', { class: 'hint' }, ['الخلية الخضراء = أفضل سعر للصنف، والحمراء = أعلى سعر. النسبة أسفل السعر = ارتفاعه عن أفضل سعر. (*) إجمالي مورد لا يغطي كل الأصناف.']),
      el('div', { class: 'table-wrap' }, [table]),
    ]);
  }

  function basketCard(a) {
    const cur = a.currency;
    const bars = el('div', { class: 'basket-bars' }, a.optimalShare.map((s) =>
      el('div', { class: 'basket-bar-row' }, [
        el('strong', {}, [s.supplier]),
        el('div', { class: 'basket-bar-track' }, [
          el('div', { class: 'basket-bar-fill', style: `width:${Math.max(2, s.pct)}%` }),
        ]),
        el('span', { class: 'num' }, [`${fmtMoney(s.total, cur)} (${s.items} صنفًا)`]),
      ])));
    return el('div', { class: 'card' }, [
      el('h2', {}, ['🧺 السلة المثلى — توزيع الترسية بأفضل سعر لكل صنف']),
      el('p', { class: 'hint' }, ['لو رسّيت كل صنف على صاحب أفضل سعر، هذا نصيب كل مورد من إجمالي السلة المثلى.']),
      bars,
    ]);
  }

  // ================= التصدير =================
  function exportCSV() {
    const a = state.analysis;
    if (!a) return;
    const cols = ['الصنف', 'الوحدة', 'الكمية المرجعية', ...a.quotes.map((q) => q.supplier), 'أفضل سعر', 'أفضل مورد', 'فرق الأسعار %'];
    const lines = [cols];
    a.rows.forEach((r) => {
      const winners = r.bestQuoteIds.map((id) => (a.quotes.find((q) => q.id === id) || {}).supplier).join(' / ');
      lines.push([
        r.name, r.unit || '', r.refQty,
        ...a.quotes.map((q) => {
          const o = r.offers.find((x) => x.quoteId === q.id);
          return o ? o.item.unitPrice : '';
        }),
        r.minPrice, winners, r.coverage > 1 ? r.spreadPct.toFixed(1) : '',
      ]);
    });
    lines.push([]);
    lines.push(['المورد', 'إجمالي العرض', 'التغطية %', 'أصناف بأفضل سعر', 'متوسط الارتفاع %']);
    a.supplierStats.forEach((s) => lines.push([s.supplier, s.quotedTotal.toFixed(2), s.coveragePct.toFixed(0), s.wins, s.avgDeviationPct.toFixed(1)]));
    lines.push([]);
    lines.push(['السلة المثلى', a.optimalTotal.toFixed(2), a.currency]);
    if (a.savings != null) lines.push(['الوفر المحتمل', a.savings.toFixed(2), a.currency]);

    const csv = '﻿' + lines.map((row) => row.map((c) => `"${String(c == null ? '' : c).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = el('a', { href: url, download: `مقارنة-عروض-الأسعار-${new Date().toISOString().slice(0, 10)}.csv` });
    document.body.appendChild(link); link.click(); link.remove();
    URL.revokeObjectURL(url);
    toast('تم تصدير ملف CSV', 'ok');
  }

  // ================= الحفظ والاسترجاع =================
  function savedList() {
    try { return JSON.parse(localStorage.getItem(SAVED_KEY)) || []; } catch (e) { return []; }
  }

  function saveComparison() {
    const name = prompt('اسم المقارنة:', state.title || `مقارنة ${new Date().toLocaleDateString('ar-SA')}`);
    if (!name) return;
    state.title = name;
    const list = savedList();
    list.unshift({
      id: U.uid(), name, date: new Date().toISOString(),
      currency: state.currency,
      suppliers: state.quotes.length,
      items: state.analysis ? state.analysis.totalItems : 0,
      quotes: state.quotes,
    });
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(list.slice(0, 30)));
      toast('تم حفظ المقارنة', 'ok');
    } catch (e) {
      toast('تعذر الحفظ — مساحة التخزين ممتلئة', 'err');
    }
  }

  function openSaved() {
    const list = savedList();
    const body = el('div', {});
    if (!list.length) {
      body.appendChild(el('div', { class: 'empty-state' }, [
        el('span', { class: 'es-icon' }, ['📁']),
        el('p', {}, ['لا توجد مقارنات محفوظة بعد']),
      ]));
    }
    list.forEach((s) => {
      body.appendChild(el('div', { class: 'saved-item' }, [
        el('div', {}, [
          el('strong', {}, [s.name]),
          el('small', {}, [`${new Date(s.date).toLocaleString('ar-SA')} · ${s.suppliers} موردين · ${s.items} صنفًا`]),
        ]),
        el('div', { style: 'display:flex;gap:6px' }, [
          el('button', {
            class: 'btn btn-primary btn-sm',
            onclick: () => {
              state.quotes = s.quotes;
              state.currency = s.currency || 'ر.س';
              state.title = s.name;
              state.uploads = [];
              closeModal();
              goStep(3);
            },
          }, ['فتح']),
          el('button', {
            class: 'btn btn-danger-soft btn-sm',
            onclick: () => {
              localStorage.setItem(SAVED_KEY, JSON.stringify(savedList().filter((x) => x.id !== s.id)));
              openSaved();
            },
          }, ['حذف']),
        ]),
      ]));
    });
    openModal('المقارنات المحفوظة', body);
  }

  // ================= الإعدادات =================
  function openSettings() {
    const s = Extract.settings();
    const body = el('div', {});

    const keyInp = el('input', { type: 'password', value: s.apiKey || '', placeholder: 'sk-ant-...', dir: 'ltr' });
    const enableSel = el('select', {}, [
      el('option', { value: '1' }, ['مفعّل (يُنصح به)']),
      el('option', { value: '0' }, ['معطّل — استخدام المحلل المحلي فقط']),
    ]);
    enableSel.value = s.aiEnabled === false ? '0' : '1';

    body.appendChild(el('div', { class: 'form-group' }, [
      el('label', {}, ['مفتاح Claude API (للاستخراج الذكي)']),
      keyInp,
      el('p', { class: 'fg-hint' }, ['يُحفظ المفتاح على جهازك فقط (localStorage) وتُرسل الملفات مباشرة إلى خدمة Claude دون أي خادم وسيط. احصل على مفتاح من platform.claude.com.']),
    ]));
    body.appendChild(el('div', { class: 'form-group' }, [
      el('label', {}, ['حالة الاستخراج الذكي']),
      enableSel,
      el('p', { class: 'fg-hint' }, [`النموذج المستخدم: ${Extract.MODEL} — يقرأ ملفات PDF النصية والممسوحة ضوئيًا.`]),
    ]));
    body.appendChild(el('div', { class: 'actions-row' }, [
      el('button', {
        class: 'btn btn-primary',
        onclick: () => {
          Extract.saveSettings({ apiKey: keyInp.value.trim(), aiEnabled: enableSel.value === '1' });
          closeModal();
          toast('تم حفظ الإعدادات', 'ok');
          render();
        },
      }, ['حفظ']),
    ]));

    openModal('الإعدادات', body);
  }

  // ================= مكونات عامة =================
  function openModal(title, bodyNode) {
    document.getElementById('modal-title').textContent = title;
    const mb = document.getElementById('modal-body');
    mb.replaceChildren(bodyNode);
    document.getElementById('modal-overlay').classList.remove('hidden');
  }
  function closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
  }
  function toast(msg, type) {
    const t = el('div', { class: `toast ${type || ''}` }, [msg]);
    document.getElementById('toast-wrap').appendChild(t);
    setTimeout(() => t.remove(), 3800);
  }

  // ================= العرض الرئيسي =================
  function render() {
    renderSteps();
    if (state.step === 1) renderUpload();
    else if (state.step === 2) renderReview();
    else renderAnalysis();
  }

  // ================= التهيئة =================
  document.querySelectorAll('.step').forEach((b) => {
    b.addEventListener('click', () => goStep(+b.dataset.step));
  });
  document.getElementById('settings-btn').addEventListener('click', openSettings);
  document.getElementById('saved-btn').addEventListener('click', openSaved);
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });

  render();
})();
