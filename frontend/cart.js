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

// document.addEventListener("DOMContentLoaded", () => {
//   const checkoutBtn = document.querySelector(".checkout");
//   if (!checkoutBtn) return;

//   checkoutBtn.addEventListener("click", function () {
//     const modal = document.getElementById("qrModal");
//     modal.style.display = "flex";

//     clearInterval(countdownInterval);
//     remainingTime = 600;
//     document.getElementById("qrcode").innerHTML = "";

//     const paymentData = "Thanh toán đơn hàng #DH001 - STK: 123456789 - Ngân hàng ACB";

//     setTimeout(() => {
//       new QRCode(document.getElementById("qrcode"), {
//         text: paymentData,
//         width: 200,
//         height: 200,
//       });
//     }, 100);

//     startCountdown();
//   });
// });

// function startCountdown() {
//   const timerDisplay = document.getElementById("timer");
//   updateTimerDisplay(timerDisplay);

//   countdownInterval = setInterval(() => {
//     remainingTime--;
//     updateTimerDisplay(timerDisplay);

//     if (remainingTime <= 0) {
//       clearInterval(countdownInterval);
//       document.getElementById("timer").textContent = "⏰ Hết thời gian quét QR!";
//       setTimeout(closeQR, 2000);
//     }
//   }, 1000);
// }

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
        <div class="item"> 
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
loadCartItems();
























// ===================== HÀM THAY ĐỔI SỐ LƯỢNG =====================
function ChangeQuantity(button, delta) {
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
  if (total_div) total_div.textContent = `₫${total_price_value.toLocaleString()}`;
  if (temp_price) temp_price.textContent = `₫${total_price_value.toLocaleString()}`;
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
function removeItem(index) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  window.location.reload();
}

