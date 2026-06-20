// حماية أمنية: تهريب (escape) أي نص يدخله المستخدم قبل استخدامه.
// React يهرّب النصوص تلقائياً عند العرض، لكن نستخدم هذه الدوال
// عند بناء HTML للتصدير (Word) أو أي سياق خارج JSX.

/** تهريب رموز HTML الخطرة لمنع XSS. */
export function escapeHtml(value) {
  const s = value == null ? '' : String(value);
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// نمط أحرف التحكم: U+0000–U+001F و U+007F (مكتوب بصيغة \u حتى لا تدخل بايتات تحكم فعلية في الملف).
const CONTROL_CHARS = new RegExp('[\\u0000-\\u001F\\u007F]', 'g');

/** تنظيف نص عادي: إزالة أحرف التحكم غير المرئية وتقليص الطول. */
export function cleanText(value, maxLen = 200) {
  const s = value == null ? '' : String(value);
  return s.replace(CONTROL_CHARS, '').trim().slice(0, maxLen);
}
