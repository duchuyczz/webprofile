// ========== BẢO VỆ ADMIN — phiên riêng (adminSession), độc lập với đăng nhập người dùng ==========
let __adminUser = null;
try {
    __adminUser = JSON.parse(localStorage.getItem('adminSession') || 'null');
} catch (_) {}
if (!__adminUser || __adminUser.role !== 'admin') {
    window.location.replace('logadmin.html');
    throw new Error('Unauthorized');
}

// ========== THEME ==========
const html = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');
const settingsThemeBtn = document.getElementById('settings-theme');

function getPreferredTheme() {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

setTheme(getPreferredTheme());

function toggleTheme() {
    const current = html.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
}

if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
if (settingsThemeBtn) settingsThemeBtn.addEventListener('click', toggleTheme);

// ========== SIDEBAR / PANELS ==========
const sidebar = document.getElementById('admin-sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebarLinks = document.querySelectorAll('.sidebar-link');
const panels = document.querySelectorAll('.panel');
const topbarTitle = document.getElementById('topbar-title');

const titles = {
    dashboard: 'Tổng quan',
    profile: 'Thông tin cá nhân',
    projects: 'Quản lý sản phẩm',
    messages: 'Tin nhắn',
    orders: 'Đơn hàng',
    users: 'Người dùng',
    settings: 'Cài đặt'
};

sidebarLinks.forEach(link => {
    link.addEventListener('click', () => {
        const panelId = link.dataset.panel;
        sidebarLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        panels.forEach(p => p.classList.remove('active'));
        const target = document.getElementById('panel-' + panelId);
        if (target) target.classList.add('active');
        if (topbarTitle) topbarTitle.textContent = titles[panelId] || 'Admin';
        if (window.innerWidth <= 768) sidebar.classList.remove('open');
    });
});

if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
}

// ========== DEMO DATA (localStorage) ==========
const DEFAULT_PROJECTS = [
    {
        id: 1,
        name: 'Portfolio cá nhân',
        desc: 'Trang giới thiệu bản thân, học vấn và sản phẩm.',
        detail: 'Portfolio cá nhân được xây dựng bằng HTML, CSS và JavaScript thuần. Bao gồm trang chủ, form liên hệ, đăng nhập người dùng và khu vực quản trị để cập nhật thông tin, sản phẩm và tin nhắn.',
        image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80',
        tags: ['HTML', 'CSS', 'JS'],
        link: 'trangchu.html',
        price: 50000
    },
    {
        id: 2,
        name: 'Landing page demo',
        desc: 'Trang giới thiệu sản phẩm với layout responsive.',
        detail: 'Landing page tập trung vào bố cục rõ ràng, hero section, các khối tính năng và form đăng ký quan tâm. Phù hợp luyện tập responsive và hiệu ứng cuộn.',
        image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80',
        tags: ['HTML', 'CSS'],
        link: '#',
        price: 30000
    },
    {
        id: 3,
        name: 'Ứng dụng todo (demo)',
        desc: 'Quản lý công việc đơn giản bằng JavaScript.',
        detail: 'Ứng dụng todo lưu danh sách trên localStorage, hỗ trợ thêm, đánh dấu hoàn thành và xóa. Dùng để thực hành DOM và xử lý sự kiện.',
        image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&q=80',
        tags: ['JS'],
        link: '#',
        price: 20000
    }
];

const DEFAULT_MESSAGES = [
    {
        id: 1,
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@email.com',
        content: 'Chào bạn, mình thấy portfolio rất đẹp. Bạn có nhận làm freelance không?',
        time: '5 giờ trước',
        unread: true
    },
    {
        id: 2,
        name: 'Trần Thị B',
        email: 'tranthib@email.com',
        content: 'Mình đang tìm cộng sự làm dự án web. Liên hệ lại mình nhé!',
        time: 'Hôm qua',
        unread: true
    },
    {
        id: 3,
        name: 'Lê Minh C',
        email: 'leminhc@email.com',
        content: 'Chúc mừng bạn đã hoàn thành trang portfolio. Rất chuyên nghiệp!',
        time: '2 ngày trước',
        unread: false
    }
];

function loadProjects() {
    const saved = localStorage.getItem('admin_products') || localStorage.getItem('admin_projects');
    if (saved) {
        try { return JSON.parse(saved); } catch { /* fallthrough */ }
    }
    return [...DEFAULT_PROJECTS];
}

function saveProjects(list) {
    localStorage.setItem('admin_products', JSON.stringify(list));
    // giữ tương thích nếu còn code cũ
    localStorage.setItem('admin_projects', JSON.stringify(list));
}

function loadMessages() {
    const saved = localStorage.getItem('admin_messages');
    if (saved !== null) {
        try {
            return JSON.parse(saved);
        } catch {
            return [];
        }
    }
    // Lần đầu: seed demo rồi lưu lại để admin quản lý thống nhất
    const seed = [...DEFAULT_MESSAGES];
    localStorage.setItem('admin_messages', JSON.stringify(seed));
    return seed;
}

function saveMessages(list) {
    localStorage.setItem('admin_messages', JSON.stringify(list));
}

// ========== RENDER PROJECTS ==========
const projectsTbody = document.getElementById('projects-tbody');
const statProjects = document.getElementById('stat-projects');

function thumbHtml(p) {
    if (p.image) {
        return `<img class="admin-thumb" src="${escapeHtml(p.image)}" alt="" onerror="this.classList.add('broken')">`;
    }
    return `<span class="admin-thumb-empty">No img</span>`;
}

function renderProjects() {
    const list = loadProjects();
    if (statProjects) statProjects.textContent = list.length;
    if (!projectsTbody) return;

    if (!list.length) {
        projectsTbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-light);padding:24px;">Chưa có sản phẩm. Bấm “+ Thêm sản phẩm”.</td></tr>`;
        return;
    }

    projectsTbody.innerHTML = list.map((p, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>${thumbHtml(p)}</td>
            <td>
                <strong>${escapeHtml(p.name)}</strong>
                <div class="table-sub">${escapeHtml(p.desc || '')}</div>
                ${p.detail ? '<div class="table-sub muted">Đã có mô tả chi tiết</div>' : '<div class="table-sub muted">Chưa có mô tả chi tiết</div>'}
            </td>
            <td>
                <div class="tag-list">
                    ${(p.tags || []).map(t => `<span>${escapeHtml(t)}</span>`).join('')}
                </div>
            </td>
            <td>
                <div class="action-btns">
                    <button type="button" class="btn btn-ghost btn-sm" data-edit="${p.id}">Sửa</button>
                    <a class="btn btn-ghost btn-sm" href="sanpham.html?id=${p.id}" target="_blank" rel="noopener">Xem</a>
                    <button type="button" class="btn btn-danger btn-sm" data-delete="${p.id}">Xóa</button>
                </div>
            </td>
        </tr>
    `).join('');

    projectsTbody.querySelectorAll('[data-edit]').forEach(btn => {
        btn.addEventListener('click', () => openProjectModal(Number(btn.dataset.edit)));
    });
    projectsTbody.querySelectorAll('[data-delete]').forEach(btn => {
        btn.addEventListener('click', () => deleteProject(Number(btn.dataset.delete)));
    });
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// ========== PROJECT MODAL ==========
const modal = document.getElementById('project-modal');
const modalTitle = document.getElementById('modal-title');
const projectForm = document.getElementById('project-form');
const btnAddProject = document.getElementById('btn-add-project');
const modalClose = document.getElementById('modal-close');
const modalCancel = document.getElementById('modal-cancel');

function setImageStatus(text, isError) {
    const el = document.getElementById('pj-image-status');
    if (!el) return;
    el.textContent = text;
    el.style.color = isError ? '#ef4444' : '';
}

function setImagePreview(src) {
    const preview = document.getElementById('pj-image-preview');
    const hidden = document.getElementById('pj-image');
    if (!preview || !hidden) return;
    if (src) {
        hidden.value = src;
        preview.innerHTML = `<img src="${src}" alt="Xem trước">`;
        preview.classList.add('has-img');
        const fromFile = src.startsWith('data:');
        setImageStatus(fromFile ? 'Ảnh từ máy đã sẵn sàng (đã nén).' : 'Đang dùng ảnh từ URL.');
    } else {
        hidden.value = '';
        preview.innerHTML = '<span class="image-preview-hint">Kéo thả ảnh vào đây hoặc bấm chọn file</span>';
        preview.classList.remove('has-img');
        setImageStatus('Hỗ trợ JPG, PNG, WEBP, GIF · ảnh sẽ được nén trước khi lưu');
    }
}

/** Nén ảnh từ máy → base64 (max cạnh dài 900px, JPEG ~0.82) */
function fileToCompressedDataUrl(file) {
    return new Promise((resolve, reject) => {
        if (!file || !file.type.startsWith('image/')) {
            reject(new Error('File không phải ảnh'));
            return;
        }
        if (file.size > 8 * 1024 * 1024) {
            reject(new Error('Ảnh quá lớn (tối đa ~8MB). Hãy chọn ảnh nhỏ hơn.'));
            return;
        }
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Không đọc được file'));
        reader.onload = () => {
            const img = new Image();
            img.onerror = () => reject(new Error('Không tải được ảnh'));
            img.onload = () => {
                const maxSide = 900;
                let w = img.width;
                let h = img.height;
                if (w > maxSide || h > maxSide) {
                    if (w >= h) {
                        h = Math.round(h * (maxSide / w));
                        w = maxSide;
                    } else {
                        w = Math.round(w * (maxSide / h));
                        h = maxSide;
                    }
                }
                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);
                try {
                    resolve(canvas.toDataURL('image/jpeg', 0.82));
                } catch (err) {
                    reject(err);
                }
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    });
}

async function handleImageFile(file) {
    if (!file) return;
    setImageStatus('Đang xử lý ảnh…');
    try {
        const dataUrl = await fileToCompressedDataUrl(file);
        setImagePreview(dataUrl);
        const urlInput = document.getElementById('pj-image-url');
        if (urlInput) urlInput.value = '';
    } catch (err) {
        setImageStatus(err.message || 'Không xử lý được ảnh', true);
        alert(err.message || 'Không xử lý được ảnh');
    }
}

function openProjectModal(id = null) {
    const list = loadProjects();
    const fileInput = document.getElementById('pj-image-file');
    if (fileInput) fileInput.value = '';
    const viewLink = document.getElementById('pj-view-detail');

    if (id) {
        const p = list.find(x => x.id === id);
        if (!p) return;
        modalTitle.textContent = 'Sửa sản phẩm';
        document.getElementById('project-id').value = p.id;
        document.getElementById('pj-name').value = p.name || '';
        document.getElementById('pj-desc').value = p.desc || '';
        document.getElementById('pj-detail').value = p.detail || '';
        document.getElementById('pj-tags').value = (p.tags || []).join(', ');
        document.getElementById('pj-link').value = (p.link && p.link !== '#') ? p.link : '';
        const priceEl = document.getElementById('pj-price');
        if (priceEl) priceEl.value = p.price != null ? p.price : '';
        const saleEl = document.getElementById('pj-sale');
        if (saleEl) saleEl.value = p.sale != null ? p.sale : '';
        const img = p.image || '';
        setImagePreview(img);
        const urlInput = document.getElementById('pj-image-url');
        if (urlInput) {
            urlInput.value = img && !img.startsWith('data:') ? img : '';
        }
        if (viewLink) {
            viewLink.style.display = 'inline-flex';
            viewLink.href = 'sanpham.html?id=' + p.id;
        }
    } else {
        modalTitle.textContent = 'Thêm sản phẩm';
        projectForm.reset();
        document.getElementById('project-id').value = '';
        document.getElementById('pj-image').value = '';
        setImagePreview('');
        const urlInput = document.getElementById('pj-image-url');
        if (urlInput) urlInput.value = '';
        if (viewLink) {
            viewLink.style.display = 'none';
            viewLink.href = '#';
        }
    }
    modal.classList.add('open');
}

const pjImageFile = document.getElementById('pj-image-file');
if (pjImageFile) {
    pjImageFile.addEventListener('change', () => {
        const file = pjImageFile.files && pjImageFile.files[0];
        handleImageFile(file).finally(() => { pjImageFile.value = ''; });
    });
}

const pjImageClear = document.getElementById('pj-image-clear');
if (pjImageClear) {
    pjImageClear.addEventListener('click', () => {
        setImagePreview('');
        const urlInput = document.getElementById('pj-image-url');
        if (urlInput) urlInput.value = '';
        if (pjImageFile) pjImageFile.value = '';
    });
}

const pjImageUrl = document.getElementById('pj-image-url');
if (pjImageUrl) {
    const applyUrl = () => {
        const v = pjImageUrl.value.trim();
        if (v) setImagePreview(v);
    };
    pjImageUrl.addEventListener('change', applyUrl);
    pjImageUrl.addEventListener('blur', applyUrl);
}

/* Kéo thả ảnh */
const dropzone = document.getElementById('pj-dropzone');
if (dropzone) {
    ['dragenter', 'dragover'].forEach(ev => {
        dropzone.addEventListener(ev, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.add('drag-over');
        });
    });
    ['dragleave', 'drop'].forEach(ev => {
        dropzone.addEventListener(ev, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.remove('drag-over');
        });
    });
    dropzone.addEventListener('drop', (e) => {
        const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        handleImageFile(file);
    });
}

function closeModal() {
    modal.classList.remove('open');
}

if (btnAddProject) btnAddProject.addEventListener('click', () => openProjectModal());
if (modalClose) modalClose.addEventListener('click', closeModal);
if (modalCancel) modalCancel.addEventListener('click', closeModal);
if (modal) {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

if (projectForm) {
    projectForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const idVal = document.getElementById('project-id').value;
        const name = document.getElementById('pj-name').value.trim();
        const desc = document.getElementById('pj-desc').value.trim();
        const detail = document.getElementById('pj-detail').value.trim();
        let image = document.getElementById('pj-image').value.trim();
        const urlAlt = document.getElementById('pj-image-url');
        if (!image && urlAlt && urlAlt.value.trim()) image = urlAlt.value.trim();
        const tags = document.getElementById('pj-tags').value.split(',').map(t => t.trim()).filter(Boolean);
        const link = document.getElementById('pj-link').value.trim() || '#';
        const priceRaw = document.getElementById('pj-price');
        const price = priceRaw ? Math.max(0, Number(priceRaw.value) || 0) : 0;
        const saleRaw = document.getElementById('pj-sale');
        const sale = saleRaw ? Math.max(0, Number(saleRaw.value) || 0) : 0;

        if (!name || !desc) {
            alert('Vui lòng nhập tên và mô tả ngắn.');
            return;
        }

        let list = loadProjects();
        let savedId = idVal ? Number(idVal) : null;
        if (idVal) {
            const idx = list.findIndex(x => x.id === Number(idVal));
            if (idx !== -1) {
                list[idx] = { ...list[idx], name, desc, detail, image, tags, link, price, sale };
                savedId = list[idx].id;
            }
        } else {
            const newId = list.length ? Math.max(...list.map(x => x.id)) + 1 : 1;
            list.push({ id: newId, name, desc, detail, image, tags, link, price, sale });
            savedId = newId;
        }

        try {
            saveProjects(list);
        } catch (err) {
            alert('Không lưu được (có thể ảnh quá lớn, vượt giới hạn localStorage). Hãy dùng ảnh nhỏ hơn hoặc URL.');
            return;
        }

        renderProjects();
        closeModal();

        const msg = document.getElementById('product-save-msg');
        if (msg) {
            msg.style.display = 'block';
            msg.textContent = 'Đã lưu sản phẩm' + (savedId ? ' · xem: sanpham.html?id=' + savedId : '');
            setTimeout(() => { msg.style.display = 'none'; }, 4000);
        }
    });
}

function deleteProject(id) {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    let list = loadProjects().filter(x => x.id !== id);
    saveProjects(list);
    renderProjects();
}

// ========== MESSAGES ==========
const messagesList = document.getElementById('messages-list');
const messagesEmpty = document.getElementById('messages-empty');
const statMessages = document.getElementById('stat-messages');
const msgBadge = document.getElementById('msg-badge');
const msgSearch = document.getElementById('msg-search');

let msgFilter = 'all'; // all | unread | read
let msgQuery = '';

function getFilteredMessages() {
    let list = loadMessages();
    if (msgFilter === 'unread') list = list.filter(m => m.unread);
    if (msgFilter === 'read') list = list.filter(m => !m.unread);
    if (msgQuery) {
        const q = msgQuery.toLowerCase();
        list = list.filter(m =>
            (m.name || '').toLowerCase().includes(q) ||
            (m.email || '').toLowerCase().includes(q) ||
            (m.phone || '').toLowerCase().includes(q) ||
            (m.contact || '').toLowerCase().includes(q) ||
            (m.content || '').toLowerCase().includes(q)
        );
    }
    return list;
}

function renderMessages() {
    const all = loadMessages();
    const unread = all.filter(m => m.unread).length;
    if (statMessages) statMessages.textContent = unread;
    if (msgBadge) {
        msgBadge.textContent = unread;
        msgBadge.style.display = unread > 0 ? 'flex' : 'none';
    }
    if (!messagesList) return;

    const list = getFilteredMessages();

    if (all.length === 0) {
        messagesList.innerHTML = '';
        if (messagesEmpty) {
            messagesEmpty.style.display = 'block';
            messagesEmpty.textContent = 'Chưa có tin nhắn nào. Khi có người gửi form Liên hệ trên trang chủ, tin sẽ hiện tại đây.';
        }
        return;
    }

    if (list.length === 0) {
        messagesList.innerHTML = '';
        if (messagesEmpty) {
            messagesEmpty.style.display = 'block';
            messagesEmpty.textContent = 'Không có tin nhắn khớp bộ lọc / tìm kiếm.';
        }
        return;
    }

    if (messagesEmpty) messagesEmpty.style.display = 'none';

    messagesList.innerHTML = list.map(m => {
        const contactInfo = getMessageContact(m);
        const preview = (m.content || '').length > 100
            ? (m.content || '').slice(0, 100) + '…'
            : (m.content || '');
        const badges =
            (m.unread ? ' <span class="tag-new">Mới</span>' : '') +
            (m.replied ? ' <span class="tag-replied">Đã phản hồi</span>' : '');

        return `
        <div class="message-card ${m.unread ? 'unread' : ''} ${m.replied ? 'replied' : ''}" data-id="${m.id}">
            <div class="message-header">
                <strong>${escapeHtml(m.name || '')}${badges}</strong>
                <small>${escapeHtml(m.time || '')}</small>
            </div>
            <p class="message-body">${escapeHtml(preview)}</p>
            <p class="message-email">${escapeHtml(contactInfo.label)}: ${escapeHtml(contactInfo.value || '—')}</p>
            <div class="action-btns" style="margin-top:10px;">
                <button type="button" class="btn btn-primary btn-sm" data-detail="${m.id}">Chi tiết &amp; phản hồi</button>
                ${m.unread
                    ? `<button type="button" class="btn btn-ghost btn-sm" data-read="${m.id}">Đã đọc</button>`
                    : ''}
                <button type="button" class="btn btn-danger btn-sm" data-del-msg="${m.id}">Xóa</button>
            </div>
        </div>
    `;
    }).join('');

    messagesList.querySelectorAll('[data-detail]').forEach(btn => {
        btn.addEventListener('click', () => openMessageDetail(Number(btn.dataset.detail)));
    });
    messagesList.querySelectorAll('[data-read]').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = Number(btn.dataset.read);
            saveMessages(loadMessages().map(m => m.id === id ? { ...m, unread: false } : m));
            renderMessages();
        });
    });
    messagesList.querySelectorAll('[data-del-msg]').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!confirm('Xóa tin nhắn này?')) return;
            const id = Number(btn.dataset.delMsg);
            saveMessages(loadMessages().filter(m => m.id !== id));
            renderMessages();
        });
    });
}

function getMessageContact(m) {
    const value = (m.contact || m.phone || m.email || '').trim();
    const type = m.contactType || (m.phone ? 'phone' : (/^0\d{9}$/.test(value) && !value.includes('@') ? 'phone' : 'email'));
    if (type === 'phone') {
        return { type: 'phone', label: 'SĐT', value };
    }
    return { type: 'email', label: 'Email', value };
}

function buildDefaultReply(m) {
    return (
        'Xin chào ' + (m.name || '') + ',\n\n' +
        'Cảm ơn bạn đã liên hệ. Mình đã nhận được tin nhắn và sẽ hỗ trợ sớm nhất có thể.\n\n' +
        '--- Tin nhắn của bạn ---\n' +
        (m.content || '') + '\n\n' +
        'Trân trọng,\nLương Đức Huy'
    );
}

function markMessageReplied(id, extra) {
    saveMessages(loadMessages().map(m =>
        m.id === id
            ? {
                ...m,
                replied: true,
                unread: false,
                repliedAt: new Date().toLocaleString('vi-VN'),
                ...(extra || {})
            }
            : m
    ));
}

/** Đẩy phản hồi vào hộp thư khách (user_inbox) */
function pushReplyToCustomerInbox(m, body) {
    const contact = (m.contact || m.email || m.phone || '').trim();
    const userKeys = [];
    if (m.userKey) userKeys.push(m.userKey);
    if (m.username) userKeys.push(m.username);
    if (m.email) userKeys.push(m.email);
    if (contact) userKeys.push(contact);

    // API inbox dùng chung localStorage — định nghĩa inline nếu chưa load inbox.js
    const KEY = 'user_inbox';
    let list = [];
    try {
        list = JSON.parse(localStorage.getItem(KEY) || '[]');
        if (!Array.isArray(list)) list = [];
    } catch (_) { list = []; }

    const item = {
        id: Date.now() + Math.floor(Math.random() * 500),
        title: 'Phản hồi từ admin',
        body: body || '',
        contact: contact,
        userKeys: userKeys.map(k => String(k).trim().toLowerCase()).filter(Boolean),
        type: 'admin_reply',
        fromMsgId: m.id,
        time: new Date().toLocaleString('vi-VN'),
        unread: true
    };
    list.unshift(item);
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 80)));
    return item;
}

function copyText(text) {
    if (!text) return Promise.reject();
    if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve, reject) => {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try {
            document.execCommand('copy');
            resolve();
        } catch (e) {
            reject(e);
        }
        ta.remove();
    });
}

let currentDetailMsgId = null;
const msgDetailModal = document.getElementById('message-detail-modal');
const msgDetailBody = document.getElementById('msg-detail-body');
const msgDetailDelete = document.getElementById('msg-detail-delete');
const msgDetailClose = document.getElementById('msg-detail-close');
const msgDetailCancel = document.getElementById('msg-detail-cancel');
const msgDetailReplied = document.getElementById('msg-detail-replied');
const msgReplySubject = document.getElementById('msg-reply-subject');
const msgReplyBody = document.getElementById('msg-reply-body');
const msgReplySend = document.getElementById('msg-reply-send');
const msgReplyCopy = document.getElementById('msg-reply-copy');
const msgCopyContact = document.getElementById('msg-copy-contact');
const msgReplyCall = document.getElementById('msg-reply-call');
const msgReplyHint = document.getElementById('msg-reply-hint');

function openMessageDetail(id) {
    const m = loadMessages().find(x => x.id === id);
    if (!m || !msgDetailModal || !msgDetailBody) return;
    currentDetailMsgId = id;

    if (m.unread) {
        saveMessages(loadMessages().map(x => x.id === id ? { ...x, unread: false } : x));
        m.unread = false;
        renderMessages();
    }

    const c = getMessageContact(m);
    const statusParts = [];
    statusParts.push(m.unread ? 'Chưa đọc' : 'Đã đọc');
    if (m.replied) statusParts.push('Đã phản hồi' + (m.repliedAt ? ' · ' + m.repliedAt : ''));

    msgDetailBody.innerHTML = `
        <div class="msg-detail-grid">
            <div><span class="msg-detail-label">Người gửi</span><p>${escapeHtml(m.name || '—')}</p></div>
            <div><span class="msg-detail-label">Thời gian</span><p>${escapeHtml(m.time || '—')}</p></div>
            <div><span class="msg-detail-label">${escapeHtml(c.label)}</span><p>${escapeHtml(c.value || '—')}</p></div>
            <div><span class="msg-detail-label">Trạng thái</span><p>${escapeHtml(statusParts.join(' · '))}</p></div>
        </div>
        <div class="msg-detail-content">
            <span class="msg-detail-label">Nội dung khách gửi</span>
            <p>${escapeHtml(m.content || '')}</p>
        </div>
        ${m.replyText ? `
        <div class="msg-detail-content" style="margin-top:12px;border-top:1px solid var(--border);padding-top:12px;">
            <span class="msg-detail-label">Phản hồi đã gửi (hộp thư khách)</span>
            <p style="white-space:pre-wrap;">${escapeHtml(m.replyText)}</p>
        </div>` : ''}
    `;

    // Form phản hồi
    if (msgReplySubject) {
        if (c.type === 'email') {
            msgReplySubject.style.display = 'block';
            msgReplySubject.value = 'Phản hồi liên hệ từ portfolio';
        } else {
            msgReplySubject.style.display = 'none';
            msgReplySubject.value = '';
        }
    }
    if (msgReplyBody) {
        msgReplyBody.value = m.replyDraft || buildDefaultReply(m);
    }
    if (msgReplySend) {
        if (c.type === 'email' && c.value) {
            msgReplySend.style.display = 'inline-flex';
            msgReplySend.textContent = 'Mở email để gửi';
        } else if (c.type === 'phone' && c.value) {
            msgReplySend.style.display = 'inline-flex';
            msgReplySend.textContent = 'Gọi điện thoại';
        } else {
            msgReplySend.style.display = 'none';
        }
    }
    if (msgReplyCall) {
        if (c.type === 'phone' && c.value) {
            msgReplyCall.style.display = 'inline-flex';
            msgReplyCall.href = 'tel:' + c.value;
        } else {
            msgReplyCall.style.display = 'none';
            msgReplyCall.href = '#';
        }
    }
    if (msgReplyHint) {
        msgReplyHint.textContent = c.type === 'email'
            ? 'Chỉnh nội dung bên trên → “Mở email để gửi” sẽ mở app mail sẵn tiêu đề & nội dung.'
            : 'Với SĐT: có thể gọi trực tiếp, hoặc sao chép số / nội dung để nhắn Zalo, SMS…';
    }

    msgDetailModal.classList.add('open');
}

function closeMessageDetail() {
    // Lưu nháp phản hồi
    if (currentDetailMsgId != null && msgReplyBody) {
        const draft = msgReplyBody.value;
        saveMessages(loadMessages().map(m =>
            m.id === currentDetailMsgId ? { ...m, replyDraft: draft } : m
        ));
    }
    if (msgDetailModal) msgDetailModal.classList.remove('open');
    currentDetailMsgId = null;
}

if (msgDetailClose) msgDetailClose.addEventListener('click', closeMessageDetail);
if (msgDetailCancel) msgDetailCancel.addEventListener('click', closeMessageDetail);
if (msgDetailModal) {
    msgDetailModal.addEventListener('click', (e) => {
        if (e.target === msgDetailModal) closeMessageDetail();
    });
}

const msgReplyToInbox = document.getElementById('msg-reply-to-inbox');
if (msgReplyToInbox) {
    msgReplyToInbox.addEventListener('click', () => {
        if (currentDetailMsgId == null) return;
        const m = loadMessages().find(x => x.id === currentDetailMsgId);
        if (!m) return;
        const body = (msgReplyBody && msgReplyBody.value.trim()) || '';
        if (!body) {
            alert('Vui lòng nhập nội dung phản hồi.');
            return;
        }
        pushReplyToCustomerInbox(m, body);
        markMessageReplied(currentDetailMsgId, { replyText: body, replyDraft: body });
        renderMessages();
        openMessageDetail(currentDetailMsgId);
        alert('Đã gửi phản hồi vào hộp thư khách.\nKhách đăng nhập (cùng email/SĐT/tài khoản) sẽ thấy tin trong Hộp thư.');
    });
}

if (msgReplySend) {
    msgReplySend.addEventListener('click', () => {
        if (currentDetailMsgId == null) return;
        const m = loadMessages().find(x => x.id === currentDetailMsgId);
        if (!m) return;
        const c = getMessageContact(m);
        const body = (msgReplyBody && msgReplyBody.value) || buildDefaultReply(m);
        const subject = (msgReplySubject && msgReplySubject.value) || 'Phản hồi liên hệ từ portfolio';

        // Vẫn đẩy vào hộp thư khi mở mail/gọi (để khách có bản ghi)
        pushReplyToCustomerInbox(m, body);
        markMessageReplied(currentDetailMsgId, { replyText: body });

        if (c.type === 'email' && c.value) {
            const href = 'mailto:' + encodeURIComponent(c.value) +
                '?subject=' + encodeURIComponent(subject) +
                '&body=' + encodeURIComponent(body);
            window.location.href = href;
            renderMessages();
            openMessageDetail(currentDetailMsgId);
        } else if ((c.type === 'phone' || c.type === 'zalo') && c.value) {
            window.location.href = 'tel:' + c.value;
            renderMessages();
            openMessageDetail(currentDetailMsgId);
        } else {
            renderMessages();
            openMessageDetail(currentDetailMsgId);
            alert('Đã lưu phản hồi vào hộp thư khách.');
        }
    });
}

if (msgReplyCopy) {
    msgReplyCopy.addEventListener('click', () => {
        const text = msgReplyBody ? msgReplyBody.value : '';
        copyText(text).then(() => {
            msgReplyCopy.textContent = 'Đã sao chép!';
            setTimeout(() => { msgReplyCopy.textContent = 'Sao chép nội dung'; }, 1500);
        }).catch(() => alert('Không sao chép được.'));
    });
}

if (msgCopyContact) {
    msgCopyContact.addEventListener('click', () => {
        if (currentDetailMsgId == null) return;
        const m = loadMessages().find(x => x.id === currentDetailMsgId);
        if (!m) return;
        const c = getMessageContact(m);
        copyText(c.value).then(() => {
            msgCopyContact.textContent = 'Đã sao chép!';
            setTimeout(() => { msgCopyContact.textContent = 'Sao chép liên hệ'; }, 1500);
        }).catch(() => alert('Không sao chép được.'));
    });
}

if (msgReplyCall) {
    msgReplyCall.addEventListener('click', () => {
        if (currentDetailMsgId == null) return;
        markMessageReplied(currentDetailMsgId);
        renderMessages();
    });
}

if (msgDetailReplied) {
    msgDetailReplied.addEventListener('click', () => {
        if (currentDetailMsgId == null) return;
        const m = loadMessages().find(x => x.id === currentDetailMsgId);
        const body = (msgReplyBody && msgReplyBody.value.trim()) || (m && m.replyDraft) || '';
        if (m && body) pushReplyToCustomerInbox(m, body);
        markMessageReplied(currentDetailMsgId, body ? { replyText: body } : {});
        renderMessages();
        openMessageDetail(currentDetailMsgId);
        if (body) alert('Đã đánh dấu phản hồi và gửi vào hộp thư khách.');
    });
}

if (msgDetailDelete) {
    msgDetailDelete.addEventListener('click', () => {
        if (currentDetailMsgId == null) return;
        if (!confirm('Xóa tin nhắn này?')) return;
        saveMessages(loadMessages().filter(m => m.id !== currentDetailMsgId));
        currentDetailMsgId = null;
        if (msgDetailModal) msgDetailModal.classList.remove('open');
        renderMessages();
    });
}

document.querySelectorAll('.msg-filter').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.msg-filter').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        msgFilter = btn.dataset.filter || 'all';
        renderMessages();
    });
});

if (msgSearch) {
    msgSearch.addEventListener('input', () => {
        msgQuery = msgSearch.value.trim();
        renderMessages();
    });
}

const btnMarkAllRead = document.getElementById('btn-mark-all-read');
if (btnMarkAllRead) {
    btnMarkAllRead.addEventListener('click', () => {
        saveMessages(loadMessages().map(m => ({ ...m, unread: false })));
        renderMessages();
    });
}

const btnClearMessages = document.getElementById('btn-clear-messages');
if (btnClearMessages) {
    btnClearMessages.addEventListener('click', () => {
        if (!confirm('Xóa toàn bộ tin nhắn?')) return;
        saveMessages([]);
        renderMessages();
    });
}

// ========== USERS — tài khoản con / duyệt đăng ký ==========
const usersTbody = document.getElementById('users-tbody');
const statUsers = document.getElementById('stat-users');

// Cache users trong bộ nhớ để các chỗ gọi sync vẫn hoạt động
let __usersCache = null;

function loadAppUsers() {
    if (Array.isArray(__usersCache)) return __usersCache.slice();
    try {
        return JSON.parse(localStorage.getItem('users') || '[]');
    } catch {
        return [];
    }
}

/** Đồng bộ users từ JSONBin (gọi khi vào trang admin) */
async function syncUsersFromRemote() {
    if (!window.RemoteUsers) return loadAppUsers();
    try {
        const list = await window.RemoteUsers.fetchUsers();
        __usersCache = Array.isArray(list) ? list : [];
        localStorage.setItem('users', JSON.stringify(__usersCache));
        return __usersCache.slice();
    } catch (e) {
        console.warn('syncUsersFromRemote failed', e);
        return loadAppUsers();
    }
}

// ========== PHÁT THÔNG BÁO (chọn 1 hoặc nhiều tài khoản) ==========
const broadcastModal = document.getElementById('broadcast-modal');
const broadcastUserList = document.getElementById('broadcast-user-list');
const btnBroadcast = document.getElementById('btn-broadcast');

function openBroadcastModal() {
    if (!broadcastModal || !broadcastUserList) return;
    const users = loadAppUsers().filter(u => u.status !== 'pending' && u.role !== 'admin');
    if (!users.length) {
        broadcastUserList.innerHTML = '<p style="padding:12px;color:var(--text-light);margin:0;">Chưa có tài khoản active. Duyệt / tạo user ở mục Người dùng trước.</p>';
    } else {
        broadcastUserList.innerHTML = users.map(u => {
            const key = u.username || u.email || String(u.id);
            const label = (u.fullname || u.username || 'User') +
                (u.email ? ' · ' + u.email : '') +
                (u.username ? ' · @' + u.username : '');
            return (
                '<label style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:8px;cursor:pointer;font-size:0.9rem;">' +
                '<input type="checkbox" class="broadcast-user-cb" value="' + escapeHtml(key) + '" data-email="' + escapeHtml(u.email || '') + '" data-username="' + escapeHtml(u.username || '') + '">' +
                '<span>' + escapeHtml(label) + '</span></label>'
            );
        }).join('');
    }
    const titleEl = document.getElementById('broadcast-title');
    const bodyEl = document.getElementById('broadcast-body');
    if (titleEl) titleEl.value = '';
    if (bodyEl) bodyEl.value = '';
    broadcastModal.classList.add('open');
}

function closeBroadcastModal() {
    if (broadcastModal) broadcastModal.classList.remove('open');
}

function sendBroadcast() {
    const title = (document.getElementById('broadcast-title')?.value || '').trim() || 'Thông báo từ admin';
    const body = (document.getElementById('broadcast-body')?.value || '').trim();
    if (!body) {
        alert('Vui lòng nhập nội dung thông báo.');
        return;
    }
    const checked = Array.from(document.querySelectorAll('.broadcast-user-cb:checked'));
    if (!checked.length) {
        alert('Chọn ít nhất một tài khoản nhận thông báo.');
        return;
    }

    let inbox = [];
    try {
        inbox = JSON.parse(localStorage.getItem('user_inbox') || '[]');
        if (!Array.isArray(inbox)) inbox = [];
    } catch (_) { inbox = []; }

    const timeStr = new Date().toLocaleString('vi-VN');
    let count = 0;
    checked.forEach((cb, i) => {
        const keys = [
            cb.value,
            cb.dataset.email || '',
            cb.dataset.username || ''
        ].map(k => String(k).trim().toLowerCase()).filter(Boolean);
        inbox.unshift({
            id: Date.now() + i + Math.floor(Math.random() * 100),
            title,
            body,
            contact: cb.dataset.email || cb.value || '',
            userKeys: keys,
            type: 'broadcast',
            time: timeStr,
            unread: true
        });
        count++;
    });
    localStorage.setItem('user_inbox', JSON.stringify(inbox.slice(0, 80)));
    closeBroadcastModal();
    alert('Đã gửi thông báo tới ' + count + ' tài khoản.\nKhách xem trong Hộp thư khi đăng nhập.');
}

if (btnBroadcast) btnBroadcast.addEventListener('click', openBroadcastModal);
document.getElementById('broadcast-close')?.addEventListener('click', closeBroadcastModal);
document.getElementById('broadcast-cancel')?.addEventListener('click', closeBroadcastModal);
document.getElementById('broadcast-send')?.addEventListener('click', sendBroadcast);
document.getElementById('broadcast-select-all')?.addEventListener('click', () => {
    document.querySelectorAll('.broadcast-user-cb').forEach(cb => { cb.checked = true; });
});
document.getElementById('broadcast-clear-all')?.addEventListener('click', () => {
    document.querySelectorAll('.broadcast-user-cb').forEach(cb => { cb.checked = false; });
});
broadcastModal?.addEventListener('click', (e) => {
    if (e.target === broadcastModal) closeBroadcastModal();
});

function saveAppUsers(list) {
    const arr = Array.isArray(list) ? list : [];
    __usersCache = arr.slice();
    localStorage.setItem('users', JSON.stringify(arr));
    // Ghi lên JSONBin (không chặn UI)
    if (window.RemoteUsers) {
        window.RemoteUsers.saveUsers(arr).catch(err => {
            console.error('Lỗi lưu users lên JSONBin:', err);
        });
    }
}

function userStatusLabel(u) {
    if (u.role === 'Admin') return 'Admin';
    if (!u.status || u.status === 'active') return 'Đã kích hoạt';
    if (u.status === 'pending') return 'Chờ duyệt';
    return u.status;
}

function renderUsers() {
    let users = loadAppUsers();
    const pending = users.filter(u => u.status === 'pending').length;
    if (statUsers) statUsers.textContent = String(users.filter(u => u.status !== 'pending').length);
    if (!usersTbody) return;

    if (!users.length) {
        usersTbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text-light);padding:20px;">Chưa có yêu cầu / tài khoản nào.</td></tr>`;
        return;
    }

    // Ưu tiên hiện pending trước
    users = [...users].sort((a, b) => {
        const pa = a.status === 'pending' ? 0 : 1;
        const pb = b.status === 'pending' ? 0 : 1;
        return pa - pb;
    });

    usersTbody.innerHTML = users.map((u, i) => {
        const st = userStatusLabel(u);
        const isPending = u.status === 'pending';
        const isActive = !u.status || u.status === 'active';
        const bal = (Number(u.balance) || 0).toLocaleString('vi-VN') + ' đ';
        const key = u.id || u.email;
        const actions = isPending
            ? `<button type="button" class="btn btn-primary btn-sm" data-activate="${key}">Duyệt</button>
               <button type="button" class="btn btn-danger btn-sm" data-del-user="${key}">Từ chối</button>`
            : `<button type="button" class="btn btn-primary btn-sm" data-add-money="${key}">+ Tiền</button>
               <button type="button" class="btn btn-danger btn-sm" data-sub-money="${key}">− Tiền</button>
               <button type="button" class="btn btn-ghost btn-sm" data-tx="${key}">Lịch sử</button>
               <button type="button" class="btn btn-ghost btn-sm" data-del-user="${key}">Xóa</button>`;
        return `
        <tr>
            <td>${i + 1}</td>
            <td>${escapeHtml(u.fullname || u.name || '—')}</td>
            <td>${escapeHtml(u.email || u.username || '—')}</td>
            <td>${bal}</td>
            <td><span class="user-status ${isPending ? 'pending' : (isActive ? 'active' : '')}">${escapeHtml(st)}</span></td>
            <td><div class="action-btns">${actions}</div></td>
        </tr>`;
    }).join('');

    usersTbody.querySelectorAll('[data-activate]').forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.dataset.activate;
            const list = loadAppUsers().map(u => {
                if (String(u.id) === key || u.email === key) {
                    return { ...u, status: 'active', balance: Number(u.balance) || 0 };
                }
                return u;
            });
            saveAppUsers(list);
            renderUsers();
            alert('Đã kích hoạt tài khoản. Người dùng có thể đăng nhập.');
        });
    });

    usersTbody.querySelectorAll('[data-add-money]').forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.dataset.addMoney;
            const amountStr = prompt('Nhập số tiền cần cộng (VNĐ):', '50000');
            if (amountStr == null) return;
            const amount = Number(String(amountStr).replace(/[^\d.-]/g, ''));
            if (!amount || amount <= 0) {
                alert('Số tiền không hợp lệ.');
                return;
            }
            const list = loadAppUsers();
            const idx = list.findIndex(u => String(u.id) === key || u.email === key);
            if (idx < 0) return;
            const u = list[idx];
            const bal = (Number(u.balance) || 0) + amount;
            u.balance = bal;
            const tx = {
                id: Date.now(),
                type: 'admin_add',
                amount: amount,
                note: 'Admin cộng tiền',
                time: new Date().toLocaleString('vi-VN'),
                balanceAfter: bal
            };
            const arr = Array.isArray(u.transactions) ? u.transactions.slice() : [];
            arr.unshift(tx);
            u.transactions = arr.slice(0, 5);
            list[idx] = u;
            saveAppUsers(list);
            renderUsers();
            alert('Đã cộng ' + amount.toLocaleString('vi-VN') + ' đ. Giao dịch đã ghi (tối đa 5 gần nhất).');
        });
    });

    usersTbody.querySelectorAll('[data-sub-money]').forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.dataset.subMoney;
            const list = loadAppUsers();
            const idx = list.findIndex(u => String(u.id) === key || u.email === key);
            if (idx < 0) return;
            const currentBal = Number(list[idx].balance) || 0;
            if (currentBal <= 0) {
                alert('Tài khoản đang có số dư 0 — không thể trừ thêm.');
                return;
            }
            const amountStr = prompt(
                'Trừ tiền (xử lý gian lận).\nSố dư hiện tại: ' + currentBal.toLocaleString('vi-VN') + ' đ\nNhập số tiền cần trừ:',
                String(Math.min(50000, currentBal))
            );
            if (amountStr == null) return;
            let amount = Number(String(amountStr).replace(/[^\d.-]/g, ''));
            if (!amount || amount <= 0) {
                alert('Số tiền không hợp lệ.');
                return;
            }
            if (amount > currentBal) {
                if (!confirm('Số trừ lớn hơn số dư. Trừ hết về 0?')) return;
                amount = currentBal;
            } else if (!confirm('Xác nhận trừ ' + amount.toLocaleString('vi-VN') + ' đ khỏi tài khoản này?')) {
                return;
            }
            const reason = prompt('Lý do trừ tiền (ghi vào lịch sử):', 'Xử lý tài khoản gian lận') || 'Admin trừ tiền';
            const u = list[idx];
            const bal = Math.max(0, currentBal - amount);
            u.balance = bal;
            const tx = {
                id: Date.now(),
                type: 'admin_deduct',
                amount: -amount,
                note: reason,
                time: new Date().toLocaleString('vi-VN'),
                balanceAfter: bal
            };
            const arr = Array.isArray(u.transactions) ? u.transactions.slice() : [];
            arr.unshift(tx);
            u.transactions = arr.slice(0, 5);
            list[idx] = u;
            saveAppUsers(list);
            renderUsers();
            alert('Đã trừ ' + amount.toLocaleString('vi-VN') + ' đ. Số dư còn: ' + bal.toLocaleString('vi-VN') + ' đ.');
        });
    });

    usersTbody.querySelectorAll('[data-tx]').forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.dataset.tx;
            const u = loadAppUsers().find(x => String(x.id) === key || x.email === key);
            if (!u) return;
            const txs = (u.transactions || []).slice(0, 5);
            if (!txs.length) {
                alert('Tài khoản này chưa có giao dịch.\n(Hệ thống chỉ lưu tối đa 5 giao dịch gần nhất.)');
                return;
            }
            const lines = txs.map((t, i) => {
                const sign = t.amount >= 0 ? '+' : '';
                return (i + 1) + '. ' + (t.time || '') + ' | ' + (t.note || t.type || '') + ' | ' + sign + (t.amount || 0).toLocaleString('vi-VN') + ' đ | SD: ' + (t.balanceAfter || 0).toLocaleString('vi-VN') + ' đ';
            });
            alert('Lịch sử (tối đa 5) — ' + (u.email || u.username) + '\n\n' + lines.join('\n'));
        });
    });

    usersTbody.querySelectorAll('[data-del-user]').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!confirm('Xóa tài khoản / yêu cầu này?')) return;
            const key = btn.dataset.delUser;
            saveAppUsers(loadAppUsers().filter(u => String(u.id) !== key && u.email !== key));
            renderUsers();
        });
    });

    // Badge pending trên sidebar nếu có
    const userBtn = document.querySelector('.sidebar-link[data-panel="users"]');
    if (userBtn) {
        let badge = userBtn.querySelector('.msg-badge');
        if (pending > 0) {
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'msg-badge';
                userBtn.appendChild(badge);
            }
            badge.textContent = pending;
        } else if (badge) {
            badge.remove();
        }
    }
}

const userModal = document.getElementById('user-modal');
const userForm = document.getElementById('user-form');
const btnAddUser = document.getElementById('btn-add-user');
const userModalClose = document.getElementById('user-modal-close');
const userModalCancel = document.getElementById('user-modal-cancel');

function openUserModal() {
    if (userForm) userForm.reset();
    if (userModal) userModal.classList.add('open');
}
function closeUserModal() {
    if (userModal) userModal.classList.remove('open');
}

if (btnAddUser) btnAddUser.addEventListener('click', openUserModal);
if (userModalClose) userModalClose.addEventListener('click', closeUserModal);
if (userModalCancel) userModalCancel.addEventListener('click', closeUserModal);
if (userModal) {
    userModal.addEventListener('click', (e) => { if (e.target === userModal) closeUserModal(); });
}

if (userForm) {
    userForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const fullname = document.getElementById('user-fullname').value.trim();
        const usernameEl = document.getElementById('user-username');
        const username = (usernameEl ? usernameEl.value : '').trim();
        const email = document.getElementById('user-email').value.trim();
        const password = document.getElementById('user-password').value;

        if (!fullname) {
            alert('Vui lòng nhập họ tên.');
            return;
        }
        if (!username || username.length < 6) {
            alert('Tên tài khoản phải có ít nhất 6 ký tự.');
            return;
        }
        if (!/^[A-Za-z0-9._\-]{6,32}$/.test(username)) {
            alert('Tên tài khoản chỉ gồm chữ, số và . _ -');
            return;
        }
        if (!password || password.length < 6) {
            alert('Mật khẩu tối thiểu 6 ký tự.');
            return;
        }

        const list = loadAppUsers();
        if (list.some(u =>
            String(u.username || '').toLowerCase() === username.toLowerCase() ||
            (email && u.email && String(u.email).toLowerCase() === email.toLowerCase())
        )) {
            alert('Tên tài khoản hoặc email đã tồn tại.');
            return;
        }

        list.push({
            id: Date.now(),
            username,
            fullname,
            email: email || '',
            password,
            role: 'user',
            status: 'active',
            balance: 0,
            createdAt: new Date().toISOString().slice(0, 10)
        });
        saveAppUsers(list);
        closeUserModal();
        renderUsers();
        alert('Đã tạo tài khoản thành công!\nNgười dùng có thể đăng nhập bằng tên tài khoản: ' + username);
    });
}

// ========== PROFILE FORM ==========
const profileForm = document.getElementById('profile-form');
const profileMsg = document.getElementById('profile-msg');

if (profileForm) {
    // Load saved profile if any
    try {
        const saved = JSON.parse(localStorage.getItem('admin_profile') || 'null');
        if (saved) {
            if (saved.name) document.getElementById('pf-name').value = saved.name;
            if (saved.age) document.getElementById('pf-age').value = saved.age;
            if (saved.job) document.getElementById('pf-job').value = saved.job;
            if (saved.school) document.getElementById('pf-school').value = saved.school;
            if (saved.address) document.getElementById('pf-address').value = saved.address;
            if (saved.bio) document.getElementById('pf-bio').value = saved.bio;
            if (saved.github) document.getElementById('pf-github').value = saved.github;
        }
    } catch (_) {}

    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = {
            name: document.getElementById('pf-name').value.trim(),
            age: document.getElementById('pf-age').value,
            job: document.getElementById('pf-job').value.trim(),
            school: document.getElementById('pf-school').value.trim(),
            address: document.getElementById('pf-address').value.trim(),
            bio: document.getElementById('pf-bio').value.trim(),
            github: document.getElementById('pf-github').value.trim()
        };
        localStorage.setItem('admin_profile', JSON.stringify(data));
        if (profileMsg) {
            profileMsg.textContent = 'Đã lưu thành công!';
            setTimeout(() => { profileMsg.textContent = ''; }, 2500);
        }
    });
}

// ========== ĐƠN HÀNG (admin_orders) ==========
function loadOrders() {
    try {
        const list = JSON.parse(localStorage.getItem('admin_orders') || '[]');
        return Array.isArray(list) ? list : [];
    } catch {
        return [];
    }
}

function saveOrders(list) {
    localStorage.setItem('admin_orders', JSON.stringify(list));
}

function orderStatusLabel(s) {
    const map = {
        pending: 'Chờ xử lý',
        processing: 'Đang xử lý',
        done: 'Hoàn thành',
        cancelled: 'Đã hủy'
    };
    return map[s] || s || '—';
}

function orderStatusClass(s) {
    if (s === 'done') return 'user-status active';
    if (s === 'cancelled') return 'user-status';
    if (s === 'processing') return 'user-status pending';
    return 'user-status pending';
}

const ordersTbody = document.getElementById('orders-tbody');
const ordersEmpty = document.getElementById('orders-empty');
const orderBadge = document.getElementById('order-badge');
const orderDetailModal = document.getElementById('order-detail-modal');
const orderDetailBody = document.getElementById('order-detail-body');
const orderDetailTitle = document.getElementById('order-detail-title');
let currentOrderId = null;

function escapeOrderHtml(s) {
    return String(s || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function updateOrderBadge() {
    const pending = loadOrders().filter(o => o.status === 'pending' || o.status === 'processing').length;
    if (!orderBadge) return;
    if (pending > 0) {
        orderBadge.hidden = false;
        orderBadge.textContent = String(pending);
    } else {
        orderBadge.hidden = true;
        orderBadge.textContent = '0';
    }
}

/** Doanh thu = tổng tiền các đơn trạng thái hoàn thành (done) */
function updateRevenueStat() {
    const el = document.getElementById('stat-revenue');
    if (!el) return;
    const done = loadOrders().filter(o => o.status === 'done');
    const total = done.reduce((s, o) => s + (Number(o.total) || 0), 0);
    el.textContent = total.toLocaleString('vi-VN') + ' đ';
}

function renderOrders() {
    const list = loadOrders();
    updateOrderBadge();
    updateRevenueStat();
    if (!ordersTbody) return;
    if (!list.length) {
        ordersTbody.innerHTML = '';
        if (ordersEmpty) ordersEmpty.style.display = 'block';
        return;
    }
    if (ordersEmpty) ordersEmpty.style.display = 'none';
    ordersTbody.innerHTML = list.map(o => {
        const d = o.delivery || {};
        const typeLabel = d.type === 'digital' ? 'Phi vật lý' : 'Vật lý';
        const customer = (o.user && (o.user.fullname || o.user.username || o.user.email)) || d.name || '—';
        return `
            <tr>
                <td>#${escapeOrderHtml(String(o.id))}</td>
                <td>${escapeOrderHtml(customer)}</td>
                <td>${typeLabel}</td>
                <td>${(Number(o.total) || 0).toLocaleString('vi-VN')} đ</td>
                <td><span class="${orderStatusClass(o.status)}">${orderStatusLabel(o.status)}</span></td>
                <td>${escapeOrderHtml(o.time || '')}</td>
                <td>
                    <button type="button" class="btn btn-ghost btn-sm" data-order-view="${o.id}">Xem</button>
                </td>
            </tr>
        `;
    }).join('');

    ordersTbody.querySelectorAll('[data-order-view]').forEach(btn => {
        btn.addEventListener('click', () => openOrderDetail(btn.dataset.orderView));
    });
}

function openOrderDetail(id) {
    const list = loadOrders();
    const o = list.find(x => String(x.id) === String(id));
    if (!o || !orderDetailModal) return;
    currentOrderId = o.id;
    const d = o.delivery || {};
    const u = o.user || {};
    const items = Array.isArray(o.items) ? o.items : [];
    if (orderDetailTitle) orderDetailTitle.textContent = 'Đơn #' + o.id;

    let itemsHtml = '';
    if (items.length) {
        itemsHtml = '<ul style="margin:8px 0;padding-left:18px;font-size:0.9rem;">' +
            items.map(it => {
                const qty = Number(it.qty) || 1;
                const price = Number(it.price) || 0;
                return `<li>${escapeOrderHtml(it.name || 'SP')} × ${qty} — ${(price * qty).toLocaleString('vi-VN')} đ</li>`;
            }).join('') + '</ul>';
    }

    const isPhysical = d.type === 'physical';
    const deliveryHtml = `
        <div style="margin-top:10px;padding:12px;border:1px solid var(--border);border-radius:12px;background:var(--bg-alt);font-size:0.9rem;">
            <p style="margin:0 0 6px;"><strong>Nhận hàng:</strong> ${isPhysical ? 'Vật lý' : 'Phi vật lý'}</p>
            <p style="margin:0 0 4px;"><strong>Người nhận:</strong> ${escapeOrderHtml(d.name || '—')}</p>
            ${isPhysical
                ? `<p style="margin:0 0 4px;"><strong>SĐT:</strong> ${escapeOrderHtml(d.phone || '—')}</p>
                   <p style="margin:0 0 4px;"><strong>Địa chỉ:</strong> ${escapeOrderHtml(d.address || '—')}</p>`
                : `<p style="margin:0 0 4px;"><strong>${d.contactType === 'zalo' ? 'Zalo' : 'Email'}:</strong> ${escapeOrderHtml(d.contact || '—')}</p>`
            }
            ${d.note ? `<p style="margin:0;"><strong>Ghi chú KH:</strong> ${escapeOrderHtml(d.note)}</p>` : ''}
        </div>
    `;

    if (orderDetailBody) {
        orderDetailBody.innerHTML = `
            <p style="margin:0 0 4px;font-size:0.9rem;"><strong>Khách:</strong> ${escapeOrderHtml(u.fullname || u.username || '—')}
                ${u.email ? ' · ' + escapeOrderHtml(u.email) : ''}
                ${u.username ? ' · @' + escapeOrderHtml(u.username) : ''}
            </p>
            <p style="margin:0 0 4px;font-size:0.9rem;"><strong>Thời gian:</strong> ${escapeOrderHtml(o.time || '')}</p>
            <p style="margin:0 0 4px;font-size:0.9rem;"><strong>Trạng thái:</strong> ${orderStatusLabel(o.status)}</p>
            <p style="margin:0 0 4px;font-size:0.9rem;"><strong>Tổng tiền:</strong> ${(Number(o.total) || 0).toLocaleString('vi-VN')} đ</p>
            <p style="margin:8px 0 0;font-size:0.9rem;"><strong>Sản phẩm:</strong></p>
            ${itemsHtml || '<p style="color:var(--text-light);">Không có SP</p>'}
            ${deliveryHtml}
        `;
    }
    orderDetailModal.classList.add('open');
}

function closeOrderDetail() {
    if (orderDetailModal) orderDetailModal.classList.remove('open');
    currentOrderId = null;
}

function setOrderStatus(status) {
    if (currentOrderId == null) return;
    const list = loadOrders();
    const i = list.findIndex(x => String(x.id) === String(currentOrderId));
    if (i < 0) return;
    list[i].status = status;
    saveOrders(list);
    renderOrders();
    openOrderDetail(currentOrderId);
}

document.getElementById('btn-refresh-orders')?.addEventListener('click', renderOrders);
document.getElementById('order-detail-close')?.addEventListener('click', closeOrderDetail);
document.getElementById('order-detail-cancel')?.addEventListener('click', closeOrderDetail);
document.getElementById('order-detail-delete')?.addEventListener('click', () => {
    if (currentOrderId == null || !confirm('Xóa đơn này?')) return;
    saveOrders(loadOrders().filter(x => String(x.id) !== String(currentOrderId)));
    closeOrderDetail();
    renderOrders();
});
document.querySelectorAll('[data-order-status]').forEach(btn => {
    btn.addEventListener('click', () => setOrderStatus(btn.dataset.orderStatus));
});
orderDetailModal?.addEventListener('click', e => {
    if (e.target === orderDetailModal) closeOrderDetail();
});

// ========== SETTINGS — Reset dữ liệu (giữ tài khoản + số dư) ==========
const btnReset = document.getElementById('btn-reset-data');
if (btnReset) {
    btnReset.addEventListener('click', () => {
        const ok = confirm(
            'Reset dữ liệu server?\n\n' +
            'Sẽ XÓA:\n' +
            '• Tin nhắn liên hệ\n' +
            '• Đơn hàng\n' +
            '• Hộp thư / thông báo khách\n' +
            '• Lịch sử giao dịch của mọi tài khoản\n' +
            '• Giỏ hàng tạm\n\n' +
            'GIỮ NGUYÊN:\n' +
            '• Tài khoản người dùng\n' +
            '• Số dư\n' +
            '• Sản phẩm\n\n' +
            'Tiếp tục?'
        );
        if (!ok) return;

        // Tin nhắn, đơn hàng, hộp thư
        localStorage.removeItem('admin_messages');
        localStorage.removeItem('admin_orders');
        localStorage.removeItem('user_inbox');

        // Xóa giỏ hàng theo user (cart_*)
        try {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && (k.indexOf('cart_') === 0)) keysToRemove.push(k);
            }
            keysToRemove.forEach(k => localStorage.removeItem(k));
        } catch (_) {}

        // Xóa lịch sử giao dịch, giữ user + balance
        try {
            const users = loadAppUsers();
            const cleaned = users.map(u => {
                const copy = { ...u };
                copy.transactions = [];
                // Đảm bảo balance vẫn là số
                copy.balance = Number(copy.balance) || 0;
                return copy;
            });
            saveAppUsers(cleaned);
        } catch (_) {}

        // Cập nhật currentUser nếu đang mở (xóa tx không ảnh hưởng balance đã lưu)
        try {
            const cur = JSON.parse(localStorage.getItem('currentUser') || 'null');
            if (cur && cur.role === 'user') {
                const list = loadAppUsers();
                const full = list.find(u =>
                    u.email === cur.email || u.username === cur.username
                );
                if (full) {
                    cur.balance = Number(full.balance) || 0;
                    localStorage.setItem('currentUser', JSON.stringify(cur));
                }
            }
        } catch (_) {}

        renderMessages();
        renderOrders();
        renderUsers();
        if (typeof updateRevenueStat === 'function') updateRevenueStat();
        if (typeof updateOrderBadge === 'function') updateOrderBadge();

        alert(
            'Đã reset dữ liệu server.\n' +
            'Đã xóa: tin nhắn, đơn hàng, thông báo, lịch sử giao dịch, giỏ hàng.\n' +
            'Đã giữ: tài khoản và số dư.'
        );
    });
}

// ========== LOGOUT ADMIN ==========
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('adminSession');
        window.location.href = 'logadmin.html';
    });
}

// ========== INIT ==========
renderProjects();
renderMessages();
renderOrders();

// Đồng bộ users từ JSONBin rồi mới render (để thấy tài khoản đã tạo từ máy khác)
(async function initUsers() {
    try {
        await syncUsersFromRemote();
    } catch (e) {
        console.warn(e);
    }
    renderUsers();
})();
