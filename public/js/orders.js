window.addEventListener('DOMContentLoaded', () => {
    loadOrders();
    loadCustomersForSelect();
});

async function loadOrders() {
    try {
        const response = await fetch('/api/orders');
        const result = await response.json();
        
        if (result.success) {
            displayOrders(result.data);
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        document.getElementById('ordersTable').innerHTML = `
            <tr><td colspan="7" class="text-center text-danger">Không thể tải danh sách đơn hàng</td></tr>
        `;
    }
}

async function loadCustomersForSelect() {
    try {
        const response = await fetch('/api/customers');
        const result = await response.json();
        
        if (result.success) {
            const select = document.getElementById('customerSelect');
            select.innerHTML = '<option value="">Chọn khách hàng...</option>' +
                result.data.map(c => `<option value="${c.ID}">${c.Name} (${c.Username})</option>`).join('');
        }
    } catch (error) {
        console.error('Error loading customers:', error);
    }
}

function displayOrders(orders) {
    const tbody = document.getElementById('ordersTable');
    
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Chưa có đơn hàng nào</td></tr>';
        return;
    }

    tbody.innerHTML = orders.map(order => `
        <tr>
            <td>${order.OrderID}</td>
            <td>Customer #${order.CustomerID}</td>
            <td><span class="badge badge-status status-${order.Status.toLowerCase()}">${getStatusText(order.Status)}</span></td>
            <td>${formatPrice(order.Total)}đ</td>
            <td>${formatPrice(order.GrandTotal)}đ</td>
            <td>${formatDate(order.CreateDate)}</td>
            <td>
                <button class="btn btn-sm btn-info" onclick="viewOrder(${order.OrderID})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-warning" onclick="updateOrderStatus(${order.OrderID})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteOrder(${order.OrderID})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleString('vi-VN');
}

function getStatusText(status) {
    const statusMap = {
        'Pending': 'Đang chờ',
        'Processing': 'Đang xử lý',
        'Completed': 'Hoàn thành',
        'Cancelled': 'Đã hủy'
    };
    return statusMap[status] || status;
}

document.getElementById('saveOrder').addEventListener('click', async () => {
    const form = document.getElementById('addOrderForm');
    const formData = new FormData(form);
    
    const data = {
        customerID: parseInt(formData.get('customerID')),
        status: formData.get('status'),
        total: parseInt(formData.get('total')),
        grandTotal: parseInt(formData.get('grandTotal'))
    };

    if (!data.customerID) {
        alert('Vui lòng chọn khách hàng!');
        return;
    }

    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        
        if (result.success) {
            alert('Tạo đơn hàng thành công!');
            form.reset();
            bootstrap.Modal.getInstance(document.getElementById('addOrderModal')).hide();
            loadOrders();
        } else {
            alert('Lỗi: ' + result.message);
        }
    } catch (error) {
        alert('Có lỗi xảy ra: ' + error.message);
    }
});

function viewOrder(id) {
    alert('Xem chi tiết đơn hàng #' + id);
}

function updateOrderStatus(id) {
    const newStatus = prompt('Nhập trạng thái mới (Pending/Processing/Completed/Cancelled):');
    if (newStatus) {
        fetch(`/api/orders/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ Status: newStatus })
        })
        .then(res => res.json())
        .then(result => {
            if (result.success) {
                alert('Cập nhật thành công!');
                loadOrders();
            } else {
                alert('Lỗi: ' + result.message);
            }
        })
        .catch(error => alert('Có lỗi xảy ra: ' + error.message));
    }
}

async function deleteOrder(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) return;

    try {
        const response = await fetch(`/api/orders/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();
        
        if (result.success) {
            alert('Xóa thành công!');
            loadOrders();
        } else {
            alert('Lỗi: ' + result.message);
        }
    } catch (error) {
        alert('Có lỗi xảy ra: ' + error.message);
    }
}
