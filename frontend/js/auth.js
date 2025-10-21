$(document).ready(function() {
    // Check if already logged in
    const token = localStorage.getItem(CONFIG.TOKEN_KEY);
    if (token && (window.location.pathname.endsWith('index.html') || window.location.pathname === '/')) {
        window.location.href = 'dashboard.html';
    }

    // Login form submit
    $('#loginForm').on('submit', async function(e) {
        e.preventDefault();
        
        const username = $('#username').val();
        const password = $('#password').val();

        try {
            showLoading();

            // Use JSON endpoint instead of form data
            const response = await fetch(`${CONFIG.API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Store token
                localStorage.setItem(CONFIG.TOKEN_KEY, data.access_token);
                
                // Get user info
                const userResponse = await fetch(`${CONFIG.API_BASE_URL}/auth/me`, {
                    headers: {
                        'Authorization': `Bearer ${data.access_token}`
                    }
                });
                
                const userData = await userResponse.json();
                localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(userData));

                hideLoading();
                showSuccess('Login successful!');
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                hideLoading();
                showError(data.detail || 'Invalid credentials');
            }
        } catch (error) {
            hideLoading();
            showError('Connection error. Please check if the server is running.');
            console.error('Login error:', error);
        }
    });
});


function checkAuth() {
    const token = localStorage.getItem(CONFIG.TOKEN_KEY);
    if (!token) {
        // Check if we're in pages subfolder
        const currentPath = window.location.pathname;
        if (currentPath.includes('/pages/')) {
            window.location.href = '../index.html';
        } else {
            window.location.href = 'index.html';
        }
        return false;
    }
    return true;
}


// Get current user
function getCurrentUser() {
    const userData = localStorage.getItem(CONFIG.USER_KEY);
    return userData ? JSON.parse(userData) : null;
}

// Check if user has role
function hasRole(role) {
    const user = getCurrentUser();
    if (!user || !user.roles) return false;
    return user.roles.some(r => r.role && r.role.name === role);
}

// Check if admin or superadmin
function isAdmin() {
    return hasRole('admin') || hasRole('superadmin');
}

// Check if manager or above
function isManager() {
    return hasRole('manager') || isAdmin();
}
