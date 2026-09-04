import { TOKEN_STORAGE_KEY } from '../constants';

const BASE_CART_KEY = 'gymtrack_shop_cart';
const CART_EVENT = 'gymtrack_cart_sync_event';

function getUserScope() {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_STORAGE_KEY) : null;
    if (token) {
      const parts = token.split('.');
      if (parts.length >= 2) {
        const payload = JSON.parse(atob(parts[1]));
        const userIdentifier = payload.sub || payload.id || payload.email;
        if (userIdentifier) {
          return '_' + String(userIdentifier).replace(/[^a-zA-Z0-9]/g, '_');
        }
      }
    }
  } catch (e) {}
  return '_guest';
}

function getCartStorageKey() {
  return `${BASE_CART_KEY}${getUserScope()}`;
}

export const cartService = {
  getCart() {
    try {
      const key = getCartStorageKey();
      const raw = localStorage.getItem(key);
      if (raw) {
        const items = JSON.parse(raw);
        return Array.isArray(items) ? items : [];
      }
      return [];
    } catch (e) {
      console.error('Failed reading cart:', e);
      return [];
    }
  },

  saveCart(items) {
    try {
      const key = getCartStorageKey();
      localStorage.setItem(key, JSON.stringify(items));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(CART_EVENT, { detail: items }));
      }
    } catch (e) {
      console.error('Failed saving cart:', e);
    }
  },

  addToCart(product, quantity = 1) {
    if (!product || !product.id) return [];
    const items = this.getCart();
    const existingIndex = items.findIndex((i) => i.productId === product.id);

    if (existingIndex > -1) {
      const currentQty = items[existingIndex].quantity || 1;
      const newQty = currentQty + quantity;
      const maxStock = product.stockQuantity || 99;
      items[existingIndex].quantity = Math.min(newQty, maxStock);
    } else {
      items.push({
        productId: product.id,
        name: product.name,
        price: Number(product.price || 0),
        image: product.images && product.images.length > 0 ? product.images[0] : null,
        categoryName: product.categoryName,
        sellerId: product.sellerId,
        sellerName: product.sellerName,
        sellerStoreName: product.sellerStoreName,
        sellerStoreLogo: product.sellerStoreLogo,
        stockQuantity: product.stockQuantity || 10,
        quantity: Math.max(1, Math.min(quantity, product.stockQuantity || 10)),
      });
    }

    this.saveCart(items);
    return items;
  },

  updateQuantity(productId, quantity) {
    let items = this.getCart();
    if (quantity <= 0) {
      items = items.filter((i) => i.productId !== productId);
    } else {
      const item = items.find((i) => i.productId === productId);
      if (item) {
        const maxStock = item.stockQuantity || 99;
        item.quantity = Math.min(quantity, maxStock);
      }
    }
    this.saveCart(items);
    return items;
  },

  removeFromCart(productId) {
    const items = this.getCart().filter((i) => i.productId !== productId);
    this.saveCart(items);
    return items;
  },

  clearCart() {
    this.saveCart([]);
  },

  getItemCount() {
    const items = this.getCart();
    return items.reduce((acc, i) => acc + (Number(i.quantity) || 1), 0);
  },

  getTotals(pointsToUse = 0, userPoints = 0) {
    const items = this.getCart();
    const subtotal = items.reduce((acc, i) => acc + Number(i.price) * (Number(i.quantity) || 1), 0);

    const shipping = subtotal >= 150 || subtotal === 0 ? 0 : 7;

    let pointsDiscount = 0;
    if (pointsToUse > 0 && userPoints > 0) {
      const applicable = Math.min(pointsToUse, userPoints);
      const maxDisc = subtotal * 0.5;
      const rawDisc = applicable * 0.10;
      pointsDiscount = Math.min(rawDisc, maxDisc);
    }

    const total = Math.max(0, subtotal - pointsDiscount + shipping);

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      shipping: Math.round(shipping * 100) / 100,
      pointsDiscount: Math.round(pointsDiscount * 100) / 100,
      total: Math.round(total * 100) / 100,
      itemCount: this.getItemCount(),
      pointsEarned: Math.round(total * 0.5), // 1 point per $2
    };
  },

  subscribe(callback) {
    const handler = (e) => callback(e.detail || this.getCart());
    window.addEventListener(CART_EVENT, handler);
    return () => window.removeEventListener(CART_EVENT, handler);
  },
};
