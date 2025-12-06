// Authentication JavaScript

// Check if user is already logged in
function checkAuth() {
    const userData = localStorage.getItem('userData');
    
    if (userData) {
        return { user: JSON.parse(userData) };
    }
    return null;
}

// Save auth data
function saveAuth(userData) {
    localStorage.setItem('userData', JSON.stringify(userData));
}

// Clear auth data
function clearAuth() {
    localStorage.removeItem('userData');
}

// Show alert message
function showAlert(message, type = 'danger') {
    const alertContainer = document.getElementById('alertContainer');
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    alertContainer.innerHTML = '';
    alertContainer.appendChild(alert);

    // Auto dismiss after 5 seconds
    setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => alert.remove(), 150);
    }, 5000);
}

// Toggle password visibility
// function setupPasswordToggle() {
//     const togglePassword = document.getElementById('togglePassword');
//     const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');

//     if (togglePassword) {
//         togglePassword.addEventListener('click', function() {
//             const passwordInput = document.getElementById('password');
//             const icon = this.querySelector('i');
            
//             if (passwordInput.type === 'password') {
//                 passwordInput.type = 'text';
//                 icon.classList.remove('fa-eye');
//                 icon.classList.add('fa-eye-slash');
//             } else {
//                 passwordInput.type = 'password';
//                 icon.classList.remove('fa-eye-slash');
//                 icon.classList.add('fa-eye');
//             }
//         });
//     }

//     if (toggleConfirmPassword) {
//         toggleConfirmPassword.addEventListener('click', function() {
//             const confirmPasswordInput = document.getElementById('confirmPassword');
//             const icon = this.querySelector('i');
            
//             if (confirmPasswordInput.type === 'password') {
//                 confirmPasswordInput.type = 'text';
//                 icon.classList.remove('fa-eye');
//                 icon.classList.add('fa-eye-slash');
//             } else {
//                 confirmPasswordInput.type = 'password';
//                 icon.classList.remove('fa-eye-slash');
//                 icon.classList.add('fa-eye');
//             }
//         });
//     }
// }

// Handle Login Form
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    // Check if already logged in
    const auth = checkAuth();
    if (auth) {
        window.location.href = '/';
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const loginBtn = document.getElementById('loginBtn');
        const originalBtnText = loginBtn.innerHTML;
        
        // Disable button and show loading
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Đang đăng nhập...';

        const formData = {
            username: document.getElementById('username').value.trim(),
            password: document.getElementById('password').value
        };

        try {
            const response = await fetch('/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                // Save auth data
                saveAuth(data.data);

                // Show success message
                showAlert('Đăng nhập thành công! Đang chuyển hướng...', 'success');

                // Redirect after 1 second
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            } else {
                showAlert(data.message || 'Đăng nhập thất bại');
                loginBtn.disabled = false;
                loginBtn.innerHTML = originalBtnText;
            }
        } catch (error) {
            console.error('Login error:', error);
            showAlert('Có lỗi xảy ra. Vui lòng thử lại sau.');
            loginBtn.disabled = false;
            loginBtn.innerHTML = originalBtnText;
        }
    });

    setupPasswordToggle();
}

// Handle Register Form
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    // Check if already logged in
    const auth = checkAuth();
    if (auth) {
        window.location.href = '/';
    }

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const registerBtn = document.getElementById('registerBtn');
        const originalBtnText = registerBtn.innerHTML;

        // Validate passwords match
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            showAlert('Mật khẩu xác nhận không khớp!');
            return;
        }

        // Validate password length
        if (password.length < 6) {
            showAlert('Mật khẩu phải có ít nhất 6 ký tự!');
            return;
        }

        // Validate username length
        const username = document.getElementById('username').value.trim();
        if (username.length < 3) {
            showAlert('Tên đăng nhập phải có ít nhất 3 ký tự!');
            return;
        }

        // Disable button and show loading
        registerBtn.disabled = true;
        registerBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Đang đăng ký...';

        const formData = {
            username: username,
            password: password,
            name: document.getElementById('fullName').value.trim(),
            phone: document.getElementById('phoneNumber').value.trim() || null,
            email: document.getElementById('email').value.trim() || null,
            address: document.getElementById('address').value.trim() || null
        };

        try {
            const response = await fetch('/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                // Save auth data
                saveAuth(data.data);

                // Show success message
                showAlert('Đăng ký thành công! Đang chuyển hướng...', 'success');

                // Redirect after 1 second
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            } else {
                showAlert(data.message || 'Đăng ký thất bại');
                registerBtn.disabled = false;
                registerBtn.innerHTML = originalBtnText;
            }
        } catch (error) {
            console.error('Register error:', error);
            showAlert('Có lỗi xảy ra. Vui lòng thử lại sau.');
            registerBtn.disabled = false;
            registerBtn.innerHTML = originalBtnText;
        }
    });

    setupPasswordToggle();
}

// Export functions for use in other pages
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { checkAuth, saveAuth, clearAuth };
}
