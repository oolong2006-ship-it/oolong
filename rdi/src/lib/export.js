// تصدير التقرير: PDF عبر الطباعة، و Word عبر ملف HTML بامتداد .doc.
// نهرّب كل نص مستخدم (escapeHtml) لمنع XSS في المخرجات.

import { escapeHtml } from './sanitize.js';
import { feeBreakdown, margin } from './finance.js';
import { money, percent } from './format.js';

/** تصدير PDF: نعتمد على نافذة الطباعة في المتصفح (المستخدم يختار "حفظ كـ PDF"). */
export function exportToPdf() {
  window.print();
}

/**
 * تصدير Word: نبني مستند HTML كامل بترميز RTL ونحفظه بامتداد .doc
 * (يفتحه Word مباشرة). كل القيم مهرّبة.
 */
export function exportToWord({ restaurant, items, platforms, settings, issues, offers, kpis }) {
  const rest = escapeHtml(restaurant.name || 'مطعم');
  const branch = escapeHtml(restaurant.branch || '');
  const today = new Date().toLocaleDateString('ar-SA');

  // جدول الربحية: صنف × منصة.
  const tableRows = items
    .map((item) => {
      const cells = platforms
        .map((p) => {
          const fb = feeBreakdown(item, p, settings);
          const m = margin(item, p, settings);
          const color = fb.net < 0 ? '#B23A2F' : '#3E7B5A';
          return `<td style="color:${color};text-align:center">${escapeHtml(money(fb.net))}<br/><small>${escapeHtml(percent(m))}</small></td>`;
        })
        .join('');
      return `<tr><td>${escapeHtml(item.name)}</td>${cells}</tr>`;
    })
    .join('');

  const platformHeaders = platforms.map((p) => `<th>${escapeHtml(p.name)}</th>`).join('');

  // المشاكل.
  const issuesHtml = issues.length
    ? issues
        .map(
          (is) =>
            `<li><b>${escapeHtml(is.item)}</b> على «${escapeHtml(is.platform)}» — ${
              is.type === 'loss' ? 'خسارة' : 'هامش رقيق'
            } (${escapeHtml(money(is.net))}، ${escapeHtml(percent(is.margin))}).<br/>${is.recommendations
              .map((r) => `• ${escapeHtml(r)}`)
              .join('<br/>')}</li>`,
        )
        .join('')
    : '<li>لا توجد مشاكل جوهرية — وضع جيد.</li>';

  // العروض.
  const offersHtml = offers.length
    ? offers.map((o) => `<li><b>${escapeHtml(o.title)}</b>: ${escapeHtml(o.detail)}</li>`).join('')
    : '<li>لا توجد مقترحات عروض حالياً.</li>';

  const html = `<!doctype html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8">
<style>
  body{font-family:'Tajawal',Arial,sans-serif;color:#131A2B;direction:rtl}
  h1{color:#131A2B} h2{color:#B8924F;border-bottom:2px solid #B8924F;padding-bottom:4px}
  table{border-collapse:collapse;width:100%;margin:12px 0}
  th,td{border:1px solid #ccc;padding:6px;font-size:13px}
  th{background:#131A2B;color:#fff}
  .kpi{display:inline-block;margin:4px 12px 4px 0}
</style></head><body>
  <h1>تقرير تحليل ربحية التوصيل — RDI</h1>
  <p><b>المطعم:</b> ${rest} ${branch ? '— ' + branch : ''} &nbsp;|&nbsp; <b>التاريخ:</b> ${escapeHtml(today)}</p>

  <h2>المؤشرات الرئيسية</h2>
  <p>
    <span class="kpi"><b>عدد الأصناف:</b> ${escapeHtml(String(kpis.itemCount))}</span>
    <span class="kpi"><b>عدد المنصات:</b> ${escapeHtml(String(kpis.platformCount))}</span>
    <span class="kpi"><b>متوسط صافي الربح للصنف:</b> ${escapeHtml(money(kpis.avgNetPerItem))}</span>
    <span class="kpi"><b>حالات الخسارة:</b> ${escapeHtml(String(kpis.losingCount))}</span>
    <span class="kpi"><b>أعلى منصة ربحاً:</b> ${escapeHtml(kpis.bestPlatform || '-')}</span>
  </p>

  <h2>جدول ربحية الأصناف على المنصات (صافي الربح / الهامش)</h2>
  <table><thead><tr><th>الصنف</th>${platformHeaders}</tr></thead><tbody>${tableRows}</tbody></table>

  <h2>المشاكل والتوصيات (بالأولوية)</h2>
  <ul>${issuesHtml}</ul>

  <h2>مقترحات العروض</h2>
  <ul>${offersHtml}</ul>
</body></html>`;

  const blob = new Blob(['﻿' + html], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `RDI-تقرير-${restaurant.name || 'مطعم'}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
