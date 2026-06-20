/* ============================================================
   store.js — طبقة البيانات والتخزين المحلي
   نظام سلامة الغذاء و GMP
   ============================================================ */
(function () {
  const KEY = 'fs_gmp_db_v1';

  // ---------- أدوات مساعدة ----------
  const uid = (p = 'id') => p + '_' + Math.random().toString(36).slice(2, 9);
  const todayISO = () => new Date().toISOString().slice(0, 10);
  function daysFromToday(d) {
    const ms = new Date(d + 'T00:00:00') - new Date(todayISO() + 'T00:00:00');
    return Math.round(ms / 86400000);
  }
  function shift(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  // ---------- قوالب قوائم التفتيش (GMP / سلامة الغذاء) ----------
  const CHECKLIST_TEMPLATES = {
    gmp: {
      name: 'تدقيق GMP – ممارسات التصنيع الجيدة',
      sections: [
        { title: 'المباني والمرافق', items: [
          'الأرضيات والجدران والأسقف نظيفة وسليمة وقابلة للتنظيف',
          'الإضاءة كافية والمصابيح محمية بأغطية واقية من الكسر',
          'التهوية كافية وتمنع تراكم الأبخرة والروائح',
          'تصريف المياه يعمل بكفاءة دون تجمعات أو روائح',
        ]},
        { title: 'نظافة المعدات والأدوات', items: [
          'الأسطح الملامسة للغذاء مصنوعة من مواد آمنة وسليمة',
          'المعدات نظيفة ومعقمة وفق جدول التنظيف المعتمد',
          'فصل أدوات التقطيع حسب نوع الغذاء (ترميز لوني)',
          'الثلاجات والمجمدات تعمل ضمن درجات الحرارة الآمنة',
        ]},
        { title: 'النظافة الشخصية للعاملين', items: [
          'العاملون يرتدون الزي النظيف وغطاء الرأس والكمامات',
          'توفر أحواض غسل الأيدي مع الصابون ومناشف يُستعمل لمرة واحدة',
          'الشهادات الصحية سارية لجميع العاملين',
          'لا يوجد عامل مصاب يعمل في مناولة الغذاء المباشر',
        ]},
        { title: 'سلامة الغذاء ومكافحة التلوث', items: [
          'فصل الأغذية النيئة عن المطهوة لمنع التلوث التبادلي',
          'تخزين المواد بطريقة FIFO وبيانات الصلاحية واضحة',
          'حفظ المواد الكيميائية بعيدًا عن مناطق الغذاء',
          'برنامج مكافحة آفات فعّال وخالٍ من علامات الإصابة',
        ]},
        { title: 'التوثيق والتتبع', items: [
          'سجلات درجات الحرارة محدثة وموقعة',
          'توفر إجراءات HACCP وخطة موثقة',
          'إمكانية تتبع المنتج من المورد حتى التقديم',
          'إجراءات تصحيحية موثقة لحالات عدم المطابقة',
        ]},
      ]
    },
    daily: {
      name: 'قائمة الفحص اليومي للنظافة',
      sections: [
        { title: 'قبل التشغيل', items: [
          'أسطح التحضير نظيفة ومعقمة',
          'فحص درجات حرارة الثلاجات والمجمدات',
          'توفر مواد التنظيف والتعقيم',
          'صحة وجاهزية العاملين (لا أعراض مرضية)',
        ]},
        { title: 'أثناء التشغيل', items: [
          'غسل الأيدي بشكل دوري وعند تغيير المهام',
          'فصل الأغذية النيئة عن الجاهزة',
          'مراقبة درجات حرارة الطهي والحفظ الساخن/البارد',
        ]},
        { title: 'بعد التشغيل', items: [
          'تنظيف وتعقيم جميع الأسطح والمعدات',
          'التخلص الصحيح من النفايات',
          'إغلاق وتأمين مناطق التخزين',
        ]},
      ]
    }
  };

  // ---------- بيانات أولية (Seed) ----------
  function seed() {
    const emps = [
      { id: uid('emp'), name: 'أحمد المطيري', role: 'طاهٍ رئيسي', dept: 'المطبخ الساخن', healthCardExpiry: shift(18), hireDate: '2023-02-01', training: ['أساسيات سلامة الغذاء', 'HACCP'] },
      { id: uid('emp'), name: 'سعاد العتيبي', role: 'مشرفة جودة', dept: 'الجودة', healthCardExpiry: shift(120), hireDate: '2022-09-15', training: ['أساسيات سلامة الغذاء', 'تدقيق داخلي'] },
      { id: uid('emp'), name: 'محمد خان', role: 'عامل مناولة', dept: 'التحضير', healthCardExpiry: shift(-4), hireDate: '2024-01-10', training: ['أساسيات سلامة الغذاء'] },
      { id: uid('emp'), name: 'راجو كومار', role: 'عامل نظافة', dept: 'التنظيف', healthCardExpiry: shift(9), hireDate: '2023-11-20', training: [] },
      { id: uid('emp'), name: 'فاطمة الزهراني', role: 'كاشير', dept: 'الخدمة', healthCardExpiry: shift(200), hireDate: '2024-03-05', training: ['أساسيات سلامة الغذاء'] },
    ];

    const units = ['ثلاجة الخضار', 'ثلاجة اللحوم', 'مجمد رئيسي', 'حافظة ساخنة - بوفيه', 'ثلاجة الألبان'];
    const tempLogs = [];
    for (let i = 0; i < 22; i++) {
      const unit = units[i % units.length];
      const isFreezer = unit.includes('مجمد');
      const isHot = unit.includes('ساخنة');
      let target, val;
      if (isFreezer) { target = '-18 أو أقل'; val = -18 + (Math.random() * 6 - 3); }
      else if (isHot) { target = '63 أو أعلى'; val = 60 + Math.random() * 8; }
      else { target = '0 إلى 5'; val = 1 + Math.random() * 7; }
      val = Math.round(val * 10) / 10;
      let status = 'مطابق';
      if (isFreezer && val > -18) status = 'مخالف';
      if (!isFreezer && !isHot && (val < 0 || val > 5)) status = 'مخالف';
      if (isHot && val < 63) status = 'مخالف';
      tempLogs.push({
        id: uid('tmp'), unit, type: isFreezer ? 'مجمد' : isHot ? 'حفظ ساخن' : 'ثلاجة',
        target, value: val, status, date: shift(-Math.floor(i / 5)),
        time: ['08:00', '12:00', '16:00', '20:00'][i % 4], by: emps[i % emps.length].name,
      });
    }

    const inspections = [
      buildInspection('gmp', emps[1].name, shift(-3)),
      buildInspection('daily', emps[0].name, todayISO()),
    ];

    const ncs = [
      { id: uid('nc'), title: 'ثلاجة اللحوم تعمل عند 8°م (أعلى من الحد)', severity: 'حرجة', source: 'مراقبة الحرارة', status: 'مفتوحة', date: shift(-2), owner: 'أحمد المطيري', dueDate: shift(1), action: 'استدعاء الصيانة وفحص الكمبروسر، نقل المنتجات لثلاجة بديلة', preventiveAction: 'جدولة صيانة وقائية دورية وتركيب إنذار حراري آلي', rootCause: 'عطل في وحدة التبريد' },
      { id: uid('nc'), title: 'انتهاء الشهادة الصحية لأحد العاملين', severity: 'عالية', source: 'تدقيق داخلي', status: 'قيد المعالجة', date: shift(-5), owner: 'سعاد العتيبي', dueDate: shift(3), action: 'إيقاف العامل عن المناولة المباشرة وتجديد الشهادة', preventiveAction: 'نظام تنبيهات قبل انتهاء الشهادات بـ30 يومًا', rootCause: 'عدم متابعة تواريخ الصلاحية' },
      { id: uid('nc'), title: 'عدم وضوح ترميز ألواح التقطيع اللونية', severity: 'متوسطة', source: 'تدقيق GMP', status: 'مغلقة', date: shift(-12), owner: 'سعاد العتيبي', dueDate: shift(-7), action: 'استبدال الألواح وتدريب العاملين على الترميز اللوني', preventiveAction: 'اعتماد دليل الترميز اللوني وتدريب توعوي ربع سنوي', rootCause: 'نقص توعية' },
    ];

    const suppliers = [
      { id: uid('sup'), name: 'مؤسسة اللحوم الطازجة', category: 'لحوم ودواجن', status: 'معتمد', rating: 4, licenseExpiry: shift(150), lastAudit: shift(-30), contact: '0555000111' },
      { id: uid('sup'), name: 'شركة الخضار الذهبية', category: 'خضار وفواكه', status: 'معتمد', rating: 5, licenseExpiry: shift(60), lastAudit: shift(-20), contact: '0555000222' },
      { id: uid('sup'), name: 'موزع الألبان الوطني', category: 'ألبان', status: 'تحت المراجعة', rating: 3, licenseExpiry: shift(-10), lastAudit: shift(-90), contact: '0555000333' },
    ];

    const pest = [
      { id: uid('pst'), date: shift(-7), company: 'شركة الوقاية لمكافحة الآفات', type: 'زيارة دورية', findings: 'لا توجد علامات إصابة. تم تجديد الطعوم.', status: 'مكتملة', nextVisit: shift(23) },
      { id: uid('pst'), date: shift(-37), company: 'شركة الوقاية لمكافحة الآفات', type: 'زيارة دورية', findings: 'رصد نشاط قوارض قرب المستودع، تم وضع محطات إضافية.', status: 'مكتملة', nextVisit: shift(-7) },
    ];

    const cleaning = [
      { id: uid('cln'), area: 'المطبخ الساخن', task: 'تنظيف وتعقيم أسطح التحضير', frequency: 'يومي', responsible: 'عامل النظافة', lastDone: todayISO(), nextDue: todayISO() },
      { id: uid('cln'), area: 'الثلاجات', task: 'تنظيف داخلي عميق وإزالة الجليد', frequency: 'أسبوعي', responsible: 'فريق المطبخ', lastDone: shift(-5), nextDue: shift(2) },
      { id: uid('cln'), area: 'المستودع الجاف', task: 'تنظيف الأرفف وفحص الآفات', frequency: 'أسبوعي', responsible: 'أمين المستودع', lastDone: shift(-9), nextDue: shift(-2) },
      { id: uid('cln'), area: 'شفاطات المطبخ', task: 'تنظيف الفلاتر وإزالة الدهون', frequency: 'شهري', responsible: 'جهة خارجية', lastDone: shift(-20), nextDue: shift(10) },
    ];

    return {
      meta: { facilityName: 'مطعم وكافيه الذواقة', license: 'CR-1010xxxxxx', city: 'الرياض', created: todayISO() },
      employees: emps, tempLogs, inspections, ncs, suppliers, pest, cleaning,
    };
  }

  function buildInspection(tplKey, by, date) {
    const tpl = CHECKLIST_TEMPLATES[tplKey];
    const sections = tpl.sections.map(s => ({
      title: s.title,
      items: s.items.map(t => ({ text: t, result: Math.random() > 0.18 ? 'yes' : (Math.random() > 0.5 ? 'no' : 'na'), note: '' }))
    }));
    return { id: uid('insp'), template: tplKey, templateName: tpl.name, by, date, sections, status: 'مكتمل' };
  }

  // ---------- قراءة/كتابة ----------
  let db = null;
  let _cloud = false;            // وضع سحابي (SaaS)
  let _hooks = {};               // { onMutate(collection,op,row), onMeta(meta) }

  // حقن بيانات المنشأة (يستدعيه cloud.js بعد تسجيل الدخول)
  function hydrate(obj) { db = obj; _cloud = true; }
  function setHooks(h) { _hooks = h || {}; }
  function isCloud() { return _cloud; }

  function load() {
    if (db) return db;
    if (_cloud) return db; // البيانات تُحقن من السحابة
    try {
      const raw = localStorage.getItem(KEY);
      db = raw ? JSON.parse(raw) : seed();
    } catch (e) { db = seed(); }
    save();
    return db;
  }
  function save() {
    if (_cloud) { if (_hooks.onMeta) _hooks.onMeta(db.meta); return; } // المنشأة تُزامَن سحابيًا
    try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { /* ممتلئ */ }
  }
  function reset() { if (_cloud) return; db = seed(); save(); }

  // ---------- العمليات ----------
  function col(name) { load(); if (!db[name]) db[name] = []; return db[name]; }
  function add(name, obj) {
    obj.id = obj.id || uid(name); col(name).unshift(obj);
    if (_cloud && _hooks.onMutate) _hooks.onMutate(name, 'upsert', obj); else save();
    return obj;
  }
  function update(name, id, patch) {
    const arr = col(name); const i = arr.findIndex(x => x.id === id);
    if (i > -1) {
      arr[i] = { ...arr[i], ...patch };
      if (_cloud && _hooks.onMutate) _hooks.onMutate(name, 'upsert', arr[i]); else save();
      return arr[i];
    }
  }
  function remove(name, id) {
    const arr = col(name); const i = arr.findIndex(x => x.id === id);
    if (i > -1) { arr.splice(i, 1); if (_cloud && _hooks.onMutate) _hooks.onMutate(name, 'delete', { id }); else save(); }
  }
  function get(name, id) { return col(name).find(x => x.id === id); }

  // ---------- مؤشرات محسوبة ----------
  function inspectionScore(insp) {
    let yes = 0, total = 0;
    insp.sections.forEach(s => s.items.forEach(it => {
      if (it.result === 'na') return;
      total++; if (it.result === 'yes') yes++;
    }));
    return total ? Math.round((yes / total) * 100) : 0;
  }

  function metrics() {
    load();
    const openNCs = db.ncs.filter(n => n.status !== 'مغلقة');
    const criticalNCs = openNCs.filter(n => n.severity === 'حرجة');
    const expiringCards = db.employees.filter(e => daysFromToday(e.healthCardExpiry) <= 30);
    const expiredCards = db.employees.filter(e => daysFromToday(e.healthCardExpiry) < 0);
    const tempBreaches = db.tempLogs.filter(t => t.status === 'مخالف');
    const lastInsp = [...db.inspections].sort((a, b) => b.date.localeCompare(a.date))[0];
    const compliance = lastInsp ? inspectionScore(lastInsp) : 0;
    const overdueCleaning = db.cleaning.filter(c => daysFromToday(c.nextDue) < 0);

    // مؤشر الجاهزية للتفتيش (مرجّح)
    let readiness = 100;
    readiness -= criticalNCs.length * 15;
    readiness -= (openNCs.length - criticalNCs.length) * 5;
    readiness -= expiredCards.length * 12;
    readiness -= Math.max(0, expiringCards.length - expiredCards.length) * 3;
    readiness -= tempBreaches.length * 2;
    readiness -= overdueCleaning.length * 4;
    readiness -= (100 - compliance) * 0.4;
    readiness = Math.max(0, Math.min(100, Math.round(readiness)));

    return {
      compliance, readiness,
      openNCs: openNCs.length, criticalNCs: criticalNCs.length,
      expiringCards: expiringCards.length, expiredCards: expiredCards.length,
      tempBreaches: tempBreaches.length, overdueCleaning: overdueCleaning.length,
      totalEmployees: db.employees.length, totalSuppliers: db.suppliers.length,
      lastInsp,
    };
  }

  // ---------- تصدير/استيراد ----------
  function exportJSON() { return JSON.stringify(load(), null, 2); }
  function importJSON(text) {
    const obj = JSON.parse(text);
    if (!obj || typeof obj !== 'object') throw new Error('ملف غير صالح');
    db = obj; save();
  }

  window.Store = {
    load, save, reset, col, add, update, remove, get, metrics,
    inspectionScore, exportJSON, importJSON,
    daysFromToday, todayISO, shift, uid,
    CHECKLIST_TEMPLATES, buildInspection,
    hydrate, setHooks, isCloud,
  };
})();
