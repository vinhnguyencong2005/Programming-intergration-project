// // ------------------- CHUYỂN TRANG -------------------
// function ReturnHome() {
//   window.location.href = "main.html";
// }

// // ------------------- THAY ĐỔI SỐ LƯỢNG -------------------
// function ChangeQuantity(button, delta) {
//   const countDiv = button.parentElement.querySelector('.count');
//   let current = parseInt(countDiv.textContent);
//   const item = button.closest('.item');

//   // Lấy số lượng tồn kho
//   const stockText = Array.from(item.querySelectorAll('.item-info div'))
//     .find(div => div.textContent.includes('Quantity in stock'));
//   const stock = stockText ? parseInt(stockText.textContent.match(/\d+/)[0]) : 9999;

//   // Cập nhật số lượng
//   if (delta === 1 && current < stock) current++;
//   else if (delta === -1 && current > 1) current--;

//   countDiv.textContent = current;

//   // Cập nhật lại giá từng sản phẩm và tổng giỏ
//   updateEachPrice();
//   updateTotalProduct();
//   total_price();
// }

// // ------------------- TỔNG SỐ SẢN PHẨM -------------------
// function updateTotalProduct() {
//   const count_products = document.querySelectorAll('.count');
//   let total = 0;
//   count_products.forEach(c => total += parseInt(c.textContent));
//   const productCountDiv = document.querySelector('.total-products');
//   if (productCountDiv)
//     productCountDiv.textContent = `${total} product${total > 1 ? 's' : ''}`;
// }

// // ------------------- CẬP NHẬT GIÁ MỖI SẢN PHẨM -------------------
// function updateEachPrice() {
//   const items = document.querySelectorAll('.item');

//   items.forEach(item => {
//     const count = Number(item.querySelector('.count').textContent);
//     const basePrice = Number(item.getAttribute('data-base-price') || 0);
//     const total_each_product = count * basePrice;
//     const priceDiv = item.querySelector('.price');
//     priceDiv.textContent = `₫${total_each_product.toLocaleString()}`;
//   });
// }

// // ------------------- TỔNG GIÁ -------------------
// function total_price() {
//   const count_div = document.querySelectorAll('.count');
//   const price_div = document.querySelectorAll('.price');
//   let total_price_value = 0;

//   for (let i = 0; i < count_div.length; ++i) {
//     const count = Number(count_div[i].textContent);
//     const price = Number(price_div[i].textContent.replace(/[₫,.]/g, ''));
//     total_price_value += price;
//   }

//   const total_div = document.querySelector('.total_price');
//   const temp_price = document.querySelector('.tempo-price');
//   if (total_div) total_div.textContent = `₫${total_price_value.toLocaleString()}`;
//   if (temp_price) temp_price.textContent = `₫${total_price_value.toLocaleString()}`;
// }

// // ------------------- XÓA SẢN PHẨM -------------------
// function removeItem(index) {
//   let cart = JSON.parse(localStorage.getItem('cart')) || [];
//   cart.splice(index, 1);
//   localStorage.setItem('cart', JSON.stringify(cart));
//   window.location.reload();
// }

// // ------------------- HIỂN THỊ GIỎ HÀNG -------------------
// window.addEventListener("load", function () {
//   const cart = JSON.parse(localStorage.getItem('cart')) || [];
//   const cartContainer = document.querySelector('.cart-items');

//   if (!cartContainer) return;

//   if (cart.length === 0) {
//     cartContainer.innerHTML = '<p>🛒 Giỏ hàng trống</p>';
//     return;
//   }

//   cartContainer.innerHTML = '';

//   cart.forEach((item, index) => {
//     const div = document.createElement('div');
//     div.classList.add('item');
//     div.setAttribute('data-base-price', item.price.replace(/[₫,.]/g, ''));
//     div.innerHTML = `
//       <div class="thumb" style="background-image:url('${item.image}')"></div>
//       <div class="item-info">
//         <div class="item-title">${item.name}</div>
//         <div class="item-meta">Color: ${item.color}</div>
//         <div>Quantity in stock: ${item.stock}</div>
//       </div>
//       <div class="item-controls">
//         <div class="qty">
//           <button onclick="ChangeQuantity(this, -1)">−</button>
//           <div class="count">${item.quantity}</div>
//           <button onclick="ChangeQuantity(this, 1)">+</button>
//         </div>
//         <div class="price">₫${(item.price * item.quantity).toLocaleString()}</div>
//         <button class="remove" onclick="removeItem(${index})">Delete</button>
//       </div>
//     `;
//     cartContainer.appendChild(div);
//   });

//   updateTotalProduct();
//   total_price();
// });

// // ------------------- QR CODE + TIMER -------------------
// let countdownInterval;
// let remainingTime = 600; // 10 phút = 600 giây
const bankCode = 'VCB';
const accountNumber = '9946311901';

let appliedVoucherCode = null; // Store applied voucher code

const applyButton = document.getElementById("applybutton");

document.addEventListener("DOMContentLoaded", () => {
  const checkoutBtn = document.querySelector(".checkout");
  if (!checkoutBtn) return;

  checkoutBtn.addEventListener("click", async function () {
    // Get all cart items
    const items = document.querySelectorAll('.item');
    if (items.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    // Prepare cart items data
    const cartItems = Array.from(items).map(item => {
      const cartItemID = item.dataset.cartItemId;
      const priceDiv = item.querySelector('.price');
      const countDiv = item.querySelector('.count');
      const vehicleID = item.querySelector('.item-meta').textContent.replace('ID: ', '').trim();
      
      return {
        CartItemID: cartItemID,
        VehicleID: vehicleID,
        Quantity: Number(countDiv.textContent) || 1,
        Price: Number(priceDiv.dataset.unit) || 0,
        Discount: 0
      };
    });

    // Get customer ID
    const customerID = localStorage.getItem("currentUserID");
    if (!customerID) {
      alert("Please login to place an order!");
      return;
    }

    // Get totals
    const tempoPrice = parsePrice(document.querySelector('.tempo-price').textContent);
    const grandTotal = parsePrice(document.querySelector('.total_price').textContent);
    
    // Get voucher code if applied
    const voucherCode = appliedVoucherCode;

    try {
      // Create order
      const response = await fetch("http://localhost:3000/api/order/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerID: customerID,
          total: tempoPrice,
          grandTotal: grandTotal,
          cartItems: cartItems,
          voucherCode: voucherCode
        })
      });

      const data = await response.json();
      if (!data.success) {
        alert("Failed to create order: " + data.message);
        return;
      }

      console.log(`✅ Order created successfully! Order ID: ${data.orderID}`);
      console.log(`Total: ₫${formatPrice(tempoPrice)}`);
      console.log(`Grand Total: ₫${formatPrice(grandTotal)}`);
      if (voucherCode) {
        console.log(`Voucher applied: ${voucherCode}`);
      }

      // Show QR code
      const amount = grandTotal;
      const message = `${data.orderID}`;
      const modal = document.getElementById("qrModal");
      modal.style.display = "flex";
      clearInterval(countdownInterval);
      remainingTime = 600;
      document.getElementById("qrcode").innerHTML = `<img src="https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact2.png?amount=${amount}&addInfo=${message}" width="400" height="auto" />`;
      
      startCountdown();
    } catch (err) {
      console.error("Error creating order:", err);
      alert("Failed to create order. Please try again.");
    }
  });
});

function startCountdown() {
  const timerDisplay = document.getElementById("timer");
  updateTimerDisplay(timerDisplay);
  countdownInterval = setInterval(() => {
    remainingTime--;
    updateTimerDisplay(timerDisplay);

    if (remainingTime <= 0) {
      clearInterval(countdownInterval);
      document.getElementById("timer").textContent = "⏰ Hết thời gian quét QR!";
      setTimeout(closeQR, 2000);
    }
  }, 1000);
}

async function applyVoucher() {
  const code = document.getElementById("couponCode").value.trim();
  if (!code) {
    alert("Please enter a voucher code.");
    return;
  }
  try {
    const response = await fetch("http://localhost:3000/api/voucher/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code })
    });
    const data = await response.json();
    
    if (data.success && data.vouchers && data.vouchers.length > 0) {
      const voucher = data.vouchers[0];
      const reduction = voucher.Reduction;
      const conditions = voucher.Conditions;
      
      // Get current total price
      const currentTotal = parsePrice(document.querySelector('.total_price').textContent);
      
      // Check if order meets minimum conditions
      if (currentTotal < conditions) {
        alert(`This voucher requires a minimum order of ₫${formatPrice(conditions)}. Your current total is ₫${formatPrice(currentTotal)}.`);
        return;
      }
      
      // Apply discount
      const discountAmount = reduction;
      const newTotal = currentTotal - discountAmount;
      
      // Update display
      const discountLine = document.querySelector('.discount-line');
      const discountAmountSpan = document.querySelector('.discount-amount');
      
      if (discountLine && discountAmountSpan) {
        discountLine.style.display = 'flex';
        discountAmountSpan.textContent = `-₫${formatPrice(discountAmount)}`;
      }
      
      document.querySelector('.total_price').textContent = `₫${formatPrice(newTotal)}`;
      
      // Store the applied voucher code
      appliedVoucherCode = code;
      
      alert(`Voucher applied! You saved ₫${formatPrice(discountAmount)}`);
      console.log(`Voucher applied! Reduction: ₫${formatPrice(reduction)}`);
    } else {
      alert("Invalid voucher code or voucher not found.");
    }
  } catch (error) {
    console.error("Error applying voucher:", error);
    alert("Failed to apply voucher. Please try again.");
  }
}
// function updateTimerDisplay(el) {
//   if (!el) return;
//   const minutes = Math.floor(remainingTime / 60);
//   const seconds = remainingTime % 60;
//   el.textContent = `Thời gian còn lại: ${minutes}:${seconds.toString().padStart(2, '0')}`;
// }

// function closeQR() {
//   clearInterval(countdownInterval);
//   const modal = document.getElementById("qrModal");
//   if (modal) modal.style.display = "none";
// }

async function loadVehicleDetails(vehicleID) {
  const res = await fetch("http://localhost:3000/api/vehicle/detail", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ vehicleID: vehicleID })
  });

  const data = await res.json();
  if (!data.success) {
    document.getElementById("vehicle-detail").innerText = "Không tìm thấy sản phẩm!";
    return;
  }

  const vehicle = data.vehicle;
  return vehicle;
}

function ReturnHome() {
  window.location.href = "main.html";
}
// Lấy thông tin giỏ hàng từ database bằng userID ngay khi trang được tải
async function loadCartItems() {
  console.log(localStorage.getItem("currentUserID"));

  const userID = localStorage.getItem("currentUserID");
  const response = await fetch("http://localhost:3000/api/cartItem/get", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currentUserID: userID })
  });

  // If server returned non-JSON (like an HTML 404 page), response.json() will throw.
  // Check response.ok first and handle errors gracefully.
  if (!response.ok) {
    const text = await response.text();
    console.error(`Failed to load cart items: ${response.status}`, text);
    // Optionally show a user-friendly message
    // alert('Could not load cart items.');
    return;
  }

  const data = await response.json();
  if (data && data.success) {
    const cartItems = data.cartItems;
    console.log('Cart items loaded:', cartItems);

    const cartContainer = document.querySelector('.cart-items');
    if (!cartContainer) return;

    if (cartItems.length === 0) {
      cartContainer.innerHTML = '<p>🛒 Empty cart</p>';
      updateTotalProduct();
      total_price();
      return;
    }

    // Enrich cart items with vehicle details. Prefer server-provided fields (if API merged them).
    const enriched = await Promise.all(cartItems.map(async (item) => {
      // Fetch vehicle details and first image
      try {
        const vehicleRes = await fetch("http://localhost:3000/api/vehicle/detail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vehicleID: item.VehicleID })
        });
        const vehicleData = await vehicleRes.json();
        
        let vehicleImage = 'picture/waveA.png';
        
        // Fetch first image using the API
        try {
          const imageRes = await fetch("http://localhost:3000/api/vehicle/first_images", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ vehicleID: item.VehicleID })
          });
          const imageData = await imageRes.json();
          if (imageData.success && imageData.imageUrl) {
            vehicleImage = imageData.imageUrl;
          }
        } catch (imageError) {
          console.error('Error fetching first image:', imageError);
        }

        const vehicle = vehicleData.vehicle || {};
        
        return {
          ...item,
          vehicleName: vehicle?.Name || 'Unknown Vehicle',
          vehiclePrice: vehicle?.Price || item.Price || 0,
          vehicleImage: vehicleImage,
          vehicleStock: vehicle?.Stock || 'N/A'
        };
      } catch (e) {
        console.error('Error enriching cart item:', e);
        return {
          ...item,
          vehicleName: 'Unknown Vehicle',
          vehiclePrice: item.Price || 0,
          vehicleImage: 'picture/waveA.png',
          vehicleStock: 'N/A'
        };
      }
    }));

    const htmls = enriched.map((item, index) => {
      const price = Number(item.Price);
      const quantity = Number(item.Quantity);
      const totalPrice = price * quantity;

      return `
        <div class="item" data-cart-item-id="${item.CartItemID}"> 
          <div class="thumb">
            <img src="${item.vehicleImage || 'picture/waveA.png'}" alt="${item.vehicleName || 'Vehicle'}">
          </div>
          <div class="item-info">
            <div class="item-title">${item.vehicleName || 'Unknown Vehicle'}</div>
            <div class="item-meta">ID: ${item.VehicleID}</div>
            <div style="font-size:13px;color:var(--muted)">Quantities in stock: ${item.vehicleStock ?? 'N/A'}</div>
          </div>
          <div class="item-controls">
            <div class="qty">
              <button onclick="ChangeQuantity(this, -1)">−</button>
              <div class="count">${quantity}</div>
              <button onclick="ChangeQuantity(this, 1)">+</button>
            </div>
            <div class="price" data-unit="${price}">₫${totalPrice.toLocaleString()}</div>
            <button class="remove" onclick="removeItem(${index})">Delete</button>
          </div>
        </div>
      `;
    }).join('');

    cartContainer.innerHTML = htmls;
    updateTotalProduct();
    updateEachPrice();
    total_price();
  }



}

// document.querySelector('checkout')?.addEventListener('click', () => {
  

loadCartItems();





















// ===================== HÀM THAY ĐỔI SỐ LƯỢNG =====================
async function ChangeQuantity(button, delta) {
  const countDiv = button.parentElement.querySelector('.count');
  let current = Number(countDiv.textContent) || 0;
  const item = button.closest('.item');
  const index = Array.from(document.querySelectorAll('.item')).indexOf(item);
  // Lấy số lượng tồn kho (nếu không tìm thấy -> vô hạn)
  const stockText = Array.from(item.querySelectorAll('.item-info div'))
    .find(div => div.textContent && div.textContent.includes('Quantities in stock'));
  const stock = stockText ? (parseInt(stockText.textContent.match(/\d+/)[0]) || Infinity) : Infinity;


  //When current product = 1 but customer enter '-' button. The system will announce "Do you want to delete this product in your cart?"
  if(delta === -1 && current === 1) {
    const confirmDelete = confirm("Do you want to delete this product in your cart?");

    if (confirmDelete) {
      removeItem(index);
      return;
    }
    else {
      return;
    }
  }

  // Thay đổi số lượng an toàn
  if (delta === 1) {
    if (current < stock) current += 1;
  } else if (delta === -1) {
    if (current > 1) current -= 1;
  }

  // Cập nhật lại hiển thị
  countDiv.textContent = current;

  // Get CartItemID from data attribute (we'll need to add this when creating items)
  const cartItemID = item.dataset.cartItemId;
  
  // Cập nhật database
  if (cartItemID) {
    try {
      const response = await fetch("http://localhost:3000/api/cartItem/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItemID: cartItemID, quantity: current })
      });
      
      const data = await response.json();
      if (!data.success) {
        console.error("Failed to update cart item:", data.message);
        alert("Failed to update quantity. Please try again.");
        return;
      }
      console.log("Cart item updated successfully in database");
    } catch (err) {
      console.error("Error updating cart item:", err);
      alert("Failed to update quantity. Please try again.");
      return;
    }
  }

  // Cập nhật tổng số sản phẩm và giá
  updateTotalProduct();
  updateEachPrice();
  total_price();
}

// ===================== CẬP NHẬT TỔNG SẢN PHẨM =====================
function updateTotalProduct() {
  const count_products = document.querySelectorAll('.count');
  let total = 0;
  count_products.forEach(c => total += parseInt(c.textContent) || 0);
  const productCountDiv = document.querySelector('.total-products');
  if (productCountDiv) productCountDiv.textContent = `${total} product${total > 1 ? 's' : ''}`;
}

function total_products() {
  // giữ để tương thích, gọi lại updateTotalProduct
  updateTotalProduct();
}

// ===================== CẬP NHẬT GIÁ TỪNG SẢN PHẨM =====================
// Lấy giá đơn vị từ data-unit (số nguyên), hiển thị tổng cho mỗi sản phẩm
function updateEachPrice() {
  const items = document.querySelectorAll('.item');
  items.forEach(item => {
    const countDiv = item.querySelector('.count');
    const priceDiv = item.querySelector('.price');
    const unit = Number(priceDiv?.dataset?.unit) || 0; // data-unit lưu giá đơn vị
    const count = Number(countDiv?.textContent) || 0;
    const total_each_product = count * unit;
    // hiển thị: nếu bạn muốn vẫn giữ price div là tổng:
    priceDiv.textContent = `₫${total_each_product.toLocaleString()}`;
    // nếu bạn muốn hiển thị 2 dòng (unit + total) thì cần thay đổi DOM.
  });
}

// Helper function to parse Vietnamese formatted price
function parsePrice(priceText) {
  if (!priceText) return 0;
  // Remove currency symbol and dots, then convert to number
  return Number(priceText.replace(/[₫,.]/g, '')) || 0;
}

// Format number to Vietnamese locale with dots
function formatPrice(number) {
  return number.toLocaleString('vi-VN');
}

// ===================== TÍNH TỔNG GIÁ =====================
function total_price() {
  const items = document.querySelectorAll('.item');
  let total_price_value = 0;
  
  items.forEach(item => {
    const count = Number(item.querySelector('.count')?.textContent) || 0;
    const priceDiv = item.querySelector('.price');
    const unit = Number(priceDiv?.dataset?.unit) || 0;
    total_price_value += count * unit;
  });

  const total_div = document.querySelector('.total_price');
  const temp_price = document.querySelector('.tempo-price');
  
  const formattedPrice = formatPrice(total_price_value);
  if (total_div) total_div.textContent = `₫${formattedPrice}`;
  if (temp_price) temp_price.textContent = `₫${formattedPrice}`;
  
  console.log('Total price updated:', total_price_value, `₫${formattedPrice}`);
}

// ===================== QR CODE THANH TOÁN =====================
let countdownInterval;
let remainingTime = 600; // 10 phút = 600 giây

function startCountdown() {
  const timerDisplay = document.getElementById("timer");
  updateTimerDisplay(timerDisplay);
  countdownInterval = setInterval(() => {
    remainingTime--;
    updateTimerDisplay(timerDisplay);
    if (remainingTime <= 0) {
      clearInterval(countdownInterval);
      if (document.getElementById("timer"))
        document.getElementById("timer").textContent = "⏰ End time!";
      setTimeout(closeQR, 2000);
    }
  }, 1000);
}

function updateTimerDisplay(el) {
  if (!el) return;
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;
  el.textContent = `Remaining time: ${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function closeQR() {
  clearInterval(countdownInterval);
  const modal = document.getElementById("qrModal");
  if (modal) modal.style.display = "none";
}

// ===================== LOAD GIỎ HÀNG =====================
window.onload = function () {
  const isLoggedIn = localStorage.getItem("loggedIn");
  if (!isLoggedIn) {
    localStorage.removeItem('cart');
  }

  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const cartContainer = document.querySelector('.cart-items');

  if (!cartContainer) return;

  if (cart.length === 0) {
    cartContainer.innerHTML = '<p>🛒 Empty cart</p>';
    updateTotalProduct();
    total_price();
    return;
  }

  cartContainer.innerHTML = ''; // Xóa nội dung cũ

  cart.forEach((item, index) => {
    const div = document.createElement('div');
    div.classList.add('item');

    // đảm bảo item.price là số (unit price) khi lưu vào localStorage
    const unitPrice = Number(item.price) || 0;

    div.innerHTML = `
      <div class="thumb" style="background-image:url('${item.image}')"></div>
      <div class="item-info">
        <div class="item-title">${item.name}</div>
        <div class="item-meta">Color: ${item.color}</div>
        <div style="font-size:13px;color:var(--muted)">Quantities in stock: ${item.stock}</div>
        <!-- nếu có thông tin tồn kho, bạn có thể thêm ở đây -->
      </div>
      <div class="item-controls">
        <div class="qty">
          <button onclick="ChangeQuantity(this, -1)">−</button>
          <div class="count">${item.quantity}</div>
          <button onclick="ChangeQuantity(this, 1)">+</button>
        </div>
        <div class="price" data-unit="${unitPrice}">₫${(unitPrice * (item.quantity || 1)).toLocaleString()}</div>
        <button class="remove" onclick="removeItem(${index})">Delete</button>
      </div>
    `;
    cartContainer.appendChild(div);
  });

  // Khởi tạo hiển thị sau khi tạo DOM
  updateTotalProduct();
  updateEachPrice();
  total_price();
};

// ===================== XÓA SẢN PHẨM =====================
async function removeItem(index) {
  const items = document.querySelectorAll('.item');
  const item = items[index];
  const cartItemID = item?.dataset.cartItemId;

  // Xác nhận xóa
  if (!confirm("Are you sure you want to remove this item from your cart?")) {
    return;
  }

  // Xóa từ database nếu có cartItemID
  if (cartItemID) {
    try {
      const response = await fetch("http://localhost:3000/api/cartItem/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItemID: cartItemID })
      });
      
      const data = await response.json();
      if (!data.success) {
        console.error("Failed to delete cart item:", data.message);
        alert("Failed to remove item. Please try again.");
        return;
      }
      console.log("Cart item deleted successfully from database");
    } catch (err) {
      console.error("Error deleting cart item:", err);
      alert("Failed to remove item. Please try again.");
      return;
    }
  }

  // Xóa từ localStorage (nếu có)
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Reload trang để cập nhật
  window.location.reload();
}