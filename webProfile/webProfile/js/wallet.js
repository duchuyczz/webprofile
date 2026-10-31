// ========== VÍ / GIAO DỊCH (tối đa 5 giao dịch / user) ==========
(function () {
    const MAX_TX = 5;

    function loadUsers() {
        try { return JSON.parse(localStorage.getItem('users') || '[]'); } catch { return []; }
    }
    function saveUsers(list) {
        localStorage.setItem('users', JSON.stringify(list));
    }

    function findUserIndex(list, ref) {
        const email = ref.email || ref.username || '';
        const id = ref.id;
        return list.findIndex(u =>
            (id && String(u.id) === String(id)) ||
            u.email === email ||
            u.username === email ||
            u.username === ref.username
        );
    }

    function getUserRecord(ref) {
        const list = loadUsers();
        const i = findUserIndex(list, ref);
        return i >= 0 ? list[i] : null;
    }

    function typeLabel(type) {
        const map = {
            admin_add: 'Admin cộng tiền',
            admin_deduct: 'Admin trừ tiền',
            purchase: 'Mua hàng',
            deposit_note: 'Ghi nhận nạp',
            adjust: 'Điều chỉnh'
        };
        return map[type] || type || 'Giao dịch';
    }

    function pushTransaction(userRef, { type, amount, note, items, delivery, orderId }) {
        const list = loadUsers();
        const i = findUserIndex(list, userRef);
        if (i < 0) return null;
        const u = list[i];
        const bal = (Number(u.balance) || 0) + (Number(amount) || 0);
        u.balance = bal;
        const tx = {
            id: Date.now(),
            type: type || 'adjust',
            amount: Number(amount) || 0,
            note: note || '',
            time: new Date().toLocaleString('vi-VN'),
            balanceAfter: bal
        };
        if (orderId) tx.orderId = orderId;
        if (Array.isArray(items) && items.length) {
            tx.items = items.map(it => ({
                id: it.id,
                name: it.name || 'Sản phẩm',
                qty: Number(it.qty) || 1,
                price: Number(it.price) || 0,
                image: it.image || ''
            }));
        }
        if (delivery && typeof delivery === 'object') {
            tx.delivery = {
                type: delivery.type || '',
                name: delivery.name || '',
                phone: delivery.phone || '',
                address: delivery.address || '',
                contactType: delivery.contactType || '',
                contact: delivery.contact || '',
                note: delivery.note || ''
            };
        }
        const arr = Array.isArray(u.transactions) ? u.transactions.slice() : [];
        arr.unshift(tx);
        u.transactions = arr.slice(0, MAX_TX);
        list[i] = u;
        saveUsers(list);

        try {
            const cur = JSON.parse(localStorage.getItem('currentUser') || 'null');
            if (cur && (cur.email === u.email || cur.username === u.username)) {
                cur.balance = bal;
                localStorage.setItem('currentUser', JSON.stringify(cur));
            }
        } catch (_) {}
        return u;
    }

    function getTransactions(userOrRef) {
        const u = userOrRef.transactions ? userOrRef : getUserRecord(userOrRef);
        if (!u) return [];
        return (u.transactions || []).slice(0, MAX_TX);
    }

    function effectivePrice(p) {
        const price = Number(p.price) || 0;
        const sale = Number(p.sale) || 0;
        if (sale > 0 && (price <= 0 || sale < price)) return sale;
        return price;
    }

    window.WalletAPI = {
        MAX_TX,
        loadUsers,
        saveUsers,
        getUserRecord,
        pushTransaction,
        getTransactions,
        typeLabel,
        effectivePrice
    };
})();
