/* ============================================================
   app.js — المتحكم الرئيسي (التنقل، الجلسة، التهيئة)
   ============================================================ */
(function () {
  const S = window.Store, U = window.UI, V = window.Views;

  const ROUTES = [
    { key: 'dashboard', icon: '📊', label: 'لوحة المعلومات', title: 'لوحة المعلومات' },
    { key: 'inspections', icon: '📋', label: 'التفتيش الذاتي و GMP', title: 'التفتيش الذاتي و GMP' },
    { key: 'temperature', icon: '🌡️', label: 'مراقبة الحرارة', title: 'مراقبة درجات الحرارة' },
    { key: 'employees', icon: '👥', label: 'العاملون والشهادات', title: 'العاملون والشهادات الصحية' },
    { key: 'nc', icon: '⚠️', label: 'عدم المطابقة (CAPA)', title: 'عدم المطابقة والإجراءات التصحيحية' },
    { key: 'suppliers', icon: '🚚', label: 'الموردون', title: 'اعتماد الموردين' },
    { key: 'cleaning', icon: '🧹', label: 'التنظيف والآفات', title: 'التنظيف ومكافحة الآفات' },
    { key: 'reports', icon: '📈', label: 'التقارير والجاهزية', title: 'التقارير وجاهزية التفتيش' },
    { key: 'settings', icon: '⚙️', label: 'الإعدادات', title: 'الإعدادات' },
  ];

  const App = {
    user: null,
    current: 'dashboard',

    init() {
      // استعادة الجلسة
      const saved = sessionStorage.getItem('fs_user');
      if (saved) { this.user = JSON.parse(saved); this.enter(); }

      // أزرار الدخول
      document.querySelectorAll('.role-btn').forEach(btn => {
        btn.onclick = () => {
          this.user = { name: btn.dataset.role, role: btn.dataset.role };
          sessionStorage.setItem('fs_user', JSON.stringify(this.user));
          this.enter();
        };
      });

      U.$('#logout-btn').onclick = () => { sessionStorage.removeItem('fs_user'); location.reload(); };
      U.$('#menu-toggle').onclick = () => U.$('#sidebar').classList.toggle('open');
      U.$('#export-btn').onclick = () => this.exportData();
      U.$('#import-btn').onclick = () => U.$('#import-file').click();
      U.$('#import-file').onchange = (e) => this.importData(e);

      // شريحة التاريخ
      U.$('#today-chip').textContent = '📅 ' + new Date().toLocaleDateString('ar', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    },

    enter() {
      U.$('#login-screen').classList.add('hidden');
      U.$('#app').classList.remove('hidden');
      // بطاقة المستخدم
      U.$('#user-badge').innerHTML = `<strong>${U.esc(this.user.name)}</strong><small>جلسة محلية</small>`;
      this.buildNav();
      S.load();
      this.go('dashboard');
    },

    buildNav() {
      const m = S.metrics();
      const counts = { nc: m.openNCs, employees: m.expiredCards, temperature: m.tempBreaches };
      U.$('#nav').innerHTML = ROUTES.map(r => {
        const c = counts[r.key];
        return `<button class="nav-item" data-key="${r.key}">
          <span class="ic">${r.icon}</span><span>${r.label}</span>
          ${c ? `<span class="badge-count">${c}</span>` : ''}
        </button>`;
      }).join('');
      U.$('#nav').querySelectorAll('.nav-item').forEach(el => {
        el.onclick = () => { this.go(el.dataset.key); U.$('#sidebar').classList.remove('open'); };
      });
    },

    go(key) {
      this.current = key;
      this.render();
      U.$('#nav').querySelectorAll('.nav-item').forEach(el => el.classList.toggle('active', el.dataset.key === key));
      const route = ROUTES.find(r => r.key === key);
      U.$('#page-title').textContent = route ? route.title : '';
      U.$('#content').scrollTop = 0;
      window.scrollTo(0, 0);
    },

    render() {
      const fn = V[this.current];
      U.$('#content').innerHTML = fn ? fn() : U.empty('الصفحة غير متاحة');
      if (this.current === 'settings') V.bindSettings();
      this.buildNav(); // تحديث عدّادات التنبيه
      U.$('#nav').querySelectorAll('.nav-item').forEach(el => el.classList.toggle('active', el.dataset.key === this.current));
    },

    exportData() {
      const blob = new Blob([S.exportJSON()], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'نسخة_احتياطية_سلامة_الغذاء_' + S.todayISO() + '.json';
      a.click();
      URL.revokeObjectURL(a.href);
      U.toast('تم تصدير النسخة الاحتياطية', 'ok');
    },

    importData(e) {
      const file = e.target.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try { S.importJSON(reader.result); U.toast('تم استيراد البيانات بنجاح', 'ok'); this.render(); }
        catch (err) { U.toast('ملف غير صالح', 'err'); }
        e.target.value = '';
      };
      reader.readAsText(file);
    },
  };

  window.App = App;
  document.addEventListener('DOMContentLoaded', () => App.init());
})();
