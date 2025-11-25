if (!localStorage.getItem("currentUserID")) {
    window.location.href = "login.html";
}

function ReturnHome() {
    window.location.href = "main.html";
}

function formatPrice(number) {
    return number.toLocaleString('vi-VN');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

async function loadOrderHistory() {
    const customerID = localStorage.getItem("currentUserID");
    if (!customerID) {
        console.log("No customer ID found");
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/api/order/history", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ customerID: customerID })
        });

        const data = await response.json();
        if (!data.success) {
            console.error("Failed to load order history");
            return;
        }

        const orders = data.orders;
        const orderHistoryList = document.querySelector('.order-history-list');
        
        if (orders.length === 0) {
            orderHistoryList.innerHTML = '<p style="text-align:center;padding:20px;">No orders yet</p>';
            return;
        }

        // Generate HTML for each order
        const ordersHTML = orders.map(order => {
            const itemsHTML = order.orderItems.map(item => `
                <tr>
                    <td>${item.VehicleName}</td>
                    <td>${item.Quantity}</td>
                    <td>₫${formatPrice(item.Price * item.Quantity)}</td>
                </tr>
            `).join('');

            const voucherHTML = order.voucher ? `
                <p><strong>Discount:</strong> ${order.voucher.code} (-₫${formatPrice(order.voucher.reduction)})</p>
            ` : '';

            return `
                <div class="order-item">
                    <h3>Order #${order.OrderID}</h3>
                    <p><strong>Order date:</strong> ${formatDate(order.CreateDate)}</p>
                    <p><strong>Status:</strong> <span style="color: ${order.Status === 'Pending' ? '#f59e0b' : order.Status === 'Accepted' ? '#10b981' : '#ef4444'}">${order.Status}</span></p>
                    <table>
                        <thead>
                            <tr>
                                <th>Product name</th>
                                <th>Number</th>
                                <th>Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHTML}
                        </tbody>
                    </table>
                    ${voucherHTML}
                    <p class="total"><strong>Total price:</strong> ₫${formatPrice(order.Total)}</p>
                    <p class="total"><strong>Grand Total:</strong> ₫${formatPrice(order.GrandTotal)}</p>
                </div>
            `;
        }).join('');

        orderHistoryList.innerHTML = ordersHTML;

    } catch (err) {
        console.error("Error loading order history:", err);
    }
}

async function loadWishlist() {
    const customerID = localStorage.getItem("currentUserID");

    try {
        const response = await fetch("http://localhost:3000/api/wishlist/read", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ customerID: customerID })
        });

        const data = await response.json();
        if (!data.success) {
            console.error("Failed to load wishlist");
            return;
        }

        const wishlistItems = data.wishlistItems;
        const wishlistList = document.querySelector('.wishlist-list');
        
        if (wishlistItems.length === 0) {
            wishlistList.innerHTML = '<p style="text-align:center;padding:20px;">No items in wishlist</p>';
            return;
        }

        // Fetch vehicle details for each wishlist item
        const itemsWithDetails = await Promise.all(wishlistItems.map(async (item) => {
            const vehicleRes = await fetch("http://localhost:3000/api/vehicle/detail", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ vehicleID: item.VehicleID })
            });
            const vehicleData = await vehicleRes.json();
            
            // Get first image
            const imageRes = await fetch("http://localhost:3000/api/vehicle/first_images", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ vehicleID: item.VehicleID })
            });
            const imageData = await imageRes.json();
            
            return {
                ...item,
                vehicle: vehicleData.success ? vehicleData.vehicle : null,
                imageUrl: imageData.success ? imageData.imageUrl : 'picture/waveA.png'
            };
        }));

        // Generate HTML for each wishlist item
        const wishlistHTML = itemsWithDetails.map(item => {
            if (!item.vehicle) return '';
            
            return `
                <div class="wishlist-item" onclick="goToDetail('${item.VehicleID}')" style="cursor:pointer;">
                    <img src="${item.imageUrl}" alt="${item.vehicle.Name}">
                    <div class="wishlist-info">
                        <h3>${item.vehicle.Name}</h3>
                        <p>Price: <strong>₫${formatPrice(item.vehicle.Price)}</strong></p>
                        <button onclick="event.stopPropagation(); addToCartFromWishlist('${item.VehicleID}', ${item.vehicle.Price})">Add to cart</button>
                    </div>
                </div>
            `;
        }).join('');

        wishlistList.innerHTML = wishlistHTML;

    } catch (err) {
        console.error("Error loading wishlist:", err);
    }
}

function goToDetail(vehicleID) {
    localStorage.setItem("selectedVehicle", vehicleID);
    window.location.href = "Detail.html";
}

async function addToCartFromWishlist(vehicleID, price) {
    const userID = localStorage.getItem("currentUserID");

    try {
        const res = await fetch("http://localhost:3000/api/cartItem/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                vehicleID: vehicleID, 
                currentUserID: userID, 
                vehiclePrice: price, 
                discount: 0 
            })
        });

        const data = await res.json();
        if (data.success) {
            alert("Added to cart successfully!");
        } else {
            alert("Failed to add to cart");
        }
    } catch (err) {
        console.error("Error adding to cart:", err);
        alert("Error adding to cart");
    }
}

window.onload = function()  {
    // const correct_full_name = localStorage.getItem("Full_name");
    const correct_full_name = localStorage.getItem("currentUser");
    const full_name_div = document.getElementById("Username");
    full_name_div.textContent = correct_full_name;

    const corret_email= localStorage.getItem("currentUserEmail");
    const email_div = document.getElementById("email");
    email_div.innerHTML = "<b>Email address:</b>" + corret_email;

    const correct_phone_number = localStorage.getItem("currentUserPhone");
    const phone_div = document.getElementById("phone_number");
    phone_div.innerHTML = "<b>Phone number:</b> " + correct_phone_number;

    // Load order history and wishlist
    loadOrderHistory();
    loadWishlist();
}
