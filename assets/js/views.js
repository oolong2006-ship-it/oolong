/* ============================================================
   views.js — شاشات النظام (الوحدات الوظيفية)
   ============================================================ */
(function () {
  const S = window.Store, U = window.UI;
  const esc = U.esc, fmtDate = U.fmtDate;
  const Views = {};

  /* ===================== لوحة المعلومات ===================== */
  Views.dashboard = function () {
    const m = S.metrics();
    const db = S.load();
    const kpi = (cls, ic, label, val, sub) => `
      <div class="card kpi ${cls}">
        <div class="kpi-ic">${ic}</div>
        <div class="kpi-label">${label}</div>
        <div class="kpi-value">${val}</div>
        <div class="kpi-sub">${sub}</div>
      </div>`;

    const readyCls = m.readiness >= 85 ? 'good' : m.readiness >= 60 ? 'warn' : 'bad';

    // أحدث المخالفات الحرارية
    const breaches = db.tempLogs.filter(t => t.status === 'مخالف').slice(0, 5);
    // الشهادات القريبة من الانتهاء
    const cards = [...db.employees].sort((a, b) => S.daysFromToday(a.healthCardExpiry) - S.daysFromToday(b.healthCardExpiry)).slice(0, 5);
    // مهام تنظيف متأخرة
    const overdue = db.cleaning.filter(c => S.daysFromToday(c.nextDue) < 0);

    return `
      <div class="grid cols-4">
        ${kpi(readyCls, '🛡️', 'جاهزية التفتيش', m.readiness + '%', 'مؤشر مرجّح للامتثال العام')}
        ${kpi(m.compliance >= 85 ? 'good' : m.compliance >= 60 ? 'warn' : 'bad', '✅', 'نسبة الامتثال GMP', m.compliance + '%', 'آخر تدقيق منفّذ')}
        ${kpi(m.openNCs ? 'bad' : 'good', '⚠️', 'حالات عدم مطابقة مفتوحة', m.openNCs, m.criticalNCs + ' حالة حرجة')}
        ${kpi(m.tempBreaches ? 'warn' : 'good', '🌡️', 'تجاوزات حرارية', m.tempBreaches, 'تحتاج إجراء تصحيحي')}
      </div>

      <div class="grid cols-3 section-gap">
        <div class="card">
          <div class="card-title">🎯 مؤشر الجاهزية للتفتيش</div>
          <div class="donut-wrap">
            ${U.donut(m.readiness, 'الجاهزية')}
            <div style="flex:1">
              <div class="row-line"><span class="dot ${m.criticalNCs ? 'red' : 'green'}"></span> مخالفات حرجة<span class="spacer"></span><strong>${m.criticalNCs}</strong></div>
              <div class="row-line"><span class="dot ${m.expiredCards ? 'red' : 'green'}"></span> شهادات منتهية<span class="spacer"></span><strong>${m.expiredCards}</strong></div>
              <div class="row-line"><span class="dot ${m.overdueCleaning ? 'amber' : 'green'}"></span> مهام تنظيف متأخرة<span class="spacer"></span><strong>${m.overdueCleaning}</strong></div>
              <div class="row-line"><span class="dot ${m.tempBreaches ? 'amber' : 'green'}"></span> تجاوزات حرارية<span class="spacer"></span><strong>${m.tempBreaches}</strong></div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-title">🌡️ آخر التجاوزات الحرارية</div>
          ${breaches.length ? `<div class="list-tight">${breaches.map(t => `
            <div class="row-line">
              <span class="dot red"></span>
              <div><strong>${esc(t.unit)}</strong><br><small class="muted">${esc(t.date)} — ${esc(t.time)}</small></div>
              <span class="spacer"></span>
              <strong style="color:#dc2626">${t.value}°م</strong>
            </div>`).join('')}</div>` : U.empty('لا توجد تجاوزات حرارية 👍', '🌡️')}
        </div>

        <div class="card">
          <div class="card-title">🪪 شهادات صحية تحتاج متابعة</div>
          <div class="list-tight">${cards.map(e => `
            <div class="row-line">
              <div><strong>${esc(e.name)}</strong><br><small class="muted">${esc(e.role)}</small></div>
              <span class="spacer"></span>
              ${U.expiryBadge(e.healthCardExpiry)}
            </div>`).join('')}</div>
        </div>
      </div>

      <div class="grid cols-2 section-gap">
        <div class="card">
          <div class="card-title">🚨 حالات عدم المطابقة المفتوحة <span class="spacer"></span><button class="btn-secondary btn-sm" onclick="App.go('nc')">عرض الكل</button></div>
          ${(() => { const list = db.ncs.filter(n => n.status !== 'مغلقة').slice(0, 5);
            return list.length ? `<div class="list-tight">${list.map(n => `
              <div class="row-line">
                <span class="dot ${n.severity === 'حرجة' ? 'red' : n.severity === 'عالية' ? 'amber' : 'green'}"></span>
                <div style="flex:1"><strong>${esc(n.title)}</strong><br><small class="muted">المسؤول: ${esc(n.owner)} — استحقاق: ${esc(n.dueDate)}</small></div>
                ${U.statusBadge(n.severity)}
              </div>`).join('')}</div>` : U.empty('لا توجد حالات مفتوحة 🎉'); })()}
        </div>

        <div class="card">
          <div class="card-title">🧹 مهام تنظيف متأخرة <span class="spacer"></span><button class="btn-secondary btn-sm" onclick="App.go('cleaning')">الجدول</button></div>
          ${overdue.length ? `<div class="list-tight">${overdue.map(c => `
            <div class="row-line">
              <span class="dot red"></span>
              <div style="flex:1"><strong>${esc(c.task)}</strong><br><small class="muted">${esc(c.area)} — ${esc(c.frequency)}</small></div>
              ${U.badge('متأخرة', 'red')}
            </div>`).join('')}</div>` : U.empty('كل مهام التنظيف محدّثة ✨', '🧹')}
        </div>
      </div>`;
  };

  /* ===================== التفتيش الذاتي / GMP ===================== */
  Views.inspections = function () {
    const db = S.load();
    const rows = [...db.inspections].sort((a, b) => b.date.localeCompare(a.date)).map(i => {
      const score = S.inspectionScore(i);
      const col = score >= 85 ? 'green' : score >= 60 ? 'amber' : 'red';
      return `<tr>
        <td><strong>${esc(i.templateName)}</strong></td>
        <td>${esc(i.by)}</td>
        <td>${fmtDate(i.date)}</td>
        <td><div style="display:flex;align-items:center;gap:8px"><span>${score}%</span><div style="width:80px">${U.progress(score, col === 'green' ? '#16a34a' : col === 'amber' ? '#d97706' : '#dc2626')}</div></div></td>
        <td>${U.badge(score >= 85 ? 'ممتاز' : score >= 60 ? 'مقبول' : 'يحتاج تحسين', col)}</td>
        <td class="t-actions">
          <button class="btn-secondary btn-sm" onclick="Views.viewInspection('${i.id}')">عرض</button>
          <button class="btn-danger btn-sm" onclick="Views.delInspection('${i.id}')">حذف</button>
        </td>
      </tr>`;
    }).join('');

    return `
      <div class="page-head">
        <div><h2>التفتيش الذاتي و GMP</h2><p>نفّذ عمليات التدقيق الداخلي وفق قوائم سلامة الغذاء وممارسات التصنيع الجيدة</p></div>
        <div class="spacer"></div>
        <button class="btn-primary" onclick="Views.newInspection()">+ تدقيق جديد</button>
      </div>
      ${db.inspections.length ? `<div class="table-wrap"><table>
        <thead><tr><th>القائمة</th><th>المدقّق</th><th>التاريخ</th><th>النتيجة</th><th>التقييم</th><th>إجراءات</th></tr></thead>
        <tbody>${rows}</tbody></table></div>` : U.empty('لا توجد عمليات تدقيق بعد. ابدأ بإنشاء تدقيق جديد.', '📋')}`;
  };

  Views.newInspection = function () {
    const opts = Object.entries(S.CHECKLIST_TEMPLATES).map(([k, v]) => `<option value="${k}">${esc(v.name)}</option>`).join('');
    U.modal('بدء تدقيق جديد', `
      <div class="form-grid">
        <div class="field"><label>نوع القائمة</label><select id="tpl">${opts}</select></div>
        <div class="field"><label>اسم المدقّق</label><input id="by" value="${esc(App.user.name)}" /></div>
        <div class="form-actions"><button class="btn-primary" id="start">بدء التدقيق</button></div>
      </div>`);
    U.$('#start').onclick = () => {
      const tpl = U.$('#tpl').value, by = U.$('#by').value.trim() || App.user.name;
      const t = S.CHECKLIST_TEMPLATES[tpl];
      const insp = {
        id: S.uid('insp'), template: tpl, templateName: t.name, by, date: S.todayISO(), status: 'قيد التنفيذ',
        sections: t.sections.map(s => ({ title: s.title, items: s.items.map(x => ({ text: x, result: 'yes', note: '' })) }))
      };
      S.add('inspections', insp);
      U.closeModal();
      Views.runInspection(insp.id);
    };
  };

  Views.runInspection = function (id) {
    const insp = S.get('inspections', id);
    if (!insp) return;
    const body = insp.sections.map((sec, si) => `
      <h4 style="margin:16px 0 10px;color:#0f766e">${esc(sec.title)}</h4>
      ${sec.items.map((it, ii) => `
        <div class="check-item" data-s="${si}" data-i="${ii}">
          <div class="ci-text">${esc(it.text)}</div>
          <div class="seg">
            <button data-v="yes" class="${it.result === 'yes' ? 'on-yes' : ''}">مطابق</button>
            <button data-v="no" class="${it.result === 'no' ? 'on-no' : ''}">مخالف</button>
            <button data-v="na" class="${it.result === 'na' ? 'on-na' : ''}">لا ينطبق</button>
          </div>
          <button class="btn-secondary btn-sm ai-eval" title="تقييم البند بالذكاء الاصطناعي">🤖</button>
        </div>`).join('')}`).join('');

    U.modal('تنفيذ التدقيق: ' + insp.templateName, `
      <div id="insp-run">${body}</div>
      <div class="form-actions" style="margin-top:18px">
        <button class="btn-primary" id="save-insp">حفظ وإنهاء التدقيق</button>
        <span id="live-score" class="muted" style="align-self:center"></span>
      </div>`, { wide: true });

    const recompute = () => {
      U.$('#live-score').textContent = 'النتيجة الحالية: ' + S.inspectionScore(insp) + '%';
    };
    recompute();

    U.$('#insp-run').addEventListener('click', async (e) => {
      const aiBtn = e.target.closest('.ai-eval');
      if (aiBtn) {
        const item = aiBtn.closest('.check-item');
        const si = +item.dataset.s, ii = +item.dataset.i;
        Views.aiEvaluateItem(insp, si, ii, item);
        return;
      }
      const btn = e.target.closest('.seg button'); if (!btn) return;
      const item = btn.closest('.check-item');
      const si = +item.dataset.s, ii = +item.dataset.i, v = btn.dataset.v;
      insp.sections[si].items[ii].result = v;
      item.querySelectorAll('.seg button').forEach(b => b.className = '');
      btn.className = v === 'yes' ? 'on-yes' : v === 'no' ? 'on-no' : 'on-na';
      S.update('inspections', insp.id, { sections: insp.sections });
      recompute();
    });

    U.$('#save-insp').onclick = () => {
      S.update('inspections', insp.id, { status: 'مكتمل', sections: insp.sections });
      // إنشاء حالات عدم مطابقة تلقائيًا من البنود المخالفة
      let created = 0;
      insp.sections.forEach(sec => sec.items.forEach(it => {
        if (it.result === 'no') {
          S.add('ncs', { id: S.uid('nc'), title: it.text, severity: 'متوسطة', source: 'تدقيق ' + insp.templateName,
            status: 'مفتوحة', date: S.todayISO(), owner: insp.by, dueDate: S.shift(7), action: '', rootCause: '' });
          created++;
        }
      }));
      U.closeModal();
      U.toast('تم حفظ التدقيق' + (created ? ` وإنشاء ${created} حالة عدم مطابقة` : ''), 'ok');
      App.render();
    };
  };

  Views.aiEvaluateItem = async function (insp, si, ii, itemEl) {
    // لوحة نتائج مدمجة تحت البند (دون فتح نافذة جديدة)
    let panel = itemEl.nextElementSibling;
    if (panel && panel.classList.contains('ai-panel')) { panel.remove(); return; }
    panel = document.createElement('div');
    panel.className = 'ai-panel card';
    panel.style.cssText = 'margin:-4px 0 12px;background:#f0fdfa;border-color:#99f6e4';
    panel.innerHTML = '<span class="muted">⏳ يقيّم النظام البند...</span>';
    itemEl.insertAdjacentElement('afterend', panel);
    const text = insp.sections[si].items[ii].text;
    try {
      const r = await window.AI.evaluateItem(text);
      panel.innerHTML = `
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px">
          <strong>🤖 تقييم البند</strong>
          ${U.badge('مستوى الخطورة: ' + (r.risk || '—'), r.risk === 'عالٍ' ? 'red' : r.risk === 'متوسط' ? 'amber' : 'green')}
          <span class="muted" style="margin-inline-start:auto;font-size:12px">${r.source === 'ai' ? 'ذكاء اصطناعي' : 'محلي'}</span>
        </div>
        <p style="font-size:13px;margin-bottom:6px"><strong>الملاحظة:</strong> ${esc(r.clarity || '')}</p>
        <p style="font-size:13px;margin-bottom:6px"><strong>صياغة محسّنة:</strong> ${esc(r.improved || '')}</p>
        <p style="font-size:13px;margin-bottom:6px"><strong>إرشاد التحقق:</strong> ${esc(r.guidance || '')}</p>
        ${r.reference ? `<p class="muted" style="font-size:12px">المرجع: ${esc(r.reference)}</p>` : ''}
        <div class="form-actions" style="margin-top:8px">
          <button class="btn-primary btn-sm" id="ai-apply">✓ تحديث صياغة البند</button>
          <button class="btn-secondary btn-sm" id="ai-close">إغلاق</button>
        </div>`;
      panel.querySelector('#ai-close').onclick = () => panel.remove();
      const applyBtn = panel.querySelector('#ai-apply');
      if (!r.improved) applyBtn.style.display = 'none';
      else applyBtn.onclick = () => {
        insp.sections[si].items[ii].text = r.improved;
        S.update('inspections', insp.id, { sections: insp.sections });
        itemEl.querySelector('.ci-text').textContent = r.improved;
        panel.remove();
        U.toast('تم تحديث صياغة البند', 'ok');
      };
    } catch (e) {
      panel.innerHTML = `<span style="color:#dc2626">⚠ ${esc(e.message)}</span> <button class="btn-secondary btn-sm" onclick="this.parentElement.remove()">إغلاق</button>`;
    }
  };

  Views.viewInspection = function (id) {
    const insp = S.get('inspections', id); if (!insp) return;
    const score = S.inspectionScore(insp);
    const body = insp.sections.map(sec => {
      const items = sec.items.map(it => `
        <div class="row-line">
          <span class="dot ${it.result === 'yes' ? 'green' : it.result === 'no' ? 'red' : 'amber'}"></span>
          <div style="flex:1">${esc(it.text)}</div>
          ${U.badge(it.result === 'yes' ? 'مطابق' : it.result === 'no' ? 'مخالف' : 'لا ينطبق', it.result === 'yes' ? 'green' : it.result === 'no' ? 'red' : 'gray')}
        </div>`).join('');
      return `<h4 style="margin:14px 0 6px;color:#0f766e">${esc(sec.title)}</h4>${items}`;
    }).join('');
    U.modal(insp.templateName, `
      <div class="inline-stat" style="margin-bottom:14px">
        <div><strong>${score}%</strong><span>النتيجة</span></div>
        <div><strong>${esc(insp.by)}</strong><span>المدقّق</span></div>
        <div><strong>${esc(insp.date)}</strong><span>التاريخ</span></div>
      </div>${body}
      <div class="form-actions" style="margin-top:16px"><button class="btn-secondary" onclick="window.print()">🖨️ طباعة التقرير</button></div>`, { wide: true });
  };

  Views.delInspection = function (id) {
    U.confirmDialog('حذف هذا التدقيق نهائيًا؟', () => { S.remove('inspections', id); U.toast('تم الحذف', 'ok'); App.render(); }, 'حذف');
  };

  /* ===================== مراقبة درجات الحرارة ===================== */
  Views.temperature = function () {
    const db = S.load();
    const logs = [...db.tempLogs].sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
    const breaches = logs.filter(t => t.status === 'مخالف').length;
    const rows = logs.slice(0, 60).map(t => `<tr>
      <td><strong>${esc(t.unit)}</strong></td>
      <td>${esc(t.type)}</td>
      <td><strong style="color:${t.status === 'مخالف' ? '#dc2626' : '#16a34a'}">${t.value}°م</strong></td>
      <td class="muted">${esc(t.target)}</td>
      <td>${fmtDate(t.date)} <small class="muted">${esc(t.time)}</small></td>
      <td>${esc(t.by)}</td>
      <td>${U.statusBadge(t.status)}</td>
      <td class="t-actions"><button class="btn-danger btn-sm" onclick="Views.delTemp('${t.id}')">حذف</button></td>
    </tr>`).join('');

    return `
      <div class="page-head">
        <div><h2>مراقبة درجات الحرارة</h2><p>سجّل وراقب حرارة الثلاجات والمجمدات والحفظ الساخن والطهي ضمن الحدود الآمنة</p></div>
        <div class="spacer"></div>
        <button class="btn-primary" onclick="Views.newTemp()">+ قراءة جديدة</button>
      </div>
      <div class="grid cols-3" style="margin-bottom:18px">
        <div class="card kpi info"><div class="kpi-ic">📊</div><div class="kpi-label">إجمالي القراءات</div><div class="kpi-value">${logs.length}</div></div>
        <div class="card kpi ${breaches ? 'bad' : 'good'}"><div class="kpi-ic">⚠️</div><div class="kpi-label">قراءات مخالفة</div><div class="kpi-value">${breaches}</div></div>
        <div class="card kpi good"><div class="kpi-ic">✅</div><div class="kpi-label">نسبة المطابقة</div><div class="kpi-value">${logs.length ? Math.round((1 - breaches / logs.length) * 100) : 100}%</div></div>
      </div>
      <div class="card" style="margin-bottom:18px">
        <div class="card-title">الحدود الحرارية المرجعية</div>
        <div class="inline-stat">
          <div><strong style="color:#2563eb">0–5°م</strong><span>التبريد (ثلاجات)</span></div>
          <div><strong style="color:#2563eb">-18°م أو أقل</strong><span>التجميد (مجمدات)</span></div>
          <div><strong style="color:#dc2626">63°م أو أعلى</strong><span>الحفظ الساخن</span></div>
          <div><strong style="color:#dc2626">75°م</strong><span>الحد الأدنى للطهي الآمن</span></div>
        </div>
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>الوحدة</th><th>النوع</th><th>القراءة</th><th>الحد المسموح</th><th>التاريخ</th><th>المسؤول</th><th>الحالة</th><th></th></tr></thead>
        <tbody>${rows}</tbody></table></div>`;
  };

  Views.newTemp = function () {
    U.modal('تسجيل قراءة حرارة', `
      <div class="form-grid two">
        <div class="field"><label>الوحدة / الجهاز</label><input name="unit" placeholder="مثال: ثلاجة اللحوم" /></div>
        <div class="field"><label>النوع</label><select name="type">
          <option>ثلاجة</option><option>مجمد</option><option>حفظ ساخن</option><option>طهي</option><option>استلام</option></select></div>
        <div class="field"><label>القراءة (°م)</label><input name="value" type="number" step="0.1" /></div>
        <div class="field"><label>الوقت</label><input name="time" type="time" value="${new Date().toTimeString().slice(0, 5)}" /></div>
        <div class="field field-full"><label>المسؤول</label><input name="by" value="${esc(App.user.name)}" /></div>
      </div>
      <div class="form-actions" style="margin-top:14px"><button class="btn-primary" id="save">حفظ القراءة</button></div>`,
      { onOpen: (root) => {
        U.$('#save').onclick = () => {
          const f = U.readForm(root);
          if (!f.unit || f.value === '') return U.toast('أكمل بيانات الوحدة والقراءة', 'err');
          const val = parseFloat(f.value);
          const ranges = { 'ثلاجة': [0, 5], 'مجمد': [-99, -18], 'حفظ ساخن': [63, 200], 'طهي': [75, 300], 'استلام': [0, 5] };
          const [lo, hi] = ranges[f.type] || [0, 5];
          const status = (val >= lo && val <= hi) ? 'مطابق' : 'مخالف';
          const targetTxt = { 'ثلاجة': '0 إلى 5', 'مجمد': '-18 أو أقل', 'حفظ ساخن': '63 أو أعلى', 'طهي': '75 أو أعلى', 'استلام': '0 إلى 5' }[f.type];
          S.add('tempLogs', { id: S.uid('tmp'), unit: f.unit, type: f.type, value: val, target: targetTxt, status, date: S.todayISO(), time: f.time, by: f.by });
          if (status === 'مخالف') {
            S.add('ncs', { id: S.uid('nc'), title: `تجاوز حراري: ${f.unit} عند ${val}°م`, severity: 'حرجة', source: 'مراقبة الحرارة', status: 'مفتوحة', date: S.todayISO(), owner: f.by, dueDate: S.shift(1), action: '', rootCause: '' });
          }
          U.closeModal();
          U.toast(status === 'مخالف' ? 'قراءة مخالفة! تم فتح حالة عدم مطابقة' : 'تم حفظ القراءة', status === 'مخالف' ? 'err' : 'ok');
          App.render();
        };
      } });
  };

  Views.delTemp = function (id) { S.remove('tempLogs', id); U.toast('تم الحذف', 'ok'); App.render(); };

  /* ===================== العاملون والشهادات الصحية ===================== */
  Views.employees = function () {
    const db = S.load();
    const rows = [...db.employees].sort((a, b) => S.daysFromToday(a.healthCardExpiry) - S.daysFromToday(b.healthCardExpiry)).map(e => `<tr>
      <td><strong>${esc(e.name)}</strong></td>
      <td>${esc(e.role)}</td>
      <td>${esc(e.dept)}</td>
      <td>${fmtDate(e.healthCardExpiry)}</td>
      <td>${U.expiryBadge(e.healthCardExpiry)}</td>
      <td>${(e.training || []).length ? e.training.map(t => U.badge(t, 'blue')).join(' ') : '<span class="muted">—</span>'}</td>
      <td class="t-actions">
        <button class="btn-secondary btn-sm" onclick="Views.editEmployee('${e.id}')">تعديل</button>
        <button class="btn-danger btn-sm" onclick="Views.delEmployee('${e.id}')">حذف</button>
      </td>
    </tr>`).join('');
    const expired = db.employees.filter(e => S.daysFromToday(e.healthCardExpiry) < 0).length;
    const soon = db.employees.filter(e => { const d = S.daysFromToday(e.healthCardExpiry); return d >= 0 && d <= 30; }).length;

    return `
      <div class="page-head">
        <div><h2>العاملون والشهادات الصحية</h2><p>تتبّع الكوادر، صلاحية الشهادات الصحية، والتدريب على سلامة الغذاء</p></div>
        <div class="spacer"></div>
        <button class="btn-primary" onclick="Views.editEmployee()">+ إضافة عامل</button>
      </div>
      <div class="grid cols-3" style="margin-bottom:18px">
        <div class="card kpi info"><div class="kpi-ic">👥</div><div class="kpi-label">إجمالي العاملين</div><div class="kpi-value">${db.employees.length}</div></div>
        <div class="card kpi ${expired ? 'bad' : 'good'}"><div class="kpi-ic">🪪</div><div class="kpi-label">شهادات منتهية</div><div class="kpi-value">${expired}</div></div>
        <div class="card kpi ${soon ? 'warn' : 'good'}"><div class="kpi-ic">⏰</div><div class="kpi-label">تنتهي خلال 30 يوم</div><div class="kpi-value">${soon}</div></div>
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>الاسم</th><th>الوظيفة</th><th>القسم</th><th>انتهاء الشهادة</th><th>الحالة</th><th>التدريب</th><th></th></tr></thead>
        <tbody>${rows}</tbody></table></div>`;
  };

  Views.editEmployee = function (id) {
    const e = id ? S.get('employees', id) : { name: '', role: '', dept: '', healthCardExpiry: S.shift(365), hireDate: S.todayISO(), training: [] };
    const trainings = ['أساسيات سلامة الغذاء', 'HACCP', 'تدقيق داخلي', 'النظافة الشخصية', 'مكافحة الآفات'];
    U.modal(id ? 'تعديل بيانات العامل' : 'إضافة عامل', `
      <div class="form-grid two">
        <div class="field"><label>الاسم</label><input name="name" value="${esc(e.name)}" /></div>
        <div class="field"><label>الوظيفة</label><input name="role" value="${esc(e.role)}" /></div>
        <div class="field"><label>القسم</label><input name="dept" value="${esc(e.dept)}" /></div>
        <div class="field"><label>تاريخ التعيين</label><input name="hireDate" type="date" value="${esc(e.hireDate)}" /></div>
        <div class="field field-full"><label>انتهاء الشهادة الصحية</label><input name="healthCardExpiry" type="date" value="${esc(e.healthCardExpiry)}" /></div>
        <div class="field field-full"><label>الدورات التدريبية</label>
          <div id="tr-box" style="display:flex;flex-wrap:wrap;gap:8px">
            ${trainings.map(t => `<label style="display:flex;gap:5px;align-items:center;font-weight:400;background:#f8fafc;padding:6px 10px;border-radius:8px;border:1px solid var(--line)">
              <input type="checkbox" value="${esc(t)}" ${(e.training || []).includes(t) ? 'checked' : ''}/> ${esc(t)}</label>`).join('')}
          </div></div>
      </div>
      <div class="form-actions" style="margin-top:14px"><button class="btn-primary" id="save">حفظ</button></div>`,
      { onOpen: (root) => {
        U.$('#save').onclick = () => {
          const f = U.readForm(root);
          if (!f.name) return U.toast('أدخل اسم العامل', 'err');
          f.training = [...root.querySelectorAll('#tr-box input:checked')].map(x => x.value);
          if (id) S.update('employees', id, f); else S.add('employees', f);
          U.closeModal(); U.toast('تم الحفظ', 'ok'); App.render();
        };
      } });
  };

  Views.delEmployee = function (id) {
    U.confirmDialog('حذف هذا العامل؟', () => { S.remove('employees', id); U.toast('تم الحذف', 'ok'); App.render(); }, 'حذف');
  };

  /* ===================== عدم المطابقة و CAPA ===================== */
  Views.nc = function () {
    const db = S.load();
    const list = [...db.ncs].sort((a, b) => b.date.localeCompare(a.date));
    const rows = list.map(n => `<tr>
      <td><strong>${esc(n.title)}</strong><br><small class="muted">${esc(n.source)}</small></td>
      <td>${U.statusBadge(n.severity)}</td>
      <td>${esc(n.owner)}</td>
      <td>${fmtDate(n.dueDate)}</td>
      <td>${U.statusBadge(n.status)}</td>
      <td class="t-actions">
        <button class="btn-secondary btn-sm" onclick="Views.editNC('${n.id}')">معالجة</button>
        <button class="btn-danger btn-sm" onclick="Views.delNC('${n.id}')">حذف</button>
      </td>
    </tr>`).join('');
    const open = list.filter(n => n.status !== 'مغلقة').length;
    const crit = list.filter(n => n.severity === 'حرجة' && n.status !== 'مغلقة').length;

    return `
      <div class="page-head">
        <div><h2>عدم المطابقة والإجراءات التصحيحية (CAPA)</h2><p>توثيق المخالفات، تحليل الأسباب الجذرية، ومتابعة الإجراءات التصحيحية حتى الإغلاق</p></div>
        <div class="spacer"></div>
        <button class="btn-primary" onclick="Views.editNC()">+ حالة جديدة</button>
      </div>
      <div class="grid cols-3" style="margin-bottom:18px">
        <div class="card kpi ${open ? 'warn' : 'good'}"><div class="kpi-ic">📂</div><div class="kpi-label">مفتوحة / قيد المعالجة</div><div class="kpi-value">${open}</div></div>
        <div class="card kpi ${crit ? 'bad' : 'good'}"><div class="kpi-ic">🚨</div><div class="kpi-label">حرجة مفتوحة</div><div class="kpi-value">${crit}</div></div>
        <div class="card kpi good"><div class="kpi-ic">✅</div><div class="kpi-label">مغلقة</div><div class="kpi-value">${list.filter(n => n.status === 'مغلقة').length}</div></div>
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>الوصف / المصدر</th><th>الخطورة</th><th>المسؤول</th><th>الاستحقاق</th><th>الحالة</th><th></th></tr></thead>
        <tbody>${rows}</tbody></table></div>`;
  };

  Views.editNC = function (id) {
    const n = id ? S.get('ncs', id) : { title: '', severity: 'متوسطة', source: 'تدقيق داخلي', status: 'مفتوحة', date: S.todayISO(), owner: App.user.name, dueDate: S.shift(7), action: '', preventiveAction: '', rootCause: '' };
    const sel = (val, opts) => opts.map(o => `<option ${o === val ? 'selected' : ''}>${o}</option>`).join('');
    U.modal(id ? 'معالجة حالة عدم المطابقة' : 'حالة عدم مطابقة جديدة', `
      <div class="form-grid two">
        <div class="field field-full"><label>وصف المخالفة</label><input name="title" value="${esc(n.title)}" /></div>
        <div class="field"><label>الخطورة</label><select name="severity">${sel(n.severity, ['حرجة', 'عالية', 'متوسطة', 'منخفضة'])}</select></div>
        <div class="field"><label>المصدر</label><select name="source">${sel(n.source, ['تدقيق داخلي', 'تدقيق GMP', 'مراقبة الحرارة', 'تفتيش رسمي', 'تحليل بالذكاء الاصطناعي', 'شكوى عميل', 'أخرى'])}</select></div>
        <div class="field"><label>المسؤول عن المعالجة</label><input name="owner" value="${esc(n.owner)}" /></div>
        <div class="field"><label>تاريخ الاستحقاق</label><input name="dueDate" type="date" value="${esc(n.dueDate)}" /></div>
        <div class="field"><label>الحالة</label><select name="status">${sel(n.status, ['مفتوحة', 'قيد المعالجة', 'مغلقة'])}</select></div>
        <div class="field"><label>التاريخ</label><input name="date" type="date" value="${esc(n.date)}" /></div>
        <div class="field field-full"><label>السبب الجذري</label><textarea name="rootCause">${esc(n.rootCause)}</textarea></div>
        <div class="field field-full"><label>الإجراء التصحيحي (الفوري)</label><textarea name="action">${esc(n.action)}</textarea></div>
        <div class="field field-full"><label>الإجراء الوقائي (لمنع التكرار)</label><textarea name="preventiveAction">${esc(n.preventiveAction || '')}</textarea></div>
      </div>
      <div class="form-actions" style="margin-top:14px">
        <button class="btn-primary" id="save">حفظ</button>
        <button class="btn-secondary" id="ai-capa">🤖 اقترح الإجراءات بالذكاء الاصطناعي</button>
        <span id="ai-state" class="muted" style="align-self:center"></span>
      </div>`,
      { wide: true, onOpen: (root) => {
        U.$('#ai-capa').onclick = async () => {
          const title = root.querySelector('[name=title]').value.trim();
          if (!title) return U.toast('أدخل وصف المخالفة أولًا', 'err');
          const st = U.$('#ai-state'); st.textContent = '⏳ جارٍ التحليل...';
          try {
            const r = await window.AI.generateCapa(title);
            if (r.severity) root.querySelector('[name=severity]').value = ['حرجة','عالية','متوسطة','منخفضة'].includes(r.severity) ? r.severity : root.querySelector('[name=severity]').value;
            if (r.rootCause) root.querySelector('[name=rootCause]').value = r.rootCause;
            root.querySelector('[name=action]').value = r.corrective + (r.reference ? '\n[المرجع: ' + r.reference + ']' : '');
            root.querySelector('[name=preventiveAction]').value = r.preventive;
            st.textContent = r.source === 'ai' ? '✓ تم التوليد بالذكاء الاصطناعي' : '✓ اقتراح محلي (فعّل الذكاء الاصطناعي لنتائج أدق)';
          } catch (e) { st.textContent = '⚠ ' + e.message; }
        };
        U.$('#save').onclick = () => {
          const f = U.readForm(root);
          if (!f.title) return U.toast('أدخل وصف المخالفة', 'err');
          if (id) S.update('ncs', id, f); else S.add('ncs', f);
          U.closeModal(); U.toast('تم الحفظ', 'ok'); App.render();
        };
      } });
  };

  Views.delNC = function (id) {
    U.confirmDialog('حذف هذه الحالة؟', () => { S.remove('ncs', id); U.toast('تم الحذف', 'ok'); App.render(); }, 'حذف');
  };

  /* ===================== الموردون ===================== */
  Views.suppliers = function () {
    const db = S.load();
    const rows = db.suppliers.map(s => `<tr>
      <td><strong>${esc(s.name)}</strong></td>
      <td>${esc(s.category)}</td>
      <td>${'★'.repeat(s.rating)}<span class="muted">${'★'.repeat(5 - s.rating)}</span></td>
      <td>${fmtDate(s.licenseExpiry)} ${U.expiryBadge(s.licenseExpiry)}</td>
      <td>${fmtDate(s.lastAudit)}</td>
      <td>${U.statusBadge(s.status)}</td>
      <td class="t-actions">
        <button class="btn-secondary btn-sm" onclick="Views.editSupplier('${s.id}')">تعديل</button>
        <button class="btn-danger btn-sm" onclick="Views.delSupplier('${s.id}')">حذف</button>
      </td>
    </tr>`).join('');
    return `
      <div class="page-head">
        <div><h2>اعتماد الموردين</h2><p>تقييم واعتماد موردي المواد الغذائية ومتابعة صلاحية تراخيصهم</p></div>
        <div class="spacer"></div>
        <button class="btn-primary" onclick="Views.editSupplier()">+ إضافة مورد</button>
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>المورد</th><th>الفئة</th><th>التقييم</th><th>انتهاء الترخيص</th><th>آخر تدقيق</th><th>الحالة</th><th></th></tr></thead>
        <tbody>${rows}</tbody></table></div>`;
  };

  Views.editSupplier = function (id) {
    const s = id ? S.get('suppliers', id) : { name: '', category: 'خضار وفواكه', status: 'تحت المراجعة', rating: 3, licenseExpiry: S.shift(365), lastAudit: S.todayISO(), contact: '' };
    const sel = (val, opts) => opts.map(o => `<option ${o === val ? 'selected' : ''}>${o}</option>`).join('');
    U.modal(id ? 'تعديل مورد' : 'إضافة مورد', `
      <div class="form-grid two">
        <div class="field"><label>اسم المورد</label><input name="name" value="${esc(s.name)}" /></div>
        <div class="field"><label>الفئة</label><select name="category">${sel(s.category, ['لحوم ودواجن', 'خضار وفواكه', 'ألبان', 'مواد جافة', 'مأكولات بحرية', 'مواد تغليف', 'أخرى'])}</select></div>
        <div class="field"><label>الحالة</label><select name="status">${sel(s.status, ['معتمد', 'تحت المراجعة', 'موقوف'])}</select></div>
        <div class="field"><label>التقييم (1-5)</label><select name="rating">${sel(String(s.rating), ['1', '2', '3', '4', '5'])}</select></div>
        <div class="field"><label>انتهاء الترخيص</label><input name="licenseExpiry" type="date" value="${esc(s.licenseExpiry)}" /></div>
        <div class="field"><label>آخر تدقيق</label><input name="lastAudit" type="date" value="${esc(s.lastAudit)}" /></div>
        <div class="field field-full"><label>جهة الاتصال</label><input name="contact" value="${esc(s.contact)}" /></div>
      </div>
      <div class="form-actions" style="margin-top:14px"><button class="btn-primary" id="save">حفظ</button></div>`,
      { onOpen: (root) => {
        U.$('#save').onclick = () => {
          const f = U.readForm(root); if (!f.name) return U.toast('أدخل اسم المورد', 'err');
          f.rating = parseInt(f.rating);
          if (id) S.update('suppliers', id, f); else S.add('suppliers', f);
          U.closeModal(); U.toast('تم الحفظ', 'ok'); App.render();
        };
      } });
  };

  Views.delSupplier = function (id) {
    U.confirmDialog('حذف هذا المورد؟', () => { S.remove('suppliers', id); U.toast('تم الحذف', 'ok'); App.render(); }, 'حذف');
  };

  /* ===================== التنظيف ومكافحة الآفات ===================== */
  Views.cleaning = function () {
    const db = S.load();
    const rows = [...db.cleaning].sort((a, b) => S.daysFromToday(a.nextDue) - S.daysFromToday(b.nextDue)).map(c => {
      const overdue = S.daysFromToday(c.nextDue) < 0;
      return `<tr>
        <td><strong>${esc(c.task)}</strong><br><small class="muted">${esc(c.area)}</small></td>
        <td>${U.badge(c.frequency, 'blue')}</td>
        <td>${esc(c.responsible)}</td>
        <td>${fmtDate(c.lastDone)}</td>
        <td>${fmtDate(c.nextDue)} ${overdue ? U.badge('متأخرة', 'red') : U.badge('في الموعد', 'green')}</td>
        <td class="t-actions">
          <button class="btn-secondary btn-sm" onclick="Views.markCleaned('${c.id}')">✓ تم التنفيذ</button>
          <button class="btn-danger btn-sm" onclick="Views.delCleaning('${c.id}')">حذف</button>
        </td>
      </tr>`;
    }).join('');

    const pestRows = [...db.pest].sort((a, b) => b.date.localeCompare(a.date)).map(p => `<tr>
      <td>${fmtDate(p.date)}</td>
      <td><strong>${esc(p.company)}</strong></td>
      <td>${esc(p.type)}</td>
      <td>${esc(p.findings)}</td>
      <td>${fmtDate(p.nextVisit)} ${S.daysFromToday(p.nextVisit) < 0 ? U.badge('مستحقة', 'red') : ''}</td>
      <td class="t-actions"><button class="btn-danger btn-sm" onclick="Views.delPest('${p.id}')">حذف</button></td>
    </tr>`).join('');

    return `
      <div class="page-head">
        <div><h2>التنظيف والتعقيم ومكافحة الآفات</h2><p>جدولة مهام النظافة وتوثيق زيارات مكافحة الآفات</p></div>
        <div class="spacer"></div>
        <button class="btn-secondary" onclick="Views.newPest()">+ زيارة مكافحة</button>
        <button class="btn-primary" onclick="Views.editCleaning()">+ مهمة تنظيف</button>
      </div>
      <div class="card" style="margin-bottom:20px">
        <div class="card-title">🧹 جدول التنظيف والتعقيم</div>
        <div class="table-wrap" style="border:none">
          <table><thead><tr><th>المهمة / المنطقة</th><th>التكرار</th><th>المسؤول</th><th>آخر تنفيذ</th><th>الاستحقاق القادم</th><th></th></tr></thead>
          <tbody>${rows}</tbody></table>
        </div>
      </div>
      <div class="card">
        <div class="card-title">🐀 سجل مكافحة الآفات</div>
        <div class="table-wrap" style="border:none">
          <table><thead><tr><th>التاريخ</th><th>الشركة</th><th>النوع</th><th>الملاحظات</th><th>الزيارة القادمة</th><th></th></tr></thead>
          <tbody>${pestRows || '<tr><td colspan="6">' + U.empty('لا توجد زيارات مسجلة', '🐀') + '</td></tr>'}</tbody></table>
        </div>
      </div>`;
  };

  Views.markCleaned = function (id) {
    const c = S.get('cleaning', id); if (!c) return;
    const freqDays = { 'يومي': 1, 'أسبوعي': 7, 'شهري': 30 }[c.frequency] || 7;
    S.update('cleaning', id, { lastDone: S.todayISO(), nextDue: S.shift(freqDays) });
    U.toast('تم تسجيل تنفيذ المهمة', 'ok'); App.render();
  };

  Views.editCleaning = function (id) {
    const c = id ? S.get('cleaning', id) : { area: '', task: '', frequency: 'يومي', responsible: '', lastDone: S.todayISO(), nextDue: S.todayISO() };
    const sel = (val, opts) => opts.map(o => `<option ${o === val ? 'selected' : ''}>${o}</option>`).join('');
    U.modal('مهمة تنظيف', `
      <div class="form-grid two">
        <div class="field"><label>المنطقة</label><input name="area" value="${esc(c.area)}" /></div>
        <div class="field"><label>التكرار</label><select name="frequency">${sel(c.frequency, ['يومي', 'أسبوعي', 'شهري'])}</select></div>
        <div class="field field-full"><label>المهمة</label><input name="task" value="${esc(c.task)}" /></div>
        <div class="field field-full"><label>المسؤول</label><input name="responsible" value="${esc(c.responsible)}" /></div>
      </div>
      <div class="form-actions" style="margin-top:14px"><button class="btn-primary" id="save">حفظ</button></div>`,
      { onOpen: (root) => {
        U.$('#save').onclick = () => {
          const f = U.readForm(root); if (!f.task) return U.toast('أدخل المهمة', 'err');
          const freqDays = { 'يومي': 1, 'أسبوعي': 7, 'شهري': 30 }[f.frequency] || 7;
          f.lastDone = c.lastDone; f.nextDue = S.shift(freqDays);
          if (id) S.update('cleaning', id, f); else S.add('cleaning', f);
          U.closeModal(); U.toast('تم الحفظ', 'ok'); App.render();
        };
      } });
  };

  Views.delCleaning = function (id) { S.remove('cleaning', id); U.toast('تم الحذف', 'ok'); App.render(); };

  Views.newPest = function () {
    U.modal('زيارة مكافحة آفات', `
      <div class="form-grid two">
        <div class="field"><label>الشركة</label><input name="company" /></div>
        <div class="field"><label>النوع</label><select name="type"><option>زيارة دورية</option><option>زيارة طارئة</option><option>معالجة</option></select></div>
        <div class="field"><label>تاريخ الزيارة</label><input name="date" type="date" value="${S.todayISO()}" /></div>
        <div class="field"><label>الزيارة القادمة</label><input name="nextVisit" type="date" value="${S.shift(30)}" /></div>
        <div class="field field-full"><label>الملاحظات / النتائج</label><textarea name="findings"></textarea></div>
      </div>
      <div class="form-actions" style="margin-top:14px"><button class="btn-primary" id="save">حفظ</button></div>`,
      { onOpen: (root) => {
        U.$('#save').onclick = () => {
          const f = U.readForm(root); if (!f.company) return U.toast('أدخل اسم الشركة', 'err');
          f.status = 'مكتملة'; S.add('pest', f);
          U.closeModal(); U.toast('تم الحفظ', 'ok'); App.render();
        };
      } });
  };

  Views.delPest = function (id) { S.remove('pest', id); U.toast('تم الحذف', 'ok'); App.render(); };

  /* ===================== الرصد بالتصوير (ذكاء اصطناعي) ===================== */
  Views._monImg = null;
  Views._monViolations = [];

  Views.monitor = function () {
    const db = S.load();
    const history = (db.monitors || []).slice(0, 8);
    const aiOn = window.AI.enabled();
    return `
      <div class="page-head">
        <div><h2>الرصد بالتصوير الذكي</h2><p>صوّر موقع العمل ليقوم الذكاء الاصطناعي برصد المخالفات تلقائيًا واقتراح الإجراءات التصحيحية والوقائية</p></div>
      </div>
      ${aiOn ? '' : `<div class="card" style="margin-bottom:16px;background:#fffbeb;border-color:#fde68a">
        <strong>⚠ خدمة الذكاء الاصطناعي غير مفعّلة</strong>
        <p class="muted" style="margin-top:6px">الرصد الآلي للمخالفات من الصور يتطلب تفعيل الخدمة من <a href="#" onclick="App.go('settings');return false">الإعدادات</a>. يمكنك حاليًا التقاط صورة وإضافة ملاحظة نصية ليقترح النظام الإجراءات المناسبة من قاعدة المواصفات.</p></div>`}
      <div class="grid cols-2">
        <div class="card">
          <div class="card-title">📷 التقاط / رفع صورة</div>
          <div id="mon-preview" style="margin-bottom:12px;text-align:center;min-height:160px;display:grid;place-items:center;background:#f8fafc;border-radius:12px;border:1.5px dashed var(--line)">
            <span class="muted">لم يتم اختيار صورة بعد</span>
          </div>
          <div class="field" style="margin-bottom:10px">
            <input type="file" id="mon-file" accept="image/*" capture="environment" />
          </div>
          <div class="field" style="margin-bottom:12px">
            <label>ملاحظة المفتش (اختياري)</label>
            <textarea id="mon-note" placeholder="مثال: بقايا طعام على سطح التحضير، أو باب الثلاجة مفتوح"></textarea>
          </div>
          <button class="btn-primary" id="mon-analyze" disabled>🔍 تحليل ورصد المخالفات</button>
          <span id="mon-state" class="muted" style="margin-inline-start:10px"></span>
        </div>
        <div class="card">
          <div class="card-title">📋 نتائج الرصد</div>
          <div id="mon-results">${U.empty('ستظهر المخالفات المرصودة هنا بعد التحليل', '🔎')}</div>
        </div>
      </div>
      ${history.length ? `<div class="card section-gap">
        <div class="card-title">🕘 سجل عمليات الرصد</div>
        <div class="table-wrap" style="border:none"><table>
          <thead><tr><th>التاريخ</th><th>الملخص</th><th>المخالفات</th><th>المصدر</th></tr></thead>
          <tbody>${history.map(h => `<tr>
            <td>${fmtDate(h.date)} <small class="muted">${esc(h.time || '')}</small></td>
            <td>${esc(h.summary || '—')}</td>
            <td>${U.badge(h.count + ' مخالفة', h.count ? 'red' : 'green')}</td>
            <td>${h.source === 'ai' ? U.badge('ذكاء اصطناعي', 'blue') : U.badge('محلي', 'gray')}</td>
          </tr>`).join('')}</tbody></table></div>
      </div>` : ''}`;
  };

  Views.bind_monitor = function () {
    Views._monImg = null;
    const fileEl = U.$('#mon-file'), analyzeBtn = U.$('#mon-analyze');
    if (!fileEl) return;
    fileEl.onchange = () => {
      const file = fileEl.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const m = /^data:(.*?);base64,(.*)$/.exec(reader.result);
        if (!m) return U.toast('تعذّر قراءة الصورة', 'err');
        Views._monImg = { mediaType: m[1], data: m[2] };
        U.$('#mon-preview').innerHTML = `<img src="${reader.result}" style="max-width:100%;max-height:240px;border-radius:10px" alt="معاينة"/>`;
        analyzeBtn.disabled = false;
      };
      reader.readAsDataURL(file);
    };

    analyzeBtn.onclick = async () => {
      const note = U.$('#mon-note').value.trim();
      if (!Views._monImg && !note) return U.toast('اختر صورة أو أضف ملاحظة', 'err');
      const st = U.$('#mon-state'); st.textContent = '⏳ جارٍ التحليل...';
      analyzeBtn.disabled = true;
      try {
        const r = await window.AI.analyzePhoto(Views._monImg || { mediaType: 'image/jpeg', data: '' }, note);
        st.textContent = '';
        Views._monViolations = r.violations || [];
        const box = U.$('#mon-results');
        if (r.error) { box.innerHTML = `<div class="empty"><span class="ic">⚠</span>${esc(r.error)}</div>`; analyzeBtn.disabled = false; return; }
        if (r.needsKey) { box.innerHTML = U.empty(r.hint, '🔑'); analyzeBtn.disabled = false; return; }

        // حفظ سجل خفيف
        S.add('monitors', { id: S.uid('mon'), date: S.todayISO(), time: new Date().toTimeString().slice(0,5), summary: r.summary || '', count: (r.violations||[]).length, source: r.source });

        let html = `<p class="muted" style="margin-bottom:12px">${esc(r.summary || '')} ${r.source === 'ai' ? U.badge('ذكاء اصطناعي', 'blue') : U.badge('محلي', 'gray')}</p>`;
        if (!Views._monViolations.length) {
          html += `<div class="empty" style="padding:20px"><span class="ic">✅</span>لم تُرصد مخالفات — المشهد مطابق</div>`;
        } else {
          html += Views._monViolations.map((v, i) => `
            <div class="card" style="margin-bottom:10px;border-color:#fecaca;background:#fef2f2">
              <div style="display:flex;gap:8px;align-items:center;margin-bottom:6px">
                <strong style="flex:1">${esc(v.title)}</strong>${U.statusBadge(v.severity || 'متوسطة')}
              </div>
              <p style="font-size:13px;margin-bottom:4px"><strong>الإجراء التصحيحي:</strong> ${esc(v.corrective || '')}</p>
              <p style="font-size:13px;margin-bottom:4px"><strong>الإجراء الوقائي:</strong> ${esc(v.preventive || '')}</p>
              ${v.reference ? `<p class="muted" style="font-size:12px;margin-bottom:8px">المرجع: ${esc(v.reference)}</p>` : ''}
              <button class="btn-primary btn-sm" onclick="Views.ncFromMonitor(${i})">+ إنشاء حالة عدم مطابقة</button>
            </div>`).join('');
        }
        box.innerHTML = html;
        // تحديث عدّادات القائمة الجانبية
        App.buildNav();
        U.toast(Views._monViolations.length ? `تم رصد ${Views._monViolations.length} مخالفة` : 'لا توجد مخالفات', Views._monViolations.length ? 'err' : 'ok');
      } catch (e) {
        st.textContent = '';
        U.$('#mon-results').innerHTML = `<div class="empty"><span class="ic">⚠</span>${esc(e.message)}</div>`;
      }
      analyzeBtn.disabled = false;
    };
  };

  Views.ncFromMonitor = function (i) {
    const v = Views._monViolations[i]; if (!v) return;
    S.add('ncs', {
      id: S.uid('nc'), title: v.title, severity: ['حرجة','عالية','متوسطة','منخفضة'].includes(v.severity) ? v.severity : 'متوسطة',
      source: 'تحليل بالذكاء الاصطناعي', status: 'مفتوحة', date: S.todayISO(), owner: App.user.name, dueDate: S.shift(3),
      action: (v.corrective || '') + (v.reference ? '\n[المرجع: ' + v.reference + ']' : ''),
      preventiveAction: v.preventive || '', rootCause: '',
    });
    U.toast('تم إنشاء حالة عدم مطابقة من المخالفة المرصودة', 'ok');
    App.buildNav();
  };

  /* ===================== المواصفات والمعايير ===================== */
  Views.standards = function () {
    const regions = ['سعودية', 'خليجية', 'عالمية'];
    const byRegion = (r) => window.Standards.STANDARDS.filter(s => s.region === r);
    const card = (s) => `
      <div class="card" style="margin-bottom:14px">
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:6px">
          <strong style="flex:1">${esc(s.title)}</strong>
          ${U.badge(s.code, 'blue')}
        </div>
        <p class="muted" style="font-size:13px;margin-bottom:8px">${esc(s.authority)} — ${esc(s.scope)}</p>
        <ul style="margin-inline-start:18px;font-size:13.5px;line-height:1.9">${s.points.map(p => `<li>${esc(p)}</li>`).join('')}</ul>
      </div>`;
    return `
      <div class="page-head">
        <div><h2>المواصفات والمعايير المرجعية</h2><p>قاعدة المعرفة التي يستند إليها النظام في التقييم والرصد — سعودية وخليجية وعالمية</p></div>
      </div>
      <div class="card" style="margin-bottom:20px">
        <div class="card-title">🌡️ الحدود الحرارية الحرجة المرجعية</div>
        <div class="table-wrap" style="border:none"><table>
          <thead><tr><th>البند</th><th>الحد المرجعي</th><th>المرجع</th></tr></thead>
          <tbody>${window.Standards.CRITICAL_LIMITS.map(l => `<tr>
            <td><strong>${esc(l.item)}</strong></td><td>${esc(l.limit)}</td><td class="muted">${esc(l.ref)}</td>
          </tr>`).join('')}</tbody></table></div>
      </div>
      ${regions.map(r => `
        <h3 style="margin:18px 0 12px;color:#0f766e">${r === 'سعودية' ? '🇸🇦 المواصفات السعودية' : r === 'خليجية' ? '🌙 المواصفات الخليجية (GSO)' : '🌍 المواصفات العالمية'}</h3>
        ${byRegion(r).map(card).join('')}
      `).join('')}`;
  };

  /* ===================== التقارير والجاهزية ===================== */
  Views.reports = function () {
    const m = S.metrics();
    const db = S.load();
    // توزيع نتائج التدقيق حسب القسم (آخر تدقيق GMP)
    const gmp = [...db.inspections].filter(i => i.template === 'gmp').sort((a, b) => b.date.localeCompare(a.date))[0];
    let sectionBars = '';
    if (gmp) {
      sectionBars = gmp.sections.map(sec => {
        let yes = 0, tot = 0;
        sec.items.forEach(it => { if (it.result !== 'na') { tot++; if (it.result === 'yes') yes++; } });
        const pct = tot ? Math.round(yes / tot * 100) : 0;
        const col = pct >= 85 ? '#16a34a' : pct >= 60 ? '#d97706' : '#dc2626';
        return `<div class="bar-row"><div class="bar-label">${esc(sec.title)}</div>
          <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${col}">${pct}%</div></div></div>`;
      }).join('');
    }

    const checklist = [
      ['سجلات درجات الحرارة محدثة', m.tempBreaches === 0],
      ['لا توجد مخالفات حرجة مفتوحة', m.criticalNCs === 0],
      ['جميع الشهادات الصحية سارية', m.expiredCards === 0],
      ['نسبة امتثال GMP ≥ 85%', m.compliance >= 85],
      ['جدول التنظيف محدّث', m.overdueCleaning === 0],
      ['تم تنفيذ تدقيق داخلي حديث', !!m.lastInsp],
    ];

    return `
      <div class="page-head">
        <div><h2>التقارير وجاهزية التفتيش</h2><p>ملخص شامل لحالة المنشأة وجاهزيتها لزيارة الجهات الرقابية</p></div>
        <div class="spacer"></div>
        <button class="btn-secondary" onclick="window.print()">🖨️ طباعة التقرير</button>
      </div>

      <div class="grid cols-3">
        <div class="card">
          <div class="card-title">🛡️ مؤشر الجاهزية العام</div>
          <div class="donut-wrap">${U.donut(m.readiness, 'جاهز للتفتيش')}
            <div style="flex:1" class="muted">${m.readiness >= 85 ? 'المنشأة في حالة جاهزية ممتازة.' : m.readiness >= 60 ? 'جاهزية مقبولة مع وجود ملاحظات تحتاج معالجة.' : 'تحذير: توجد مخاطر تتطلب إجراءات عاجلة قبل التفتيش.'}</div>
          </div>
        </div>
        <div class="card" style="grid-column:span 2">
          <div class="card-title">📋 قائمة التحقق قبل التفتيش</div>
          ${checklist.map(([t, ok]) => `<div class="row-line">
            <span class="dot ${ok ? 'green' : 'red'}"></span>
            <div style="flex:1">${esc(t)}</div>
            ${ok ? U.badge('مستوفى', 'green') : U.badge('غير مستوفى', 'red')}</div>`).join('')}
        </div>
      </div>

      <div class="card section-gap">
        <div class="card-title">📊 الامتثال حسب محاور GMP</div>
        ${sectionBars || U.empty('نفّذ تدقيق GMP لعرض التحليل', '📊')}
      </div>

      <div class="card section-gap">
        <div class="card-title">🏢 بيانات المنشأة</div>
        <div class="inline-stat">
          <div><strong>${esc(db.meta.facilityName)}</strong><span>اسم المنشأة</span></div>
          <div><strong>${esc(db.meta.city)}</strong><span>المدينة</span></div>
          <div><strong>${esc(db.meta.license)}</strong><span>السجل التجاري</span></div>
          <div><strong>${db.employees.length}</strong><span>عدد العاملين</span></div>
          <div><strong>${db.suppliers.length}</strong><span>الموردون</span></div>
          <div><strong>${fmtDate(S.todayISO())}</strong><span>تاريخ التقرير</span></div>
        </div>
      </div>`;
  };

  /* ===================== الإعدادات ===================== */
  Views.settings = function () {
    const db = S.load();
    return `
      <div class="page-head"><div><h2>الإعدادات</h2><p>بيانات المنشأة وإدارة البيانات</p></div></div>
      <div class="card" style="max-width:560px">
        <div class="card-title">🏢 بيانات المنشأة</div>
        <div class="form-grid">
          <div class="field"><label>اسم المنشأة</label><input id="set-name" value="${esc(db.meta.facilityName)}" /></div>
          <div class="field"><label>المدينة</label><input id="set-city" value="${esc(db.meta.city)}" /></div>
          <div class="field"><label>السجل التجاري / الترخيص</label><input id="set-lic" value="${esc(db.meta.license)}" /></div>
          <div class="form-actions"><button class="btn-primary" id="save-meta">حفظ</button></div>
        </div>
      </div>
      <div class="card section-gap" style="max-width:560px">
        <div class="card-title">🤖 الذكاء الاصطناعي (Claude)</div>
        <p class="muted" style="margin-bottom:14px">عند التفعيل يستخدم النظام نموذج <strong>${esc(window.AI.MODEL)}</strong> لتحليل الصور ورصد المخالفات وتقييم البنود وتوليد الإجراءات. يُحفظ المفتاح محليًا على جهازك فقط ولا يُرسل لأي جهة عدا خدمة Claude.</p>
        <div class="form-grid">
          <div class="field"><label>مفتاح Claude API</label><input id="ai-key" type="password" placeholder="sk-ant-..." value="${esc(window.AI.cfg().apiKey || '')}" /></div>
          <div class="field"><label style="display:flex;gap:8px;align-items:center;font-weight:400">
            <input type="checkbox" id="ai-enabled" ${window.AI.cfg().enabled !== false ? 'checked' : ''}/> تفعيل خدمة الذكاء الاصطناعي
          </label></div>
          <div class="form-actions">
            <button class="btn-primary" id="ai-save">حفظ الإعدادات</button>
            <button class="btn-secondary" id="ai-test">اختبار الاتصال</button>
            <span id="ai-test-state" class="muted" style="align-self:center"></span>
          </div>
        </div>
      </div>
      <div class="card section-gap" style="max-width:560px">
        <div class="card-title">🗃️ إدارة البيانات</div>
        <p class="muted" style="margin-bottom:14px">تُحفظ جميع البيانات محليًا على هذا الجهاز. يمكنك تصدير نسخة احتياطية أو إعادة ضبط النظام.</p>
        <div class="form-actions">
          <button class="btn-secondary" onclick="App.exportData()">⬇ تصدير نسخة احتياطية</button>
          <button class="btn-danger" id="reset-btn">↺ إعادة الضبط للبيانات التجريبية</button>
        </div>
      </div>`;
  };

  Views.bindSettings = function () {
    const save = U.$('#save-meta');
    if (save) save.onclick = () => {
      const db = S.load();
      db.meta.facilityName = U.$('#set-name').value.trim();
      db.meta.city = U.$('#set-city').value.trim();
      db.meta.license = U.$('#set-lic').value.trim();
      S.save(); U.toast('تم حفظ بيانات المنشأة', 'ok');
    };
    const reset = U.$('#reset-btn');
    if (reset) reset.onclick = () => U.confirmDialog('سيتم حذف جميع البيانات الحالية واستعادة البيانات التجريبية. متابعة؟', () => {
      S.reset(); U.toast('تمت إعادة الضبط', 'ok'); App.render();
    }, 'إعادة الضبط');

    const aiSave = U.$('#ai-save');
    if (aiSave) aiSave.onclick = () => {
      window.AI.setCfg({ apiKey: U.$('#ai-key').value.trim(), enabled: U.$('#ai-enabled').checked });
      U.toast('تم حفظ إعدادات الذكاء الاصطناعي', 'ok');
    };
    const aiTest = U.$('#ai-test');
    if (aiTest) aiTest.onclick = async () => {
      window.AI.setCfg({ apiKey: U.$('#ai-key').value.trim(), enabled: U.$('#ai-enabled').checked });
      const st = U.$('#ai-test-state');
      if (!window.AI.hasKey()) { st.textContent = '⚠ أدخل المفتاح أولًا'; return; }
      st.textContent = '⏳ جارٍ الاختبار...';
      try {
        const r = await window.AI.generateCapa('اختبار اتصال: درجة حرارة ثلاجة مرتفعة');
        st.textContent = r.source === 'ai' ? '✓ الاتصال ناجح والخدمة تعمل' : '⚠ تعذّر الاتصال — يعمل النظام بالوضع المحلي';
      } catch (e) { st.textContent = '⚠ ' + e.message; }
    };
  };

  window.Views = Views;
})();
