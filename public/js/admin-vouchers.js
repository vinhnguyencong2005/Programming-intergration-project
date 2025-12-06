// Admin Vouchers JavaScript

let allVouchers = [];
const addVoucherModal = new bootstrap.Modal(document.getElementById('addVoucherModal'));
const editVoucherModal = new bootstrap.Modal(document.getElementById('editVoucherModal'));

// Logout function - make it global
window.logout = function() {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
        localStorage.removeItem('adminData');
        window.location.href = '/admin/login';
    }
};

// Load vouchers
async function loadVouchers() {
    try {
        const response = await fetch('/api/admin/vouchers');
        const data = await response.json();
        
        if (data.success) {
            allVouchers = data.data;
            displayVouchers(allVouchers);
        }
    } catch (error) {
        console.error('Load vouchers error:', error);
    }
}

// Display vouchers
function displayVouchers(vouchers) {
    const tbody = document.getElementById('vouchersTable');
    
    if (vouchers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">Không có voucher</td></tr>';
        return;
    }
    
    tbody.innerHTML = vouchers.map(voucher => {
        const status = getVoucherStatus(voucher.StartDate, voucher.EndDate);
        
        return `
            <tr>
                <td><strong>${voucher.Code}</strong></td>
                <td>${formatCurrency(voucher.Reduction)}</td>
                <td>${formatDate(voucher.StartDate)}</td>
                <td>${formatDate(voucher.EndDate)}</td>
                <td>${voucher.Quantity}</td>
                <td>${formatCurrency(voucher.Conditions)}</td>
                <td><span class="status-badge status-${status.class}">${status.text}</span></td>
                <td>
                    <button class="btn btn-sm btn-warning me-1" onclick="openEditVoucher('${voucher.Code}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteVoucher('${voucher.Code}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Get voucher status
function getVoucherStatus(startDate, endDate) {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (now < start) {
        return { class: 'upcoming', text: 'Sắp diễn ra' };
    } else if (now > end) {
        return { class: 'expired', text: 'Hết hạn' };
    } else {
        return { class: 'active', text: 'Đang hoạt động' };
    }
}

// Add voucher
async function addVoucher() {
    const code = document.getElementById('addCode').value.trim();
    const reduction = parseInt(document.getElementById('addReduction').value);
    const startDate = document.getElementById('addStartDate').value;
    const endDate = document.getElementById('addEndDate').value;
    const quantity = parseInt(document.getElementById('addQuantity').value);
    const conditions = parseInt(document.getElementById('addConditions').value);
    
    if (!code || !reduction || !startDate || !endDate || !quantity || conditions === undefined) {
        alert('Vui lòng điền đầy đủ thông tin');
        return;
    }
    
    if (new Date(endDate) < new Date(startDate)) {
        alert('Ngày kết thúc phải sau ngày bắt đầu');
        return;
    }
    
    try {
        const response = await fetch('/api/admin/vouchers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                code,
                reduction,
                startDate,
                endDate,
                quantity,
                conditions
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Thêm voucher thành công!');
            addVoucherModal.hide();
            document.getElementById('addVoucherForm').reset();
            loadVouchers();
        } else {
            alert(data.message || 'Thêm voucher thất bại');
        }
    } catch (error) {
        console.error('Add voucher error:', error);
        alert('Có lỗi xảy ra');
    }
}

// Open edit voucher modal
async function openEditVoucher(code) {
    try {
        const response = await fetch(`/api/admin/vouchers/${code}`);
        const data = await response.json();
        
        if (data.success) {
            const voucher = data.data;
            document.getElementById('editCode').value = voucher.Code;
            document.getElementById('editCodeDisplay').value = voucher.Code;
            document.getElementById('editReduction').value = voucher.Reduction;
            document.getElementById('editStartDate').value = voucher.StartDate.split('T')[0];
            document.getElementById('editEndDate').value = voucher.EndDate.split('T')[0];
            document.getElementById('editQuantity').value = voucher.Quantity;
            document.getElementById('editConditions').value = voucher.Conditions;
            editVoucherModal.show();
        }
    } catch (error) {
        console.error('Load voucher error:', error);
        alert('Có lỗi xảy ra');
    }
}

// Update voucher
async function updateVoucher() {
    const code = document.getElementById('editCode').value;
    const reduction = parseInt(document.getElementById('editReduction').value);
    const startDate = document.getElementById('editStartDate').value;
    const endDate = document.getElementById('editEndDate').value;
    const quantity = parseInt(document.getElementById('editQuantity').value);
    const conditions = parseInt(document.getElementById('editConditions').value);
    
    if (!reduction || !startDate || !endDate || !quantity || conditions === undefined) {
        alert('Vui lòng điền đầy đủ thông tin');
        return;
    }
    
    if (new Date(endDate) < new Date(startDate)) {
        alert('Ngày kết thúc phải sau ngày bắt đầu');
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/vouchers/${code}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                reduction,
                startDate,
                endDate,
                quantity,
                conditions
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Cập nhật voucher thành công!');
            editVoucherModal.hide();
            loadVouchers();
        } else {
            alert(data.message || 'Cập nhật thất bại');
        }
    } catch (error) {
        console.error('Update voucher error:', error);
        alert('Có lỗi xảy ra');
    }
}

// Delete voucher
async function deleteVoucher(code) {
    if (!confirm(`Bạn có chắc muốn xóa voucher "${code}"?`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/vouchers/${code}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Xóa voucher thành công!');
            loadVouchers();
        } else {
            alert(data.message || 'Xóa thất bại');
        }
    } catch (error) {
        console.error('Delete voucher error:', error);
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

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadVouchers();
});
