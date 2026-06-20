import { useMemo } from 'react';
import { feeBreakdown, margin, analyzeIssues, buildOffers, buildKpis } from '../lib/finance.js';
import { money, percent } from '../lib/format.js';
import { exportToPdf, exportToWord } from '../lib/export.js';
import Charts from './Charts.jsx';

// التقرير الاحترافي الكامل.
export default function Report({ restaurant, items, platforms, settings }) {
  // كل الحسابات مذكّرة (memo) لتفادي إعادة الحساب غير الضرورية.
  const kpis = useMemo(() => buildKpis(items, platforms, settings), [items, platforms, settings]);
  const issues = useMemo(
    () => analyzeIssues(items, platforms, settings),
    [items, platforms, settings],
  );
  const offers = useMemo(() => buildOffers(items, platforms, settings), [items, platforms, settings]);

  const today = new Date().toLocaleDateString('ar-SA');

  function handleWord() {
    exportToWord({ restaurant, items, platforms, settings, issues, offers, kpis });
  }

  return (
    <div className="print-area">
      {/* أزرار التصدير */}
      <div className="no-print flex flex-wrap gap-3 justify-end mb-4">
        <button
          onClick={exportToPdf}
          className="bg-navy text-cream px-4 py-2 rounded-lg font-medium hover:bg-navy/90"
        >
          طباعة / PDF
        </button>
        <button
          onClick={handleWord}
          className="border border-gold text-gold px-4 py-2 rounded-lg font-medium hover:bg-gold/10"
        >
          تصدير Word
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gold/20 p-6 space-y-8">
        {/* الترويسة */}
        <header className="border-b border-gold/30 pb-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h1 className="text-2xl font-extrabold text-navy">تقرير تحليل ربحية التوصيل</h1>
              <p className="text-navy/60 mt-1">
                {restaurant.name || 'مطعم'}
                {restaurant.branch ? ` — ${restaurant.branch}` : ''}
              </p>
            </div>
            <div className="text-left">
              <div className="text-gold font-bold text-lg">RDI</div>
              <div className="text-xs text-navy/50">التاريخ: {today}</div>
            </div>
          </div>
        </header>

        {/* الملخص التنفيذي */}
        <ExecutiveSummary kpis={kpis} issues={issues} />

        {/* المؤشرات الرئيسية */}
        <section>
          <SectionTitle>المؤشرات الرئيسية</SectionTitle>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Kpi label="عدد الأصناف" value={kpis.itemCount} />
            <Kpi label="عدد المنصات" value={kpis.platformCount} />
            <Kpi label="متوسط صافي الربح/صنف" value={money(kpis.avgNetPerItem)} tone={kpis.avgNetPerItem >= 0 ? 'profit' : 'loss'} />
            <Kpi label="حالات الخسارة" value={kpis.losingCount} tone={kpis.losingCount > 0 ? 'loss' : 'profit'} />
            <Kpi label="حالات هامش رقيق" value={kpis.thinCount} tone={kpis.thinCount > 0 ? 'gold' : 'profit'} />
            <Kpi label="أعلى منصة ربحاً" value={kpis.bestPlatform || '—'} />
            <Kpi label="إجمالي ربح أفضل منصة" value={money(kpis.bestPlatformTotal)} tone="profit" />
          </div>
        </section>

        {/* جدول الربحية */}
        <section>
          <SectionTitle>ربحية كل صنف على كل منصة</SectionTitle>
          <ProfitTable items={items} platforms={platforms} settings={settings} />
          <p className="text-xs text-navy/50 mt-2">
            كل خلية تعرض «صافي الربح / الهامش». الأخضر = ربح، الأحمر = خسارة.
          </p>
        </section>

        {/* الرسوم البيانية */}
        <section>
          <SectionTitle>الرسوم البيانية</SectionTitle>
          <Charts items={items} platforms={platforms} settings={settings} />
        </section>

        {/* المشاكل والتوصيات */}
        <section>
          <SectionTitle>المشاكل والتوصيات (بالأولوية)</SectionTitle>
          <IssuesList issues={issues} />
        </section>

        {/* العروض */}
        <section>
          <SectionTitle>مقترحات العروض الذكية</SectionTitle>
          <OffersList offers={offers} />
        </section>
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h2 className="text-lg font-bold text-navy border-r-4 border-gold pr-3 mb-4">{children}</h2>
  );
}

function ExecutiveSummary({ kpis, issues }) {
  const lossCount = issues.filter((i) => i.type === 'loss').length;
  const thinCount = issues.filter((i) => i.type === 'thin').length;

  let verdict;
  if (lossCount > 0) {
    verdict = `يوجد ${lossCount} حالة خسارة تتطلب تدخلاً فورياً (رفع سعر أو سحب صنف أو تفاوض على العمولة).`;
  } else if (thinCount > 0) {
    verdict = `لا توجد خسائر مباشرة، لكن ${thinCount} حالة بهامش رقيق تستحق المراجعة لتحسين الربحية.`;
  } else {
    verdict = 'الوضع المالي جيد عبر كل المنصات — لا خسائر ولا هوامش رقيقة جوهرية.';
  }

  return (
    <section className="bg-cream/60 rounded-xl p-5 border border-gold/20">
      <SectionTitle>الملخص التنفيذي</SectionTitle>
      <p className="text-navy leading-relaxed">
        تم تحليل <b className="num">{kpis.itemCount}</b> صنفاً عبر{' '}
        <b className="num">{kpis.platformCount}</b> منصات. متوسط صافي الربح للصنف الواحد{' '}
        <b className="num">{money(kpis.avgNetPerItem)}</b>، وأعلى المنصات ربحاً{' '}
        <b>{kpis.bestPlatform || '—'}</b>. {verdict}
      </p>
    </section>
  );
}

function Kpi({ label, value, tone }) {
  const toneClass =
    tone === 'profit'
      ? 'text-profit'
      : tone === 'loss'
        ? 'text-loss'
        : tone === 'gold'
          ? 'text-gold'
          : 'text-navy';
  return (
    <div className="bg-cream/50 rounded-xl p-3 border border-navy/5">
      <div className="text-xs text-navy/50 mb-1">{label}</div>
      <div className={`num text-lg font-bold ${toneClass}`}>{value}</div>
    </div>
  );
}

function ProfitTable({ items, platforms, settings }) {
  return (
    <div className="overflow-x-auto -mx-2 px-2">
      <table className="w-full text-sm min-w-[560px] border-collapse">
        <thead>
          <tr>
            <th className="text-right py-2 px-2 bg-navy text-cream rounded-r-lg">الصنف</th>
            {platforms.map((p, i) => (
              <th
                key={i}
                className={`text-center py-2 px-2 bg-navy text-cream ${i === platforms.length - 1 ? 'rounded-l-lg' : ''}`}
              >
                {p.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, ri) => (
            <tr key={ri} className="border-b border-navy/5">
              <td className="py-2 px-2 font-medium text-navy">{item.name}</td>
              {platforms.map((p, ci) => {
                const fb = feeBreakdown(item, p, settings);
                const m = margin(item, p, settings);
                const loss = fb.net < 0;
                return (
                  <td
                    key={ci}
                    className={`text-center py-2 px-2 ${loss ? 'bg-loss/10' : 'bg-profit/5'}`}
                  >
                    <div className={`num font-semibold ${loss ? 'text-loss' : 'text-profit'}`}>
                      {money(fb.net)}
                    </div>
                    <div className={`num text-xs ${loss ? 'text-loss/70' : 'text-profit/70'}`}>
                      {percent(m)}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function IssuesList({ issues }) {
  if (issues.length === 0) {
    return (
      <div className="rounded-xl bg-profit/10 border border-profit/30 text-profit px-4 py-3">
        ✓ لا توجد مشاكل جوهرية — الوضع المالي جيد.
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {issues.map((is, i) => (
        <div
          key={i}
          className={`rounded-xl border p-4 ${
            is.severity === 'high'
              ? 'bg-loss/5 border-loss/30'
              : 'bg-gold/5 border-gold/30'
          }`}
        >
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
            <div className="font-bold text-navy">
              <span
                className={`inline-block text-xs px-2 py-0.5 rounded-full ml-2 ${
                  is.severity === 'high' ? 'bg-loss text-white' : 'bg-gold text-white'
                }`}
              >
                {is.type === 'loss' ? 'خسارة — أولوية عالية' : 'هامش رقيق — أولوية متوسطة'}
              </span>
              {is.item} على «{is.platform}»
            </div>
            <div className="num text-sm">
              <span className={is.net < 0 ? 'text-loss font-semibold' : 'text-gold font-semibold'}>
                {money(is.net)}
              </span>
              <span className="text-navy/40 mx-1">·</span>
              <span className="text-navy/60">{percent(is.margin)}</span>
            </div>
          </div>
          <ul className="text-sm text-navy/80 space-y-1 pr-1">
            {is.recommendations.map((r, ri) => (
              <li key={ri} className="flex gap-2">
                <span className="text-gold">←</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function OffersList({ offers }) {
  if (offers.length === 0) {
    return <p className="text-navy/60 text-sm">لا توجد مقترحات عروض حالياً.</p>;
  }
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {offers.map((o, i) => (
        <div key={i} className="rounded-xl border border-gold/30 bg-gold/5 p-4">
          <h4 className="font-bold text-navy mb-1">{o.title}</h4>
          <p className="text-sm text-navy/70 mb-2">{o.detail}</p>
          {o.items?.length > 0 && (
            <ul className="text-sm text-navy/80 space-y-1">
              {o.items.map((it, ii) => (
                <li key={ii} className="flex justify-between border-b border-gold/10 py-1">
                  <span>{it.name}</span>
                  <span className="num text-gold">
                    {it.directMargin !== undefined
                      ? percent(it.directMargin)
                      : it.total !== undefined
                        ? money(it.total)
                        : it.profit !== undefined
                          ? money(it.profit)
                          : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
