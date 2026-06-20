// قراءة ملفات الإكسل وتوليد القالب — باستخدام مكتبة SheetJS (xlsx).
// معالجة أخطاء قوية: نتحقق من الصيغة والحجم والأعمدة وكل رقم.

import * as XLSX from 'xlsx';
import { cleanText } from './sanitize.js';

// الحد الأقصى لحجم الملف (5 ميجابايت) — يحمي من الملفات الضخمة/التالفة.
export const MAX_FILE_BYTES = 5 * 1024 * 1024;

// الامتدادات المقبولة.
const ALLOWED_EXT = ['.xlsx', '.xls', '.csv'];

// خريطة أسماء الأعمدة المقبولة (عربي/إنجليزي) → الحقل الداخلي.
const COLUMN_ALIASES = {
  name: ['اسم الصنف', 'الصنف', 'الاسم', 'name', 'item'],
  food: ['تكلفة الطعام', 'الطعام', 'food', 'food cost', 'cost'],
  pack: ['التغليف', 'تكلفة التغليف', 'pack', 'packaging'],
  price: ['سعر المطعم', 'السعر', 'price', 'سعر الكاش', 'الكاش'],
  appPriceOverride: ['سعر التطبيق', 'app price', 'apppriceoverride', 'سعر التطبيق الصريح'],
};

/** يطابق عنوان عمود مع الحقل الداخلي (مع تجاهل المسافات وحالة الأحرف). */
function matchColumn(header) {
  const h = String(header || '').trim().toLowerCase();
  for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
    if (aliases.some((a) => a.toLowerCase() === h)) return field;
  }
  return null;
}

/**
 * تحليل ملف إكسل إلى مصفوفة أصناف.
 * يرمي خطأً برسالة عربية واضحة عند أي مشكلة.
 * @param {ArrayBuffer} buffer محتوى الملف
 * @returns {{ items: Array, warnings: string[] }}
 */
export function parseWorkbook(buffer) {
  let wb;
  try {
    wb = XLSX.read(buffer, { type: 'array' });
  } catch {
    throw new Error('تعذّرت قراءة الملف. تأكد أنه ملف إكسل صالح (xlsx أو xls أو csv) وغير تالف.');
  }

  if (!wb.SheetNames || wb.SheetNames.length === 0) {
    throw new Error('الملف لا يحتوي على أي ورقة عمل.');
  }

  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  if (rows.length < 2) {
    throw new Error('الملف فارغ أو لا يحتوي على بيانات بعد صف العناوين.');
  }

  // الصف الأول = العناوين. نبني خريطة العمود → فهرسه.
  const headerRow = rows[0];
  const colIndex = {};
  headerRow.forEach((header, idx) => {
    const field = matchColumn(header);
    if (field && colIndex[field] === undefined) colIndex[field] = idx;
  });

  // الأعمدة الإلزامية.
  const required = ['name', 'food', 'pack', 'price'];
  const missing = required.filter((f) => colIndex[f] === undefined);
  if (missing.length > 0) {
    const labels = {
      name: 'اسم الصنف',
      food: 'تكلفة الطعام',
      pack: 'التغليف',
      price: 'سعر المطعم',
    };
    throw new Error(
      `الأعمدة المطلوبة مفقودة: ${missing.map((m) => `«${labels[m]}»`).join('، ')}. ` +
        'حمّل القالب وتأكد من مطابقة عناوين الأعمدة.',
    );
  }

  const items = [];
  const warnings = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const rawName = cleanText(row[colIndex.name], 120);

    // تجاهل الصفوف الفارغة تماماً.
    const isEmpty = rawName === '' && required.every((f) => String(row[colIndex[f]] ?? '').trim() === '');
    if (isEmpty) continue;

    if (rawName === '') {
      warnings.push(`الصف ${r + 1}: تم تجاهله لأن اسم الصنف فارغ.`);
      continue;
    }

    const food = toNumber(row[colIndex.food]);
    const pack = toNumber(row[colIndex.pack]);
    const price = toNumber(row[colIndex.price]);
    const appPriceOverride =
      colIndex.appPriceOverride !== undefined ? toNumber(row[colIndex.appPriceOverride]) : 0;

    // تحقق من صحة الأرقام.
    const badFields = [];
    if (food === null) badFields.push('تكلفة الطعام');
    if (pack === null) badFields.push('التغليف');
    if (price === null) badFields.push('سعر المطعم');
    if (badFields.length > 0) {
      warnings.push(`الصف ${r + 1} («${rawName}»): قيمة غير رقمية في ${badFields.join('، ')} — تم تجاهل الصف.`);
      continue;
    }

    if (price <= 0) {
      warnings.push(`الصف ${r + 1} («${rawName}»): سعر المطعم يجب أن يكون أكبر من صفر — تم تجاهل الصف.`);
      continue;
    }

    items.push({
      name: rawName,
      food: food < 0 ? 0 : food,
      pack: pack < 0 ? 0 : pack,
      price,
      appPriceOverride: appPriceOverride && appPriceOverride > 0 ? appPriceOverride : 0,
    });
  }

  if (items.length === 0) {
    throw new Error('لم يُعثر على أي صنف صالح في الملف. تحقق من البيانات والقالب.');
  }

  return { items, warnings };
}

/** تحويل قيمة خلية إلى رقم، أو null إن كانت غير رقمية. القيمة الفارغة تُعامل كصفر. */
function toNumber(value) {
  if (value === '' || value === null || value === undefined) return 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  // إزالة الفواصل والمسافات والرموز العربية للأرقام.
  const cleaned = String(value).replace(/[,\s٬]/g, '').replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

/** التحقق من الملف قبل القراءة (الامتداد والحجم). يرمي خطأً عربياً. */
export function validateFile(file) {
  if (!file) throw new Error('لم يتم اختيار أي ملف.');
  const name = file.name.toLowerCase();
  if (!ALLOWED_EXT.some((ext) => name.endsWith(ext))) {
    throw new Error('صيغة الملف غير مدعومة. استخدم ملف إكسل بصيغة xlsx أو xls أو csv.');
  }
  if (file.size === 0) throw new Error('الملف فارغ.');
  if (file.size > MAX_FILE_BYTES) {
    throw new Error('حجم الملف كبير جداً (الحد الأقصى 5 ميجابايت).');
  }
}

/** توليد قالب إكسل قابل للتحميل وفتح حفظه للمستخدم. */
export function downloadTemplate() {
  const data = [
    ['اسم الصنف', 'تكلفة الطعام', 'التغليف', 'سعر المطعم', 'سعر التطبيق'],
    ['برجر لحم', 18, 3, 35, ''],
    ['دجاج مقرمش', 14, 3, 30, 42],
    ['بطاطس', 4, 2, 12, ''],
    ['مشروب غازي', 2, 1, 6, ''],
  ];
  const ws = XLSX.utils.aoa_to_sheet(data);
  // عرض أعمدة مناسب.
  ws['!cols'] = [{ wch: 20 }, { wch: 14 }, { wch: 10 }, { wch: 12 }, { wch: 12 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'الأصناف');
  XLSX.writeFile(wb, 'RDI-قالب-الأصناف.xlsx');
}
