// Trang tài khoản người dùng
(function () {
    let user = null;
    try {
        user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    } catch (_) {}

    if (!user || user.role !== 'user') {
        alert('Vui lòng đăng nhập.');
        window.location.href = 'dangnhap.html';
        return;
    }

    if (!window.WalletAPI) {
        alert('Không tải được module ví.');
        return;
    }

    const full = WalletAPI.getUserRecord(user);
    if (!full) {
        alert('Không tìm thấy tài khoản.');
        return;
    }

    user = { ...user, balance: Number(full.balance) || 0 };
    localStorage.setItem('currentUser', JSON.stringify(user));

    const nameEl = document.getElementById('account-name');
    const metaEl = document.getElementById('account-meta');
    const balEl = document.getElementById('account-balance');
    const listEl = document.getElementById('tx-list');
    const modal = document.getElementById('tx-modal');
    const modalBody = document.getElementById('tx-modal-body');
    const modalTitle = document.getElementById('tx-modal-title');

    const displayName =
        full.fullname || user.fullname || full.username || user.username || 'Người dùng';
    const emailLine = full.email || user.email || '';
    const userLine = full.username || user.username || '';

    if (nameEl) nameEl.textContent = displayName;
    if (metaEl) {
        if (emailLine && emailLine !== displayName) {
            metaEl.textContent = emailLine;
        } else if (userLine && userLine !== displayName) {
            metaEl.textContent = userLine;
        } else {
            metaEl.textContent = emailLine || userLine || '—';
        }
    }
    if (balEl) {
        balEl.textContent = (Number(full.balance) || 0).toLocaleString('vi-VN') + ' đ';
    }

    function esc(s) {
        return String(s || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    const txs = WalletAPI.getTransactions(full);

    function openTxDetail(tx) {
        if (!modal || !modalBody) return;
        const items = Array.isArray(tx.items) ? tx.items : [];
        if (modalTitle) {
            modalTitle.textContent = tx.type === 'purchase' ? 'Chi tiết đơn hàng' : 'Chi tiết giao dịch';
        }

        let html = `
            <div class="tx-detail-meta">
                <p><strong>Loại:</strong> ${esc(WalletAPI.typeLabel(tx.type))}</p>
                <p><strong>Thời gian:</strong> ${esc(tx.time || '—')}</p>
                <p><strong>Số tiền:</strong> <span class="${(tx.amount || 0) >= 0 ? 'tx-plus' : 'tx-minus'}">${(tx.amount || 0) >= 0 ? '+' : ''}${(tx.amount || 0).toLocaleString('vi-VN')} đ</span></p>
                <p><strong>Số dư sau:</strong> ${(tx.balanceAfter || 0).toLocaleString('vi-VN')} đ</p>
                ${tx.orderId ? `<p><strong>Mã đơn:</strong> #${esc(String(tx.orderId))}</p>` : ''}
                ${tx.note ? `<p><strong>Ghi chú SP:</strong> ${esc(tx.note)}</p>` : ''}
            </div>
        `;

        const d = tx.delivery;
        if (d && (d.name || d.address || d.contact)) {
            const isPhysical = d.type === 'physical';
            html += `
                <div class="tx-detail-delivery">
                    <h4>Thông tin nhận hàng</h4>
                    <p><strong>Loại:</strong> ${isPhysical ? 'Hàng vật lý' : 'Phi vật lý'}</p>
                    <p><strong>Người nhận:</strong> ${esc(d.name || '—')}</p>
                    ${isPhysical
                        ? `<p><strong>SĐT:</strong> ${esc(d.phone || '—')}</p>
                           <p><strong>Địa chỉ:</strong> ${esc(d.address || '—')}</p>`
                        : `<p><strong>${d.contactType === 'zalo' ? 'Zalo' : 'Email'}:</strong> ${esc(d.contact || '—')}</p>`
                    }
                    ${d.note ? `<p><strong>Ghi chú:</strong> ${esc(d.note)}</p>` : ''}
                </div>
            `;
        }

        if (items.length) {
            let sum = 0;
            html += '<ul class="tx-detail-items">';
            items.forEach(it => {
                const qty = Number(it.qty) || 1;
                const price = Number(it.price) || 0;
                const line = price * qty;
                sum += line;
                const img = it.image
                    ? `<img src="${esc(it.image)}" alt="" class="tx-detail-thumb">`
                    : `<span class="tx-detail-ph">SP</span>`;
                html += `
                    <li class="tx-detail-item">
                        <div class="tx-detail-img">${img}</div>
                        <div class="tx-detail-info">
                            <strong>${esc(it.name || 'Sản phẩm')}</strong>
                            <span>${price.toLocaleString('vi-VN')} đ × ${qty}</span>
                        </div>
                        <div class="tx-detail-line">${line.toLocaleString('vi-VN')} đ</div>
                    </li>
                `;
            });
            html += `</ul>
                <p class="tx-detail-total">Tổng: <strong>${sum.toLocaleString('vi-VN')} đ</strong></p>`;
        } else if (tx.type === 'purchase') {
            html += '<p class="tx-detail-empty">Không có danh sách sản phẩm (giao dịch cũ trước khi cập nhật).</p>';
        }

        modalBody.innerHTML = html;
        modal.hidden = false;
        document.body.style.overflow = 'hidden';
    }

    function closeTxModal() {
        if (!modal) return;
        modal.hidden = true;
        document.body.style.overflow = '';
    }

    if (listEl) {
        if (!txs.length) {
            listEl.innerHTML = '<p class="tx-empty">Chưa có giao dịch nào.</p>';
        } else {
            listEl.innerHTML = txs.map((t, idx) => {
                const positive = (t.amount || 0) >= 0;
                const sign = positive ? '+' : '';
                const cls = positive ? 'tx-plus' : 'tx-minus';
                const iconCls = positive ? 'plus' : 'minus';
                const icon = positive ? '+' : '−';
                const hasItems = Array.isArray(t.items) && t.items.length > 0;
                const canDetail = t.type === 'purchase' || hasItems || t.note;
                return `
                    <article class="tx-item" data-tx-idx="${idx}">
                        <div class="tx-icon ${iconCls}" aria-hidden="true">${icon}</div>
                        <div class="tx-body">
                            <strong>${esc(WalletAPI.typeLabel(t.type))}</strong>
                            <p>${esc(t.note || '')}</p>
                            <small>${esc(t.time || '')}</small>
                            ${canDetail ? `<button type="button" class="tx-detail-btn" data-tx-detail="${idx}">Xem chi tiết</button>` : ''}
                        </div>
                        <div class="tx-right">
                            <span class="${cls}">${sign}${(t.amount || 0).toLocaleString('vi-VN')} đ</span>
                            <small>SD: ${(t.balanceAfter || 0).toLocaleString('vi-VN')} đ</small>
                        </div>
                    </article>
                `;
            }).join('');

            listEl.querySelectorAll('[data-tx-detail]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const i = Number(btn.dataset.txDetail);
                    if (txs[i]) openTxDetail(txs[i]);
                });
            });
        }
    }

    document.querySelectorAll('[data-close-tx-modal]').forEach(el => {
        el.addEventListener('click', closeTxModal);
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeTxModal();
    });

    // Hộp thư mini
    const inboxList = document.getElementById('account-inbox-list');
    const inboxCount = document.getElementById('account-inbox-count');
    if (window.InboxAPI && inboxList) {
        const notes = InboxAPI.listForUser(user).slice(0, 3);
        const unread = InboxAPI.unreadCount(user);
        if (inboxCount) {
            inboxCount.textContent = String(unread);
            inboxCount.hidden = unread === 0;
        }
        InboxAPI.updateNavBadge();
        if (!notes.length) {
            inboxList.innerHTML = '<p class="tx-empty" style="padding:16px;">Chưa có tin. Admin phản hồi form liên hệ sẽ hiện ở đây.</p>';
        } else {
            inboxList.innerHTML = notes.map(n => {
                return '<article class="inbox-card ' + (n.unread ? 'unread' : '') + '">' +
                    '<div class="inbox-card-main">' +
                    '<div class="inbox-card-top"><strong>' + esc(n.title || 'Thông báo') + '</strong>' +
                    (n.unread ? '<span class="inbox-dot">Mới</span>' : '') + '</div>' +
                    '<p class="inbox-preview">' + esc((n.body || '').slice(0, 80)) + ((n.body || '').length > 80 ? '…' : '') + '</p>' +
                    '<small>' + esc(n.time || '') + '</small></div>' +
                    '<a href="hopthu.html" class="btn btn-ghost btn-sm">Mở</a></article>';
            }).join('');
        }
    }

    document.getElementById('btn-logout-acc')?.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'trangchu.html';
    });
})();
