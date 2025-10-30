

// function changeColor(color) {
//   const img = document.getElementById("mainImage");
//   const items = document.querySelectorAll(".color-item");

//   // Xóa trạng thái active cũ
//   items.forEach(item => item.classList.remove("active"));

//   // Thêm active cho màu đang chọn
//   const selected = event.currentTarget;
//   selected.classList.add("active");

//   // Đổi hình tương ứng
//   if (color === "black") {
//     img.src = "picture/waveA.png";
//   } else if (color === "black-red") {
//     img.src = "picture/wave black-red.png";
//   } else if (color === "black-blue") {
//     img.src = "picture/waveBlue.png";
//   }
// }


// class ProductDetail {
//   Add_to_cart() {
//     console.log("Add successfully")
//   }

//   ReturnHome() {
//     window.location.href = "main.html";
//   }
// }

// function Add_to_cart() {
//   const c = new ProductDetail();
//   c.Add_to_cart();
// }

// function ReturnHome() {
//   const h = new ProductDetail();
//   h.ReturnHome();
// }

// function toggleLike() {
//   const btn = document.getElementById("likeBtn");
//   const liked = btn.classList.toggle("liked");

//   // đổi text khi người dùng bấm
//   btn.textContent = liked ? "💖 Liked" : "❤️ Like";

//   // lưu trạng thái vào localStorage (theo sản phẩm cụ thể)
//   localStorage.setItem("liked_wave_alpha", liked);
// }

// // khi load trang thì đọc trạng thái từ localStorage
// document.addEventListener("DOMContentLoaded", () => {
//   const btn = document.getElementById("likeBtn");
//   const liked = localStorage.getItem("liked_wave_alpha") === "true";
//   if (liked) {
//     btn.classList.add("liked");
//     btn.textContent = "Liked";
//   }
// });

// function addToCart() {
//   // Lấy thông tin sản phẩm hiện tại
//   const name = document.querySelector('.product-info h1').textContent.trim();
//   const price = document.querySelector('.color-section h2 span').textContent.trim();
//   const image = document.getElementById('mainImage').src;

//   const selectedColor = document.querySelector('.color-item.selected p')?.textContent || 'Default Color';

//   // Tạo object sản phẩm
//   const product = {
//     name,
//     price,
//     image,
//     color: selectedColor,
//     quantity: 1
//   };

//   // Lấy danh sách giỏ hàng hiện tại từ localStorage
//   let cart = JSON.parse(localStorage.getItem('cart')) || [];

//   // Kiểm tra xem sản phẩm đã có trong giỏ chưa
//   const existing = cart.find(item => item.name === product.name && item.color === product.color);

//   if (existing) {
//     existing.quantity += 1; // nếu có rồi thì +1 số lượng
//   } else {
//     cart.push(product); // nếu chưa có thì thêm mới
//   }

//   // Lưu lại vào localStorage
//   localStorage.setItem('cart', JSON.stringify(cart));

//   alert('✅ Đã thêm sản phẩm vào giỏ hàng!');
// }

const vehicleID = localStorage.getItem("selectedVehicle");
let imagesArray = [];

async function loadImages() {
  try {
    const res = await fetch("http://localhost:3000/api/vehicle/images", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vehicleID: vehicleID })
    });

    if (!res.ok) {
      throw new Error('Failed to fetch images');
    }

    const data = await res.json();
    if (data.success && data.images) {
      imagesArray = data.images;
      displayImages();
    }
  } catch (error) {
    console.error('Error loading images:', error);
  }
}

function displayImages() {
  const imagesContainer = document.querySelector('.images');
  if (!imagesContainer) return;

  imagesContainer.innerHTML = `
    <div class="main-image">
      <img src="${imagesArray[0]?.ImageLink || 'picture/waveA.png'}" alt="Main vehicle image">
    </div>
    <div class="image-scroll">
      ${imagesArray.map((img, index) => `
        <div class="image-item ${index === 0 ? 'active' : ''}" onclick="selectImage(${index})">
          <img src="${img.ImageLink}" alt="Vehicle image ${index + 1}">
        </div>
      `).join('')}
    </div>
  `;
}

function selectImage(index) {
  const mainImage = document.querySelector('.main-image img');
  if (mainImage && imagesArray[index]) {
    mainImage.src = imagesArray[index].ImageLink;
    
    // Update active state
    document.querySelectorAll('.image-item').forEach((item, i) => {
      item.classList.toggle('active', i === index);
    });
  }
}

async function loadDetail() {
  // const vehicleID = "Exciter155_GP";
  if (!vehicleID) {
    document.getElementById("vehicle-detail").innerText = "Không tìm thấy sản phẩm!";
    return;
  }

  // Gọi API lấy thông tin chi tiết theo VehicleID
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
  localStorage.setItem("currentVehiclePrice", vehicle.Price);
  document.getElementById("vehicle-detail").innerHTML = `
          <div class="product-info">
            <h1>${vehicle.Name}</h1>
            <p class="description">${vehicle.Summary}</p>
            <p><strong>Thương hiệu:</strong> ${vehicle.Brand}</p>
            <p><strong>Loại xe:</strong> ${vehicle.Type}</p>
            <p><strong>Mô tả:</strong> ${vehicle.Summary}</p>
            <h4 class="stock">Quantities in stock: ${vehicle.Stock}</h4>
            <h2><strong>Giá:</strong> ${vehicle.Price.toLocaleString()} VND</h2>
          </div>
  `;
}

loadDetail();
loadImages();

function ReturnHome() {
  window.location.href = "main.html";
}

function checkLogin() {
  const isLoggedIn = localStorage.getItem("loggedIn") === 'true';
  if (!isLoggedIn) {
    const confrimLogin = confirm("You don't have account. Please login your account");
    if (confrimLogin) {
      window.location.href = "login.html";
      return;
    }
    else {
      return;
    }
  }
}

// ===================== HÀM ADD TO CART =====================
// function addToCart() {

//   const isLoggedIn = localStorage.getItem("loggedIn") === 'true';
//   Lấy thông tin sản phẩm hiện tại
//   const name = document.querySelector(".product-info h1").textContent.trim();
//   const priceText = document.querySelector(".color-section h2 span").textContent.trim();
//   const price = Number(priceText.replace(/[₫,.]/g, ''));
//   const image = document.getElementById("mainImage").src;
//   const color = document.querySelector(".color-section h1")?.textContent || "Default";
  
//   const stockText = document.querySelector(".stock")?.textContent || "Quantities in stock: 20";
//   const stock = parseInt(stockText.match(/\d+/)?.[0] || 0);
  
//   // Lấy giỏ hàng hiện tại (nếu có)
//   const cart = JSON.parse(localStorage.getItem("cart")) || [];

//   // Kiểm tra xem sản phẩm đã có trong giỏ chưa
//   const existingItem = cart.find(item => item.name === name && item.color === color);

//   if (existingItem && isLoggedIn) {
//     // Nếu có rồi → tăng số lượng
//     if (existingItem.quantity < stock) {
//       existingItem.quantity++;
//       alert(`✅ Add "${name}" (${color}) to cart successfully.`);
//     } 
//     else {
//       alert("⚠️ The quantites in stock is not enough now!");
//     }
//   } 





//   if(!existingItem && isLoggedIn){
//     // Nếu chưa có → thêm sản phẩm mới
//     cart.push({
//       name,
//       price,
//       image,
//       color,
//       quantity: 1,
//       stock
//     });
//     alert("✅ Added successfully");
//   }

//   else {
//     checkLogin();
//   }

//   // Lưu lại vào localStorage
//   localStorage.setItem("cart", JSON.stringify(cart));
// }

// ===================== CHỌN MÀU =====================
// function changeColor(color) {
//   const img = document.getElementById("mainImage");
//   const items = document.querySelectorAll(".color-item");

//   // Xóa trạng thái active cũ
//   items.forEach(item => item.classList.remove("active"));

//   // Thêm active cho màu đang chọn
//   const selected = event.currentTarget;
//   selected.classList.add("active");

//   // Đổi hình tương ứng
//   if (color === "black") {
//     img.src = "picture/waveA.png";
//   } else if (color === "black-red") {
//     img.src = "picture/wave black-red.png";
//   } else if (color === "black-blue") {
//     img.src = "picture/waveBlue.png";
//   }
// }


// ===================== LIKE BUTTON =====================
function toggleLike() {
  const likeBtn = document.getElementById("likeBtn");
  likeBtn.classList.toggle("liked");
  likeBtn.textContent = likeBtn.classList.contains("liked") ? "💖 Liked" : "❤️ Like";
}


async function addToCart() {
  const vehicleID = localStorage.getItem("selectedVehicle");
  const userID = localStorage.getItem("currentUserID");
  const vehiclePrice = localStorage.getItem("currentVehiclePrice");
 
  if (!vehicleID) {
    document.getElementById("vehicle-detail").innerText = "Không tìm thấy sản phẩm!";
    return;
  }

  const res = await fetch("http://localhost:3000/api/cartItem/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ vehicleID: vehicleID,  currentUserID: userID, vehiclePrice: vehiclePrice, discount: 0})
  });

  const data = await res.json();
  if (!data.success) { 
    alert("Không thêm được vào giỏ hàng");
    return;
  } 

  alert("Thêm vào giỏ hàng thành công!!!!");
}