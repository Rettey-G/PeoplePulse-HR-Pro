// Authentication state
let currentUser = null;

// Initialize authentication
async function initAuth() {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const response = await fetch('/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                currentUser = await response.json();
                updateUIForLoggedInUser();
            } else {
                localStorage.removeItem('token');
                redirectToLogin();
            }
        } catch (error) {
            console.error('Auth error:', error);
            localStorage.removeItem('token');
            redirectToLogin();
        }
    } else {
        redirectToLogin();
    }
}

// Update UI for logged in user
function updateUIForLoggedInUser() {
    document.getElementById('userName').textContent = currentUser.username;
    
    // Show/hide navigation items based on role
    const navItems = document.querySelectorAll('.nav-link');
    navItems.forEach(item => {
        if (item.getAttribute('data-role')) {
            const requiredRole = item.getAttribute('data-role');
            item.style.display = currentUser.role === requiredRole ? 'block' : 'none';
        }
    });
}

// Redirect to login page
function redirectToLogin() {
    if (window.location.pathname !== '/login.html') {
        window.location.href = '/login.html';
    }
}

// Login function
async function login(username, password) {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            currentUser = data.user;
            updateUIForLoggedInUser();
            showToast('Success', 'Logged in successfully');
            window.location.href = '/dashboard.html';
        } else {
            const error = await response.json();
            showToast('Error', error.message);
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('Error', 'An error occurred during login');
    }
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    currentUser = null;
    redirectToLogin();
}

// Show toast notification
function showToast(title, message) {
    const toast = document.getElementById('toast');
    const toastTitle = document.getElementById('toastTitle');
    const toastMessage = document.getElementById('toastMessage');
    
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
}

// Show loading spinner
function showLoading() {
    document.getElementById('loadingSpinner').style.display = 'block';
}

// Hide loading spinner
function hideLoading() {
    document.getElementById('loadingSpinner').style.display = 'none';
}

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize auth
    initAuth();

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});

// Export functions for use in other files
window.auth = {
    login,
    logout,
    showToast,
    showLoading,
    hideLoading,
    getCurrentUser: () => currentUser
}; 