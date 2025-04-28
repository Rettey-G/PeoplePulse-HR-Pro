document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Store the token in localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.employee));
                
                // Redirect based on role
                switch (data.employee.role) {
                    case 'admin':
                        window.location.href = '/src/dashboard/admin.html';
                        break;
                    case 'hr':
                        window.location.href = '/src/dashboard/hr.html';
                        break;
                    case 'employee':
                        window.location.href = '/src/dashboard/employee.html';
                        break;
                    default:
                        window.location.href = '/src/dashboard/employee.html';
                }
            } else {
                alert(data.error || 'Login failed. Please try again.');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('An error occurred during login. Please try again.');
        }
    });
});

// Utility function to check if user is authenticated
function isAuthenticated() {
    return localStorage.getItem('token') !== null;
}

// Utility function to get user role
function getUserRole() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role;
}

// Utility function to get authorization header
function getAuthHeader() {
    const token = localStorage.getItem('token');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/src/auth/login.html';
} 