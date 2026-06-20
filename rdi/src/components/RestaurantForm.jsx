import { useState } from 'react';
import { parseWorkbook, validateFile, downloadTemplate } from '../lib/excel.js';
import { cleanText } from '../lib/sanitize.js';

// شاشة إدخال بيانات المطعم ورفع ملف الإكسل.
export default function RestaurantForm({ restaurant, onRestaurantChange, items, onItemsLoaded }) {
  const [error, setError] = useState('');
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');

  async function handleFile(e) {
    setError('');
    setWarnings([]);
    const file = e.target.files?.[0];
    e.target.value = ''; // السماح بإعادة رفع نفس الملف لاحقاً
    if (!file) return;

    try {
      validateFile(file);
      setLoading(true);
      setFileName(file.name);
      const buffer = await file.arrayBuffer();
      const { items: parsed, warnings: warns } = parseWorkbook(buffer);
      setWarnings(warns);
      onItemsLoaded(parsed);
    } catch (err) {
      setError(err.message || 'حدث خطأ غير متوقع أثناء قراءة الملف.');
      onItemsLoaded([]);
      setFileName('');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gold/20 p-6">
      <h2 className="text-xl font-bold text-navy mb-1">بيانات المطعم</h2>
      <p className="text-sm text-navy/60 mb-5">أدخل اسم المطعم والفرع، ثم ارفع ملف الأصناف.</p>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <label className="block">
          <span className="text-sm font-medium text-navy">اسم المطعم *</span>
          <input
            type="text"
            value={restaurant.name}
            maxLength={120}
            onChange={(e) => onRestaurantChange({ ...restaurant, name: cleanText(e.target.value, 120) })}
            placeholder="مثال: مطعم الذواقة"
            className="mt-1 w-full rounded-lg border border-navy/20 px-3 py-2 focus:border-gold focus:ring-1 focus:ring-gold outline-none"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-navy">الفرع</span>
          <input
            type="text"
            value={restaurant.branch}
            maxLength={120}
            onChange={(e) => onRestaurantChange({ ...restaurant, branch: cleanText(e.target.value, 120) })}
            placeholder="مثال: فرع العليا"
            className="mt-1 w-full rounded-lg border border-navy/20 px-3 py-2 focus:border-gold focus:ring-1 focus:ring-gold outline-none"
          />
        </label>
      </div>

      <div className="border-2 border-dashed border-gold/40 rounded-xl p-6 text-center bg-cream/40">
        <p className="text-navy font-medium mb-1">ارفع ملف الأصناف (إكسل)</p>
        <p className="text-xs text-navy/50 mb-4">
          الأعمدة المطلوبة: اسم الصنف، تكلفة الطعام، التغليف، سعر المطعم، (سعر التطبيق اختياري)
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <label className="cursor-pointer inline-flex items-center gap-2 bg-navy text-cream px-5 py-2.5 rounded-lg font-medium hover:bg-navy/90 transition">
            <span>{loading ? 'جارٍ القراءة…' : 'اختر ملف الإكسل'}</span>
            <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} className="hidden" disabled={loading} />
          </label>
          <button
            type="button"
            onClick={downloadTemplate}
            className="inline-flex items-center gap-2 border border-gold text-gold px-5 py-2.5 rounded-lg font-medium hover:bg-gold/10 transition"
          >
            تحميل قالب الإكسل
          </button>
        </div>

        {fileName && !error && (
          <p className="mt-4 text-sm text-profit">
            ✓ تم تحميل «{fileName}» — عدد الأصناف الصالحة: <span className="num">{items.length}</span>
          </p>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-loss/10 border border-loss/30 text-loss px-4 py-3 text-sm">
          ⚠️ {error}
        </div>
      )}

      {warnings.length > 0 && (
        <div className="mt-4 rounded-lg bg-gold/10 border border-gold/30 text-navy px-4 py-3 text-sm">
          <p className="font-medium mb-1">تنبيهات أثناء القراءة ({warnings.length}):</p>
          <ul className="list-disc pr-5 space-y-1 max-h-40 overflow-auto">
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
