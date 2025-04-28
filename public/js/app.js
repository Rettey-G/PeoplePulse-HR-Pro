let currentUser = null;
let employeesTable;

$(document).ready(function() {
    initializeDataTable();
    setupEventListeners();
    checkAuthStatus();
});

function initializeDataTable() {
    employeesTable = $('#employeesTable').DataTable({
        columns: [
            { data: 'empNo' },
            { 
                data: null,
                render: function(data) {
                    return `${data.firstName} ${data.lastName}`;
                }
            },
            { data: 'idNumber' },
            { data: 'gender' },
            { data: 'nationality' },
            { data: 'designation' },
            { data: 'department' },
            { data: 'workSite' },
            {
                data: null,
                render: function(data) {
                    return `
                        <button class="btn btn-sm btn-info view-btn" data-id="${data._id}">View</button>
                        ${currentUser?.role === 'admin' ? `
                            <button class="btn btn-sm btn-warning edit-btn" data-id="${data._id}">Edit</button>
                            <button class="btn btn-sm btn-danger delete-btn" data-id="${data._id}">Delete</button>
                        ` : ''}
                    `;
                }
            }
        ]
    });
}

function setupEventListeners() {
    $('#loginBtn').click(showLoginModal);
    $('#addEmployeeBtn').click(showEmployeeModal);
    $('#saveEmployeeBtn').click(saveEmployee);
    
    $(document).on('click', '.view-btn', function() {
        const id = $(this).data('id');
        viewEmployee(id);
    });
    
    $(document).on('click', '.edit-btn', function() {
        const id = $(this).data('id');
        editEmployee(id);
    });
    
    $(document).on('click', '.delete-btn', function() {
        const id = $(this).data('id');
        deleteEmployee(id);
    });
}

function checkAuthStatus() {
    const token = localStorage.getItem('token');
    if (token) {
        fetch('/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(user => {
            currentUser = user;
            updateUI();
            loadEmployees();
        })
        .catch(() => {
            localStorage.removeItem('token');
            updateUI();
        });
    }
}

function updateUI() {
    if (currentUser) {
        $('#loginBtn').text('Logout');
        if (currentUser.role === 'admin') {
            $('#addEmployeeBtn').show();
        }
    } else {
        $('#loginBtn').text('Login');
        $('#addEmployeeBtn').hide();
    }
}

function loadEmployees() {
    fetch('/api/employees', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => response.json())
    .then(employees => {
        employeesTable.clear().rows.add(employees).draw();
    })
    .catch(error => console.error('Error loading employees:', error));
}

function showLoginModal() {
    if (currentUser) {
        localStorage.removeItem('token');
        currentUser = null;
        updateUI();
        loadEmployees();
        return;
    }

    // Show login form
    const modal = new bootstrap.Modal(document.getElementById('employeeModal'));
    $('#employeeModal .modal-title').text('Login');
    $('#employeeForm').html(`
        <div class="mb-3">
            <label class="form-label">Username</label>
            <input type="text" class="form-control" id="username" required>
        </div>
        <div class="mb-3">
            <label class="form-label">Password</label>
            <input type="password" class="form-control" id="password" required>
        </div>
    `);
    $('#saveEmployeeBtn').text('Login');
    modal.show();
}

function login() {
    const username = $('#username').val();
    const password = $('#password').val();

    fetch('/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        localStorage.setItem('token', data.token);
        currentUser = data.user;
        updateUI();
        loadEmployees();
        bootstrap.Modal.getInstance(document.getElementById('employeeModal')).hide();
    })
    .catch(error => alert('Login failed: ' + error.message));
}

function showEmployeeModal(employee = null) {
    const modal = new bootstrap.Modal(document.getElementById('employeeModal'));
    $('#employeeModal .modal-title').text(employee ? 'Edit Employee' : 'Add Employee');
    $('#employeeForm').html(`
        <div class="row">
            <div class="col-md-6 mb-3">
                <label class="form-label">Employee Number</label>
                <input type="text" class="form-control" id="empNo" value="${employee?.empNo || ''}" required>
            </div>
            <div class="col-md-6 mb-3">
                <label class="form-label">Email</label>
                <input type="email" class="form-control" id="email" value="${employee?.email || ''}" required>
            </div>
        </div>
        <div class="row">
            <div class="col-md-6 mb-3">
                <label class="form-label">First Name</label>
                <input type="text" class="form-control" id="firstName" value="${employee?.firstName || ''}" required>
            </div>
            <div class="col-md-6 mb-3">
                <label class="form-label">Last Name</label>
                <input type="text" class="form-control" id="lastName" value="${employee?.lastName || ''}" required>
            </div>
        </div>
        <!-- Add more fields as needed -->
    `);
    $('#saveEmployeeBtn').text(employee ? 'Update' : 'Save');
    modal.show();
}

function saveEmployee() {
    const formData = {
        empNo: $('#empNo').val(),
        email: $('#email').val(),
        firstName: $('#firstName').val(),
        lastName: $('#lastName').val(),
        // Add more fields as needed
    };

    const url = '/api/employees';
    const method = 'POST';

    fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(() => {
        bootstrap.Modal.getInstance(document.getElementById('employeeModal')).hide();
        loadEmployees();
    })
    .catch(error => alert('Error saving employee: ' + error.message));
}

function viewEmployee(id) {
    fetch(`/api/employees/${id}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => response.json())
    .then(employee => {
        const modal = new bootstrap.Modal(document.getElementById('employeeModal'));
        $('#employeeModal .modal-title').text('Employee Details');
        $('#employeeForm').html(`
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label class="form-label">Employee Number</label>
                    <p>${employee.empNo}</p>
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label">Name</label>
                    <p>${employee.firstName} ${employee.lastName}</p>
                </div>
            </div>
            <!-- Add more fields as needed -->
        `);
        $('#saveEmployeeBtn').hide();
        modal.show();
    })
    .catch(error => alert('Error loading employee: ' + error.message));
}

function editEmployee(id) {
    fetch(`/api/employees/${id}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => response.json())
    .then(employee => {
        showEmployeeModal(employee);
    })
    .catch(error => alert('Error loading employee: ' + error.message));
}

function deleteEmployee(id) {
    if (confirm('Are you sure you want to delete this employee?')) {
        fetch(`/api/employees/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(() => {
            loadEmployees();
        })
        .catch(error => alert('Error deleting employee: ' + error.message));
    }
} 