// Order Success Page
let orderData = null;

document.addEventListener('DOMContentLoaded', function() {
    // Get order data from URL parameters or localStorage
    loadOrderData();
});

// Load order data
function loadOrderData() {
    // Try to get from URL params first
    const urlParams = new URLSearchParams(window.location.search);
    const orderID = urlParams.get('orderID');
    const paymentMethod = urlParams.get('paymentMethod');
    const total = urlParams.get('total');

    if (orderID) {
        // Display order info from URL params
        displayOrderInfo({
            orderID: orderID,
            paymentMethod: paymentMethod,
            total: parseFloat(total) || 0,
            orderDate: new Date().toLocaleString('vi-VN')
        });
    } else {
        // Try to get from localStorage (backup method)
        const savedOrder = localStorage.getItem('lastOrder');
        if (savedOrder) {
            const order = JSON.parse(savedOrder);
            displayOrderInfo(order);
            // Clear after displaying
            localStorage.removeItem('lastOrder');
        } else {
            // No order data found, redirect to home
            alert('Không tìm thấy thông tin đơn hàng');
            window.location.href = '/';
        }
    }
}

// Display order information
function displayOrderInfo(order) {
    orderData = order;

    // Basic order info
    document.getElementById('orderID').textContent = `#${order.orderID}`;
    document.getElementById('orderDate').textContent = order.orderDate || new Date().toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Payment method
    const paymentMethodText = order.paymentMethod === 'bank' 
        ? 'Chuyển khoản ngân hàng' 
        : 'Thanh toán khi nhận hàng';
    document.getElementById('paymentMethod').textContent = paymentMethodText;

    // Total amount
    const totalFormatted = formatCurrency(order.total);
    document.getElementById('totalAmount').textContent = totalFormatted;

    // Order status - if bank transfer, order is already Accepted
    const statusBadge = document.getElementById('orderStatus');
    if (order.paymentMethod === 'bank') {
        statusBadge.textContent = 'Đã xác nhận';
        statusBadge.className = 'badge bg-success';
    } else {
        statusBadge.textContent = 'Chờ xác nhận';
        statusBadge.className = 'badge bg-warning text-dark';
    }

    // Show bank transfer section if payment method is bank
    if (order.paymentMethod === 'bank') {
        showBankTransferInfo(order);
    }
}

// Show bank transfer information
// function showBankTransferInfo(order) {
//     const bankSection = document.getElementById('bankTransferSection');
//     bankSection.style.display = 'block';

//     // Set transfer amount
//     document.getElementById('transferAmount').textContent = formatCurrency(order.total);

//     // Set transfer content with order ID
//     const transferContent = `BKMOTOR ${order.orderID}`;
//     document.getElementById('transferContent').textContent = transferContent;
// }

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}
