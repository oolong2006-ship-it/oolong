import { num } from '../lib/finance.js';
import { cleanText } from '../lib/sanitize.js';

// شاشة ضبط عمولات المنصات وإعدادات التسعير العامة.
export default function PlatformSettings({ platforms, onPlatformsChange, settings, onSettingsChange }) {
  function updatePlatform(idx, field, value) {
    const next = platforms.map((p, i) =>
      i === idx ? { ...p, [field]: field === 'name' ? cleanText(value, 40) : clampNum(value) } : p,
    );
    onPlatformsChange(next);
  }

  function addPlatform() {
    onPlatformsChange([
      ...platforms,
      { name: 'منصة جديدة', commission: 20, serviceFee: 0, payment: 2.5, freeDelivery: 0 },
    ]);
  }

  function removePlatform(idx) {
    onPlatformsChange(platforms.filter((_, i) => i !== idx));
  }

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gold/20 p-6">
      <h2 className="text-xl font-bold text-navy mb-1">ضبط المنصات والتسعير</h2>
      <p className="text-sm text-navy/60 mb-5">
        القيم الافتراضية تقديرية — عدّلها حسب عقد كل مطعم. كل عمولة قابلة للتغيير.
      </p>

      {/* جدول المنصات */}
      <div className="overflow-x-auto -mx-2 px-2">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="text-navy/60 text-right border-b border-navy/10">
              <th className="py-2 font-medium">المنصة</th>
              <th className="py-2 font-medium text-center">العمولة %</th>
              <th className="py-2 font-medium text-center">رسوم الخدمة %</th>
              <th className="py-2 font-medium text-center">الدفع %</th>
              <th className="py-2 font-medium text-center">حصة التوصيل (ر.س)</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {platforms.map((p, idx) => (
              <tr key={idx} className="border-b border-navy/5">
                <td className="py-2 pl-2">
                  <input
                    value={p.name}
                    onChange={(e) => updatePlatform(idx, 'name', e.target.value)}
                    className="w-full rounded border border-navy/15 px-2 py-1.5 focus:border-gold outline-none"
                  />
                </td>
                {['commission', 'serviceFee', 'payment', 'freeDelivery'].map((field) => (
                  <td key={field} className="py-2 px-1">
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={p[field]}
                      onChange={(e) => updatePlatform(idx, field, e.target.value)}
                      className="num w-20 mx-auto block rounded border border-navy/15 px-2 py-1.5 text-center focus:border-gold outline-none"
                    />
                  </td>
                ))}
                <td className="py-2 text-center">
                  <button
                    onClick={() => removePlatform(idx)}
                    disabled={platforms.length <= 1}
                    className="text-loss hover:bg-loss/10 rounded px-2 py-1 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="حذف المنصة"
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={addPlatform}
        className="mt-3 text-sm text-gold hover:bg-gold/10 rounded-lg px-3 py-1.5 font-medium border border-gold/40"
      >
        + إضافة منصة
      </button>

      {/* منزلقات التسعير */}
      <div className="mt-6 grid sm:grid-cols-2 gap-6 border-t border-navy/10 pt-5">
        <Slider
          label="نسبة رفع سعر التطبيق"
          value={settings.appMarkupPct}
          min={0}
          max={60}
          step={1}
          onChange={(v) => onSettingsChange({ ...settings, appMarkupPct: v })}
          hint="المطاعم ترفع أسعار التطبيق لتغطية العمولة الأعلى."
        />
        <Slider
          label="متوسط الخصم للعميل"
          value={settings.avgDiscountPct}
          min={0}
          max={50}
          step={1}
          onChange={(v) => onSettingsChange({ ...settings, avgDiscountPct: v })}
          hint="متوسط الخصومات المعروضة على المنصات."
        />
      </div>

      <label className="mt-5 flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={settings.vatOnFees}
          onChange={(e) => onSettingsChange({ ...settings, vatOnFees: e.target.checked })}
          className="w-5 h-5 accent-gold"
        />
        <span className="text-sm text-navy">
          تطبيق ضريبة القيمة المضافة 15% على الرسوم (العمولة + الخدمة + الدفع)
        </span>
      </label>
    </section>
  );
}

// منزلق نسبة مئوية.
function Slider({ label, value, min, max, step, onChange, hint }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-navy">{label}</span>
        <span className="num text-gold font-semibold">{value}%</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(num(e.target.value))}
        className="w-full accent-gold"
      />
      {hint && <p className="text-xs text-navy/50 mt-1">{hint}</p>}
    </div>
  );
}

// تقييد القيمة الرقمية لتكون غير سالبة.
function clampNum(value) {
  const n = parseFloat(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}
