/**
 * Quản lý danh sách users dùng chung qua JSONBin.
 * Bin hiện tại dùng dạng: { "users": [ ... ] }
 * Nếu chưa cấu hình JSONBin → fallback về localStorage (để test local).
 */
(function () {
    const CFG = (window.APP_CONFIG && window.APP_CONFIG.jsonbin) || {};
    const BIN_ID = (CFG.binId || '').trim();
    const MASTER_KEY = (CFG.masterKey || '').trim();
    const isConfigured = BIN_ID && MASTER_KEY &&
        BIN_ID !== 'YOUR_BIN_ID' &&
        MASTER_KEY !== 'YOUR_JSONBIN_MASTER_KEY';

    const API = 'https://api.jsonbin.io/v3/b/' + BIN_ID;

    function extractList(record) {
        if (Array.isArray(record)) return record;
        if (record && Array.isArray(record.users)) return record.users;
        return [];
    }

    async function fetchUsers() {
        if (!isConfigured) {
            try {
                return JSON.parse(localStorage.getItem('users') || '[]');
            } catch {
                return [];
            }
        }
        try {
            const res = await fetch(API + '/latest', {
                method: 'GET',
                headers: {
                    'X-Master-Key': MASTER_KEY
                }
            });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const data = await res.json();
            return extractList(data.record);
        } catch (err) {
            console.warn('Không đọc được JSONBin, dùng localStorage:', err);
            try {
                return JSON.parse(localStorage.getItem('users') || '[]');
            } catch {
                return [];
            }
        }
    }

    async function saveUsers(list) {
        const arr = Array.isArray(list) ? list : [];
        // Luôn ghi local để dự phòng
        try {
            localStorage.setItem('users', JSON.stringify(arr));
        } catch (_) {}

        if (!isConfigured) return true;

        try {
            // Lưu đúng format { users: [...] } để khớp với Bin hiện tại
            const res = await fetch(API, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': MASTER_KEY
                },
                body: JSON.stringify({ users: arr })
            });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return true;
        } catch (err) {
            console.error('Lỗi lưu JSONBin:', err);
            alert('Không lưu được lên server (JSONBin). Dữ liệu chỉ được lưu tạm trên trình duyệt này.');
            return false;
        }
    }

    // Export ra global
    window.RemoteUsers = {
        isConfigured,
        fetchUsers,
        saveUsers
    };
})();
