// Get vehicle ID from URL
const urlParams = new URLSearchParams(window.location.search);
const vehicleID = urlParams.get('id');

let vehicleData = null;
let vehicleImages = [];
let isInWishlist = false;

// Load vehicle detail on page load
window.addEventListener('DOMContentLoaded', () => {
    if (!vehicleID) {
        showError();
        return;
    }
    loadVehicleDetail();
    checkWishlistStatus();
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
        loadVehicleRatings();
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
    
    // Update rating - use average rating from database
    const avgRating = vehicleData.AverageRating || 0;
    const totalRatings = vehicleData.TotalRatings || 0;
    displayRating(avgRating, totalRatings);
    
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

function displayRating(rating, totalRatings = 0) {
    const starsContainer = document.getElementById('ratingStars');
    const ratingText = document.getElementById('ratingText');
    
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let starsHTML = '';
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fas fa-star text-warning"></i>';
    }
    if (hasHalfStar) {
        starsHTML += '<i class="fas fa-star-half-alt text-warning"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="far fa-star text-warning"></i>';
    }
    
    starsContainer.innerHTML = starsHTML;
    
    if (totalRatings > 0) {
        ratingText.textContent = `${rating.toFixed(1)} (${totalRatings} đánh giá)`;
    } else {
        ratingText.textContent = 'Chưa có đánh giá';
    }
}

function setupActionButtons(isInStock) {
    const addToCartBtn = document.getElementById('addToCartBtn');
    const addToWishlistBtn = document.getElementById('addToWishlistBtn');
    
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

    // Setup wishlist button
    updateWishlistButton();
    addToWishlistBtn.addEventListener('click', async () => {
        await toggleWishlist();
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

// ============ RATING FUNCTIONALITY ============
let selectedRating = 0;

// Star rating interaction
const stars = document.querySelectorAll('.star-rating i');
stars.forEach(star => {
    star.addEventListener('click', function() {
        selectedRating = parseInt(this.getAttribute('data-rating'));
        updateStarDisplay();
    });

    star.addEventListener('mouseenter', function() {
        const rating = parseInt(this.getAttribute('data-rating'));
        highlightStars(rating);
    });
});

document.querySelector('.star-rating').addEventListener('mouseleave', () => {
    updateStarDisplay();
});

function highlightStars(rating) {
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.remove('far');
            star.classList.add('fas');
        } else {
            star.classList.remove('fas');
            star.classList.add('far');
        }
    });
}

function updateStarDisplay() {
    highlightStars(selectedRating);
}

// Submit rating
document.getElementById('submitRatingBtn').addEventListener('click', async () => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    
    if (!userData || !userData.ID) {
        alert('Vui lòng đăng nhập để đánh giá sản phẩm');
        window.location.href = '/login';
        return;
    }

    if (selectedRating === 0) {
        alert('Vui lòng chọn số sao đánh giá');
        return;
    }

    const comment = document.getElementById('ratingComment').value.trim();

    try {
        const response = await fetch('/api/ratings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                customerID: userData.ID,
                vehicleID: vehicleID,
                star: selectedRating,
                information: comment || null
            })
        });

        const data = await response.json();

        if (data.success) {
            alert('Gửi đánh giá thành công! Cảm ơn bạn đã đánh giá.');
            selectedRating = 0;
            updateStarDisplay();
            document.getElementById('ratingComment').value = '';
            loadVehicleRatings();
        } else {
            alert('Có lỗi xảy ra: ' + (data.message || 'Vui lòng thử lại'));
        }
    } catch (error) {
        console.error('Error submitting rating:', error);
        alert('Có lỗi xảy ra khi gửi đánh giá');
    }
});

// Load vehicle ratings
async function loadVehicleRatings() {
    try {
        const response = await fetch(`/api/ratings/vehicle/${vehicleID}`);
        const data = await response.json();

        if (data.success) {
            displayRatings(data.data);
        }
    } catch (error) {
        console.error('Error loading ratings:', error);
        document.getElementById('ratingsDisplay').innerHTML = `
            <div class="text-center text-muted py-3">
                <i class="fas fa-exclamation-circle me-2"></i>Không thể tải đánh giá
            </div>
        `;
    }
}

function displayRatings(ratings) {
    const container = document.getElementById('ratingsDisplay');

    if (ratings.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted py-3">
                <i class="fas fa-star me-2"></i>Chưa có đánh giá nào
            </div>
        `;
        return;
    }

    container.innerHTML = ratings.map(rating => {
        const stars = '★'.repeat(rating.Star) + '☆'.repeat(5 - rating.Star);
        return `
            <div class="rating-item">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                        <strong>${rating.customerName}</strong>
                        <div class="rating-stars">${stars}</div>
                    </div>
                    <small class="text-muted">${formatDateTime(rating.CreateDate)}</small>
                </div>
                ${rating.Information ? `<p class="mb-0 text-muted">${rating.Information}</p>` : ''}
            </div>
        `;
    }).join('');
}

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

// ============ WISHLIST FUNCTIONALITY ============
// Check if vehicle is in wishlist
async function checkWishlistStatus() {
    try {
        const userData = JSON.parse(localStorage.getItem("userData"));
        
        if (!userData || !userData.ID) {
            isInWishlist = false;
            return;
        }

        const response = await fetch(`/api/wishlist/check?customerID=${userData.ID}&vehicleID=${vehicleID}`);
        const data = await response.json();

        if (data.success) {
            isInWishlist = data.inWishlist;
            updateWishlistButton();
        }
    } catch (error) {
        console.error('Error checking wishlist:', error);
    }
}

// Update wishlist button appearance
function updateWishlistButton() {
    const btn = document.getElementById('addToWishlistBtn');
    if (!btn) return;

    if (isInWishlist) {
        btn.innerHTML = '<i class="fas fa-heart"></i>';
        btn.classList.remove('btn-outline-danger');
        btn.classList.add('btn-danger');
        btn.title = 'Đã thêm vào yêu thích';
    } else {
        btn.innerHTML = '<i class="far fa-heart"></i>';
        btn.classList.remove('btn-danger');
        btn.classList.add('btn-outline-danger');
        btn.title = 'Thêm vào yêu thích';
    }
}

// Toggle wishlist (add or remove)
async function toggleWishlist() {
    try {
        const userData = JSON.parse(localStorage.getItem("userData"));
        
        if (!userData || !userData.ID) {
            alert('Vui lòng đăng nhập để sử dụng tính năng này');
            window.location.href = '/login';
            return;
        }

        if (isInWishlist) {
            // Remove from wishlist
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

            const data = await response.json();

            if (data.success) {
                isInWishlist = false;
                updateWishlistButton();
                showWishlistMessage('Đã xóa khỏi danh sách yêu thích', 'info');
            } else {
                alert('Không thể xóa khỏi danh sách yêu thích');
            }
        } else {
            // Add to wishlist
            const response = await fetch('/api/wishlist/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    customerID: userData.ID,
                    vehicleID: vehicleID
                })
            });

            const data = await response.json();

            if (data.success) {
                isInWishlist = true;
                updateWishlistButton();
                showWishlistMessage('Đã thêm vào danh sách yêu thích', 'success');
            } else {
                alert(data.message || 'Không thể thêm vào danh sách yêu thích');
            }
        }
    } catch (error) {
        console.error('Error toggling wishlist:', error);
        alert('Có lỗi xảy ra');
    }
}

// Show wishlist message
function showWishlistMessage(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
    alertDiv.style.zIndex = '9999';
    alertDiv.innerHTML = `
        <i class="fas fa-heart me-2"></i>${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

