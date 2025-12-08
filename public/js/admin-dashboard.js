// Admin Dashboard JavaScript

let allOrders = [];
let currentFilter = {
    status: 'all',
    startDate: null,
    endDate: null
};

// Logout function - make it global
window.logout = function() {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
        localStorage.removeItem('adminData');
        window.location.href = '/admin/login';
    }
};

// Load dashboard data
async function loadDashboard() {
    try {
        // Load statistics
        const statsResponse = await fetch('/api/admin/dashboard');
        const statsData = await statsResponse.json();
        
        if (statsData.success) {
            displayStatistics(statsData.data);
        }
        
        // Load orders
        const ordersResponse = await fetch('/api/admin/orders');
        const ordersData = await ordersResponse.json();
        
        if (ordersData.success) {
            allOrders = ordersData.data;
            displayOrders(allOrders);
        }
    } catch (error) {
        console.error('Load dashboard error:', error);
    }
}

// Display statistics cards
function displayStatistics(stats) {
    document.getElementById('totalRevenue').textContent = formatCurrency(stats.totalRevenue);
    document.getElementById('pendingOrders').textContent = stats.pendingOrders;
    document.getElementById('acceptedOrders').textContent = stats.acceptedOrders;
    document.getElementById('canceledOrders').textContent = stats.canceledOrders;
}

// Display orders table
function displayOrders(orders) {
    const tbody = document.getElementById('ordersTable');
    
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Không có đơn hàng</td></tr>';
        return;
    }
    
    tbody.innerHTML = orders.map(order => {
        let statusClass = '';
        let statusText = '';
        
        switch(order.Status) {
            case 'Pending':
                statusClass = 'bg-warning';
                statusText = 'Chờ xử lý';
                break;
            case 'Accepted':
                statusClass = 'bg-success';
                statusText = 'Đã xác nhận';
                break;
            case 'Cancel':
                statusClass = 'bg-danger';
                statusText = 'Đã hủy';
                break;
            default:
                statusClass = 'bg-secondary';
                statusText = order.Status;
        }
        
        // Action buttons based on status
        let actionButtons = '';
        if (order.Status === 'Pending') {
            actionButtons = `
                <button class="btn btn-sm btn-info me-1" onclick="viewOrderDetails(${order.OrderID})" title="Xem chi tiết">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-success me-1" onclick="updateOrderStatus(${order.OrderID}, 'Accepted')" title="Xác nhận">
                    <i class="fas fa-check"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="updateOrderStatus(${order.OrderID}, 'Cancel')" title="Hủy">
                    <i class="fas fa-times"></i>
                </button>
            `;
        } else if (order.Status === 'Accepted') {
            actionButtons = `
                <button class="btn btn-sm btn-info me-1" onclick="viewOrderDetails(${order.OrderID})" title="Xem chi tiết">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="updateOrderStatus(${order.OrderID}, 'Cancel')" title="Hủy">
                    <i class="fas fa-times"></i>
                </button>
            `;
        } else {
            actionButtons = `
                <button class="btn btn-sm btn-info" onclick="viewOrderDetails(${order.OrderID})" title="Xem chi tiết">
                    <i class="fas fa-eye"></i>
                </button>
            `;
        }
        
        return `
            <tr>
                <td><strong>#${order.OrderID}</strong></td>
                <td>${order.customerName}</td>
                <td>${order.customerPhone || '-'}</td>
                <td>${formatDateTime(order.CreateDate)}</td>
                <td><strong>${formatCurrency(order.GrandTotal)}</strong></td>
                <td><span class="badge ${statusClass}">${statusText}</span></td>
                <td>${actionButtons}</td>
            </tr>
        `;
    }).join('');
}

// Filter orders (deprecated - kept for backward compatibility)
function filterOrders(status) {
    document.getElementById('statusFilter').value = status;
    applyFilters();
}

// Apply filters
window.applyFilters = function() {
    const status = document.getElementById('statusFilter').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    currentFilter = { status, startDate, endDate };
    
    let filtered = allOrders;
    
    // Filter by status
    if (status !== 'all') {
        filtered = filtered.filter(order => order.Status === status);
    }
    
    // Filter by date range
    if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        filtered = filtered.filter(order => {
            const orderDate = new Date(order.CreateDate);
            return orderDate >= start;
        });
    }
    
    if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filtered = filtered.filter(order => {
            const orderDate = new Date(order.CreateDate);
            return orderDate <= end;
        });
    }
    
    displayOrders(filtered);
};

// View order details
const orderDetailsModal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));

async function viewOrderDetails(orderId) {
    try {
        const response = await fetch(`/api/admin/orders/${orderId}`);
        const data = await response.json();
        
        if (data.success) {
            displayOrderDetails(data.data);
            orderDetailsModal.show();
        } else {
            alert('Không thể tải thông tin đơn hàng');
        }
    } catch (error) {
        console.error('View order details error:', error);
        alert('Có lỗi xảy ra');
    }
}

function displayOrderDetails(order) {
    // Status badge
    let statusClass = '';
    let statusText = '';
    
    switch(order.Status) {
        case 'Pending':
            statusClass = 'bg-warning';
            statusText = 'Chờ xử lý';
            break;
        case 'Accepted':
            statusClass = 'bg-success';
            statusText = 'Đã xác nhận';
            break;
        case 'Cancel':
            statusClass = 'bg-danger';
            statusText = 'Đã hủy';
            break;
        default:
            statusClass = 'bg-secondary';
            statusText = order.Status;
    }
    
    // Order info
    document.getElementById('orderDetailsContent').innerHTML = `
        <div class="row mb-3">
            <div class="col-md-6">
                <p><strong>Mã đơn hàng:</strong> #${order.OrderID}</p>
                <p><strong>Ngày đặt:</strong> ${formatDateTime(order.CreateDate)}</p>
                <p><strong>Trạng thái:</strong> <span class="badge ${statusClass}">${statusText}</span></p>
            </div>
            <div class="col-md-6">
                <p><strong>Khách hàng:</strong> ${order.customerName}</p>
                <p><strong>Số điện thoại:</strong> ${order.customerPhone || '-'}</p>
                <p><strong>Email:</strong> ${order.customerEmail || '-'}</p>
                <p><strong>Địa chỉ:</strong> ${order.customerAddress || '-'}</p>
            </div>
        </div>
        
        <hr>
        
        <h6 class="mb-3">Chi tiết sản phẩm:</h6>
        <div class="table-responsive">
            <table class="table table-sm">
                <thead>
                    <tr>
                        <th>Hình ảnh</th>
                        <th>Sản phẩm</th>
                        <th>Số lượng</th>
                        <th>Đơn giá</th>
                        <th>Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.items.map(item => `
                        <tr>
                            <td>
                                ${item.imageUrl ? 
                                    `<img src="${item.imageUrl}" alt="${item.vehicleName}" style="width: 50px; height: 50px; object-fit: cover;">` : 
                                    '<div style="width: 50px; height: 50px; background: #ddd; display: flex; align-items: center; justify-content: center;"><i class="fas fa-image"></i></div>'
                                }
                            </td>
                            <td>
                                <strong>${item.vehicleName || 'N/A'}</strong><br>
                                <small class="text-muted">${item.Brand || ''}</small><br>
                                <small class="text-muted">Mã: ${item.VehicleID}</small>
                            </td>
                            <td>${item.Quantity}</td>
                            <td>${formatCurrency(item.Price)}</td>
                            <td><strong>${formatCurrency(item.Price * item.Quantity)}</strong></td>
                        </tr>
                    `).join('')}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="4" class="text-end"><strong>Tổng cộng:</strong></td>
                        <td><strong class="text-primary">${formatCurrency(order.GrandTotal)}</strong></td>
                    </tr>
                </tfoot>
            </table>
        </div>
    `;
}

// Update order status
async function updateOrderStatus(orderId, newStatus) {
    const statusText = newStatus === 'Accepted' ? 'xác nhận' : 'hủy';
    
    if (!confirm(`Bạn có chắc muốn ${statusText} đơn hàng #${orderId}?`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(`${statusText === 'xác nhận' ? 'Xác nhận' : 'Hủy'} đơn hàng thành công!`);
            loadDashboard(); // Reload data
        } else {
            alert(data.message || 'Cập nhật thất bại');
        }
    } catch (error) {
        console.error('Update order status error:', error);
        alert('Có lỗi xảy ra');
    }
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

// Format date time
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
});
