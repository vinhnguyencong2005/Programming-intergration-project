// Check authentication
const userData = JSON.parse(localStorage.getItem('userData'));
if (!userData) {
    window.location.href = '/login';
}

const customerData = userData; // Alias for backward compatibility

let originalProfileData = {};

// Load customer data on page load
window.addEventListener('DOMContentLoaded', () => {
    loadCustomerProfile();
    setupFormHandlers();
});

// Load customer profile
async function loadCustomerProfile() {
    try {
        const response = await fetch(`/api/customers/${customerData.ID}`);
        const result = await response.json();
        
        if (result.success && result.data) {
            const customer = result.data;
            originalProfileData = { ...customer };
            
            // Update sidebar
            document.getElementById('sidebarName').textContent = customer.FullName || 'Người dùng';
            document.getElementById('sidebarEmail').textContent = customer.Email || '';
            
            // Fill form
            document.getElementById('fullName').value = customer.FullName || '';
            document.getElementById('phoneNumber').value = customer.PhoneNumber || '';
            document.getElementById('email').value = customer.Email || '';
            document.getElementById('address').value = customer.Address || '';
        } else {
            showAlert('Không thể tải thông tin người dùng', 'danger');
        }
    } catch (error) {
        console.error('Error loading customer profile:', error);
        showAlert('Đã xảy ra lỗi khi tải thông tin', 'danger');
    }
}

// Setup form handlers
function setupFormHandlers() {
    const profileForm = document.getElementById('profileForm');
    const cancelBtn = document.getElementById('cancelBtn');
    
    // Submit form
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await updateProfile();
    });
    
    // Cancel button - restore original data
    cancelBtn.addEventListener('click', () => {
        document.getElementById('fullName').value = originalProfileData.FullName || '';
        document.getElementById('phoneNumber').value = originalProfileData.PhoneNumber || '';
        document.getElementById('address').value = originalProfileData.Address || '';
    });
}

// Update profile
async function updateProfile() {
    const fullName = document.getElementById('fullName').value.trim();
    const phoneNumber = document.getElementById('phoneNumber').value.trim();
    const address = document.getElementById('address').value.trim();
    
    // Validation
    if (!fullName || !phoneNumber) {
        showAlert('Vui lòng điền đầy đủ thông tin bắt buộc', 'warning');
        return;
    }
    
    try {
        const response = await fetch(`/api/customers/${customerData.ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fullName,
                phoneNumber,
                address
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert('Cập nhật thông tin thành công!', 'success');
            // Reload profile to get updated data
            await loadCustomerProfile();
        } else {
            showAlert(result.message || 'Cập nhật thất bại', 'danger');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        showAlert('Đã xảy ra lỗi khi cập nhật thông tin', 'danger');
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
