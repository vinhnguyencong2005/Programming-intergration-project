function CheckRegister() {

    const full_name = document.getElementById("Full-name").querySelector("input").value.trim();
    const p_num = document.getElementById("Phone-number").querySelector("input").value.trim();
    const address = document.getElementById("Address").querySelector("input").value.trim();
    const username_register = document.getElementById("Username").querySelector("input").value.trim();
    const password_register = document.getElementById("Password").querySelector("input").value.trim();

    if (full_name&&p_num&&address&&username_register&&password_register)
    {
        localStorage.setItem("Full_name", full_name);
        localStorage.setItem("Phone_number", p_num);
        localStorage.setItem("Email_address", address);
        localStorage.setItem("username_register", username_register);
        localStorage.setItem("password_register", password_register);
        alert("Register successfully");
        window.location.href = "login.html";
    }
    else 
    {
        alert("Register unsuccessfully");
    }
}