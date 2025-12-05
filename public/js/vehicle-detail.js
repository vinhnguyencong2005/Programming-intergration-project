// Get vehicle ID from URL
const urlParams = new URLSearchParams(window.location.search);
const vehicleID = urlParams.get('id');

let vehicleData = null;
let vehicleImages = [];

// Load vehicle detail on page load
window.addEventListener('DOMContentLoaded', () => {
    if (!vehicleID) {
        showError();
        return;
    }
    loadVehicleDetail();
});

async function loadVehicleDetail() {
    try {
        // Fetch vehicle data
        const vehicleResponse = await fetch(`/api/vehicles/${vehicleID}`);
        const vehicleResult = await vehicleResponse.json();
        
        if (!vehicleResult.success || !vehicleResult.data) {
            showError();
            return;
        }
        
        vehicleData = vehicleResult.data;
        
        // Fetch vehicle images
        const imagesResponse = await fetch(`/api/vehicles/${vehicleID}/images`);
        const imagesResult = await imagesResponse.json();
        
        if (imagesResult.success && imagesResult.data) {
            vehicleImages = imagesResult.data;
        }
        
        displayVehicleDetail();
    } catch (error) {
        console.error('Error loading vehicle detail:', error);
        showError();
    }
}

function displayVehicleDetail() {
    // Hide loading, show content
    document.getElementById('loadingSection').classList.add('d-none');
    document.getElementById('productDetail').classList.remove('d-none');
    
    // Update breadcrumb
    document.getElementById('breadcrumbName').textContent = vehicleData.Name;
    
    // Update brand badge
    document.getElementById('brandBadge').textContent = vehicleData.Brand;
    
    // Update product name
    document.getElementById('productName').textContent = vehicleData.Name;
    
    // Update rating
    displayRating(vehicleData.Rating || 5);
    
    // Update price
    const currentPrice = document.getElementById('currentPrice');
    currentPrice.textContent = formatPrice(vehicleData.Price) + ' VNĐ';
    
    // Show discount if exists
    if (vehicleData.Discount && vehicleData.Discount > 0) {
        const originalPrice = document.getElementById('originalPrice');
        const originalPriceValue = vehicleData.Price / (1 - vehicleData.Discount);
        originalPrice.textContent = formatPrice(originalPriceValue) + ' VNĐ';
        originalPrice.classList.remove('d-none');
    }
    
    // Update product details
    document.getElementById('vehicleID').textContent = vehicleData.VehicleID;
    document.getElementById('vehicleType').textContent = vehicleData.Type || 'Chưa phân loại';
    document.getElementById('warehouseID').textContent = vehicleData.WarehouseID || 'N/A';
    
    // Update stock status
    const isInStock = vehicleData.Stock > 0;
    const stockStatus = document.getElementById('stockStatus');
    const stockBadge = document.getElementById('stockBadge');
    
    if (isInStock) {
        stockStatus.innerHTML = `<span class="text-success fw-semibold"><i class="fas fa-check-circle me-1"></i>Còn ${vehicleData.Stock} xe</span>`;
        stockBadge.textContent = `Còn ${vehicleData.Stock} xe`;
        stockBadge.classList.remove('out-of-stock');
    } else {
        stockStatus.innerHTML = `<span class="text-danger fw-semibold"><i class="fas fa-times-circle me-1"></i>Hết hàng</span>`;
        stockBadge.textContent = 'Hết hàng';
        stockBadge.classList.add('out-of-stock');
    }
    
    // Update summary
    document.getElementById('productSummary').textContent = vehicleData.Summary || 'Chưa có mô tả chi tiết cho sản phẩm này.';
    
    // Display images
    displayImages();
    
    // Setup action buttons
    setupActionButtons(isInStock);
    
    // Update page title
    document.title = `${vehicleData.Name} - BKMotor`;
}

function displayImages() {
    const mainImage = document.getElementById('mainImage');
    const thumbnailsContainer = document.getElementById('thumbnails');
    
    // Use images from database if available, otherwise use placeholder
    if (vehicleImages.length > 0) {
        // Sort by priority
        vehicleImages.sort((a, b) => a.ImagePriority - b.ImagePriority);
        
        // Set main image (first image with priority 1)
        mainImage.src = vehicleImages[0].ImageLink;
        mainImage.alt = vehicleData.Name;
        
        // Create thumbnails
        thumbnailsContainer.innerHTML = vehicleImages.map((img, index) => `
            <img src="${img.ImageLink}" 
                 alt="${vehicleData.Name} - ${index + 1}" 
                 class="thumbnail ${index === 0 ? 'active' : ''}" 
                 data-index="${index}"
                 onclick="changeMainImage(${index})">
        `).join('');
    } else {
        // Use placeholder if no images in database
        const placeholderUrl = 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&h=600&fit=crop&q=80';
        mainImage.src = placeholderUrl;
        mainImage.alt = vehicleData.Name;
        
        thumbnailsContainer.innerHTML = `
            <img src="${placeholderUrl}" 
                 alt="${vehicleData.Name}" 
                 class="thumbnail active">
        `;
    }
}

function changeMainImage(index) {
    if (vehicleImages.length === 0) return;
    
    const mainImage = document.getElementById('mainImage');
    mainImage.src = vehicleImages[index].ImageLink;
    
    // Update active thumbnail
    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach((thumb, i) => {
        if (i === index) {
            thumb.classList.add('active');
        } else {
            thumb.classList.remove('active');
        }
    });
}

function displayRating(rating) {
    const starsContainer = document.getElementById('ratingStars');
    const ratingText = document.getElementById('ratingText');
    
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - Math.ceil(rating);
    
    let starsHTML = '';
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fas fa-star"></i>';
    }
    if (hasHalfStar) {
        starsHTML += '<i class="fas fa-star-half-alt"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="far fa-star"></i>';
    }
    
    starsContainer.innerHTML = starsHTML;
    ratingText.textContent = `${rating.toFixed(1)} / 5.0`;
}

function setupActionButtons(isInStock) {
    const buyNowBtn = document.getElementById('buyNowBtn');
    
    if (!isInStock) {
        buyNowBtn.disabled = true;
        buyNowBtn.innerHTML = '<i class="fas fa-times-circle me-2"></i>Hết Hàng';
        buyNowBtn.classList.add('disabled');
    }
    
    buyNowBtn.addEventListener('click', () => {
        if (isInStock) {
            alert(`Bạn đã chọn mua: ${vehicleData.Name}\nGiá: ${formatPrice(vehicleData.Price)} VNĐ\n\nChức năng đặt hàng sẽ được phát triển sau!`);
        }
    });
}

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price);
}

function showError() {
    document.getElementById('loadingSection').classList.add('d-none');
    document.getElementById('errorSection').classList.remove('d-none');
}
