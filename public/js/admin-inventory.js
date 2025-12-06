// Admin Inventory JavaScript

let allInventory = [];
const addVehicleModal = new bootstrap.Modal(document.getElementById('addVehicleModal'));
const editVehicleModal = new bootstrap.Modal(document.getElementById('editVehicleModal'));
const editStockModal = new bootstrap.Modal(document.getElementById('editStockModal'));

// Load inventory
async function loadInventory() {
    try {
        const response = await fetch('/api/admin/inventory');
        const data = await response.json();
        
        if (data.success) {
            allInventory = data.data;
            displayInventory(allInventory);
        }
    } catch (error) {
        console.error('Load inventory error:', error);
    }
}

// Update inventory statistics
function updateInventoryStats(inventory) {
    const totalProducts = inventory.length;
    const uniqueBrands = new Set(inventory.map(item => item.Brand)).size;
    const totalStock = inventory.reduce((sum, item) => sum + item.Stock, 0);
    const lowStock = inventory.filter(item => item.Stock < 10).length;
    
    document.getElementById('totalProducts').textContent = totalProducts;
    document.getElementById('totalBrands').textContent = uniqueBrands;
    document.getElementById('totalStock').textContent = totalStock;
    document.getElementById('lowStock').textContent = lowStock;
}

// Logout function - make it global
window.logout = function() {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
        localStorage.removeItem('adminData');
        window.location.href = '/admin/login';
    }
};

// Display inventory
function displayInventory(inventory) {
    const tbody = document.getElementById('inventoryTable');
    
    // Update statistics
    updateInventoryStats(inventory);
    
    if (inventory.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" class="text-center">Không có sản phẩm</td></tr>';
        return;
    }
    
    tbody.innerHTML = inventory.map(item => {
        const finalPrice = item.Price * (1 - item.Discount);
        
        // Stock status
        let stockClass = '';
        if (item.Stock === 0) {
            stockClass = 'stock-low';
        } else if (item.Stock < 10) {
            stockClass = 'stock-low';
        } else if (item.Stock < 50) {
            stockClass = 'stock-medium';
        } else {
            stockClass = 'stock-high';
        }
        
        return `
            <tr>
                <td>
                    ${item.imageUrl ? 
                        `<img src="${item.imageUrl}" alt="${item.Name}" class="product-img">` : 
                        '<div class="product-img bg-secondary d-flex align-items-center justify-content-center"><i class="fas fa-image text-white"></i></div>'
                    }
                </td>
                <td>${item.VehicleID}</td>
                <td>${item.Name}</td>
                <td>${item.Brand}</td>
                <td>${item.Type || '-'}</td>
                <td>${formatCurrency(item.Price)}</td>
                <td>${item.Stock}</td>
                <td>${item.WarehouseID || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-warning me-1" onclick="openEditVehicle('${item.VehicleID}')" title="Chỉnh sửa thông tin">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteVehicle('${item.VehicleID}', '${item.Name}')" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Open edit stock modal
function openEditStock(vehicleId, vehicleName, currentStock) {
    document.getElementById('editStockVehicleId').value = vehicleId;
    document.getElementById('editStockVehicleName').value = vehicleName;
    document.getElementById('editStockQuantity').value = currentStock;
    editStockModal.show();
}

// Save stock
async function saveStock() {
    const vehicleId = document.getElementById('editStockVehicleId').value;
    const newStock = parseInt(document.getElementById('editStockQuantity').value);
    
    if (newStock < 0) {
        alert('Số lượng tồn kho không hợp lệ');
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/inventory/${vehicleId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ stock: newStock })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Cập nhật tồn kho thành công!');
            editStockModal.hide();
            loadInventory();
        } else {
            alert(data.message || 'Cập nhật thất bại');
        }
    } catch (error) {
        console.error('Save stock error:', error);
        alert('Có lỗi xảy ra');
    }
}

// Open add vehicle modal
function openAddVehicle() {
    document.getElementById('addVehicleForm').reset();
    addVehicleModal.show();
}

// Save new vehicle
async function saveNewVehicle() {
    const form = document.getElementById('addVehicleForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const vehicleId = document.getElementById('addVehicleId').value;
    const name = document.getElementById('addName').value;
    const brand = document.getElementById('addBrand').value;
    const type = document.getElementById('addType').value;
    const price = parseFloat(document.getElementById('addPrice').value);
    const discount = 0; // Fixed to 0 since discount field is removed
    const stock = parseInt(document.getElementById('addStock').value);
    const rating = parseFloat(document.getElementById('addRating').value);
    const warehouseID = document.getElementById('addWarehouse').value;
    const summary = document.getElementById('addSummary').value;
    const imageUrl = document.getElementById('addImageUrl').value;
    
    // Auto generate slug from name
    // const slug = name.toLowerCase()
    //     .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    //     .replace(/đ/g, 'd')
    //     .replace(/[^a-z0-9\s-]/g, '')
    //     .replace(/\s+/g, '-')
    //     .replace(/-+/g, '-')
    //     .trim();

    try {
        const response = await fetch('/api/admin/vehicles', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                vehicleId,
                name,
                brand,
                type,
                price,
                discount,
                stock,
                rating,
                warehouseID,
                summary,
                slug,
                imageUrl
            })
        });

        const data = await response.json();

        if (data.success) {
            alert('Thêm sản phẩm thành công!');
            addVehicleModal.hide();
            form.reset();
            loadInventory();
        } else {
            alert(data.message || 'Thêm sản phẩm thất bại');
        }
    } catch (error) {
        console.error('Add vehicle error:', error);
        alert('Có lỗi xảy ra');
    }
}

// Open edit vehicle modal
async function openEditVehicle(vehicleId) {
    try {
        const response = await fetch(`/api/admin/vehicles/${vehicleId}`);
        const data = await response.json();

        if (data.success) {
            const vehicle = data.data;
            document.getElementById('editVehicleIdOriginal').value = vehicle.VehicleID;
            document.getElementById('editVehicleIdDisplay').value = vehicle.VehicleID;
            document.getElementById('editName').value = vehicle.Name;
            document.getElementById('editBrand').value = vehicle.Brand;
            document.getElementById('editType').value = vehicle.Type || '';
            document.getElementById('editPrice').value = vehicle.Price;
            // document.getElementById('editDiscount').value = vehicle.Discount;
            document.getElementById('editStockValue').value = vehicle.Stock;
            document.getElementById('editRating').value = vehicle.Rating;
            document.getElementById('editWarehouse').value = vehicle.WarehouseID || '';
            document.getElementById('editSummary').value = vehicle.Summary || '';
            
            // Load image URL if exists
            if (vehicle.imageUrl) {
                document.getElementById('editImageUrl').value = vehicle.imageUrl;
            }

            editVehicleModal.show();
        } else {
            alert('Không thể tải thông tin sản phẩm');
        }
    } catch (error) {
        console.error('Load vehicle error:', error);
        alert('Có lỗi xảy ra');
    }
}

// Save edit vehicle
async function saveEditVehicle() {
    const form = document.getElementById('editVehicleForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const vehicleId = document.getElementById('editVehicleIdOriginal').value;
    const name = document.getElementById('editName').value;
    const brand = document.getElementById('editBrand').value;
    const type = document.getElementById('editType').value;
    const price = parseFloat(document.getElementById('editPrice').value);
    const stock = parseInt(document.getElementById('editStockValue').value);
    const rating = parseFloat(document.getElementById('editRating').value);
    const warehouseID = document.getElementById('editWarehouse').value;
    const summary = document.getElementById('editSummary').value;
    const imageUrl = document.getElementById('editImageUrl').value;

    try {
        const response = await fetch(`/api/admin/vehicles/${vehicleId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                brand,
                type,
                price,
                stock,
                rating,
                warehouseID,
                summary,
                imageUrl
            })
        });

        const data = await response.json();

        if (data.success) {
            alert('Cập nhật sản phẩm thành công!');
            editVehicleModal.hide();
            loadInventory();
        } else {
            alert(data.message || 'Cập nhật thất bại');
        }
    } catch (error) {
        console.error('Update vehicle error:', error);
        alert('Có lỗi xảy ra');
    }
}

// Delete vehicle
async function deleteVehicle(vehicleId, vehicleName) {
    if (!confirm(`Bạn có chắc muốn xóa sản phẩm "${vehicleName}"?\n\nLưu ý: Không thể xóa sản phẩm có trong đơn hàng đang chờ xử lý.`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/inventory/${vehicleId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Xóa sản phẩm thành công!');
            loadInventory();
        } else {
            alert(data.message || 'Xóa thất bại');
        }
    } catch (error) {
        console.error('Delete vehicle error:', error);
        alert('Có lỗi xảy ra');
    }
}

// Search inventory
document.getElementById('searchInput')?.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    
    const filtered = allInventory.filter(item => 
        item.VehicleID.toLowerCase().includes(searchTerm) ||
        item.Name.toLowerCase().includes(searchTerm) ||
        item.Brand.toLowerCase().includes(searchTerm) ||
        (item.Type && item.Type.toLowerCase().includes(searchTerm))
    );
    
    displayInventory(filtered);
});

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadInventory();
});
