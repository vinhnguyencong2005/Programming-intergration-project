let allVehicles = [];
let vehicleImages = {}; // Store images for each vehicle
let currentFilter = {
    brand: '',
    type: '',
    sort: '',
    search: ''
};

// Load vehicles on page load
window.addEventListener('DOMContentLoaded', () => {
    loadVehicles();
    setupEventListeners();
});

function setupEventListeners() {
    // Real-time filtering
    document.getElementById('brandFilter').addEventListener('change', applyFilters);
    document.getElementById('typeFilter').addEventListener('change', applyFilters);
    document.getElementById('sortFilter').addEventListener('change', applyFilters);
    document.getElementById('searchInput').addEventListener('input', applyFilters);
    
    // Reset filter buttons
    const resetBtn = document.getElementById('resetFilter');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetFilters);
    }
    
    const clearBtn = document.getElementById('clearFilters');
    if (clearBtn) {
        clearBtn.addEventListener('click', resetFilters);
    }
}

async function loadVehicles() {
    showLoading();
    try {
        const response = await fetch('/api/vehicles');
        const result = await response.json();
        
        if (result.success) {
            allVehicles = result.data || [];
            
            // Load images for all vehicles
            await loadAllVehicleImages();
            
            displayVehicles(allVehicles);
        } else {
            showError('Không thể tải danh sách sản phẩm');
        }
    } catch (error) {
        console.error('Error loading vehicles:', error);
        showError('Có lỗi xảy ra khi tải sản phẩm');
    }
}

async function loadAllVehicleImages() {
    // Load images for all vehicles in parallel
    const imagePromises = allVehicles.map(async (vehicle) => {
        try {
            const response = await fetch(`/api/vehicles/${vehicle.VehicleID}/images`);
            const result = await response.json();
            
            if (result.success && result.data && result.data.length > 0) {
                // Get image with priority 1 (first image)
                const primaryImage = result.data.find(img => img.ImagePriority === 1) || result.data[0];
                vehicleImages[vehicle.VehicleID] = primaryImage.ImageLink;
            }
        } catch (error) {
            console.error(`Error loading images for ${vehicle.VehicleID}:`, error);
        }
    });
    
    await Promise.all(imagePromises);
}

function showLoading() {
    document.getElementById('loadingSpinner').classList.remove('d-none');
    document.getElementById('vehiclesList').innerHTML = '';
    document.getElementById('noResults').classList.add('d-none');
}

function hideLoading() {
    document.getElementById('loadingSpinner').classList.add('d-none');
}

function showError(message) {
    hideLoading();
    document.getElementById('vehiclesList').innerHTML = `
        <div class="col-12 text-center py-5">
            <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
            <h5 class="text-danger">${message}</h5>
        </div>
    `;
}

function displayVehicles(vehicles) {
    hideLoading();
    const container = document.getElementById('vehiclesList');
    const resultCount = document.getElementById('resultCount');
    const noResults = document.getElementById('noResults');
    
    // Update result count
    resultCount.innerHTML = `<i class="fas fa-box me-2"></i>Hiển thị ${vehicles.length} sản phẩm`;
    
    if (vehicles.length === 0) {
        container.innerHTML = '';
        noResults.classList.remove('d-none');
        return;
    }
    
    noResults.classList.add('d-none');
    container.innerHTML = vehicles.map(vehicle => createVehicleCard(vehicle)).join('');
}

function createVehicleCard(vehicle) {
    // Get image from database or use placeholder
    const imageUrl = vehicleImages[vehicle.VehicleID] || 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400&h=300&fit=crop&q=80';
    const isInStock = vehicle.Stock > 0;
    
    return `
        <div class="col-md-6 col-lg-4">
            <div class="card vehicle-card shadow-sm rounded-4">
                <div class="vehicle-img-wrapper">
                    <span class="brand-badge">${vehicle.Brand}</span>
                    <span class="stock-badge ${!isInStock ? 'out-of-stock' : ''}">
                        ${isInStock ? `Còn ${vehicle.Stock} xe` : 'Hết hàng'}
                    </span>
                    <img src="${imageUrl}" class="vehicle-img" alt="${vehicle.Name}" loading="lazy">
                </div>
                <div class="vehicle-info">
                    <h5 class="vehicle-name">${vehicle.Name}</h5>
                    <div class="vehicle-type">
                        <i class="fas fa-motorcycle me-1"></i>${vehicle.Type || 'Chưa phân loại'}
                    </div>
                    <div class="vehicle-price">${formatPrice(vehicle.Price)} VNĐ</div>
                    <button class="btn btn-view-detail" onclick="viewDetail('${vehicle.VehicleID}')">
                        <i class="fas fa-info-circle me-2"></i>Xem Chi Tiết
                    </button>
                </div>
            </div>
        </div>
    `;
}

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price);
}

function applyFilters() {
    // Get filter values
    currentFilter.brand = document.getElementById('brandFilter').value;
    currentFilter.type = document.getElementById('typeFilter').value;
    currentFilter.sort = document.getElementById('sortFilter').value;
    currentFilter.search = document.getElementById('searchInput').value.toLowerCase().trim();

    let filtered = [...allVehicles];

    // Apply search filter
    if (currentFilter.search) {
        filtered = filtered.filter(v => 
            v.Name.toLowerCase().includes(currentFilter.search) ||
            v.Brand.toLowerCase().includes(currentFilter.search) ||
            (v.Type && v.Type.toLowerCase().includes(currentFilter.search))
        );
    }

    // Apply brand filter
    if (currentFilter.brand) {
        filtered = filtered.filter(v => v.Brand === currentFilter.brand);
    }

    // Apply type filter
    if (currentFilter.type) {
        filtered = filtered.filter(v => v.Type === currentFilter.type);
    }

    // Apply sorting
    if (currentFilter.sort === 'price-asc') {
        filtered.sort((a, b) => a.Price - b.Price);
    } else if (currentFilter.sort === 'price-desc') {
        filtered.sort((a, b) => b.Price - a.Price);
    } else if (currentFilter.sort === 'name') {
        filtered.sort((a, b) => a.Name.localeCompare(b.Name, 'vi'));
    }

    displayVehicles(filtered);
}

function resetFilters() {
    document.getElementById('brandFilter').value = '';
    document.getElementById('typeFilter').value = '';
    document.getElementById('sortFilter').value = '';
    document.getElementById('searchInput').value = '';
    
    currentFilter = {
        brand: '',
        type: '',
        sort: '',
        search: ''
    };
    
    displayVehicles(allVehicles);
}

function viewDetail(vehicleID) {
    // Redirect to vehicle detail page with ID parameter
    window.location.href = `/vehicle-detail?id=${vehicleID}`;
}
