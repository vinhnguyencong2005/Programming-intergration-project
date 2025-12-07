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
    const addToCartBtn = document.getElementById('addToCartBtn');
    
    if (!isInStock) {
        addToCartBtn.disabled = true;
        addToCartBtn.innerHTML = '<i class="fas fa-times-circle me-2"></i>Hết Hàng';
        addToCartBtn.classList.add('disabled');
    }
    
    addToCartBtn.addEventListener('click', async () => {
        if (isInStock) {
            await addToCart();
        }
    });
}

async function addToCart() {
    try {
        const userData = JSON.parse(localStorage.getItem("userData"));
        
        if (!userData || !userData.ID) {
            alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
            window.location.href = "/login";
            return;
        }

        const response = await fetch("/api/cart/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                customerID: userData.ID,
                vehicleID: vehicleData.VehicleID,
                quantity: 1,
                price: vehicleData.Price,
                discount: vehicleData.Discount || 0
            })
        });

        const data = await response.json();

        if (data.success) {
            // Show success message
            showSuccessMessage();
            // Update cart badge
            updateCartCount();
        } else {
            alert("Không thể thêm sản phẩm vào giỏ hàng");
        }
    } catch (error) {
        console.error("Error adding to cart:", error);
        alert("Có lỗi xảy ra khi thêm vào giỏ hàng");
    }
}

function showSuccessMessage() {
    const addToCartBtn = document.getElementById('addToCartBtn');
    const originalHTML = addToCartBtn.innerHTML;
    
    addToCartBtn.innerHTML = '<i class="fas fa-check me-2"></i>Đã Thêm Vào Giỏ';
    addToCartBtn.classList.remove('btn-primary');
    addToCartBtn.classList.add('btn-success');
    addToCartBtn.disabled = true;
    
    setTimeout(() => {
        addToCartBtn.innerHTML = originalHTML;
        addToCartBtn.classList.remove('btn-success');
        addToCartBtn.classList.add('btn-primary');
        addToCartBtn.disabled = false;
    }, 2000);
}

async function updateCartCount() {
    try {
        const userData = JSON.parse(localStorage.getItem("userData"));
        
        if (!userData || !userData.ID) return;

        const response = await fetch(`/api/cart/count?customerID=${userData.ID}`);
        const data = await response.json();

        if (data.success) {
            const cartCount = document.getElementById("cartCount");
            if (cartCount) {
                cartCount.textContent = data.count;
                cartCount.style.display = data.count > 0 ? "inline-block" : "none";
            }
        }
    } catch (error) {
        console.error("Error updating cart count:", error);
    }
}

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price);
}

function showError() {
    document.getElementById('loadingSection').classList.add('d-none');
    document.getElementById('errorSection').classList.remove('d-none');
}

// Handle Report Submission
const reportModal = new bootstrap.Modal(document.getElementById('reportModal'));

document.getElementById('submitReportBtn').addEventListener('click', async () => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    
    if (!userData || !userData.ID) {
        alert('Vui lòng đăng nhập để gửi báo cáo');
        window.location.href = '/login';
        return;
    }

    const title = document.getElementById('reportTitle').value.trim();
    const information = document.getElementById('reportInformation').value.trim();

    if (!title || !information) {
        alert('Vui lòng điền đầy đủ thông tin');
        return;
    }

    try {
        const response = await fetch('/api/reports', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: title,
                information: information,
                customerID: userData.ID
            })
        });

        const data = await response.json();

        if (data.success) {
            alert('Gửi báo cáo thành công! Cảm ơn bạn đã phản hồi.');
            reportModal.hide();
            document.getElementById('reportForm').reset();
        } else {
            alert('Có lỗi xảy ra: ' + (data.message || 'Vui lòng thử lại'));
        }
    } catch (error) {
        console.error('Error submitting report:', error);
        alert('Có lỗi xảy ra khi gửi báo cáo');
    }
});

