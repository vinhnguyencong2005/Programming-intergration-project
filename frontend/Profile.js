function ReturnHome() {
    window.location.href = "main.html";
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
}

function CheckLogin() {

}