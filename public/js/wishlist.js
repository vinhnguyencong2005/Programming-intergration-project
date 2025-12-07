// Check authentication
const userData = JSON.parse(localStorage.getItem('userData'));
if (!userData) {
    window.location.href = '/login';
}

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

// Load wishlist items
async function loadWishlist() {
    const loadingEl = document.getElementById('wishlistLoading');
    const emptyEl = document.getElementById('wishlistEmpty');
    const itemsEl = document.getElementById('wishlistItems');
    
    // Show loading
    loadingEl.style.display = 'block';
    emptyEl.style.display = 'none';
    itemsEl.style.display = 'none';
    
    try {
        const response = await fetch(`/api/wishlist/${userData.ID}`);
        const result = await response.json();
        
        loadingEl.style.display = 'none';
        
        if (result.success && result.data && result.data.length > 0) {
            displayWishlistItems(result.data);
            document.getElementById('wishlistCount').textContent = `${result.data.length} sản phẩm`;
        } else {
            emptyEl.style.display = 'block';
            document.getElementById('wishlistCount').textContent = '0 sản phẩm';
        }
    } catch (error) {
        console.error('Error loading wishlist:', error);
        loadingEl.style.display = 'none';
        showAlert('Đã xảy ra lỗi khi tải danh sách yêu thích', 'danger');
    }
}

// Display wishlist items
function displayWishlistItems(items) {
    const itemsEl = document.getElementById('wishlistItems');
    const gridEl = document.getElementById('wishlistGrid');
    
    itemsEl.style.display = 'block';
    
    let html = '';
    items.forEach(item => {
        const imageUrl = item.ImageLink || 'https://via.placeholder.com/300x200?text=No+Image';
        const inStock = item.Stock > 0;
        
        html += `
            <div class="col-md-6 col-lg-4">
                <div class="card h-100 wishlist-item-card">
                    <div class="position-relative">
                        <img src="${imageUrl}" 
                             class="card-img-top" 
                             alt="${item.VehicleName}"
                             style="height: 200px; object-fit: cover;"
                             onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
                        <button class="btn btn-danger btn-sm position-absolute top-0 end-0 m-2 remove-wishlist-btn"
                                data-vehicle-id="${item.VehicleID}"
                                title="Xóa khỏi danh sách yêu thích">
                            <i class="fas fa-times"></i>
                        </button>
                        ${!inStock ? '<span class="badge bg-danger position-absolute bottom-0 start-0 m-2">Hết hàng</span>' : ''}
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h6 class="card-title fw-bold">${item.VehicleName}</h6>
                        <p class="text-muted small mb-2">
                            <i class="fas fa-tag me-1"></i>${item.Brand} - ${item.Type}
                        </p>
                        <p class="text-primary fw-bold fs-5 mb-3">${formatPrice(item.Price)} VNĐ</p>
                        <div class="mt-auto">
                            <button class="btn w-100 view-detail-btn text-white" style="background-color: #FFCA2C;"
                                    data-vehicle-id="${item.VehicleID}"
                                    ${!inStock ? 'disabled' : ''}>
                                <i class="fas fa-eye me-2"></i>Xem Chi Tiết
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    gridEl.innerHTML = html;
    
    // Attach event listeners
    attachWishlistItemEvents();
}

// Attach event listeners to wishlist items
function attachWishlistItemEvents() {
    // Remove from wishlist buttons
    const removeBtns = document.querySelectorAll('.remove-wishlist-btn');
    removeBtns.forEach(btn => {
        btn.addEventListener('click', async function() {
            const vehicleID = this.dataset.vehicleId;
            await removeFromWishlist(vehicleID);
        });
    });
    
    // View detail buttons
    const viewBtns = document.querySelectorAll('.view-detail-btn');
    viewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const vehicleID = this.dataset.vehicleId;
            window.location.href = `/vehicle-detail?id=${vehicleID}`;
        });
    });
}

// Remove item from wishlist
async function removeFromWishlist(vehicleID) {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này khỏi danh sách yêu thích?')) {
        return;
    }
    
    try {
        const response = await fetch('/api/wishlist/remove', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                customerID: userData.ID,
                vehicleID: vehicleID
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert('Đã xóa khỏi danh sách yêu thích', 'success');
            // Reload wishlist
            loadWishlist();
        } else {
            showAlert(result.message || 'Không thể xóa sản phẩm', 'danger');
        }
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        showAlert('Đã xảy ra lỗi', 'danger');
    }
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
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

// Load data on page load
window.addEventListener('DOMContentLoaded', () => {
    loadCustomerProfile();
    loadWishlist();
});
