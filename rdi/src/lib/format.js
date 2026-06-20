// أدوات تنسيق الأرقام والعملة بالعربية.

const sar = new Intl.NumberFormat('ar-SA', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** تنسيق مبلغ بالريال (رقمين عشريين). */
export function money(value) {
  const n = Number.isFinite(value) ? value : 0;
  return `${sar.format(n)} ر.س`;
}

/** تنسيق نسبة مئوية. */
export function percent(value, digits = 1) {
  const n = Number.isFinite(value) ? value : 0;
  return `${n.toFixed(digits)}%`;
}

/** رقم عادي بفواصل. */
export function number(value) {
  const n = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat('ar-SA').format(n);
}
