// Checkout page functionality
let cartItems = [];
let userData = null;

document.addEventListener("DOMContentLoaded", function() {
    // Check authentication
    userData = JSON.parse(localStorage.getItem("userData"));
    
    if (!userData || !userData.ID) {
        alert("Vui lòng đăng nhập để thanh toán");
        window.location.href = "/login";
        return;
    }

    // Load cart items and user info
    loadCheckoutData();

    // Payment method selection
    setupPaymentMethods();

    // Place order button
    const placeOrderBtn = document.getElementById("placeOrderBtn");
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener("click", handlePlaceOrder);
    }
});

// Load checkout data
async function loadCheckoutData() {
    try {
        // Load cart items
        const response = await fetch(`/api/cart?customerID=${userData.ID}`);
        const data = await response.json();

        if (data.success && data.data.length > 0) {
            cartItems = data.data;
            displayOrderItems(cartItems);
            calculateOrderSummary(cartItems);
            populateCustomerInfo();
        } else {
            alert("Giỏ hàng của bạn đang trống");
            window.location.href = "/cart";
        }
    } catch (error) {
        console.error("Error loading checkout data:", error);
        alert("Có lỗi xảy ra khi tải thông tin đơn hàng");
    }
}

// Display order items
function displayOrderItems(items) {
    const orderItemsContainer = document.getElementById("orderItems");

    orderItemsContainer.innerHTML = items.map(item => {
        const itemTotal = item.Price * item.Quantity * (1 - item.Discount);
        const imageUrl = item.ImageLink || `https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&h=600&fit=crop&q=80`;

        return `
            <div class="order-item">
                <img src="${imageUrl}" 
                     alt="${item.VehicleName}" 
                     class="order-item-image"
                     onerror="this.src='https://via.placeholder.com/80x60?text=No+Image'">
                <div class="order-item-info">
                    <h6>${item.VehicleName}</h6>
                    <p>Số lượng: ${item.Quantity} × ${formatCurrency(item.Price)}</p>
                    ${item.Discount > 0 ? `<p class="text-danger">Giảm: ${(item.Discount * 100).toFixed(0)}%</p>` : ''}
                </div>
                <div class="order-item-price">
                    ${formatCurrency(itemTotal)}
                </div>
            </div>
        `;
    }).join('');
}

// Calculate order summary
function calculateOrderSummary(items) {
    let subtotal = 0;
    let totalDiscount = 0;

    items.forEach(item => {
        const itemPrice = item.Price * item.Quantity;
        subtotal += itemPrice;
        totalDiscount += itemPrice * item.Discount;
    });

    const grandTotal = subtotal - totalDiscount;

    document.getElementById("subtotal").textContent = formatCurrency(subtotal);
    document.getElementById("discount").textContent = formatCurrency(totalDiscount);
    document.getElementById("grandTotal").textContent = formatCurrency(grandTotal);
}

// Populate customer info from localStorage
function populateCustomerInfo() {
    if (userData) {
        document.getElementById("customerName").value = userData.Name || "";
        document.getElementById("customerPhone").value = userData.Phone || "";
        document.getElementById("customerEmail").value = userData.Email || "";
        document.getElementById("customerAddress").value = userData.Address || "";
    }
}

// Setup payment method selection
function setupPaymentMethods() {
    const paymentMethods = document.querySelectorAll(".payment-method");

    paymentMethods.forEach(method => {
        method.addEventListener("click", function() {
            // Remove active class from all
            paymentMethods.forEach(m => m.classList.remove("active"));
            
            // Add active class to clicked
            this.classList.add("active");
            
            // Check the radio button
            const radio = this.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
            }
        });
    });
}

// Handle place order
async function handlePlaceOrder() {
    try {
        // Validate form
        const form = document.getElementById("checkoutForm");
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // Get form data
        const name = document.getElementById("customerName").value.trim();
        const phone = document.getElementById("customerPhone").value.trim();
        const email = document.getElementById("customerEmail").value.trim();
        const address = document.getElementById("customerAddress").value.trim();
        const note = document.getElementById("orderNote").value.trim();
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

        if (!name || !phone || !email || !address) {
            alert("Vui lòng điền đầy đủ thông tin giao hàng");
            return;
        }

        // Calculate totals
        let subtotal = 0;
        let totalDiscount = 0;

        cartItems.forEach(item => {
            const itemPrice = item.Price * item.Quantity;
            subtotal += itemPrice;
            totalDiscount += itemPrice * item.Discount;
        });

        const grandTotal = subtotal - totalDiscount;

        // Prepare order data
        const orderData = {
            customerID: userData.ID,
            status: "Pending",
            total: subtotal,
            grandTotal: grandTotal,
            shippingInfo: {
                name: name,
                phone: phone,
                email: email,
                address: address
            },
            note: note,
            paymentMethod: paymentMethod,
            items: cartItems.map(item => ({
                vehicleID: item.VehicleID,
                quantity: item.Quantity,
                price: item.Price,
                discount: item.Discount
            }))
        };

        // Show loading
        const placeOrderBtn = document.getElementById("placeOrderBtn");
        const originalText = placeOrderBtn.innerHTML;
        placeOrderBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Đang xử lý...';
        placeOrderBtn.disabled = true;

        // Submit order
        const response = await fetch("/api/orders/checkout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(orderData)
        });

        const data = await response.json();

        if (data.success) {
            // Clear cart
            await fetch("/api/cart/clear/all", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ customerID: userData.ID })
            });

            // Save order info to localStorage (backup method)
            localStorage.setItem('lastOrder', JSON.stringify({
                orderID: data.orderID,
                paymentMethod: paymentMethod,
                total: grandTotal,
                orderDate: new Date().toLocaleString('vi-VN')
            }));

            // Redirect to order success page with URL params
            window.location.href = `/order-success?orderID=${data.orderID}&paymentMethod=${paymentMethod}&total=${grandTotal}`;
        } else {
            alert("Đặt hàng thất bại: " + (data.message || "Vui lòng thử lại"));
            placeOrderBtn.innerHTML = originalText;
            placeOrderBtn.disabled = false;
        }
    } catch (error) {
        console.error("Error placing order:", error);
        alert("Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại");
        
        const placeOrderBtn = document.getElementById("placeOrderBtn");
        placeOrderBtn.innerHTML = '<i class="fas fa-check-circle me-2"></i>Đặt Hàng';
        placeOrderBtn.disabled = false;
    }
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}
