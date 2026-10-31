// ========== HỘP THƯ / THÔNG BÁO KHÁCH HÀNG ==========
// Lưu localStorage: user_inbox
(function () {
    const KEY = 'user_inbox';
    const MAX = 80;

    function loadAll() {
        try {
            const list = JSON.parse(localStorage.getItem(KEY) || '[]');
            return Array.isArray(list) ? list : [];
        } catch {
            return [];
        }
    }

    function saveAll(list) {
        localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
    }

    function normalizeKey(s) {
        return String(s || '').trim().toLowerCase();
    }

    function userMatchKeys(user) {
        if (!user) return [];
        const keys = [];
        if (user.username) keys.push(normalizeKey(user.username));
        if (user.email) keys.push(normalizeKey(user.email));
        return keys.filter(Boolean);
    }

    function matchesUser(item, user) {
        if (!user || !item) return false;
        const keys = userMatchKeys(user);
        const itemKeys = (item.userKeys || []).map(normalizeKey);
        if (keys.some(k => itemKeys.includes(k))) return true;
        const contact = normalizeKey(item.contact);
        if (contact && keys.includes(contact)) return true;
        return false;
    }

    function listForUser(user) {
        return loadAll().filter(n => matchesUser(n, user));
    }

    function unreadCount(user) {
        return listForUser(user).filter(n => n.unread).length;
    }

    /**
     * Đẩy thông báo / phản hồi vào hộp thư khách
     * @param {{ title, body, contact?, userKeys?, type?, fromMsgId? }} payload
     */
    function push(payload) {
        const list = loadAll();
        const item = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            title: payload.title || 'Thông báo',
            body: payload.body || '',
            contact: payload.contact || '',
            userKeys: Array.isArray(payload.userKeys)
                ? payload.userKeys.map(normalizeKey).filter(Boolean)
                : [],
            type: payload.type || 'admin_reply',
            fromMsgId: payload.fromMsgId || null,
            time: new Date().toLocaleString('vi-VN'),
            unread: true
        };
        // Nếu có contact mà chưa có trong userKeys → thêm
        if (item.contact && !item.userKeys.includes(normalizeKey(item.contact))) {
            item.userKeys.push(normalizeKey(item.contact));
        }
        list.unshift(item);
        saveAll(list);
        return item;
    }

    function markRead(id) {
        const list = loadAll().map(n =>
            String(n.id) === String(id) ? { ...n, unread: false } : n
        );
        saveAll(list);
    }

    function markAllRead(user) {
        const keys = userMatchKeys(user);
        const list = loadAll().map(n => {
            if (!matchesUser(n, user)) return n;
            return { ...n, unread: false };
        });
        saveAll(list);
    }

    function remove(id) {
        saveAll(loadAll().filter(n => String(n.id) !== String(id)));
    }

    function updateNavBadge() {
        let user = null;
        try { user = JSON.parse(localStorage.getItem('currentUser') || 'null'); } catch (_) {}
        const badge = document.getElementById('inbox-badge');
        if (!badge) return;
        if (!user || user.role !== 'user') {
            badge.hidden = true;
            badge.textContent = '0';
            return;
        }
        const n = unreadCount(user);
        badge.textContent = String(n);
        badge.hidden = n === 0;
    }

    window.InboxAPI = {
        loadAll,
        saveAll,
        listForUser,
        unreadCount,
        push,
        markRead,
        markAllRead,
        remove,
        updateNavBadge,
        userMatchKeys,
        matchesUser
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateNavBadge);
    } else {
        updateNavBadge();
    }
})();
