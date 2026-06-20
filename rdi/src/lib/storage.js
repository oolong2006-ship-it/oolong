// طبقة الحفظ المحلي (localStorage) — المرحلة 1.
// مصمّمة لتُستبدل لاحقاً بقاعدة بيانات في المرحلة 3 دون تغيير الواجهة.

const KEY = 'rdi:state:v1';

/** قراءة الحالة المحفوظة، مع حماية ضد البيانات التالفة. */
export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn('تعذّرت قراءة البيانات المحفوظة:', err);
    return null;
  }
}

/** حفظ الحالة. يعيد true عند النجاح. */
export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch (err) {
    console.warn('تعذّر حفظ البيانات:', err);
    return false;
  }
}

/** مسح كل البيانات المحفوظة. */
export function clearState() {
  try {
    localStorage.removeItem(KEY);
  } catch (err) {
    console.warn('تعذّر مسح البيانات:', err);
  }
}
