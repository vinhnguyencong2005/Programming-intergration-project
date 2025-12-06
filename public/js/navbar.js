// Navbar Authentication Handler
(function() {
    // Check authentication status on page load
    function checkAuthStatus() {
        const userData = localStorage.getItem('userData');
        
        if (userData) {
            try {
                const user = JSON.parse(userData);
                showUserProfile(user);
            } catch (error) {
                console.error('Error parsing user data:', error);
                clearAuth();
                showLoginState();
            }
        } else {
            showLoginState();
        }
    }

    // Show user profile when logged in
    function showUserProfile(user) {
        // Update display name to show username
        const userDisplayName = document.getElementById('userDisplayName');
        if (userDisplayName && user.Username) {
            userDisplayName.textContent = user.Username;
        }
        
        // Hide auth menu items (login/register)
        const authMenuItems = document.querySelectorAll('.auth-menu-item');
        authMenuItems.forEach(item => item.style.display = 'none');
        
        // Show user menu items (profile, orders, logout)
        const userMenuItems = document.querySelectorAll('.user-menu-item');
        userMenuItems.forEach(item => item.style.display = 'block');
        
        // Set full name in dropdown header
        const userFullName = document.getElementById('userFullName');
        if (userFullName && user.Name) {
            userFullName.textContent = user.Name;
        }
    }

    // Show login state when not logged in
    function showLoginState() {
        // Update display name to show "Login"
        const userDisplayName = document.getElementById('userDisplayName');
        if (userDisplayName) {
            userDisplayName.textContent = 'Login';
        }
        
        // Show auth menu items (login/register)
        const authMenuItems = document.querySelectorAll('.auth-menu-item');
        authMenuItems.forEach(item => item.style.display = 'block');
        
        // Hide user menu items (profile, orders, logout)
        const userMenuItems = document.querySelectorAll('.user-menu-item');
        userMenuItems.forEach(item => item.style.display = 'none');
    }

    // Clear authentication data
    function clearAuth() {
        localStorage.removeItem('userData');
        showLoginState();
    }

    // Handle logout
    function handleLogout(e) {
        e.preventDefault();
        
        // Confirm logout
        if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
            // Call logout API (optional)
            fetch('/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                console.log('Logout response:', data);
            })
            .catch(error => {
                console.error('Logout error:', error);
            })
            .finally(() => {
                // Clear local storage
                clearAuth();
                
                // Redirect to home page
                window.location.href = '/';
            });
        }
    }

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', function() {
        checkAuthStatus();
        loadCartCount();
        
        // Add logout event listener
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }

        // Update cart icon link
        const cartIcon = document.getElementById('cartIcon');
        if (cartIcon) {
            cartIcon.href = '/cart';
        }
    });

    // Load cart item count
    async function loadCartCount() {
        try {
            const userData = localStorage.getItem('userData');
            
            if (!userData) {
                updateCartBadge(0);
                return;
            }

            const user = JSON.parse(userData);
            const response = await fetch(`/api/cart/count?customerID=${user.ID}`);
            const data = await response.json();

            if (data.success) {
                updateCartBadge(data.count);
            } else {
                updateCartBadge(0);
            }
        } catch (error) {
            console.error('Error loading cart count:', error);
            updateCartBadge(0);
        }
    }

    // Update cart badge
    function updateCartBadge(count) {
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            if (count > 0) {
                cartCount.textContent = count;
                cartCount.style.display = 'inline-block';
            } else {
                cartCount.style.display = 'none';
            }
        }
    }
})();
