document.getElementById("register-button").addEventListener("click", async (event) => {
    event.preventDefault();
    const full_name = document.getElementById("Full-name").querySelector("input").value.trim();
    const p_num = document.getElementById("Phone-number").querySelector("input").value.trim();
    const address = document.getElementById("Address").querySelector("input").value.trim();
    const email = document.getElementById("Email").querySelector("input").value.trim();
    const username_register = document.getElementById("Username").querySelector("input").value.trim();
    const password_register = document.getElementById("Password").querySelector("input").value.trim();
    console.log(username_register, password_register, full_name, p_num, email, address);
    try {
        const response = await fetch("http://localhost:3000/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username_register,
                password: password_register,
                name: full_name,
                phone: p_num,
                email,
                address
            })
        });

        // Read the response body once and attempt to parse JSON.
        // Some error responses may not be JSON (or body may be empty), so fall back to text.
        const raw = await response.text();
        let data;
        try {
            data = raw ? JSON.parse(raw) : {};
        } catch (parseErr) {
            // Not JSON — treat raw text as message
            data = { message: raw };
        }

        if (!response.ok) {
            // Show server-provided message if present, otherwise generic message with status
            alert(data.message);
            return;
        }

        if (data.success) {
            // success message should indicate registration (Đăng kí)
            alert("Đăng kí thành công!");
        } else {
            // API returned 200 but signaled failure
            alert(data.message || "Đăng kí thất bại");
        }
    } catch (err) {
        console.error("Lỗi kết nối:", err);
        alert("Không thể kết nối tới server!");
    }
});