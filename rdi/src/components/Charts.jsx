import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from 'recharts';
import { feeBreakdown, directProfit } from '../lib/finance.js';
import { money } from '../lib/format.js';

// رسمان بيانيان: مقارنة المنصات + أكثر الأصناف ربحية.
export default function Charts({ items, platforms, settings }) {
  // 1. إجمالي صافي الربح لكل منصة (عبر كل الأصناف).
  const platformData = platforms.map((p) => ({
    name: p.name,
    value: items.reduce((sum, it) => sum + feeBreakdown(it, p, settings).net, 0),
  }));

  // 2. أكثر الأصناف ربحية (الربح المباشر) — أعلى 6.
  const itemData = [...items]
    .map((it) => ({ name: it.name, value: directProfit(it) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <ChartCard title="مقارنة المنصات (إجمالي صافي الربح)">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={platformData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e0d5" />
            <XAxis dataKey="name" tick={{ fontFamily: 'Tajawal', fontSize: 12, fill: '#131A2B' }} />
            <YAxis tick={{ fontFamily: 'IBM Plex Mono', fontSize: 11, fill: '#131A2B' }} />
            <Tooltip formatter={(v) => money(v)} contentStyle={{ fontFamily: 'Tajawal', direction: 'rtl' }} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {platformData.map((d, i) => (
                <Cell key={i} fill={d.value < 0 ? '#B23A2F' : '#3E7B5A'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="أكثر الأصناف ربحية (ربح مباشر)">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={itemData} layout="vertical" margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e0d5" />
            <XAxis type="number" tick={{ fontFamily: 'IBM Plex Mono', fontSize: 11, fill: '#131A2B' }} />
            <YAxis
              type="category"
              dataKey="name"
              width={90}
              tick={{ fontFamily: 'Tajawal', fontSize: 12, fill: '#131A2B' }}
            />
            <Tooltip formatter={(v) => money(v)} contentStyle={{ fontFamily: 'Tajawal', direction: 'rtl' }} />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} fill="#B8924F" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gold/20 p-4">
      <h3 className="text-sm font-bold text-navy mb-3">{title}</h3>
      {children}
    </div>
  );
}
