const Views = (() => {

  // ── Helpers ───────────────────────────────────────────────────────────────

  function fmt(price) { return price.toFixed(0) + ' ر.س'; }
  function priceRange(n) { return '<span class="price-dot">●</span>'.repeat(n) + '<span class="price-dot dim">●</span>'.repeat(3 - n); }

  const STATUS_LABEL = { pending: 'قيد الانتظار', preparing: 'يُحضَّر الآن', ready: 'في الطريق', delivered: 'تم التوصيل' };
  const STATUS_COLOR = { pending: '#f59e0b', preparing: '#3b82f6', ready: '#8b5cf6', delivered: '#10b981' };

  // ── Top Navigation ────────────────────────────────────────────────────────

  function topNav(showBack = false) {
    const count = Store.getCartItemCount();
    return `
      <nav class="top-nav">
        <div class="nav-start">
          ${showBack
            ? `<button class="nav-back" data-action="go-back">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l6-6-6-6"/><line x1="21" y1="12" x2="3" y2="12"/></svg>
                رجوع
               </button>`
            : `<div class="nav-brand" data-action="go-home">
                <span class="brand-icon">🍽️</span>
                <span class="brand-name">سوق المطاعم</span>
               </div>`}
        </div>
        <div class="nav-end">
          <button class="nav-link" data-action="view-my-orders">📦 طلباتي</button>
          <button class="nav-link" data-action="go-dashboard">🏪 المطعم</button>
          ${count > 0 ? `
            <button class="nav-cart" data-action="go-checkout">
              🛒 <span class="cart-badge">${count}</span>
            </button>` : ''}
        </div>
      </nav>`;
  }

  // ── Cart FAB (floating action button) ────────────────────────────────────

  function cartFab() {
    const count = Store.getCartItemCount();
    const total = Store.getCartTotal();
    if (count === 0) return '';
    return `
      <div class="cart-fab" data-action="go-checkout">
        <span>🛒 ${count} عنصر</span>
        <span>${fmt(total)} ←</span>
      </div>`;
  }

  // ── Cart Sidebar Content ──────────────────────────────────────────────────

  function cartSidebarInner() {
    const cart        = Store.getState().cart;
    const count       = Store.getCartItemCount();
    const subtotal    = Store.getCartSubtotal();
    const delivery    = Store.getCartDelivery();
    const total       = Store.getCartTotal();
    const restaurant  = cart.restaurantId ? Store.getRestaurant(cart.restaurantId) : null;

    if (count === 0) return `
      <h3 class="cart-title">سلة الطلب</h3>
      <div class="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <p>السلة فارغة</p>
        <small>أضف وجبات من القائمة</small>
      </div>`;

    return `
      <div class="cart-head">
        <h3 class="cart-title">🛒 طلبك</h3>
        ${restaurant ? `<span class="cart-restaurant">${restaurant.name}</span>` : ''}
      </div>
      <div class="cart-items" id="cart-items">
        ${cart.items.map(it => `
          <div class="cart-item">
            <div class="cart-item-top">
              <span class="cart-item-name">${it.name}</span>
              <span class="cart-item-price">${fmt(it.price * it.quantity)}</span>
            </div>
            <div class="cart-item-qty">
              <button class="qty-sm" data-action="cart-dec" data-id="${it.id}">−</button>
              <span class="qty-val">${it.quantity}</span>
              <button class="qty-sm" data-action="cart-inc" data-id="${it.id}" data-rid="${cart.restaurantId}" data-name="${it.name}" data-price="${it.price}">+</button>
            </div>
          </div>`).join('')}
      </div>
      <div class="cart-summary">
        <div class="cart-row"><span>المجموع</span><span>${fmt(subtotal)}</span></div>
        <div class="cart-row"><span>التوصيل</span><span>${fmt(delivery)}</span></div>
        <div class="cart-row total-row"><span>الإجمالي</span><strong>${fmt(total)}</strong></div>
      </div>
      ${restaurant?.isOpen
        ? `<button class="btn-checkout" data-action="go-checkout">تأكيد الطلب ←</button>`
        : `<div class="closed-notice">⚠️ المطعم مغلق حاليًا</div>`}
      <button class="btn-clear" data-action="clear-cart">إلغاء الطلب</button>`;
  }

  // ── HOME ──────────────────────────────────────────────────────────────────

  function renderHome() {
    const st = Store.getState();
    const restaurants = Store.getFilteredRestaurants();

    return `
      <div class="page page-home">
        ${topNav()}

        <div class="hero">
          <div class="hero-content">
            <div class="hero-badge">🎉 بدون عمولة — المطعم يستلم 100%</div>
            <h1>اطلب من مطاعمك المفضلة</h1>
            <p>توصيل مباشر من المطعم إلى بابك<br/>بدون وسيط، بدون رسوم خفية</p>
            <div class="search-box">
              <span class="search-icon">🔍</span>
              <input type="text" id="search-input" class="search-input"
                placeholder="ابحث عن مطعم أو وجبة..."
                value="${st.filters.search}"
                autocomplete="off" />
            </div>
          </div>
        </div>

        <div class="filters-bar">
          <div class="cuisine-tabs">
            ${CUISINES.map(c => `
              <button class="cuisine-tab ${st.filters.cuisine === c.id ? 'active' : ''}"
                data-action="set-cuisine" data-cuisine="${c.id}">
                ${c.emoji} ${c.label}
              </button>`).join('')}
          </div>
          <select class="sort-select" id="sort-select">
            <option value="rating"   ${st.filters.sortBy === 'rating'   ? 'selected' : ''}>الأعلى تقييمًا</option>
            <option value="delivery" ${st.filters.sortBy === 'delivery' ? 'selected' : ''}>أسرع توصيل</option>
            <option value="minOrder" ${st.filters.sortBy === 'minOrder' ? 'selected' : ''}>أقل حد للطلب</option>
          </select>
        </div>

        <div class="page-body">
          ${restaurants.length === 0 ? `
            <div class="empty-state">
              <div class="empty-icon">🍽️</div>
              <h3>لا توجد نتائج</h3>
              <p>جرّب بحثًا آخر أو اختر تصنيفًا مختلفًا</p>
            </div>
          ` : `
            <div class="section-header">
              <h2>${st.filters.cuisine === 'all' ? 'جميع المطاعم' : `مطاعم ${st.filters.cuisine}`}</h2>
              <span class="count-badge">${restaurants.length} مطعم</span>
            </div>
            <div class="restaurant-grid">
              ${restaurants.map(r => restaurantCard(r)).join('')}
            </div>
          `}
        </div>

        ${cartFab()}
      </div>`;
  }

  function restaurantCard(r) {
    return `
      <div class="r-card ${!r.isOpen ? 'r-card--closed' : ''}" data-action="open-restaurant" data-id="${r.id}">
        <div class="r-card-cover" style="background:${r.color}18; border-bottom:3px solid ${r.color}40">
          <span class="r-card-emoji">${r.emoji}</span>
          ${!r.isOpen ? '<span class="closed-chip">مغلق الآن</span>' : ''}
          <span class="r-card-rating">★ ${r.rating}</span>
        </div>
        <div class="r-card-body">
          <h3 class="r-card-name">${r.name}</h3>
          <p class="r-card-cuisine">${r.cuisine}</p>
          <div class="r-card-meta">
            <span>🕐 ${r.deliveryTime} د</span>
            <span>📦 ${r.minOrder} ر.س</span>
            <span class="price-range">${priceRange(r.priceRange)}</span>
          </div>
          <div class="r-card-tags">
            ${r.tags.map(t => `<span class="tag">${t}</span>`).join('')}
          </div>
        </div>
      </div>`;
  }

  // ── RESTAURANT PAGE ───────────────────────────────────────────────────────

  function renderRestaurant(restaurantId) {
    const r = Store.getRestaurant(restaurantId);
    if (!r) return `<div class="page"><div class="error-msg">المطعم غير موجود</div></div>`;

    return `
      <div class="page page-restaurant">
        ${topNav(true)}

        <div class="r-header" style="border-top:4px solid ${r.color}">
          <div class="r-header-cover" style="background:linear-gradient(135deg,${r.color}28,${r.color}10)">
            <span class="r-header-emoji">${r.emoji}</span>
          </div>
          <div class="r-header-info">
            <div class="r-header-top">
              <h1>${r.name}</h1>
              <span class="r-header-rating">★ ${r.rating} <em>(${r.reviewCount} تقييم)</em></span>
            </div>
            <p class="r-header-cuisine">${r.cuisine}</p>
            <div class="r-header-meta">
              <span>🕐 ${r.deliveryTime} دقيقة</span>
              <span>🛵 توصيل ${r.deliveryFee} ر.س</span>
              <span>📦 حد أدنى ${r.minOrder} ر.س</span>
              <span>📍 ${r.neighborhood}</span>
            </div>
            ${!r.isOpen ? `<div class="r-closed-banner">⚠️ المطعم مغلق حاليًا — يمكنك تصفح القائمة</div>` : ''}
          </div>
        </div>

        <div class="r-layout">
          <div class="menu-col">
            <nav class="cat-nav" id="cat-nav">
              ${r.categories.map(c => `
                <a class="cat-nav-item" href="#cat-${c.id}">${c.name}</a>`).join('')}
            </nav>

            ${r.categories.map(c => `
              <div class="menu-category" id="cat-${c.id}">
                <h2 class="cat-title">${c.name}</h2>
                <div class="menu-items">
                  ${c.items.map(item => menuItemCard(item, r.id, r.isOpen)).join('')}
                </div>
              </div>`).join('')}
          </div>

          <aside class="cart-col">
            <div class="cart-panel" id="cart-panel">
              ${cartSidebarInner()}
            </div>
          </aside>
        </div>

        ${cartFab()}
      </div>`;
  }

  function menuItemCard(item, restaurantId, isOpen) {
    const cartItem = Store.getState().cart.items.find(i => i.id === item.id);
    const qty = cartItem?.quantity || 0;

    return `
      <div class="menu-item ${!item.available ? 'menu-item--unavailable' : ''}">
        <div class="menu-item-body">
          <h4 class="menu-item-name">${item.name}</h4>
          <p class="menu-item-desc">${item.description}</p>
          <div class="menu-item-foot">
            <span class="menu-item-price">${item.price} ر.س</span>
            ${item.available && isOpen ? `
              <div class="qty-ctrl">
                ${qty > 0 ? `
                  <button class="qty-btn" data-action="item-dec" data-id="${item.id}">−</button>
                  <span class="qty-num">${qty}</span>
                ` : ''}
                <button class="qty-btn qty-add ${qty > 0 ? 'qty-add--mini' : ''}"
                  data-action="item-add"
                  data-iid="${item.id}"
                  data-rid="${restaurantId}"
                  data-name="${item.name.replace(/"/g, '&quot;')}"
                  data-price="${item.price}">
                  ${qty > 0 ? '+' : '+ إضافة'}
                </button>
              </div>
            ` : item.available ? `<span class="unavail-tag">المطعم مغلق</span>` : `<span class="unavail-tag">غير متاح</span>`}
          </div>
        </div>
      </div>`;
  }

  // ── CHECKOUT ──────────────────────────────────────────────────────────────

  function renderCheckout() {
    const cart       = Store.getState().cart;
    const subtotal   = Store.getCartSubtotal();
    const delivery   = Store.getCartDelivery();
    const total      = Store.getCartTotal();
    const restaurant = Store.getRestaurant(cart.restaurantId);

    if (Store.getCartItemCount() === 0) {
      return `
        <div class="page">
          ${topNav(true)}
          <div class="page-body">
            <div class="empty-state">
              <div class="empty-icon">🛒</div>
              <h3>السلة فارغة</h3>
              <button class="btn-primary" data-action="go-home">تصفح المطاعم</button>
            </div>
          </div>
        </div>`;
    }

    return `
      <div class="page page-checkout">
        ${topNav(true)}
        <div class="page-body">
          <h2 class="page-title">إتمام الطلب</h2>
          <div class="checkout-layout">

            <div class="checkout-form-col">
              <div class="form-card">
                <h3>بيانات التوصيل</h3>
                <div class="form-group">
                  <label class="form-label">الاسم <span class="req">*</span></label>
                  <input type="text"  id="f-name"    class="form-input" placeholder="اسمك الكامل" autocomplete="name" />
                </div>
                <div class="form-group">
                  <label class="form-label">رقم الجوال <span class="req">*</span></label>
                  <input type="tel"   id="f-phone"   class="form-input" placeholder="05xxxxxxxx" autocomplete="tel" />
                </div>
                <div class="form-group">
                  <label class="form-label">العنوان <span class="req">*</span></label>
                  <textarea id="f-address" class="form-input form-ta" placeholder="الحي، الشارع، رقم المبنى..." rows="3"></textarea>
                </div>
                <div class="form-group">
                  <label class="form-label">ملاحظات للمطعم</label>
                  <textarea id="f-notes"   class="form-input form-ta" placeholder="مثال: بدون بصل، الطابق الثالث..." rows="2"></textarea>
                </div>
              </div>

              <div class="form-card">
                <h3>طريقة الدفع</h3>
                <div class="pay-options">
                  <div class="pay-option pay-option--active">
                    <span class="pay-icon">💵</span>
                    <div>
                      <strong>الدفع عند الاستلام</strong>
                      <p>ادفع نقدًا حين يصل الطلب</p>
                    </div>
                    <span class="pay-check">✓</span>
                  </div>
                  <div class="pay-option pay-option--disabled">
                    <span class="pay-icon">💳</span>
                    <div>
                      <strong>بطاقة / محفظة</strong>
                      <p>قريبًا</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="checkout-summary-col">
              <div class="summary-card">
                <h3>${restaurant?.name || 'ملخص الطلب'}</h3>
                <div class="summary-items">
                  ${cart.items.map(it => `
                    <div class="summary-item">
                      <span>${it.name} × ${it.quantity}</span>
                      <span>${fmt(it.price * it.quantity)}</span>
                    </div>`).join('')}
                </div>
                <div class="summary-sep"></div>
                <div class="summary-row"><span>المجموع</span><span>${fmt(subtotal)}</span></div>
                <div class="summary-row"><span>التوصيل</span><span>${fmt(delivery)}</span></div>
                <div class="summary-row summary-total"><span>الإجمالي</span><strong>${fmt(total)}</strong></div>
                <button class="btn-place-order" data-action="place-order">
                  تأكيد الطلب &ndash; ${fmt(total)}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>`;
  }

  // ── CONFIRMATION ──────────────────────────────────────────────────────────

  function renderConfirmation(orderId) {
    const order = Store.getState().orders.find(o => o.id === orderId);
    if (!order) return `<div class="page">${topNav(true)}<div class="error-msg">الطلب غير موجود</div></div>`;

    const steps = [
      { icon: '📋', label: 'تم الاستلام',  statuses: ['pending','preparing','ready','delivered'] },
      { icon: '👨‍🍳', label: 'يُحضَّر',      statuses: ['preparing','ready','delivered'] },
      { icon: '🛵', label: 'في الطريق',   statuses: ['ready','delivered'] },
      { icon: '🏠', label: 'تم التوصيل',  statuses: ['delivered'] },
    ];

    return `
      <div class="page page-confirm">
        ${topNav()}
        <div class="page-body">
          <div class="confirm-card">
            <div class="confirm-anim">✅</div>
            <h2>تم استلام طلبك!</h2>
            <p class="confirm-sub">سيصلك طلبك من <strong>${order.restaurantName}</strong><br/>خلال <strong>~${order.estimatedMinutes} دقيقة</strong></p>
            <div class="confirm-id">رقم الطلب: <strong>${order.id}</strong></div>

            <div class="status-track">
              ${steps.map(s => `
                <div class="track-step ${s.statuses.includes(order.status) ? 'track-step--active' : ''}">
                  <div class="track-icon">${s.icon}</div>
                  <div class="track-label">${s.label}</div>
                </div>`).join('<div class="track-line"></div>')}
            </div>

            <div class="confirm-details">
              <div class="detail-row"><span>📍 العنوان</span><span>${order.customer.address}</span></div>
              <div class="detail-row"><span>💵 الإجمالي</span><span>${fmt(order.total)}</span></div>
              <div class="detail-row"><span>💳 الدفع</span><span>عند الاستلام</span></div>
            </div>

            <div class="confirm-actions">
              <button class="btn-primary" data-action="go-home">تصفح مطاعم أخرى</button>
              <button class="btn-secondary" data-action="view-my-orders">طلباتي</button>
            </div>
          </div>
        </div>
      </div>`;
  }

  // ── MY ORDERS ─────────────────────────────────────────────────────────────

  function renderMyOrders() {
    const orders = Store.getState().orders;

    return `
      <div class="page page-orders">
        ${topNav(true)}
        <div class="page-body">
          <h2 class="page-title">طلباتي</h2>
          ${orders.length === 0 ? `
            <div class="empty-state">
              <div class="empty-icon">📦</div>
              <h3>لا توجد طلبات بعد</h3>
              <p>ابدأ بتصفح المطاعم وأضف أول طلب!</p>
              <button class="btn-primary mt" data-action="go-home">تصفح المطاعم</button>
            </div>
          ` : `
            <div class="orders-list">
              ${orders.map(o => `
                <div class="order-card">
                  <div class="order-card-top">
                    <div>
                      <h4>${o.restaurantName}</h4>
                      <small class="order-date">${new Date(o.createdAt).toLocaleString('ar-SA', { dateStyle: 'short', timeStyle: 'short' })}</small>
                    </div>
                    <span class="status-pill" style="background:${STATUS_COLOR[o.status]}18;color:${STATUS_COLOR[o.status]}">
                      ${STATUS_LABEL[o.status]}
                    </span>
                  </div>
                  <p class="order-items-preview">${o.items.map(i => `${i.name} ×${i.quantity}`).join(' · ')}</p>
                  <div class="order-card-foot">
                    <span class="order-total">${fmt(o.total)}</span>
                    <span class="order-num">${o.id}</span>
                  </div>
                </div>`).join('')}
            </div>
          `}
        </div>
      </div>`;
  }

  // ── DASHBOARD ─────────────────────────────────────────────────────────────

  function renderDashboard() {
    const st = Store.getState();

    if (!st.dashboardRestaurantId) {
      return `
        <div class="page page-dashboard">
          ${topNav(true)}
          <div class="page-body">
            <h2 class="page-title">لوحة تحكم المطعم</h2>
            <p class="page-sub">اختر مطعمك لإدارة الطلبات والقائمة</p>
            <div class="dash-selector">
              ${RESTAURANTS_DATA.map(r => `
                <div class="dash-sel-card" data-action="sel-dashboard-r" data-id="${r.id}">
                  <span class="sel-emoji">${r.emoji}</span>
                  <div class="sel-info">
                    <h4>${r.name}</h4>
                    <p>${r.cuisine} · ${r.neighborhood}</p>
                  </div>
                  <span class="sel-arrow">←</span>
                </div>`).join('')}
            </div>
          </div>
        </div>`;
    }

    const r = Store.getRestaurant(st.dashboardRestaurantId);
    const rOrders  = st.orders.filter(o => o.restaurantId === st.dashboardRestaurantId);
    const pending  = rOrders.filter(o => o.status === 'pending').length;
    const preparing= rOrders.filter(o => o.status === 'preparing').length;
    const done     = rOrders.filter(o => o.status === 'delivered').length;
    const revenue  = rOrders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.total, 0);

    return `
      <div class="page page-dashboard">
        ${topNav(true)}
        <div class="page-body">
          <div class="dash-head">
            <div>
              <button class="back-link" data-action="back-dashboard">← جميع المطاعم</button>
              <h2 class="page-title">${r.emoji} ${r.name}</h2>
            </div>
            <span class="open-badge ${r.isOpen ? 'open' : 'closed'}">● ${r.isOpen ? 'مفتوح' : 'مغلق'}</span>
          </div>

          <div class="stats-row">
            <div class="stat-card stat-orange"><div class="stat-val">${pending}</div><div class="stat-lbl">طلبات جديدة</div></div>
            <div class="stat-card stat-blue"><div class="stat-val">${preparing}</div><div class="stat-lbl">قيد التحضير</div></div>
            <div class="stat-card stat-green"><div class="stat-val">${done}</div><div class="stat-lbl">مكتملة</div></div>
            <div class="stat-card stat-purple"><div class="stat-val">${fmt(revenue)}</div><div class="stat-lbl">إجمالي الإيرادات</div></div>
          </div>

          <div class="dash-tabs">
            <button class="dash-tab ${st.dashboardTab === 'orders' ? 'active' : ''}" data-action="dash-tab" data-tab="orders">
              الطلبات ${rOrders.length > 0 ? `<span class="tab-cnt">${rOrders.length}</span>` : ''}
            </button>
            <button class="dash-tab ${st.dashboardTab === 'menu' ? 'active' : ''}" data-action="dash-tab" data-tab="menu">
              القائمة
            </button>
          </div>

          ${st.dashboardTab === 'orders' ? dashOrders(rOrders) : dashMenu(r)}
        </div>
      </div>`;
  }

  function dashOrders(orders) {
    if (orders.length === 0) return `
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <h3>لا توجد طلبات بعد</h3>
        <p>ستظهر الطلبات الجديدة هنا فور وصولها</p>
      </div>`;

    return `
      <div class="dash-orders">
        ${orders.map(o => `
          <div class="dash-order-card">
            <div class="dash-order-top">
              <div>
                <strong class="dash-order-id">${o.id}</strong>
                <small>${new Date(o.createdAt).toLocaleString('ar-SA', { dateStyle: 'short', timeStyle: 'short' })}</small>
              </div>
              <select class="status-sel" data-action="update-status" data-oid="${o.id}">
                <option value="pending"   ${o.status === 'pending'   ? 'selected' : ''}>قيد الانتظار</option>
                <option value="preparing" ${o.status === 'preparing' ? 'selected' : ''}>يُحضَّر الآن</option>
                <option value="ready"     ${o.status === 'ready'     ? 'selected' : ''}>جاهز للتوصيل</option>
                <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>تم التوصيل</option>
              </select>
            </div>
            <div class="dash-order-items">
              ${o.items.map(it => `<span class="item-chip">${it.name} ×${it.quantity}</span>`).join('')}
            </div>
            <div class="dash-customer">
              <span>👤 ${o.customer.name}</span>
              <span>📞 ${o.customer.phone}</span>
              <span>📍 ${o.customer.address}</span>
              ${o.customer.notes ? `<span>📝 ${o.customer.notes}</span>` : ''}
            </div>
            <div class="dash-order-foot">
              <strong class="dash-order-total">${fmt(o.total)}</strong>
              <span class="status-pill" style="background:${STATUS_COLOR[o.status]}18;color:${STATUS_COLOR[o.status]}">${STATUS_LABEL[o.status]}</span>
            </div>
          </div>`).join('')}
      </div>`;
  }

  function dashMenu(r) {
    return `
      <div class="dash-menu">
        ${r.categories.map(c => `
          <div class="dash-cat">
            <h3 class="dash-cat-title">${c.name}</h3>
            ${c.items.map(it => `
              <div class="dash-menu-item">
                <div>
                  <h4>${it.name}</h4>
                  <p>${it.description}</p>
                </div>
                <div class="dash-item-meta">
                  <span class="menu-price">${it.price} ر.س</span>
                  <span class="avail-badge ${it.available ? 'avail' : 'unavail'}">${it.available ? 'متاح' : 'غير متاح'}</span>
                </div>
              </div>`).join('')}
          </div>`).join('')}
      </div>`;
  }

  // ── Toast ─────────────────────────────────────────────────────────────────

  function showToast(msg, type = 'success') {
    const root = document.getElementById('toast-root');
    if (!root) return;
    const el = document.createElement('div');
    el.className = `toast toast--${type}`;
    el.textContent = msg;
    root.appendChild(el);
    requestAnimationFrame(() => el.classList.add('toast--show'));
    setTimeout(() => {
      el.classList.remove('toast--show');
      setTimeout(() => el.remove(), 320);
    }, 2600);
  }

  // ── Public ────────────────────────────────────────────────────────────────

  return {
    renderHome, renderRestaurant, renderCheckout, renderConfirmation,
    renderMyOrders, renderDashboard,
    cartSidebarInner,
    showToast,
  };
})();
