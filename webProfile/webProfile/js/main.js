// ========== DARK MODE ==========
const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;

// Kiểm tra theme đã lưu hoặc theo hệ thống
function getPreferredTheme() {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

// Áp dụng theme ngay khi load
setTheme(getPreferredTheme());

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const current = html.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        setTheme(next);
    });
}

// ========== MENU TOGGLE (hamburger 3 gạch) ==========
const menuToggle = document.getElementById('menu-toggle');
const nav = document.getElementById('nav');

function closeMenu() {
    if (!nav || !menuToggle) return;
    nav.classList.remove('active');
    menuToggle.classList.remove('active');
}

function toggleMenu() {
    if (!nav || !menuToggle) return;
    nav.classList.toggle('active');
    menuToggle.classList.toggle('active');
}

if (menuToggle && nav) {
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => closeMenu());
    });

    // Đóng khi click ra ngoài
    document.addEventListener('click', (e) => {
        if (!nav.classList.contains('active')) return;
        if (nav.contains(e.target) || menuToggle.contains(e.target)) return;
        closeMenu();
    });

    // Đóng khi nhấn Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMenu();
    });
}

// ========== ACTIVE NAV LINK KHI SCROLL ==========
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function highlightNav() {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', highlightNav);

// ========== HEADER SHADOW KHI SCROLL ==========
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
    } else {
        header.style.boxShadow = 'none';
    }
});

// ========== SCROLL REVEAL ANIMATION ==========
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Chỉ animate 1 lần
            revealObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));

// ========== PROGRESS BAR ANIMATION ==========
const progressBars = document.querySelectorAll('.progress');

const progressObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const bar = entry.target;
            const width = bar.getAttribute('data-width') || 0;
            bar.style.width = width + '%';
            progressObserver.unobserve(bar);
        }
    });
}, {
    threshold: 0.5
});

progressBars.forEach(bar => progressObserver.observe(bar));

// ========== TOAST ==========
function showToast(message, type = 'success', title = '') {
    const wrap = document.getElementById('toast-wrap');
    if (!wrap) {
        alert((title ? title + '\n' : '') + message);
        return;
    }
    const icons = {
        success: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
        error: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
        info: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
    };
    const el = document.createElement('div');
    el.className = 'toast toast-' + type;
    el.innerHTML = `
        ${icons[type] || icons.info}
        <div class="toast-body">${title ? '<strong>' + title + '</strong>' : ''}${message}</div>
        <button type="button" class="toast-close" aria-label="Đóng">&times;</button>
    `;
    wrap.appendChild(el);
    const remove = () => {
        el.classList.add('hiding');
        setTimeout(() => el.remove(), 250);
    };
    el.querySelector('.toast-close').addEventListener('click', remove);
    setTimeout(remove, 4200);
}

// ========== FORM CONTACT → lưu admin, toast cho user ==========
function parseContactValue(raw) {
    const value = String(raw || '').trim();
    if (value.length < 3) return { ok: false };
    const digits = value.replace(/[\s.\-()]/g, '');
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    const isPhone = /^(0|\+84)\d{8,11}$/.test(digits) || /^0\d{9,10}$/.test(digits);
    if (isEmail) return { ok: true, type: 'email', value: value };
    if (isPhone) return { ok: true, type: 'phone', value: digits.replace(/^\+84/, '0') };
    // Chấp nhận Zalo / liên hệ khác (≥ 6 ký tự)
    if (value.length >= 6) return { ok: true, type: 'zalo', value: value };
    return { ok: true, type: 'other', value: value };
}

function submitContactForm() {
    const nameEl = document.getElementById('cf-name') || document.getElementById('name');
    const contactEl = document.getElementById('cf-contact') || document.getElementById('contact');
    const messageEl = document.getElementById('cf-message') || document.getElementById('message');
    const subjectEl = document.getElementById('cf-subject') || document.getElementById('subject');
    const form = document.getElementById('contact-form');
    const submitBtn = document.getElementById('cf-submit') || (form && form.querySelector('button[type="submit"]'));

    const name = nameEl ? nameEl.value.trim() : '';
    const contactRaw = contactEl ? contactEl.value.trim() : '';
    const message = messageEl ? messageEl.value.trim() : '';
    const subject = subjectEl ? subjectEl.value.trim() : '';

    if (!name || !contactRaw || !message) {
        if (typeof showToast === 'function') {
            showToast('Vui lòng điền họ tên, liên hệ và nội dung.', 'error', 'Thiếu thông tin');
        } else {
            alert('Vui lòng điền họ tên, liên hệ và nội dung.');
        }
        return false;
    }

    const contact = parseContactValue(contactRaw);
    if (!contact.ok) {
        if (typeof showToast === 'function') {
            showToast('Liên hệ quá ngắn. Nhập email, SĐT hoặc Zalo.', 'error', 'Sai định dạng');
        } else {
            alert('Liên hệ không hợp lệ.');
        }
        return false;
    }

    let messages = [];
    try {
        messages = JSON.parse(localStorage.getItem('admin_messages') || '[]');
    } catch (_) {}
    if (!Array.isArray(messages)) messages = [];

    const now = new Date();
    const timeStr = now.toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
    const content = (subject ? '[' + subject + '] ' : '') + message;

    let curUser = null;
    try { curUser = JSON.parse(localStorage.getItem('currentUser') || 'null'); } catch (_) {}
    const userKey = curUser && curUser.role === 'user'
        ? (curUser.username || curUser.email || '')
        : '';

    messages.unshift({
        id: Date.now(),
        name,
        subject: subject || '',
        email: contact.type === 'email' ? contact.value : ((curUser && curUser.email) || ''),
        phone: (contact.type === 'phone' || contact.type === 'zalo') ? contact.value : '',
        contact: contact.value,
        contactType: contact.type,
        content,
        time: timeStr,
        unread: true,
        userKey: userKey || '',
        username: (curUser && curUser.username) || ''
    });
    localStorage.setItem('admin_messages', JSON.stringify(messages.slice(0, 100)));

    if (userKey) {
        try {
            const KEY = 'user_inbox';
            let inbox = JSON.parse(localStorage.getItem(KEY) || '[]');
            if (!Array.isArray(inbox)) inbox = [];
            inbox.unshift({
                id: Date.now() + 1,
                title: 'Đã gửi liên hệ',
                body: 'Bạn đã gửi: "' + content.slice(0, 120) + (content.length > 120 ? '…' : '') + '"\nAdmin sẽ phản hồi vào hộp thư này.',
                contact: contact.value,
                userKeys: [String(userKey).toLowerCase(), String(contact.value).toLowerCase()].filter(Boolean),
                type: 'system',
                time: timeStr,
                unread: true
            });
            localStorage.setItem(KEY, JSON.stringify(inbox.slice(0, 80)));
            if (window.InboxAPI) InboxAPI.updateNavBadge();
        } catch (_) {}
    }

    if (submitBtn) {
        submitBtn.disabled = true;
        const oldText = submitBtn.textContent;
        submitBtn.textContent = 'Đã gửi ✓';
        setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = oldText || 'Gửi tin nhắn';
        }, 2000);
    }

    if (typeof showToast === 'function') {
        showToast(
            userKey
                ? 'Tin đã gửi. Xem phản hồi sau tại Hộp thư.'
                : 'Tin đã gửi tới quản trị thành công!',
            'success',
            'Gửi thành công'
        );
    } else {
        alert('Gửi tin nhắn thành công!');
    }

    if (form) form.reset();
    return true;
}

(function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        e.stopPropagation();
        submitContactForm();
    });

    const btn = document.getElementById('cf-submit');
    if (btn) {
        btn.addEventListener('click', function (e) {
            // Dự phòng nếu submit event bị chặn
            if (e && e.detail === 0) return;
        });
    }
})();

// ========== SCROLL PROGRESS + BACK TO TOP ==========
const scrollProgress = document.getElementById('scroll-progress');
const backToTop = document.getElementById('back-to-top');

function updateScrollUI() {
    const doc = document.documentElement;
    const scrollTop = window.scrollY || doc.scrollTop;
    const height = doc.scrollHeight - doc.clientHeight;
    if (scrollProgress && height > 0) {
        scrollProgress.style.width = Math.min(100, (scrollTop / height) * 100) + '%';
    }
    if (backToTop) {
        if (scrollTop > 400) backToTop.classList.add('visible');
        else backToTop.classList.remove('visible');
    }
}

window.addEventListener('scroll', updateScrollUI, { passive: true });
updateScrollUI();

if (backToTop) {
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ========== ĐỒNG BỘ DỮ LIỆU TỪ ADMIN (localStorage) ==========
(function syncFromAdmin() {
    function esc(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // --- Profile ---
    let profile = null;
    try {
        profile = JSON.parse(localStorage.getItem('admin_profile') || 'null');
    } catch (_) {}

    if (profile) {
        const setText = (id, val) => {
            const el = document.getElementById(id);
            if (el && val != null && val !== '') el.textContent = val;
        };

        if (profile.name) {
            setText('dyn-hero-name', profile.name);
            setText('dyn-logo', profile.name);
            setText('dyn-about-name', profile.name);
            setText('dyn-info-name', profile.name);
            const footer = document.querySelector('footer p');
            if (footer) footer.textContent = `© 2026 ${profile.name}. All rights reserved.`;
            document.title = `${profile.name} | Portfolio`;
        }
        if (profile.age) {
            setText('dyn-about-age', profile.age);
            setText('dyn-info-age', profile.age);
        }
        if (profile.job) {
            setText('dyn-info-job', profile.job);
            setText('dyn-hero-title', profile.job);
        }
        if (profile.address) setText('dyn-info-address', profile.address);
        if (profile.bio) setText('dyn-about-bio', profile.bio);
        if (profile.school) {
            const schoolEl = document.getElementById('dyn-edu-school');
            const majorEl = document.getElementById('dyn-edu-major');
            const metaEl = document.getElementById('dyn-edu-meta');
            if (schoolEl) {
                const parts = profile.school.split(/[–—]/).map(s => s.trim());
                schoolEl.textContent = parts[0] || profile.school;
                if (majorEl && parts[1]) majorEl.textContent = parts[1];
                else if (majorEl) majorEl.textContent = profile.school;
            }
            if (metaEl) {
                metaEl.textContent = (profile.job || 'Sinh viên') + ' · ' + (profile.address || 'Quy Nhơn');
            }
            if (profile.job) {
                const heroDesc = document.getElementById('dyn-hero-desc');
                if (heroDesc) {
                    heroDesc.textContent = `${profile.job} tại ${profile.school}. Quan tâm bảo mật hệ thống, mạng máy tính và hoàn thiện kỹ năng mỗi ngày.`;
                }
            }
        }
        if (profile.github) {
            const gh = document.getElementById('dyn-info-github');
            if (gh) {
                gh.href = profile.github;
                try {
                    const u = new URL(profile.github);
                    gh.textContent = u.hostname.replace('www.', '') + u.pathname.replace(/\/$/, '');
                } catch {
                    gh.textContent = profile.github;
                }
            }
        }
    }

    // --- Sản phẩm (products) + lọc theo tag + ảnh ---
    const DEFAULT_PRODUCTS = [
        {
            id: 1,
            name: 'Portfolio cá nhân',
            desc: 'Trang giới thiệu bản thân, học vấn và sản phẩm.',
            detail: 'Portfolio cá nhân được xây dựng bằng HTML, CSS và JavaScript thuần. Bao gồm trang chủ, form liên hệ, đăng nhập người dùng và khu vực quản trị.',
            image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80',
            tags: ['HTML', 'CSS', 'JS'],
            link: 'trangchu.html',
            price: 50000
        },
        {
            id: 2,
            name: 'Landing page demo',
            desc: 'Trang giới thiệu sản phẩm với layout responsive.',
            detail: 'Landing page với hero, khối tính năng và form đăng ký. Luyện tập responsive và hiệu ứng cuộn.',
            image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80',
            tags: ['HTML', 'CSS'],
            link: '#',
            price: 30000
        },
        {
            id: 3,
            name: 'Ứng dụng todo (demo)',
            desc: 'Quản lý công việc đơn giản bằng JavaScript.',
            detail: 'Todo list lưu trên localStorage: thêm, hoàn thành, xóa. Thực hành DOM và sự kiện.',
            image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&q=80',
            tags: ['JS', 'API'],
            link: '#',
            price: 20000
        }
    ];

    let products = DEFAULT_PRODUCTS;
    try {
        const saved = localStorage.getItem('admin_products') || localStorage.getItem('admin_projects');
        if (saved) products = JSON.parse(saved);
    } catch (_) {}

    const grid = document.getElementById('dyn-products-grid');
    const filtersEl = document.getElementById('product-filters');
    const emptyEl = document.getElementById('products-empty');
    let activeTag = 'all';

    function productImageHtml(p, index) {
        if (p.image) {
            return `<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy" onerror="this.parentElement.classList.add('no-img');this.remove();">`;
        }
        return `<span class="project-image-placeholder">Sản phẩm ${index + 1}</span>`;
    }

    function collectTags(list) {
        const set = new Set();
        list.forEach(p => (p.tags || []).forEach(t => set.add(t)));
        return Array.from(set);
    }

    function renderFilters() {
        if (!filtersEl) return;
        const tags = collectTags(products);
        filtersEl.innerHTML = '<button type="button" class="filter-chip active" data-tag="all">Tất cả</button>' +
            tags.map(t => `<button type="button" class="filter-chip" data-tag="${esc(t)}">${esc(t)}</button>`).join('');
        filtersEl.querySelectorAll('.filter-chip').forEach(btn => {
            btn.addEventListener('click', () => {
                filtersEl.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeTag = btn.dataset.tag || 'all';
                renderProductCards();
            });
        });
    }

    function renderProductCards() {
        if (!grid) return;
        const list = activeTag === 'all'
            ? products
            : products.filter(p => (p.tags || []).some(t => t.toLowerCase() === activeTag.toLowerCase()));

        if (emptyEl) emptyEl.hidden = list.length > 0;

        grid.innerHTML = list.map((p, i) => {
            const delay = i === 0 ? '' : ` delay-${Math.min(i, 3)}`;
            const tags = (p.tags || []).map(t => `<span>${esc(t)}</span>`).join('');
            const detailUrl = 'sanpham.html?id=' + encodeURIComponent(p.id);
            return `
                <article class="project-card reveal${delay}" data-product-id="${p.id}">
                    <a href="${detailUrl}" class="project-image-link">
                        <div class="project-image">${productImageHtml(p, i)}</div>
                    </a>
                    <div class="project-info">
                        <h3><a href="${detailUrl}">${esc(p.name)}</a></h3>
                        <p>${esc(p.desc)}</p>
                        ${(() => {
                            const price = Number(p.price) || 0;
                            const sale = Number(p.sale) || 0;
                            const eff = (sale > 0 && (price <= 0 || sale < price)) ? sale : price;
                            if (sale > 0 && price > sale) {
                                return `<p class="product-price"><span class="price-old">${price.toLocaleString('vi-VN')} đ</span> ${eff.toLocaleString('vi-VN')} đ</p>`;
                            }
                            return `<p class="product-price">${eff.toLocaleString('vi-VN')} đ</p>`;
                        })()}
                        <div class="project-tags">${tags}</div>
                        <div class="project-actions">
                            <a href="${detailUrl}" class="project-link">Xem chi tiết →</a>
                            <button type="button" class="btn btn-ghost btn-sm btn-add-cart" data-add-cart="${p.id}">Thêm giỏ</button>
                        </div>
                    </div>
                </article>
            `;
        }).join('');

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

        grid.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

        grid.querySelectorAll('[data-add-cart]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = Number(btn.dataset.addCart);
                const product = products.find(x => Number(x.id) === id);
                if (product && window.CartAPI) CartAPI.addToCart(product);
            });
        });
    }

    renderFilters();
    renderProductCards();
})();

// ========== NAV: user + logout ==========
(function () {
    let user = null;
    try { user = JSON.parse(localStorage.getItem('currentUser') || 'null'); } catch (_) {}
    const navUser = document.getElementById('nav-user');
    const navAccount = document.getElementById('nav-account');
    const navLogin = document.getElementById('nav-login');
    const navRegister = document.getElementById('nav-register');
    const navLogout = document.getElementById('nav-logout');
    if (user && user.role === 'user') {
        let bal = Number(user.balance) || 0;
        try {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const full = users.find(u => u.email === user.email || u.username === user.username);
            if (full) bal = Number(full.balance) || 0;
        } catch (_) {}
        if (navUser) {
            navUser.hidden = false;
            navUser.textContent = (user.fullname || user.username || 'User') + ' · ' + bal.toLocaleString('vi-VN') + 'đ';
        }
        if (navAccount) navAccount.hidden = false;
        const navInbox = document.getElementById('nav-inbox');
        if (navInbox) navInbox.hidden = false;
        if (navLogin) navLogin.hidden = true;
        if (navRegister) navRegister.hidden = true;
        if (navLogout) navLogout.hidden = false;
        if (window.InboxAPI) InboxAPI.updateNavBadge();
    }
    if (navLogout) {
        navLogout.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            window.location.reload();
        });
    }
})();
