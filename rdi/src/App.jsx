import { useState, useEffect } from 'react';
import RestaurantForm from './components/RestaurantForm.jsx';
import PlatformSettings from './components/PlatformSettings.jsx';
import Report from './components/Report.jsx';
import { freshPlatforms, freshSettings } from './lib/defaults.js';
import { loadState, saveState } from './lib/storage.js';

// خطوات سير العمل: إدخال → ضبط → تقرير.
const STEPS = [
  { id: 'input', label: '١. البيانات' },
  { id: 'settings', label: '٢. المنصات' },
  { id: 'report', label: '٣. التقرير' },
];

export default function App() {
  const [step, setStep] = useState('input');
  const [restaurant, setRestaurant] = useState({ name: '', branch: '' });
  const [items, setItems] = useState([]);
  const [platforms, setPlatforms] = useState(freshPlatforms);
  const [settings, setSettings] = useState(freshSettings);
  const [loaded, setLoaded] = useState(false);

  // استرجاع آخر حالة محفوظة عند الإقلاع.
  useEffect(() => {
    const saved = loadState();
    if (saved) {
      if (saved.restaurant) setRestaurant(saved.restaurant);
      if (Array.isArray(saved.items)) setItems(saved.items);
      if (Array.isArray(saved.platforms) && saved.platforms.length) setPlatforms(saved.platforms);
      if (saved.settings) setSettings({ ...freshSettings(), ...saved.settings });
    }
    setLoaded(true);
  }, []);

  // الحفظ التلقائي في localStorage عند أي تغيير (بعد الاسترجاع الأول).
  useEffect(() => {
    if (!loaded) return;
    saveState({ restaurant, items, platforms, settings, savedAt: Date.now() });
  }, [loaded, restaurant, items, platforms, settings]);

  const canSettings = items.length > 0;
  const canReport = items.length > 0 && restaurant.name.trim() !== '' && platforms.length > 0;

  return (
    <div className="min-h-screen bg-cream">
      {/* الترويسة */}
      <header className="no-print bg-navy text-cream">
        <div className="max-w-5xl mx-auto px-4 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold flex items-center gap-2">
              <span className="text-gold">RDI</span>
              <span className="text-cream/90 text-base font-medium">تحليل ربحية المطاعم على التوصيل</span>
            </h1>
          </div>
        </div>
      </header>

      {/* شريط الخطوات */}
      <nav className="no-print bg-white border-b border-gold/20 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 flex">
          {STEPS.map((s) => {
            const disabled =
              (s.id === 'settings' && !canSettings) || (s.id === 'report' && !canReport);
            const active = step === s.id;
            return (
              <button
                key={s.id}
                onClick={() => !disabled && setStep(s.id)}
                disabled={disabled}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
                  active
                    ? 'border-gold text-navy'
                    : disabled
                      ? 'border-transparent text-navy/30 cursor-not-allowed'
                      : 'border-transparent text-navy/60 hover:text-navy'
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {step === 'input' && (
          <>
            <RestaurantForm
              restaurant={restaurant}
              onRestaurantChange={setRestaurant}
              items={items}
              onItemsLoaded={setItems}
            />
            <StepNav
              nextLabel="التالي: ضبط المنصات"
              nextDisabled={!canSettings}
              onNext={() => setStep('settings')}
              hint={!canSettings ? 'ارفع ملف أصناف صالحاً للمتابعة.' : ''}
            />
          </>
        )}

        {step === 'settings' && (
          <>
            <PlatformSettings
              platforms={platforms}
              onPlatformsChange={setPlatforms}
              settings={settings}
              onSettingsChange={setSettings}
            />
            <StepNav
              backLabel="رجوع"
              onBack={() => setStep('input')}
              nextLabel="توليد التقرير"
              nextDisabled={!canReport}
              onNext={() => setStep('report')}
              hint={!canReport ? 'أدخل اسم المطعم وتأكد من وجود أصناف ومنصة واحدة على الأقل.' : ''}
            />
          </>
        )}

        {step === 'report' && (
          <>
            <div className="no-print">
              <StepNav backLabel="رجوع للضبط" onBack={() => setStep('settings')} />
            </div>
            <Report restaurant={restaurant} items={items} platforms={platforms} settings={settings} />
          </>
        )}
      </main>

      <footer className="no-print text-center text-xs text-navy/40 py-6">
        RDI — تُحفظ بياناتك محلياً في متصفحك فقط (المرحلة 1).
      </footer>
    </div>
  );
}

function StepNav({ backLabel, onBack, nextLabel, onNext, nextDisabled, hint }) {
  return (
    <div className="no-print flex items-center justify-between gap-3 flex-wrap">
      <div>
        {onBack && (
          <button
            onClick={onBack}
            className="border border-navy/20 text-navy px-5 py-2.5 rounded-lg font-medium hover:bg-navy/5"
          >
            {backLabel}
          </button>
        )}
      </div>
      <div className="flex items-center gap-3">
        {hint && <span className="text-xs text-navy/50">{hint}</span>}
        {onNext && (
          <button
            onClick={onNext}
            disabled={nextDisabled}
            className="bg-gold text-white px-6 py-2.5 rounded-lg font-bold hover:bg-gold/90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {nextLabel}
          </button>
        )}
      </div>
    </div>
  );
}
