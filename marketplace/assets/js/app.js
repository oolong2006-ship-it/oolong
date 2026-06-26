const App = (() => {
  const root = document.getElementById('app');

  // ── Render ────────────────────────────────────────────────────────────────

  function render() {
    const st = Store.getState();
    switch (st.view) {
      case 'home':         root.innerHTML = Views.renderHome();                       break;
      case 'restaurant':   root.innerHTML = Views.renderRestaurant(st.currentRestaurantId); break;
      case 'checkout':     root.innerHTML = Views.renderCheckout();                   break;
      case 'confirmation': root.innerHTML = Views.renderConfirmation(st.currentOrderId);   break;
      case 'my-orders':    root.innerHTML = Views.renderMyOrders();                   break;
      case 'dashboard':    root.innerHTML = Views.renderDashboard();                  break;
      default:             root.innerHTML = Views.renderHome();
    }
    window.scrollTo(0, 0);
    if (st.view === 'restaurant') setupCategoryHighlight();
  }

  function nav(view, params = {}) {
    Store.navigate(view, params);
    render();
  }

  // ── Partial update helpers ────────────────────────────────────────────────

  function refreshCartPanel() {
    const panel = document.getElementById('cart-panel');
    if (panel) panel.innerHTML = Views.cartSidebarInner();
  }

  function refreshCartFab() {
    const existing = document.querySelector('.cart-fab');
    const count    = Store.getCartItemCount();
    const total    = Store.getCartTotal();
    if (count === 0) {
      existing?.remove();
    } else {
      if (existing) {
        existing.innerHTML = `<span>🛒 ${count} عنصر</span><span>${total.toFixed(0)} ر.س ←</span>`;
      } else {
        const fab = document.createElement('div');
        fab.className = 'cart-fab';
        fab.dataset.action = 'go-checkout';
        fab.innerHTML = `<span>🛒 ${count} عنصر</span><span>${total.toFixed(0)} ر.س ←</span>`;
        document.querySelector('.page')?.appendChild(fab);
      }
    }
  }

  function refreshNavCart() {
    const btn   = document.querySelector('.nav-cart');
    const count = Store.getCartItemCount();
    if (btn) {
      const badge = btn.querySelector('.cart-badge');
      if (badge) badge.textContent = count;
      if (count === 0) btn.remove();
    }
  }

  function refreshMenuItemQty(itemId) {
    const cartItem = Store.getState().cart.items.find(i => i.id === itemId);
    const qty      = cartItem?.quantity || 0;

    document.querySelectorAll(`[data-iid="${itemId}"]`).forEach(addBtn => {
      const ctrl = addBtn.closest('.qty-ctrl');
      if (!ctrl) return;
      const rid   = addBtn.dataset.rid;
      const isOpen = Store.getRestaurant(rid)?.isOpen;

      if (qty > 0) {
        ctrl.innerHTML = `
          <button class="qty-btn" data-action="item-dec" data-id="${itemId}">−</button>
          <span class="qty-num">${qty}</span>
          <button class="qty-btn qty-add qty-add--mini"
            data-action="item-add" data-iid="${itemId}" data-rid="${rid}"
            data-name="${addBtn.dataset.name}" data-price="${addBtn.dataset.price}">+</button>`;
      } else {
        ctrl.innerHTML = `
          <button class="qty-btn qty-add"
            data-action="item-add" data-iid="${itemId}" data-rid="${rid}"
            data-name="${addBtn.dataset.name}" data-price="${addBtn.dataset.price}">+ إضافة</button>`;
      }
    });
  }

  // ── Category nav highlight ────────────────────────────────────────────────

  function setupCategoryHighlight() {
    const catNavItems = document.querySelectorAll('.cat-nav-item');
    if (!catNavItems.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          catNavItems.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
        }
      });
    }, { rootMargin: '-10% 0px -70% 0px' });

    document.querySelectorAll('.menu-category').forEach(el => observer.observe(el));
  }

  // ── Action handler ────────────────────────────────────────────────────────

  function handleAction(el) {
    const action = el.dataset.action;

    switch (action) {
      case 'go-home':
        nav('home');
        break;

      case 'go-back':
        Store.goBack();
        render();
        break;

      case 'open-restaurant':
        nav('restaurant', { currentRestaurantId: el.dataset.id });
        break;

      case 'item-add': {
        const result = Store.addToCart(el.dataset.rid, {
          id:    el.dataset.iid,
          name:  el.dataset.name,
          price: parseFloat(el.dataset.price),
        });
        if (result === 'conflict') {
          if (confirm('لديك طلب من مطعم آخر.\nهل تريد إلغاءه والبدء من هذا المطعم؟')) {
            Store.clearCart();
            Store.addToCart(el.dataset.rid, {
              id:    el.dataset.iid,
              name:  el.dataset.name,
              price: parseFloat(el.dataset.price),
            });
            refreshMenuItemQty(el.dataset.iid);
            refreshCartPanel();
            refreshCartFab();
            refreshNavCart();
            Views.showToast('تمت الإضافة ✓');
          }
        } else if (result === true) {
          refreshMenuItemQty(el.dataset.iid);
          refreshCartPanel();
          refreshCartFab();
          refreshNavCart();
          Views.showToast('أُضيف إلى السلة ✓');
        }
        break;
      }

      case 'item-dec': {
        const cartItem = Store.getState().cart.items.find(i => i.id === el.dataset.id);
        if (cartItem) {
          Store.updateCartItemQty(el.dataset.id, cartItem.quantity - 1);
          refreshMenuItemQty(el.dataset.id);
          refreshCartPanel();
          refreshCartFab();
          refreshNavCart();
        }
        break;
      }

      case 'cart-dec': {
        const it = Store.getState().cart.items.find(i => i.id === el.dataset.id);
        if (it) {
          Store.updateCartItemQty(el.dataset.id, it.quantity - 1);
          refreshCartPanel();
          refreshCartFab();
          refreshNavCart();
          if (Store.getState().view === 'restaurant') refreshMenuItemQty(el.dataset.id);
        }
        break;
      }

      case 'cart-inc': {
        Store.addToCart(el.dataset.rid, {
          id:    el.dataset.id,
          name:  el.dataset.name,
          price: parseFloat(el.dataset.price),
        });
        refreshCartPanel();
        refreshCartFab();
        refreshNavCart();
        if (Store.getState().view === 'restaurant') refreshMenuItemQty(el.dataset.id);
        break;
      }

      case 'go-checkout':
        if (Store.getCartItemCount() > 0) nav('checkout');
        break;

      case 'clear-cart':
        if (confirm('هل تريد إلغاء الطلب بالكامل؟')) {
          Store.clearCart();
          render();
        }
        break;

      case 'place-order': {
        const name    = document.getElementById('f-name')?.value.trim();
        const phone   = document.getElementById('f-phone')?.value.trim();
        const address = document.getElementById('f-address')?.value.trim();
        const notes   = document.getElementById('f-notes')?.value.trim();
        if (!name || !phone || !address) {
          Views.showToast('يرجى تعبئة الحقول المطلوبة كاملة', 'error');
          ['f-name','f-phone','f-address'].forEach(id => {
            const el = document.getElementById(id);
            if (el && !el.value.trim()) el.classList.add('input-error');
          });
          return;
        }
        const order = Store.createOrder({ name, phone, address, notes: notes || '' });
        nav('confirmation', { currentOrderId: order.id });
        break;
      }

      case 'view-my-orders':
        nav('my-orders');
        break;

      case 'go-dashboard':
        nav('dashboard');
        break;

      case 'sel-dashboard-r':
        Store.setDashboardRestaurant(el.dataset.id);
        render();
        break;

      case 'back-dashboard':
        Store.setDashboardRestaurant(null);
        render();
        break;

      case 'dash-tab':
        Store.setDashboardTab(el.dataset.tab);
        render();
        break;
    }
  }

  // ── Global event listeners ────────────────────────────────────────────────

  function init() {
    // Click delegation
    document.addEventListener('click', e => {
      const el = e.target.closest('[data-action]');
      if (el) { e.preventDefault(); handleAction(el); }

      // Cuisine tab click
      const cuisineTab = e.target.closest('.cuisine-tab');
      if (cuisineTab) {
        Store.setFilter('cuisine', cuisineTab.dataset.cuisine);
        render();
      }
    });

    // Change events (select elements)
    document.addEventListener('change', e => {
      if (e.target.id === 'sort-select') {
        Store.setFilter('sortBy', e.target.value);
        render();
        return;
      }
      if (e.target.dataset.action === 'update-status') {
        Store.updateOrderStatus(e.target.dataset.oid, e.target.value);
        Views.showToast('تم تحديث حالة الطلب ✓');
      }
    });

    // Search input (debounced)
    let searchTimer;
    document.addEventListener('input', e => {
      if (e.target.id !== 'search-input') return;
      Store.setFilter('search', e.target.value);
      clearTimeout(searchTimer);
      searchTimer = setTimeout(render, 280);
    });

    // Remove input-error class on focus
    document.addEventListener('focus', e => {
      if (e.target.classList?.contains('input-error')) {
        e.target.classList.remove('input-error');
      }
    }, true);

    render();
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', App.init);
