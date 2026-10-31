// ========== AUTH NGƯỜI DÙNG ==========
// Đăng ký → gửi email cho admin (EmailJS).
// Admin tạo tài khoản qua trang quản trị → lưu vào JSONBin.
// Đăng nhập → đọc danh sách users từ JSONBin (dùng chung).

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify({
        username: user.username || user.email,
        fullname: user.fullname || user.name || user.username,
        email: user.email || '',
        role: 'user',
        status: user.status || 'active',
        balance: Number(user.balance) || 0
    }));
}

function isUserActive(u) {
    if (!u.status) return true;
    return u.status === 'active';
}

function isValidUsername(name) {
    return /^[A-Za-z0-9._\-]{6,32}$/.test(name);
}

function findUserByAccount(users, account) {
    const a = String(account || '').trim().toLowerCase();
    if (!a) return null;
    return users.find(u => {
        const un = String(u.username || '').toLowerCase();
        const em = String(u.email || '').toLowerCase();
        return un === a || (em && em === a);
    }) || null;
}

// ----- ĐĂNG NHẬP -----
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const accountEl = document.getElementById('account') || document.getElementById('email');
        const account = accountEl ? accountEl.value.trim() : '';
        const password = document.getElementById('password').value;

        if (!account || !password) {
            alert('Vui lòng nhập tài khoản và mật khẩu.');
            return;
        }

        const btn = loginForm.querySelector('button[type="submit"]');
        const oldText = btn ? btn.textContent : '';
        if (btn) {
            btn.disabled = true;
            btn.textContent = 'Đang đăng nhập...';
        }

        try {
            // Ưu tiên đọc từ JSONBin (dùng chung)
            let users = [];
            if (window.RemoteUsers) {
                users = await window.RemoteUsers.fetchUsers();
            } else {
                try {
                    users = JSON.parse(localStorage.getItem('users') || '[]');
                } catch {
                    users = [];
                }
            }

            const found = users.find(
                u =>
                    (u.username === account ||
                        (u.email && u.email === account) ||
                        String(u.username || '').toLowerCase() === account.toLowerCase() ||
                        (u.email && String(u.email).toLowerCase() === account.toLowerCase())) &&
                    u.password === password
            );

            if (!found) {
                alert('Sai tài khoản hoặc mật khẩu.\nNếu chưa có tài khoản, hãy đăng ký và chờ admin tạo giúp.');
                return;
            }

            if (!isUserActive(found)) {
                alert(
                    'Tài khoản của bạn chưa được kích hoạt.\n' +
                    'Vui lòng liên hệ admin để được tạo / duyệt tài khoản trước khi đăng nhập.'
                );
                return;
            }

            setCurrentUser(found);

            let next = 'trangchu.html';
            try {
                const params = new URLSearchParams(window.location.search);
                const n = params.get('next');
                if (n) {
                    const decoded = decodeURIComponent(n);
                    if (/^[a-zA-Z0-9._\-]+\.html([?#].*)?$/.test(decoded)) {
                        next = decoded;
                    }
                }
            } catch (_) {}
            window.location.href = next;
        } catch (err) {
            console.error(err);
            alert('Có lỗi khi đăng nhập. Vui lòng thử lại.');
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.textContent = oldText;
            }
        }
    });
}

// ----- ĐĂNG KÝ = GỬI YÊU CẦU QUA EMAIL -----
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const fullname = (document.getElementById('fullname')?.value || '').trim();
        const usernameRaw = (document.getElementById('username')?.value || '').trim();
        const email = (document.getElementById('email')?.value || '').trim();
        const password = document.getElementById('password')?.value || '';
        const confirm = document.getElementById('confirm')?.value || '';

        if (!fullname) {
            alert('Vui lòng nhập họ tên.');
            return;
        }
        if (!usernameRaw) {
            alert('Vui lòng nhập tên tài khoản.');
            return;
        }
        if (usernameRaw.length < 6) {
            alert('Tên tài khoản phải có ít nhất 6 ký tự.');
            return;
        }
        if (!isValidUsername(usernameRaw)) {
            alert('Tên tài khoản chỉ gồm chữ cái, số và các ký tự . _ - (6–32 ký tự).');
            return;
        }
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert('Email không hợp lệ. Bạn có thể bỏ trống email.');
            return;
        }
        if (!password) {
            alert('Vui lòng nhập mật khẩu.');
            return;
        }
        if (password.length < 6) {
            alert('Mật khẩu phải có ít nhất 6 ký tự.');
            return;
        }
        if (password !== confirm) {
            alert('Mật khẩu xác nhận không khớp.');
            return;
        }

        const username = usernameRaw;
        const btn = registerForm.querySelector('button[type="submit"]');
        const oldText = btn ? btn.textContent : '';
        if (btn) {
            btn.disabled = true;
            btn.textContent = 'Đang gửi yêu cầu...';
        }

        try {
            // Kiểm tra trùng trên danh sách remote (nếu có)
            let users = [];
            if (window.RemoteUsers) {
                users = await window.RemoteUsers.fetchUsers();
            }

            if (findUserByAccount(users, username)) {
                alert('Tên tài khoản đã tồn tại. Hãy chọn tên khác hoặc đăng nhập.');
                return;
            }
            if (email) {
                const byEmail = users.find(
                    u => u.email && String(u.email).toLowerCase() === email.toLowerCase()
                );
                if (byEmail) {
                    alert('Email này đã có tài khoản. Hãy đăng nhập hoặc dùng email khác.');
                    return;
                }
            }

            // Gửi email thông báo cho admin qua EmailJS
            const cfg = (window.APP_CONFIG && window.APP_CONFIG.emailjs) || {};
            const publicKey = (cfg.publicKey || '').trim();
            const serviceId = (cfg.serviceId || '').trim();
            const templateId = (cfg.templateId || '').trim();

            const hasEmailJS =
                publicKey &&
                serviceId &&
                templateId &&
                publicKey !== 'YOUR_EMAILJS_PUBLIC_KEY' &&
                serviceId !== 'YOUR_SERVICE_ID' &&
                templateId !== 'YOUR_TEMPLATE_ID';

            if (hasEmailJS && window.emailjs) {
                emailjs.init(publicKey);
                await emailjs.send(serviceId, templateId, {
                    fullname: fullname,
                    username: username,
                    email: email || '(không cung cấp)',
                    password: password,
                    time: new Date().toLocaleString('vi-VN')
                });
            } else {
                // Chưa cấu hình EmailJS → vẫn cho đăng ký thành công (để test local)
                console.warn('EmailJS chưa được cấu hình. Bỏ qua gửi email.');
            }

            alert(
                'Đã gửi yêu cầu đăng ký thành công!\n\n' +
                'Tên tài khoản: ' + username + '\n' +
                (email ? 'Email: ' + email + '\n' : '') +
                '\nAdmin sẽ nhận được thông tin và tạo tài khoản giúp bạn.\n' +
                'Sau khi được tạo, hãy đăng nhập bằng tên tài khoản và mật khẩu vừa nhập.'
            );
            window.location.href = 'dangnhap.html';
        } catch (err) {
            console.error(err);
            alert(
                'Gửi yêu cầu thất bại.\n' +
                'Vui lòng thử lại hoặc liên hệ trực tiếp admin.\n\n' +
                (err && err.text ? err.text : '')
            );
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.textContent = oldText;
            }
        }
    });
}
