// Check authentication
const userData = JSON.parse(localStorage.getItem('userData'));
if (!userData) {
    window.location.href = '/login';
}

// Load customer data on page load
window.addEventListener('DOMContentLoaded', () => {
    loadCustomerProfile();
    loadCustomerOrders();
});

// Load customer profile sidebar
async function loadCustomerProfile() {
    try {
        const response = await fetch(`/api/customers/${userData.ID}`);
        const result = await response.json();
        
        if (result.success && result.data) {
            const customer = result.data;
            
            // Update sidebar
            document.getElementById('sidebarName').textContent = customer.FullName || 'Người dùng';
            document.getElementById('sidebarEmail').textContent = customer.Email || '';
        }
    } catch (error) {
        console.error('Error loading customer profile:', error);
    }
}

// Load customer orders
async function loadCustomerOrders() {
    const loadingEl = document.getElementById('ordersLoading');
    const emptyEl = document.getElementById('ordersEmpty');
    const listEl = document.getElementById('ordersList');
    
    // Show loading
    loadingEl.style.display = 'block';
    emptyEl.style.display = 'none';
    listEl.style.display = 'none';
    
    try {
        const response = await fetch(`/api/customers/${userData.ID}/orders`);
        const result = await response.json();
        
        loadingEl.style.display = 'none';
        
        if (result.success && result.data && result.data.length > 0) {
            const orderCount = displayOrders(result.data);
            document.getElementById('orderCount').textContent = `${orderCount} đơn hàng`;
        } else {
            emptyEl.style.display = 'block';
            document.getElementById('orderCount').textContent = '0 đơn hàng';
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        loadingEl.style.display = 'none';
        showAlert('Đã xảy ra lỗi khi tải đơn hàng', 'danger');
    }
}

// Display orders
function displayOrders(orders) {
    const listEl = document.getElementById('ordersList');
    listEl.style.display = 'block';
    
    // Group orders by OrderID
    const groupedOrders = {};
    orders.forEach(item => {
        if (!groupedOrders[item.OrderID]) {
            groupedOrders[item.OrderID] = {
                OrderID: item.OrderID,
                OrderDate: item.OrderDate,
                Status: item.Status,
                TotalAmount: item.TotalAmount,
                items: []
            };
        }
        groupedOrders[item.OrderID].items.push(item);
    });
    
    // Return the actual number of orders (not order items)
    const orderCount = Object.keys(groupedOrders).length;
    
    // Generate HTML
    let html = '';
    Object.values(groupedOrders).forEach(order => {
        const statusClass = order.Status.toLowerCase();
        const statusText = {
            'pending': 'Chờ xác nhận',
            'accepted': 'Đã xác nhận',
            'cancelled': 'Đã hủy'
        }[order.Status.toLowerCase()] || order.Status;
        
        const orderDate = new Date(order.OrderDate).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        html += `
            <div class="order-card">
                <div class="order-header d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-1">Đơn hàng #${order.OrderID}</h6>
                        <small class="text-muted"><i class="fas fa-calendar-alt me-1"></i>${orderDate}</small>
                    </div>
                    <span class="order-status ${statusClass}">${statusText}</span>
                </div>
                <div class="order-body">
                    ${order.items.map(item => `
                        <div class="order-item">
                            <img src="${item.ImageLink || 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400&h=300&fit=crop&q=80'}" 
                                 alt="${item.VehicleName || 'Sản phẩm'}" 
                                 class="order-item-image"
                                 onerror="this.src='https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400&h=300&fit=crop&q=80'">
                            <div class="order-item-details">
                                <div class="order-item-name">${item.VehicleName || 'Sản phẩm đã xóa'}</div>
                                <div class="order-item-info">
                                    ${item.VehicleID ? `<span class="me-3"><i class="fas fa-tag me-1"></i>${item.VehicleID}</span>` : ''}
                                    <span><i class="fas fa-box me-1"></i>Số lượng: ${item.Quantity}</span>
                                </div>
                            </div>
                            <div class="order-item-price">
                                <div class="fw-semibold">${formatPrice(item.Price)} VNĐ</div>
                                <small class="text-muted">x${item.Quantity}</small>
                                <div class="text-primary fw-bold mt-1">${formatPrice(item.Price * item.Quantity)} VNĐ</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="order-footer d-flex justify-content-between align-items-center">
                    <div>
                        <small class="text-muted">Tổng số lượng: ${order.items.reduce((sum, item) => sum + item.Quantity, 0)} sản phẩm</small>
                    </div>
                    <div class="text-end">
                        <small class="d-block text-muted mb-1">Tổng thanh toán:</small>
                        <span class="order-total">${formatPrice(order.TotalAmount)} VNĐ</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    listEl.innerHTML = html;
    
    // Return the number of orders
    return orderCount;
}

// Format price
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price);
}

// Show alert
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
    alertDiv.style.zIndex = '9999';
    alertDiv.style.minWidth = '300px';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}
