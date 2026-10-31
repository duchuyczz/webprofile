// ========== CHI TIẾT SẢN PHẨM ==========
(function () {
    const DEFAULT_PRODUCTS = [
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

    function esc(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function loadProducts() {
        try {
            const saved = localStorage.getItem('admin_products') || localStorage.getItem('admin_projects');
            if (saved) return JSON.parse(saved);
        } catch (_) {}
        return DEFAULT_PRODUCTS;
    }

    function formatPrice(product) {
        const price = Number(product.price) || 0;
        const sale = Number(product.sale) || 0;
        const eff = (sale > 0 && (price <= 0 || sale < price)) ? sale : price;
        if (sale > 0 && price > sale) {
            return `<span class="price-old">${price.toLocaleString('vi-VN')} đ</span> ${eff.toLocaleString('vi-VN')} đ`;
        }
        return `${eff.toLocaleString('vi-VN')} đ`;
    }

    const params = new URLSearchParams(window.location.search);
    const id = Number(params.get('id'));
    const box = document.getElementById('product-detail');
    if (!box) return;

    const products = loadProducts();
    const product = products.find(p => Number(p.id) === id);

    if (!product) {
        box.innerHTML = `
            <div class="detail-error">
                <p>Không tìm thấy sản phẩm.</p>
                <p><a href="trangchu.html#products" class="project-link">← Quay lại danh sách</a></p>
            </div>
        `;
        return;
    }

    document.title = product.name + ' | Lương Đức Huy';

    const tags = (product.tags || []).map(t => `<span>${esc(t)}</span>`).join('');
    const longText = product.detail || product.desc || '';
    const hasLink = product.link && product.link !== '#' && product.link !== '';

    const cover = product.image
        ? `<img src="${esc(product.image)}" alt="${esc(product.name)}" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'detail-cover-placeholder',textContent:'Không tải được ảnh'}))">`
        : `<div class="detail-cover-placeholder">Chưa có ảnh</div>`;

    box.innerHTML = `
        <div class="detail-layout">
            <div class="detail-cover">${cover}</div>
            <div class="detail-body">
                <h1>${esc(product.name)}</h1>
                <div class="detail-tags">${tags}</div>
                <p class="detail-short">${esc(product.desc || '')}</p>
                <p class="product-price" style="font-size:1.15rem;margin-bottom:12px;">${formatPrice(product)}</p>
                <div class="detail-long">${esc(longText)}</div>
                <div class="detail-actions">
                    <button type="button" class="btn btn-primary" id="detail-add-cart">Thêm vào giỏ hàng</button>
                    <a class="btn btn-outline" href="giohang.html">Xem giỏ hàng</a>
                    ${hasLink ? `<a class="btn btn-outline" href="${esc(product.link)}" target="_blank" rel="noopener noreferrer">Mở link sản phẩm</a>` : ''}
                    <a class="btn btn-outline" href="trangchu.html#products">Các sản phẩm khác</a>
                </div>
            </div>
        </div>
    `;

    const addBtn = document.getElementById('detail-add-cart');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            if (!window.CartAPI) {
                alert('Không tải được module giỏ hàng. Vui lòng tải lại trang.');
                return;
            }
            const ok = CartAPI.addToCart(product);
            if (ok && CartAPI.updateCartBadge) CartAPI.updateCartBadge();
        });
    }
})();
