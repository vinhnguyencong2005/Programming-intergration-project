// import { readCustomer } from "../Jsproject/usermodel.js"

//     document.getElementById("login-btn").addEventListener("click", async (event) => {
//         event.preventDefault(); // Ngăn form reload trang

//         const username = document.getElementById("username").value.trim();
//         const password = document.getElementById("password").value.trim();

//         async function check() {
//             const cus = await readCustomer("Username", username);
//             const correct_password = cus[0].Password;
//             if (password == correct_password) {
//                 window.location.href = "main.html";
//                 return false;
//             } else {
//                 alert("Wrong!!!!");
//                 return false;
//             }
//         }
//         check();
//     });




// function CheckAccount() {
//     const username = document.getElementById('username').value.trim();
//     const password = document.getElementById('password').value.trim();

//     //Dummy account
//     // const correct_username = 'thien';
//     // const correct_password = '123456';

//     const correct_username = localStorage.getItem("username_register");
//     const correct_password = localStorage.getItem("password_register");

//     if (username == correct_username && password == correct_password) {

//         localStorage.setItem("loggedIn", "true");
//         localStorage.setItem("username", username);

        
//         window.location.href = "main.html";
//         return false;
//     }
//     else {
//         alert("Wrong!");
//         return false;
//     }
// }

// function Register() {
//     window.open("Register.html");
// }




document.getElementById("login-btn").addEventListener("click", async (event) => {
  event.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const response = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      const err = await response.json();
      alert(err.message || "Đăng nhập thất bại!");
      return;
    }

    const data = await response.json();
    if (data.success) {
      alert("Đăng nhập thành công!");
      const currentUser = data.user;
      localStorage.setItem("currentUser", currentUser.Username); 
      localStorage.setItem("currentUserID", currentUser.ID); 
      localStorage.setItem("currentUserPhone", currentUser.Phone); 
      localStorage.setItem("currentUserAddress", currentUser.Address); 
      localStorage.setItem("currentUserEmail", currentUser.Email); 
      localStorage.setItem("currentUserName", currentUser.Name); 
      localStorage.setItem("loggedIn", true); 
      window.location.href = "main.html";
    }
  } catch (err) {
    console.error("Lỗi kết nối:", err);
    alert("Không thể kết nối tới server!");
  }
});