const API_URL = 'http://localhost:3000/api/auth';

// ========== ĐĂNG NHẬP ==========
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        try {
            const res = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || 'Đăng nhập thất bại');
                return;
            }

            // Lưu thông tin user (có thể dùng localStorage hoặc sessionStorage)
            localStorage.setItem('user', JSON.stringify(data.user));
            alert('Đăng nhập thành công!');
            window.location.href = 'trangchu.html';
        } catch (err) {
            console.error(err);
            alert('Không kết nối được server. Hãy kiểm tra backend đang chạy chưa.');
        }
    });
}

// ========== ĐĂNG KÝ ==========
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fullname = document.getElementById('fullname').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirm = document.getElementById('confirm').value;

        if (password !== confirm) {
            alert('Mật khẩu xác nhận không khớp!');
            return;
        }

        try {
            const res = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullname, email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || 'Đăng ký thất bại');
                return;
            }

            alert(data.message);
            window.location.href = 'dangnhap.html';
        } catch (err) {
            console.error(err);
            alert('Không kết nối được server.');
        }
    });
}