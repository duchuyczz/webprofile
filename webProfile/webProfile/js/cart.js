// ========== GIỎ HÀNG (theo user đăng nhập) ==========
(function () {
    function getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem('currentUser') || 'null');
        } catch {
            return null;
        }
    }

    function cartKey(user) {
        const id = (user && (user.username || user.email)) || 'guest';
        return 'cart_' + String(id).replace(/\s+/g, '_');
    }

    function loadCart(user) {
        try {
            return JSON.parse(localStorage.getItem(cartKey(user)) || '[]');
        } catch {
            return [];
        }
    }

    function saveCart(user, items) {
        localStorage.setItem(cartKey(user), JSON.stringify(items));
        updateCartBadge();
    }

    function effectivePrice(product) {
        const price = Number(product && product.price) || 0;
        const sale = Number(product && product.sale) || 0;
        if (sale > 0 && (price <= 0 || sale < price)) return sale;
        return price;
    }

    function updateCartBadge() {
        const user = getCurrentUser();
        const badge = document.getElementById('cart-badge');
        if (!badge) return;
        if (!user || user.role !== 'user') {
            badge.hidden = true;
            badge.textContent = '0';
            return;
        }
        const items = loadCart(user);
        const count = items.reduce((s, i) => s + (Number(i.qty) || 1), 0);
        badge.textContent = String(count);
        badge.hidden = count === 0;
    }

    function notify(message, type, title) {
        if (typeof showToast === 'function') {
            showToast(message, type || 'info', title || '');
        } else {
            alert((title ? title + '\n' : '') + message);
        }
    }

    function addToCart(product) {
        if (!product || product.id == null) {
            notify('Không tìm thấy sản phẩm.', 'error', 'Giỏ hàng');
            return false;
        }

        const user = getCurrentUser();
        if (!user || user.role !== 'user') {
            notify('Vui lòng đăng nhập để thêm vào giỏ hàng.', 'info', 'Cần đăng nhập');
            const returnTo = encodeURIComponent(
                (window.location.pathname.split('/').pop() || '') +
                (window.location.search || '') +
                (window.location.hash || '')
            );
            setTimeout(() => {
                window.location.href = 'dangnhap.html' + (returnTo ? '?next=' + returnTo : '');
            }, 500);
            return false;
        }

        const items = loadCart(user);
        const id = Number(product.id);
        const existing = items.find(i => Number(i.id) === id);
        const eff = effectivePrice(product);

        if (existing) {
            existing.qty = (Number(existing.qty) || 1) + 1;
            if (eff) existing.price = eff;
            if (product.name) existing.name = product.name;
            if (product.desc != null) existing.desc = product.desc;
            if (product.image) existing.image = product.image;
        } else {
            items.push({
                id: product.id,
                name: product.name || 'Sản phẩm',
                desc: product.desc || '',
                image: product.image || '',
                price: eff,
                qty: 1
            });
        }

        saveCart(user, items);
        notify('Đã thêm “' + (product.name || 'sản phẩm') + '” vào giỏ.', 'success', 'Giỏ hàng');
        return true;
    }

    function setQty(productId, qty) {
        const user = getCurrentUser();
        if (!user) return;
        const items = loadCart(user);
        const id = Number(productId);
        const item = items.find(i => Number(i.id) === id);
        if (!item) return;
        const n = Math.max(1, Number(qty) || 1);
        item.qty = n;
        saveCart(user, items);
    }

    function removeFromCart(productId) {
        const user = getCurrentUser();
        if (!user) return;
        const id = Number(productId);
        const items = loadCart(user).filter(i => Number(i.id) !== id);
        saveCart(user, items);
    }

    function clearCart() {
        const user = getCurrentUser();
        if (!user) return;
        saveCart(user, []);
    }

    window.CartAPI = {
        getCurrentUser,
        loadCart,
        saveCart,
        addToCart,
        updateCartBadge,
        setQty,
        removeFromCart,
        clearCart,
        effectivePrice
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateCartBadge);
    } else {
        updateCartBadge();
    }
})();
