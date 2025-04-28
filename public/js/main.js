// API base URL
const API_BASE_URL = '/api';

// Utility function to make API requests
async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const defaultOptions = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'An error occurred');
        }

        return await response.json();
    } catch (error) {
        console.error('API error:', error);
        throw error;
    }
}

// Load page content
async function loadPageContent() {
    const path = window.location.pathname;
    const contentDiv = document.getElementById('content');
    
    try {
        auth.showLoading();
        
        switch (path) {
            case '/dashboard.html':
                await loadDashboard();
                break;
            case '/employees.html':
                await loadEmployees();
                break;
            case '/leaves.html':
                await loadLeaves();
                break;
            case '/profile.html':
                await loadProfile();
                break;
            default:
                contentDiv.innerHTML = '<h1>Page not found</h1>';
        }
    } catch (error) {
        auth.showToast('Error', error.message);
    } finally {
        auth.hideLoading();
    }
}

// Load dashboard
async function loadDashboard() {
    const contentDiv = document.getElementById('content');
    const user = auth.getCurrentUser();
    
    let html = '<div class="row">';
    
    if (user.role === 'admin' || user.role === 'hr') {
        // Admin/HR dashboard
        const [employees, leaves] = await Promise.all([
            apiRequest('/employees'),
            apiRequest('/leaves')
        ]);
        
        html += `
            <div class="col-md-4 mb-4">
                <div class="card dashboard-card">
                    <div class="card-body">
                        <h5 class="card-title">Total Employees</h5>
                        <p class="card-text">${employees.length}</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-4">
                <div class="card dashboard-card">
                    <div class="card-body">
                        <h5 class="card-title">Pending Leaves</h5>
                        <p class="card-text">${leaves.filter(l => l.status === 'pending').length}</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Employee dashboard
    const employee = await apiRequest(`/employees/user/${user._id}`);
    const leaveBalances = await apiRequest(`/leaves/${employee._id}/balances`);
    
    html += `
        <div class="col-md-4 mb-4">
            <div class="card dashboard-card">
                <div class="card-body">
                    <h5 class="card-title">Leave Balance</h5>
                    <p class="card-text">${leaveBalances.annual.accrued - leaveBalances.annual.used} days</p>
                </div>
            </div>
        </div>
    `;
    
    html += '</div>';
    contentDiv.innerHTML = html;
}

// Load employees
async function loadEmployees() {
    const contentDiv = document.getElementById('content');
    const user = auth.getCurrentUser();
    
    if (user.role !== 'admin' && user.role !== 'hr') {
        contentDiv.innerHTML = '<h1>Access Denied</h1>';
        return;
    }
    
    const employees = await apiRequest('/employees');
    
    let html = `
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Employees</h5>
                <button class="btn btn-primary" id="addEmployeeBtn">Add Employee</button>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Employee ID</th>
                                <th>Name</th>
                                <th>Department</th>
                                <th>Position</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
    `;
    
    employees.forEach(employee => {
        html += `
            <tr>
                <td>${employee.employeeId}</td>
                <td>${employee.user.firstName} ${employee.user.lastName}</td>
                <td>${employee.department}</td>
                <td>${employee.position}</td>
                <td><span class="badge bg-${employee.status === 'active' ? 'success' : 'danger'}">${employee.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="viewEmployee('${employee._id}')">View</button>
                    <button class="btn btn-sm btn-warning" onclick="editEmployee('${employee._id}')">Edit</button>
                </td>
            </tr>
        `;
    });
    
    html += `
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    contentDiv.innerHTML = html;
}

// Load leaves
async function loadLeaves() {
    const contentDiv = document.getElementById('content');
    const user = auth.getCurrentUser();
    
    let html = '<div class="card">';
    
    if (user.role === 'admin' || user.role === 'hr') {
        // Admin/HR view
        const leaves = await apiRequest('/leaves');
        
        html += `
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">All Leave Requests</h5>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Type</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                                <th>Duration</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        leaves.forEach(leave => {
            html += `
                <tr>
                    <td>${leave.employee.user.firstName} ${leave.employee.user.lastName}</td>
                    <td>${leave.type}</td>
                    <td>${new Date(leave.startDate).toLocaleDateString()}</td>
                    <td>${new Date(leave.endDate).toLocaleDateString()}</td>
                    <td>${leave.duration} days</td>
                    <td><span class="badge bg-${getStatusColor(leave.status)}">${leave.status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="viewLeave('${leave._id}')">View</button>
                        ${leave.status === 'pending' ? `
                            <button class="btn btn-sm btn-success" onclick="approveLeave('${leave._id}')">Approve</button>
                            <button class="btn btn-sm btn-danger" onclick="rejectLeave('${leave._id}')">Reject</button>
                        ` : ''}
                    </td>
                </tr>
            `;
        });
    } else {
        // Employee view
        const employee = await apiRequest(`/employees/user/${user._id}`);
        const leaves = await apiRequest(`/leaves/${employee._id}/history`);
        
        html += `
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">My Leave Requests</h5>
                <button class="btn btn-primary" id="requestLeaveBtn">Request Leave</button>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                                <th>Duration</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        leaves.forEach(leave => {
            html += `
                <tr>
                    <td>${leave.type}</td>
                    <td>${new Date(leave.startDate).toLocaleDateString()}</td>
                    <td>${new Date(leave.endDate).toLocaleDateString()}</td>
                    <td>${leave.duration} days</td>
                    <td><span class="badge bg-${getStatusColor(leave.status)}">${leave.status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="viewLeave('${leave._id}')">View</button>
                        ${leave.status === 'pending' ? `
                            <button class="btn btn-sm btn-danger" onclick="cancelLeave('${leave._id}')">Cancel</button>
                        ` : ''}
                    </td>
                </tr>
            `;
        });
    }
    
    html += `
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    contentDiv.innerHTML = html;
}

// Load profile
async function loadProfile() {
    const user = auth.getCurrentUser();
    
    // Update profile info
    document.getElementById('profileName').textContent = user.username;
    document.getElementById('profileRole').textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    document.getElementById('username').value = user.username;
    
    // Load leave balances
    const employee = await apiRequest(`/employees/user/${user._id}`);
    const leaveBalances = await apiRequest(`/leaves/${employee._id}/balances`);
    
    const leaveBalancesDiv = document.getElementById('leaveBalances');
    leaveBalancesDiv.innerHTML = `
        <div class="col-md-4">
            <div class="card">
                <div class="card-body">
                    <h6 class="card-title">Annual Leave</h6>
                    <p class="card-text">
                        <strong>Accrued:</strong> ${leaveBalances.annual.accrued} days<br>
                        <strong>Used:</strong> ${leaveBalances.annual.used} days<br>
                        <strong>Remaining:</strong> ${leaveBalances.annual.accrued - leaveBalances.annual.used} days
                    </p>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card">
                <div class="card-body">
                    <h6 class="card-title">Sick Leave</h6>
                    <p class="card-text">
                        <strong>Accrued:</strong> ${leaveBalances.sick.accrued} days<br>
                        <strong>Used:</strong> ${leaveBalances.sick.used} days<br>
                        <strong>Remaining:</strong> ${leaveBalances.sick.accrued - leaveBalances.sick.used} days
                    </p>
                </div>
            </div>
        </div>
    `;
    
    // Add event listeners
    document.getElementById('profileForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            auth.showLoading();
            const username = document.getElementById('username').value;
            
            await apiRequest('/auth/me', {
                method: 'PATCH',
                body: JSON.stringify({ username })
            });
            
            auth.showToast('Success', 'Profile updated successfully');
            document.getElementById('userName').textContent = username;
        } catch (error) {
            auth.showToast('Error', error.message);
        } finally {
            auth.hideLoading();
        }
    });
    
    document.getElementById('changePasswordBtn').addEventListener('click', () => {
        const modal = new bootstrap.Modal(document.getElementById('changePasswordModal'));
        modal.show();
    });
    
    document.getElementById('submitPasswordChangeBtn').addEventListener('click', async () => {
        try {
            auth.showLoading();
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (newPassword !== confirmPassword) {
                throw new Error('New passwords do not match');
            }
            
            await apiRequest('/auth/me', {
                method: 'PATCH',
                body: JSON.stringify({ currentPassword, newPassword })
            });
            
            auth.showToast('Success', 'Password changed successfully');
            bootstrap.Modal.getInstance(document.getElementById('changePasswordModal')).hide();
            document.getElementById('changePasswordForm').reset();
        } catch (error) {
            auth.showToast('Error', error.message);
        } finally {
            auth.hideLoading();
        }
    });
}

// Utility function to get status color
function getStatusColor(status) {
    switch (status) {
        case 'pending': return 'warning';
        case 'approved': return 'success';
        case 'rejected': return 'danger';
        case 'cancelled': return 'secondary';
        default: return 'info';
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    loadPageContent();
}); 