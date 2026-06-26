const Store = (() => {
  const CART_KEY   = 'mkt_cart';
  const ORDERS_KEY = 'mkt_orders';

  function load(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  }

  const emptyCart = () => ({ restaurantId: null, items: [], deliveryFee: 0 });

  let state = {
    view: 'home',
    currentRestaurantId: null,
    currentOrderId: null,
    cart: load(CART_KEY, emptyCart()),
    orders: load(ORDERS_KEY, []),
    filters: { search: '', cuisine: 'all', sortBy: 'rating' },
    dashboardRestaurantId: null,
    dashboardTab: 'orders',
    prevViews: [],
  };

  function saveCart()   { localStorage.setItem(CART_KEY,   JSON.stringify(state.cart)); }
  function saveOrders() { localStorage.setItem(ORDERS_KEY, JSON.stringify(state.orders)); }

  // ── Queries ──────────────────────────────────────────────────────────────

  function getState() { return state; }

  function getRestaurant(id) {
    return RESTAURANTS_DATA.find(r => r.id === id) || null;
  }

  function getFilteredRestaurants() {
    let list = [...RESTAURANTS_DATA];
    const { search, cuisine, sortBy } = state.filters;

    if (search) {
      const q = search.trim().toLowerCase();
      list = list.filter(r =>
        r.name.includes(q) ||
        r.cuisine.toLowerCase().includes(q) ||
        r.tags.some(t => t.includes(q))
      );
    }
    if (cuisine !== 'all') {
      list = list.filter(r => r.cuisine.includes(cuisine));
    }
    if (sortBy === 'rating')    list.sort((a, b) => b.rating - a.rating);
    if (sortBy === 'delivery')  list.sort((a, b) => parseInt(a.deliveryTime) - parseInt(b.deliveryTime));
    if (sortBy === 'minOrder')  list.sort((a, b) => a.minOrder - b.minOrder);

    return list;
  }

  // ── Cart ─────────────────────────────────────────────────────────────────

  function addToCart(restaurantId, item) {
    const restaurant = getRestaurant(restaurantId);
    if (!restaurant) return false;

    if (state.cart.restaurantId && state.cart.restaurantId !== restaurantId) {
      return 'conflict';
    }
    if (!state.cart.restaurantId) {
      state.cart.restaurantId = restaurantId;
      state.cart.deliveryFee  = restaurant.deliveryFee;
    }

    const existing = state.cart.items.find(i => i.id === item.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      state.cart.items.push({ id: item.id, name: item.name, price: item.price, quantity: 1 });
    }
    saveCart();
    return true;
  }

  function removeFromCart(itemId) {
    state.cart.items = state.cart.items.filter(i => i.id !== itemId);
    if (state.cart.items.length === 0) state.cart = emptyCart();
    saveCart();
  }

  function updateCartItemQty(itemId, qty) {
    if (qty <= 0) { removeFromCart(itemId); return; }
    const item = state.cart.items.find(i => i.id === itemId);
    if (item) { item.quantity = qty; saveCart(); }
  }

  function clearCart() { state.cart = emptyCart(); saveCart(); }

  function getCartSubtotal() {
    return state.cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
  }
  function getCartDelivery() {
    return state.cart.items.length ? state.cart.deliveryFee : 0;
  }
  function getCartTotal()    { return getCartSubtotal() + getCartDelivery(); }
  function getCartItemCount(){ return state.cart.items.reduce((s, i) => s + i.quantity, 0); }

  // ── Orders ───────────────────────────────────────────────────────────────

  function createOrder(customerData) {
    const restaurant = getRestaurant(state.cart.restaurantId);
    const order = {
      id: 'ORD-' + Date.now(),
      restaurantId:   state.cart.restaurantId,
      restaurantName: restaurant?.name || '',
      items:          [...state.cart.items],
      subtotal:       getCartSubtotal(),
      deliveryFee:    getCartDelivery(),
      total:          getCartTotal(),
      customer:       { ...customerData },
      status:         'pending',
      createdAt:      new Date().toISOString(),
      estimatedMinutes: parseInt((restaurant?.deliveryTime || '45').split('-')[1]) || 45,
    };
    state.orders.unshift(order);
    saveOrders();
    clearCart();
    return order;
  }

  function updateOrderStatus(orderId, status) {
    const order = state.orders.find(o => o.id === orderId);
    if (order) { order.status = status; saveOrders(); }
  }

  // ── Navigation ───────────────────────────────────────────────────────────

  function navigate(view, params = {}) {
    state.prevViews.push(state.view);
    state.view = view;
    Object.assign(state, params);
  }

  function goBack() {
    const prev = state.prevViews.pop() || 'home';
    state.view = prev;
  }

  // ── Filters & Dashboard ──────────────────────────────────────────────────

  function setFilter(key, val)           { state.filters[key] = val; }
  function setDashboardRestaurant(id)    { state.dashboardRestaurantId = id; state.dashboardTab = 'orders'; }
  function setDashboardTab(tab)          { state.dashboardTab = tab; }

  return {
    getState, getRestaurant, getFilteredRestaurants,
    addToCart, removeFromCart, updateCartItemQty, clearCart,
    getCartSubtotal, getCartDelivery, getCartTotal, getCartItemCount,
    createOrder, updateOrderStatus,
    navigate, goBack,
    setFilter, setDashboardRestaurant, setDashboardTab,
  };
})();
