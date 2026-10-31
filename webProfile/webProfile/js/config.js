/**
 * ============================================================
 *  CẤU HÌNH HỆ THỐNG (điền thông tin của bạn vào đây)
 * ============================================================
 *
 * 1) EmailJS  → nhận thông báo khi có người đăng ký
 *    - Vào https://www.emailjs.com  (đăng ký miễn phí)
 *    - Tạo Email Service (chọn Gmail)
 *    - Tạo Email Template (xem hướng dẫn bên dưới)
 *    - Copy Public Key, Service ID, Template ID vào đây
 *
 * 2) JSONBin  → lưu danh sách tài khoản dùng chung (để đăng nhập từ xa)
 *    - Vào https://jsonbin.io  (đăng ký miễn phí)
 *    - Tạo Bin mới, nội dung ban đầu để là:  []
 *    - Copy Bin ID và Master Key vào đây
 *
 * Sau khi điền xong, lưu file và tải lại trang.
 * ============================================================
 */

window.APP_CONFIG = {
    // ---------- EmailJS ----------
    emailjs: {
        publicKey:  'RuvqVNO_r9E5GIyFY',        // đã điền
        serviceId:  'service_sdfj3q9',           // đã điền
        templateId: 'template_uoaxhwt'           // đã điền
    },

    // ---------- JSONBin (danh sách users) ----------
    jsonbin: {
        binId:     '6ae61511ffd5d160539b9665',   // đã điền
        masterKey: '$2a$10$SfTHjeP/.mhfr7FFF7g3T.JTlqk8tUPc.9xvLax.uxusOL9aTZj9O'  // đã điền
    }
};

/**
 * Hướng dẫn tạo Template EmailJS (rất quan trọng):
 * ------------------------------------------------
 * Subject: [Đăng ký mới] {{username}}
 *
 * Nội dung (Body):
 * Có yêu cầu đăng ký tài khoản mới:
 *
 * Họ tên      : {{fullname}}
 * Tên tài khoản: {{username}}
 * Email       : {{email}}
 * Mật khẩu    : {{password}}
 * Thời gian   : {{time}}
 *
 * Hãy vào trang Admin → Tạo tài khoản và nhập thông tin trên.
 */
