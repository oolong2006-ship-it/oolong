/* ============================================================
   cloud.js — طبقة الـ SaaS السحابية (Supabase)
   - مصادقة (تسجيل/دخول/خروج) متعددة المستأجرين
   - تحميل بيانات المنشأة إلى ذاكرة التطبيق ثم المزامنة الكتابية
   - الخطط والاشتراك والحدود
   يُفعَّل تلقائيًا فقط عند ضبط window.SAAS (url + anonKey).
   بدون ضبط → يبقى التطبيق في وضع العرض المحلي كما هو.
   ============================================================ */
(function () {
  // خريطة مجموعات التطبيق ↔ جداول قاعدة البيانات
  const TABLES = {
    employees: 'employees', tempLogs: 'temp_logs', inspections: 'inspections',
    ncs: 'ncs', suppliers: 'suppliers', pest: 'pest_visits',
    cleaning: 'cleaning_tasks', monitors: 'monitors',
  };
  const COLLECTIONS = Object.keys(TABLES);

  // حدود الخطط (الفوترة تُضاف لاحقًا — التقييد منطقي الآن)
  const PLAN_LIMITS = {
    trial:      { ai: true,  employees: 9999, label: 'تجريبية' },
    basic:      { ai: false, employees: 30,   label: 'الأساسية' },
    pro:        { ai: true,  employees: 200,  label: 'الاحترافية' },
    enterprise: { ai: true,  employees: 99999, label: 'المؤسسية' },
  };

  let client = null;
  let _org = null;   // صف المنشأة الحالي
  let _active = false;

  function cfg() { return window.SAAS || {}; }
  function configured() { return !!(cfg().url && cfg().anonKey); }
  function enabled() { return configured() && !!window.supabase; }
  function active() { return _active; }
  function org() { return _org; }

  function init() {
    if (!enabled() || client) return client;
    client = window.supabase.createClient(cfg().url, cfg().anonKey, {
      auth: { persistSession: true, autoRefreshSession: true },
    });
    return client;
  }

  // ---------- المصادقة ----------
  async function signUp(email, password, facility) {
    init();
    const { data, error } = await client.auth.signUp({ email, password });
    if (error) throw error;
    if (!data.session) return { needsConfirm: true }; // تأكيد البريد مطلوب
    await bootstrap({ createWith: facility });
    return { ok: true };
  }

  async function signIn(email, password) {
    init();
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await bootstrap({});
    return { ok: true };
  }

  async function signOut() { if (client) await client.auth.signOut(); }

  async function currentSession() {
    init();
    if (!client) return null;
    const { data } = await client.auth.getSession();
    return data.session || null;
  }

  // ---------- تحميل بيانات المنشأة إلى الذاكرة ----------
  async function bootstrap(opts = {}) {
    init();
    const { data: u } = await client.auth.getUser();
    if (!u || !u.user) throw new Error('غير مسجّل الدخول');

    // إيجاد منشأة المستخدم (RLS يُرجِع منشآته فقط)
    let { data: orgs, error } = await client.from('organizations').select('*').limit(1);
    if (error) throw error;
    if ((!orgs || !orgs.length)) {
      // أول دخول → إنشاء منشأة عبر RPC الآمن
      const f = opts.createWith || {};
      const { data: created, error: e2 } = await client.rpc('create_org_for_current_user', {
        p_name: f.name || 'منشأتي', p_city: f.city || null, p_license: f.license || null,
      });
      if (e2) throw e2;
      _org = created;
    } else {
      _org = orgs[0];
    }

    // بناء كائن البيانات بنفس شكل التطبيق
    const db = {
      meta: {
        facilityName: _org.name, city: _org.city || '', license: _org.license || '',
        plan: _org.plan, subscriptionStatus: _org.subscription_status,
        trialEndsAt: _org.trial_ends_at, created: (_org.created_at || '').slice(0, 10),
      },
    };
    for (const c of COLLECTIONS) {
      const { data: rows, error: e } = await client.from(TABLES[c]).select('id,data');
      if (e) throw e;
      db[c] = (rows || []).map(r => r.data);
    }

    // حقن البيانات في طبقة التخزين + ربط المزامنة الكتابية
    window.Store.hydrate(db);
    window.Store.setHooks({ onMutate: mutate, onMeta: updateMeta });
    _active = true;
    return _org;
  }

  // ---------- المزامنة الكتابية ----------
  async function mutate(collection, op, payload) {
    if (!_active || !TABLES[collection]) return;
    const table = TABLES[collection];
    try {
      let res;
      if (op === 'delete') {
        res = await client.from(table).delete().eq('id', payload.id);
      } else { // upsert
        res = await client.from(table).upsert({ id: payload.id, org_id: _org.id, data: payload });
      }
      if (res.error) throw res.error;
    } catch (e) {
      if (window.UI) window.UI.toast('تعذّرت مزامنة البيانات: ' + (e.message || ''), 'err');
    }
  }

  async function updateMeta(meta) {
    if (!_active) return;
    try {
      const { error } = await client.from('organizations')
        .update({ name: meta.facilityName, city: meta.city, license: meta.license })
        .eq('id', _org.id);
      if (error) throw error;
    } catch (e) {
      if (window.UI) window.UI.toast('تعذّر حفظ بيانات المنشأة سحابيًا', 'err');
    }
  }

  // ---------- الخطط ----------
  function planKey() { return (_org && _org.plan) || 'trial'; }
  function planLimits() { return PLAN_LIMITS[planKey()] || PLAN_LIMITS.trial; }
  function feature(name) { return !!planLimits()[name]; }
  function trialDaysLeft() {
    if (!_org || !_org.trial_ends_at) return null;
    return Math.ceil((new Date(_org.trial_ends_at) - new Date()) / 86400000);
  }

  // ---------- واجهة المصادقة (تُحقن في شاشة الدخول) ----------
  function mountAuth(container, onReady) {
    const esc = (s) => window.UI ? window.UI.esc(s) : s;
    let mode = 'login';
    function render() {
      container.innerHTML = `
        <p class="login-hint">${mode === 'login' ? 'سجّل الدخول لحسابك' : 'أنشئ حساب منشأتك'}</p>
        <div class="form-grid" style="text-align:right">
          ${mode === 'signup' ? `
            <div class="field"><label>اسم المنشأة</label><input id="c-fac" placeholder="مثال: مطعم الذواقة" /></div>
            <div class="field"><label>المدينة</label><input id="c-city" placeholder="الرياض" /></div>` : ''}
          <div class="field"><label>البريد الإلكتروني</label><input id="c-email" type="email" autocomplete="email" /></div>
          <div class="field"><label>كلمة المرور</label><input id="c-pass" type="password" autocomplete="${mode === 'login' ? 'current-password' : 'new-password'}" /></div>
        </div>
        <button class="btn-primary" id="c-submit" style="width:100%;margin-top:14px;border-radius:12px;padding:12px">${mode === 'login' ? 'دخول' : 'إنشاء الحساب'}</button>
        <p id="c-msg" class="muted" style="margin-top:10px;min-height:18px"></p>
        <p class="muted" style="margin-top:6px;font-size:13px">
          ${mode === 'login' ? 'ليس لديك حساب؟' : 'لديك حساب؟'}
          <a href="#" id="c-toggle" style="font-weight:700">${mode === 'login' ? 'أنشئ منشأة جديدة' : 'سجّل الدخول'}</a>
        </p>`;
      container.querySelector('#c-toggle').onclick = (e) => { e.preventDefault(); mode = mode === 'login' ? 'signup' : 'login'; render(); };
      container.querySelector('#c-submit').onclick = submit;
      container.querySelectorAll('input').forEach(i => i.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); }));
    }
    async function submit() {
      const msg = container.querySelector('#c-msg');
      const email = container.querySelector('#c-email').value.trim();
      const pass = container.querySelector('#c-pass').value;
      if (!email || !pass) { msg.textContent = '⚠ أدخل البريد وكلمة المرور'; return; }
      const btn = container.querySelector('#c-submit'); btn.disabled = true; msg.textContent = '⏳ جارٍ المعالجة...';
      try {
        if (mode === 'signup') {
          const facility = { name: (container.querySelector('#c-fac') || {}).value, city: (container.querySelector('#c-city') || {}).value };
          const r = await signUp(email, pass, facility);
          if (r.needsConfirm) { msg.textContent = '✓ تم إنشاء الحساب — فعّل بريدك ثم سجّل الدخول'; mode = 'login'; setTimeout(render, 1500); btn.disabled = false; return; }
        } else {
          await signIn(email, pass);
        }
        onReady({ name: email });
      } catch (e) {
        msg.textContent = '⚠ ' + (e.message || 'تعذّر إتمام العملية');
        btn.disabled = false;
      }
    }
    render();
  }

  window.Cloud = {
    enabled, configured, active, init, org,
    signUp, signIn, signOut, currentSession, bootstrap, mountAuth,
    planKey, planLimits, feature, trialDaysLeft, PLAN_LIMITS,
  };
})();
