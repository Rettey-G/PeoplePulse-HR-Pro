document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    if (!isAuthenticated()) {
        window.location.href = '/src/auth/login.html';
        return;
    }

    // Set user name
    const user = JSON.parse(localStorage.getItem('user'));
    document.getElementById('userName').textContent = user.name;

    // Initialize dashboard
    initializeDashboard();
});

async function initializeDashboard() {
    try {
        // Fetch dashboard data
        const response = await fetch('/api/dashboard', {
            headers: getAuthHeader()
        });

        if (!response.ok) {
            throw new Error('Failed to fetch dashboard data');
        }

        const data = await response.json();

        // Update dashboard cards
        document.getElementById('totalEmployees').textContent = data.totalEmployees;
        document.getElementById('activeLeaves').textContent = data.activeLeaves;
        document.getElementById('pendingRequests').textContent = data.pendingRequests;
        document.getElementById('todaysAttendance').textContent = data.todaysAttendance;

        // Initialize charts
        initializeEmployeeChart(data.employeeDistribution);
        initializeLeaveChart(data.leaveTrends);
    } catch (error) {
        console.error('Dashboard initialization error:', error);
        alert('Failed to load dashboard data');
    }
}

function initializeEmployeeChart(data) {
    const ctx = document.getElementById('employeeChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.values,
                backgroundColor: [
                    '#3498db',
                    '#2ecc71',
                    '#e74c3c',
                    '#f1c40f',
                    '#9b59b6'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function initializeLeaveChart(data) {
    const ctx = document.getElementById('leaveChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Leave Requests',
                data: data.values,
                borderColor: '#3498db',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Handle sidebar navigation
document.querySelectorAll('.sidebar-nav a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = e.target.getAttribute('href');
        
        // Update active state
        document.querySelector('.sidebar-nav li.active').classList.remove('active');
        e.target.parentElement.classList.add('active');
        
        // Load content based on target
        loadContent(target);
    });
});

async function loadContent(target) {
    try {
        const response = await fetch(`/api${target}`, {
            headers: getAuthHeader()
        });

        if (!response.ok) {
            throw new Error(`Failed to load ${target} content`);
        }

        const data = await response.json();
        // Update content area based on the target
        // This will be implemented based on specific module requirements
    } catch (error) {
        console.error(`Error loading ${target}:`, error);
        alert(`Failed to load ${target} content`);
    }
} 