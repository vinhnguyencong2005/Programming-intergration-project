// Admin Customers JavaScript

let allCustomers = [];

// Logout function - make it global
window.logout = function() {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
        localStorage.removeItem('adminData');
        window.location.href = '/admin/login';
    }
};

// Load customers
async function loadCustomers() {
    try {
        const response = await fetch('/api/admin/customers');
        const data = await response.json();
        
        if (data.success) {
            allCustomers = data.data;
            displayCustomers(allCustomers);
        }
    } catch (error) {
        console.error('Load customers error:', error);
    }
}

// Display customers
function displayCustomers(customers) {
    const tbody = document.getElementById('customersTable');
    
    if (customers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center">Không có khách hàng</td></tr>';
        return;
    }
    
    tbody.innerHTML = customers.map(customer => `
        <tr>
            <td>${customer.ID}</td>
            <td>${customer.Username}</td>
            <td>${customer.Name}</td>
            <td>${customer.Phone}</td>
            <td>${customer.Email}</td>
            <td>${customer.Address}</td>
            <td>${customer.totalOrders}</td>
            <td>${formatCurrency(customer.totalPaid)}</td>
            <td>${formatDate(customer.CreateDate)}</td>
        </tr>
    `).join('');
}

// Search customers
document.getElementById('searchInput')?.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    
    const filtered = allCustomers.filter(customer => 
        customer.ID.toString().includes(searchTerm) ||
        customer.Username.toLowerCase().includes(searchTerm) ||
        customer.Name.toLowerCase().includes(searchTerm) ||
        customer.Phone.includes(searchTerm) ||
        customer.Email.toLowerCase().includes(searchTerm)
    );
    
    displayCustomers(filtered);
});

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
    loadCustomers();
});
