// Cart page functionality
document.addEventListener("DOMContentLoaded", function() {
    loadCart();

    // Clear cart button
    const clearCartBtn = document.getElementById("clearCartBtn");
    if (clearCartBtn) {
        clearCartBtn.addEventListener("click", handleClearCart);
    }

    // Checkout button
    const checkoutBtn = document.getElementById("checkoutBtn");
    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", handleCheckout);
    }
});

// Load cart items
async function loadCart() {
    try {
        const userData = JSON.parse(localStorage.getItem("userData"));
        
        if (!userData || !userData.ID) {
            showEmptyCart();
            return;
        }

        const response = await fetch(`/api/cart?customerID=${userData.ID}`);
        const data = await response.json();

        if (data.success && data.data.length > 0) {
            displayCartItems(data.data);
            calculateTotal(data.data);
            updateCartBadge(data.data.length);
        } else {
            showEmptyCart();
            updateCartBadge(0);
        }
    } catch (error) {
        console.error("Error loading cart:", error);
        showEmptyCart();
    }
}

// Display cart items
function displayCartItems(items) {
    const cartItemsList = document.getElementById("cartItemsList");
    const cartContent = document.getElementById("cartContent");
    const emptyCart = document.getElementById("emptyCart");

    cartContent.style.display = "flex";
    emptyCart.style.display = "none";

    cartItemsList.innerHTML = items.map(item => {
        const itemTotal = item.Price * item.Quantity * (1 - item.Discount);
        const imageUrl = item.ImageLink || `https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&h=600&fit=crop&q=80`;
        
        return `
            <div class="cart-item" data-cart-id="${item.CartItemID}">
                <img src="${imageUrl}" 
                     alt="${item.VehicleName}" 
                     class="cart-item-image"
                     onerror="this.src='https://via.placeholder.com/120x90?text=No+Image'">
                
                <div class="cart-item-info">
                    <div class="cart-item-details">
                        <h5>${item.VehicleName}</h5>
                        <p class="mb-0">Đơn giá: ${formatCurrency(item.Price)}</p>
                        ${item.Discount > 0 ? `<p class="text-danger mb-0">Giảm: ${(item.Discount * 100).toFixed(0)}%</p>` : ''}
                    </div>

                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateQuantity(${item.CartItemID}, ${item.Quantity - 1})">
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="number" 
                               class="quantity-input" 
                               value="${item.Quantity}" 
                               min="1" 
                               max="10"
                               onchange="updateQuantity(${item.CartItemID}, this.value)">
                        <button class="quantity-btn" onclick="updateQuantity(${item.CartItemID}, ${item.Quantity + 1})">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>

                    <div class="cart-item-price">
                        ${formatCurrency(itemTotal)}
                    </div>

                    <button class="remove-btn" onclick="removeCartItem(${item.CartItemID})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Calculate and display total
function calculateTotal(items) {
    let subtotal = 0;
    let totalDiscount = 0;

    items.forEach(item => {
        const itemPrice = item.Price * item.Quantity;
        subtotal += itemPrice;
        totalDiscount += itemPrice * item.Discount;
    });

    const total = subtotal - totalDiscount;

    document.getElementById("subtotal").textContent = formatCurrency(subtotal);
    document.getElementById("discount").textContent = formatCurrency(totalDiscount);
    document.getElementById("total").textContent = formatCurrency(total);
}

// Update cart item quantity
async function updateQuantity(cartItemID, newQuantity) {
    newQuantity = parseInt(newQuantity);
    
    if (newQuantity < 1) {
        if (confirm("Bạn muốn xóa sản phẩm này khỏi giỏ hàng?")) {
            await removeCartItem(cartItemID);
        }
        return;
    }

    if (newQuantity > 10) {
        alert("Số lượng tối đa là 10");
        return;
    }

    try {
        const response = await fetch(`/api/cart/${cartItemID}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ Quantity: newQuantity })
        });

        const data = await response.json();

        if (data.success) {
            loadCart();
        } else {
            alert("Không thể cập nhật số lượng");
        }
    } catch (error) {
        console.error("Error updating quantity:", error);
        alert("Có lỗi xảy ra khi cập nhật số lượng");
    }
}

// Remove cart item
async function removeCartItem(cartItemID) {
    try {
        if (!confirm("Bạn muốn xóa sản phẩm này khỏi giỏ hàng?")) {
            return;
        }
        const response = await fetch(`/api/cart/${cartItemID}`, {
            method: "DELETE"
        });

        const data = await response.json();

        if (data.success) {
            loadCart();
        } else {
            alert("Không thể xóa sản phẩm");
        }
    } catch (error) {
        console.error("Error removing item:", error);
        alert("Có lỗi xảy ra khi xóa sản phẩm");
    }
}

// Clear entire cart
async function handleClearCart() {
    if (!confirm("Bạn có chắc muốn xóa tất cả sản phẩm trong giỏ hàng?")) {
        return;
    }

    try {
        const userData = JSON.parse(localStorage.getItem("userData"));
        
        if (!userData || !userData.ID) {
            alert("Vui lòng đăng nhập");
            return;
        }

        const response = await fetch("/api/cart/clear/all", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ customerID: userData.ID })
        });

        const data = await response.json();

        if (data.success) {
            loadCart();
        } else {
            alert("Không thể xóa giỏ hàng");
        }
    } catch (error) {
        console.error("Error clearing cart:", error);
        alert("Có lỗi xảy ra khi xóa giỏ hàng");
    }
}

// Handle checkout
function handleCheckout() {
    const userData = JSON.parse(localStorage.getItem("userData"));
    
    if (!userData || !userData.ID) {
        alert("Vui lòng đăng nhập để thanh toán");
        window.location.href = "/login";
        return;
    }

    // Navigate to checkout page
    window.location.href = "/checkout";
}

// Show empty cart
function showEmptyCart() {
    const cartContent = document.getElementById("cartContent");
    const emptyCart = document.getElementById("emptyCart");

    cartContent.style.display = "none";
    emptyCart.style.display = "block";
}

// Update cart badge in navbar
function updateCartBadge(count) {
    const cartCount = document.getElementById("cartCount");
    if (cartCount) {
        if (count > 0) {
            cartCount.textContent = count;
            cartCount.style.display = "inline-block";
        } else {
            cartCount.style.display = "none";
        }
    }
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

// Make functions global
window.updateQuantity = updateQuantity;
window.removeCartItem = removeCartItem;
