// Checkout page functionality
let cartItems = [];
let userData = null;
let selectedVoucher = null;
let voucherModal = null;
let qrModal = null;
let qrTimer = null;
let qrPollInterval = null;

document.addEventListener("DOMContentLoaded", function() {
    // Check authentication
    userData = JSON.parse(localStorage.getItem("userData"));
    
    if (!userData || !userData.ID) {
        alert("Vui lòng đăng nhập để thanh toán");
        window.location.href = "/login";
        return;
    }

    // Initialize voucher modal
    voucherModal = new bootstrap.Modal(document.getElementById('voucherModal'));

    // Initialize QR modal
    const qrModalElement = document.getElementById('qrPaymentModal');
    if (qrModalElement) {
        qrModal = new bootstrap.Modal(qrModalElement);
        qrModalElement.addEventListener('hidden.bs.modal', function () {
            clearQRTimers();
        });
    }

    // Load cart items and user info
    loadCheckoutData();

    // Payment method selection
    setupPaymentMethods();

    // Voucher button
    document.getElementById("selectVoucherBtn").addEventListener("click", openVoucherModal);

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

    const afterDiscount = subtotal - totalDiscount;
    
    // Apply voucher if selected - trừ trực tiếp vào tổng cộng
    let voucherAmount = 0;
    if (selectedVoucher) {
        voucherAmount = selectedVoucher.Reduction; // Trừ trực tiếp số tiền
    }

    const grandTotal = afterDiscount - voucherAmount;

    document.getElementById("subtotal").textContent = formatCurrency(subtotal);
    document.getElementById("discount").textContent = formatCurrency(totalDiscount);
    document.getElementById("voucherDiscount").textContent = formatCurrency(voucherAmount);
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
        // const note = document.getElementById("orderNote").value.trim();
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

        const afterDiscount = subtotal - totalDiscount;
        
        // Apply voucher if selected - trừ trực tiếp vào tổng cộng
        let voucherAmount = 0;
        let voucherCode = null;
        if (selectedVoucher) {
            voucherAmount = selectedVoucher.Reduction; // Trừ trực tiếp số tiền
            voucherCode = selectedVoucher.Code;
        }

        const grandTotal = afterDiscount - voucherAmount;

        // Prepare order data
        const orderData = {
            customerID: userData.ID,
            status: "Pending",
            total: subtotal,
            grandTotal: grandTotal,
            voucherCode: voucherCode,
            shippingInfo: {
                name: name,
                phone: phone,
                email: email,
                address: address
            },
            // note: note,
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
            const orderID = data.orderID;
            
            // Clear cart immediately after order creation
            await fetch("/api/cart/clear/all", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ customerID: userData.ID })
            });
            
            // Check if payment method is bank transfer
            if (paymentMethod === 'bank') {
                // Show QR payment modal
                placeOrderBtn.innerHTML = originalText;
                placeOrderBtn.disabled = false;
                
                await showQRPaymentModal(orderID, grandTotal);
            } else {
                // COD - Redirect to success page
                localStorage.setItem('lastOrder', JSON.stringify({
                    orderID: orderID,
                    paymentMethod: paymentMethod,
                    total: grandTotal,
                    orderDate: new Date().toLocaleString('vi-VN')
                }));

                window.location.href = `/order-success?orderID=${orderID}&paymentMethod=${paymentMethod}&total=${grandTotal}`;
            }
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

// ============ VOUCHER FUNCTIONALITY ============
// Open voucher modal
async function openVoucherModal() {
    voucherModal.show();
    await loadAvailableVouchers();
}

// Load available vouchers
async function loadAvailableVouchers() {
    const loadingEl = document.getElementById('voucherLoading');
    const listEl = document.getElementById('voucherList');
    const emptyEl = document.getElementById('voucherEmpty');

    loadingEl.classList.remove('d-none');
    listEl.classList.add('d-none');
    emptyEl.classList.add('d-none');

    try {
        const response = await fetch('/api/vouchers');
        const data = await response.json();

        loadingEl.classList.add('d-none');

        if (data.success && data.data && data.data.length > 0) {
            const now = new Date();
            const availableVouchers = data.data.filter(voucher => {
                const startDate = new Date(voucher.StartDate);
                const endDate = new Date(voucher.EndDate);
                return now >= startDate && now <= endDate && voucher.Quantity > 0;
            });

            if (availableVouchers.length > 0) {
                displayVouchers(availableVouchers);
                listEl.classList.remove('d-none');
            } else {
                emptyEl.classList.remove('d-none');
            }
        } else {
            emptyEl.classList.remove('d-none');
        }
    } catch (error) {
        console.error('Error loading vouchers:', error);
        loadingEl.classList.add('d-none');
        emptyEl.classList.remove('d-none');
    }
}

// Display vouchers
function displayVouchers(vouchers) {
    const listEl = document.getElementById('voucherList');
    
    // Calculate current total
    let subtotal = 0;
    let totalDiscount = 0;
    cartItems.forEach(item => {
        const itemPrice = item.Price * item.Quantity;
        subtotal += itemPrice;
        totalDiscount += itemPrice * item.Discount;
    });
    const currentTotal = subtotal - totalDiscount;

    listEl.innerHTML = vouchers.map(voucher => {
        const canApply = currentTotal >= voucher.Conditions;
        
        return `
            <div class="voucher-card ${!canApply ? 'disabled' : ''}" data-voucher='${JSON.stringify(voucher)}'>
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <div class="voucher-code">${voucher.Code}</div>
                        <div class="voucher-reduction">Giảm ${formatCurrency(voucher.Reduction)}</div>
                        <div class="voucher-condition">
                            <i class="fas fa-info-circle me-1"></i>
                            Áp dụng cho đơn hàng từ ${formatCurrency(voucher.Conditions)}
                        </div>
                        <div class="voucher-dates">
                            <i class="far fa-calendar me-1"></i>
                            ${formatDate(voucher.StartDate)} - ${formatDate(voucher.EndDate)}
                        </div>
                        <div class="voucher-quantity ${voucher.Quantity <= 5 ? 'text-warning' : ''}">
                            <i class="fas fa-ticket-alt me-1"></i>
                            Còn ${voucher.Quantity} voucher
                        </div>
                    </div>
                    ${canApply ? `
                        <button class="btn btn-primary btn-sm apply-voucher-btn">
                            Áp dụng
                        </button>
                    ` : `
                        <span class="badge bg-secondary">Không đủ điều kiện</span>
                    `}
                </div>
            </div>
        `;
    }).join('');

    // Attach event listeners
    document.querySelectorAll('.apply-voucher-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const card = this.closest('.voucher-card');
            const voucher = JSON.parse(card.dataset.voucher);
            applyVoucher(voucher);
        });
    });
}

// Apply voucher
function applyVoucher(voucher) {
    selectedVoucher = voucher;
    
    // Update UI
    document.getElementById('voucherInput').value = voucher.Code;
    document.getElementById('appliedVoucherCode').textContent = voucher.Code;
    document.getElementById('appliedVoucherAmount').textContent = formatCurrency(voucher.Reduction);
    document.getElementById('voucherApplied').classList.remove('d-none');
    
    // Setup remove button
    document.getElementById('removeVoucherBtn').addEventListener('click', removeVoucher);
    
    // Recalculate totals
    calculateOrderSummary(cartItems);
    
    // Close modal
    voucherModal.hide();
    
    // Show success message
    showAlert('Áp dụng voucher thành công!', 'success');
}

// Remove voucher
function removeVoucher() {
    selectedVoucher = null;
    document.getElementById('voucherInput').value = '';
    document.getElementById('voucherApplied').classList.add('d-none');
    calculateOrderSummary(cartItems);
    showAlert('Đã hủy voucher', 'info');
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

// Show alert
function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
    alertDiv.style.zIndex = '9999';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

// ============ QR PAYMENT FUNCTIONS ============

// Show QR Payment Modal
async function showQRPaymentModal(orderID, amount) {
    try {
        // Generate QR Code
        const response = await fetch('/api/payment/generate-qr', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                orderId: orderID,
                amount: amount
            })
        });

        const data = await response.json();

        if (data.success) {
            const { qrUrl, bankInfo } = data.data;

            // Set QR code image
            document.getElementById('qrCodeImage').src = qrUrl;

            // Set bank info
            document.getElementById('bankName').textContent = bankInfo.bankName;
            document.getElementById('bankAccountNo').textContent = bankInfo.accountNo;
            document.getElementById('bankAccountName').textContent = bankInfo.accountName;
            document.getElementById('bankAmount').textContent = formatCurrency(bankInfo.amount);
            document.getElementById('bankContent').textContent = bankInfo.content;

            // Show modal
            qrModal.show();

            // Start countdown timer (10 minutes)
            startQRTimer(600);

            // Start polling payment status (every 5 seconds)
            startPaymentPolling(orderID, amount);
        } else {
            alert('Không thể tạo mã QR');
        }
    } catch (error) {
        console.error('Error showing QR modal:', error);
        alert('Có lỗi xảy ra khi tạo mã QR');
    }
}

// Start countdown timer
function startQRTimer(seconds) {
    let remaining = seconds;
    const timerElement = document.getElementById('qrTimer');

    qrTimer = setInterval(() => {
        const minutes = Math.floor(remaining / 60);
        const secs = remaining % 60;
        timerElement.textContent = `${minutes}:${secs.toString().padStart(2, '0')}`;

        if (remaining <= 0) {
            clearInterval(qrTimer);
            showPaymentExpired();
        }

        remaining--;
    }, 1000);
}

// Start polling payment status
function startPaymentPolling(orderID, amount) {
    qrPollInterval = setInterval(async () => {
        try {
            const response = await fetch(`/api/payment/check/${orderID}`);
            const data = await response.json();

            if (data.success) {
                const status = data.data.status;

                if (status === 'Paid') {
                    clearQRTimers();
                    showPaymentSuccess(orderID, amount);
                } else if (status === 'Expired') {
                    clearQRTimers();
                    showPaymentExpired();
                }
            }
        } catch (error) {
            console.error('Error polling payment:', error);
        }
    }, 5000); // Poll every 5 seconds
}

// Clear timers
function clearQRTimers() {
    if (qrTimer) {
        clearInterval(qrTimer);
        qrTimer = null;
    }
    if (qrPollInterval) {
        clearInterval(qrPollInterval);
        qrPollInterval = null;
    }
}

// Payment success
async function showPaymentSuccess(orderID, amount) {
    // Cart already cleared when order was placed
    // Just save to localStorage and redirect
    
    // Save to localStorage
    localStorage.setItem('lastOrder', JSON.stringify({
        orderID: orderID,
        paymentMethod: 'bank',
        total: amount,
        orderDate: new Date().toLocaleString('vi-VN')
    }));

    // Hide modal and redirect
    qrModal.hide();
    
    setTimeout(() => {
        window.location.href = `/order-success?orderID=${orderID}&paymentMethod=bank&total=${amount}`;
    }, 500);
}

// Payment expired
function showPaymentExpired() {
    const statusElement = document.getElementById('paymentStatusMessage');
    statusElement.innerHTML = `
        <div class="alert alert-danger">
            <i class="fas fa-times-circle me-2"></i>
            <strong>Hết thời gian!</strong><br>
            Vui lòng thanh toán trong 10 phút.
        </div>
    `;
    statusElement.style.display = 'block';
}
