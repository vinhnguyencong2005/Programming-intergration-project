window.addEventListener('DOMContentLoaded', loadCustomers);

async function loadCustomers() {
    try {
        const response = await fetch('/api/customers');
        const result = await response.json();
        
        if (result.success) {
            displayCustomers(result.data);
        }
    } catch (error) {
        console.error('Error loading customers:', error);
        document.getElementById('customersTable').innerHTML = `
            <tr><td colspan="7" class="text-center text-danger">Không thể tải danh sách khách hàng</td></tr>
        `;
    }
}

function displayCustomers(customers) {
    const tbody = document.getElementById('customersTable');
    
    if (customers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Chưa có khách hàng nào</td></tr>';
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
            <td>
                <button class="btn btn-sm btn-info" onclick="viewCustomer(${customer.ID})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-warning" onclick="editCustomer(${customer.ID})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteCustomer(${customer.ID})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

document.getElementById('saveCustomer').addEventListener('click', async () => {
    const form = document.getElementById('addCustomerForm');
    const formData = new FormData(form);
    
    const data = {
        username: formData.get('username'),
        password: formData.get('password'),
        name: formData.get('name'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        address: formData.get('address')
    };

    try {
        const response = await fetch('/api/customers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        
        if (result.success) {
            alert('Thêm khách hàng thành công!');
            form.reset();
            bootstrap.Modal.getInstance(document.getElementById('addCustomerModal')).hide();
            loadCustomers();
        } else {
            alert('Lỗi: ' + result.message);
        }
    } catch (error) {
        alert('Có lỗi xảy ra: ' + error.message);
    }
});

function viewCustomer(id) {
    alert('Xem chi tiết khách hàng ID: ' + id);
}

function editCustomer(id) {
    alert('Chỉnh sửa khách hàng ID: ' + id);
}

async function deleteCustomer(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) return;

    try {
        const response = await fetch(`/api/customers/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();
        
        if (result.success) {
            alert('Xóa thành công!');
            loadCustomers();
        } else {
            alert('Lỗi: ' + result.message);
        }
    } catch (error) {
        alert('Có lỗi xảy ra: ' + error.message);
    }
}
