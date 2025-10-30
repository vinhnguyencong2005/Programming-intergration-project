document.getElementById("CustomerSite").style.display = "none";
// document.getElementById("AdminSite").style.display = "none";


// function showmodels(brand) {
//   document.querySelectorAll(".vehicle-type").forEach(div => 
//     {   
//         div.style.display="none";
//     }

//   );

//    document.getElementById(brand).style.display = "flex";


//   //Products of previous brand will disappear when entering another brands
//    document.querySelectorAll(".products > div").forEach(div => {
//     div.style.display = "none";
//   });

  
// }

document.querySelectorAll(".brand").forEach(btn => {
  btn.addEventListener("click", async (event) => {
    event.preventDefault();
    
    const brand = event.target.id;
    // console.log(brand);

    try {
      const response = await fetch("http://localhost:3000/api/vehicle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ brand })
      });

      if (!response.ok) {
        const err = await response.json();
        alert(err.message || "Thất bại!");
        return;
      }

      const data = await response.json();
      if (data.success) {
        // alert("Thành công!");
        // console.log(data.vehicles);


        const vehicle = data.vehicles;

        // Create an array of promises for fetching images
        const imagePromises = vehicle.map(item => 
          fetch("http://localhost:3000/api/vehicle/first_images", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ vehicleID: item.VehicleID })
          }).then(res => res.json())
        );

        // Wait for all image requests to complete
        const imageResults = await Promise.all(imagePromises);

        const newArray = vehicle.map((item, index) => { 
          console.log(`Processing vehicle ${item.VehicleID} at index ${index}`);
          const imageData = imageResults[index];
          console.log('Image data for this vehicle:', imageData);
          const imageUrl = imageData.success && imageData.imageUrl ? imageData.imageUrl : "picture/waveA.png";
          
          return `
                  <div class="itemCard">
                      <img class="showImage" src="${imageUrl}" alt="${item.Name}">
                      <h1 id="itemName"> ${item.Name} </h1>
                      <button onclick = "openDetail('${item.VehicleID}')">Detail</button>
                  </div>
          `;
        })

        // console.log(newArray);

        const htmls = newArray.join("");

        const test = document.querySelector("#test");
        // console.log(test);

        test.innerHTML = htmls;

      }
    } catch (err) {
      console.error("Lỗi kết nối:", err);
      alert("Không thể kết nối tới server!");
    }
  })
});

function openDetail(vehicleID) {
  console.log("Vehicle ID:", vehicleID);
  // Lưu ID xe vào localStorage
  localStorage.setItem("selectedVehicle", vehicleID);

  // Chuyển trang
  window.location.href = 'Detail.html';
}


function showproducts(brand,type) {
  const productsContainer = document.querySelector(".products");
  if (productsContainer) productsContainer.style.display = "block";

  // ẩn tất cả sản phẩm con rồi mới show đúng 1 sản phẩm
  document.querySelectorAll(".products > div").forEach(div => {
    div.style.display = "none";
  });

  // selector: tìm div có class hãng và id loại
  let selector = `.products .${brand}#${type}`;
  const product = document.querySelector(selector);
  if (product) {
    product.style.display = "block";
  } else {
    console.warn("Không tìm thấy sản phẩm cho selector:", selector);
  }
}

function MovenewSite(url) {
  window.location.href = url;
}




// ĐỔI LOGIN THÀNH SIGN OUT KHI ĐĂNG NHẬP

// window.onload = function() {
//   let loginLink = document.getElementById("login-links");

//   var isLoggedIn = localStorage.getItem("loggedIn") === 'true';
//   if (isLoggedIn) {

//     loginLink.textContent = "Sign out";
//     loginLink.href = "#";
    

//     loginLink.onclick = function() {
//       const confirmOut = confirm("Bạn có chắc muốn đăng xuất không?");
//       if (confirmOut) {
//         localStorage.removeItem("loggedIn");
//         localStorage.removeItem("username");
//         alert("✅ Đã đăng xuất!");
//         window.location.reload();
//       }
//     };
//   }
// };

function checkExistedAccount() {
  const isLoggedIn = localStorage.getItem("loggedIn") === 'true';

  if (isLoggedIn) {
    const confirmSignOut = confirm("Do you want to sign out your account?");
    if (confirmSignOut) {
      localStorage.removeItem("loggedIn");
      localStorage.removeItem("currentUser");
      localStorage.removeItem("currentUserID");
      localStorage.removeItem("currentUserPhone");
      localStorage.removeItem("currentUserAddress");
      localStorage.removeItem("currentUserEmail");
      localStorage.removeItem("currentUserName");
      alert("✅ Signed out successfully!");
      window.location.reload(); 
    } else {
      return;
    }
  } else {
    window.location.href = "login.html";
  }
}
