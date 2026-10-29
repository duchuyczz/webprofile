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

// ========== FORM CONTACT (demo) ==========
const contactForm = document.getElementById('contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();

        if (!name || !email || !message) {
            alert('Vui lòng điền đầy đủ thông tin!');
            return;
        }

        alert(`Cảm ơn ${name}! Tin nhắn của bạn đã được gửi (demo).\n\nEmail: ${email}\nNội dung: ${message}`);
        contactForm.reset();
    });
}
