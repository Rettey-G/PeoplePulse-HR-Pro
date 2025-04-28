document.addEventListener('DOMContentLoaded', () => {
  const employeesTable = document.getElementById('employeesTable');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const toastContainer = document.getElementById('toastContainer');

  // Function to show toast message
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    `;
    
    toastContainer.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', () => {
      toast.remove();
    });
  }

  // Function to format date
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Function to fetch employees
  async function fetchEmployees() {
    try {
      loadingSpinner.style.display = 'block';
      const response = await fetch('/api/employees', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      
      const employees = await response.json();
      displayEmployees(employees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      showToast('Error fetching employees', 'danger');
    } finally {
      loadingSpinner.style.display = 'none';
    }
  }

  // Function to display employees in the table
  function displayEmployees(employees) {
    const tbody = employeesTable.querySelector('tbody');
    tbody.innerHTML = '';
    
    employees.forEach(employee => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${employee.empNo}</td>
        <td>${employee.employeeName}</td>
        <td>${employee.designation}</td>
        <td>${employee.department}</td>
        <td>${employee.workSite}</td>
        <td>${formatDate(employee.joinDate)}</td>
        <td>
          <button class="btn btn-sm btn-primary view-employee" data-id="${employee._id}">
            <i class="bi bi-eye"></i> View
          </button>
          <button class="btn btn-sm btn-warning edit-employee" data-id="${employee._id}">
            <i class="bi bi-pencil"></i> Edit
          </button>
        </td>
      `;
      
      tbody.appendChild(row);
    });
    
    // Add event listeners to view and edit buttons
    document.querySelectorAll('.view-employee').forEach(button => {
      button.addEventListener('click', () => viewEmployee(button.dataset.id));
    });
    
    document.querySelectorAll('.edit-employee').forEach(button => {
      button.addEventListener('click', () => editEmployee(button.dataset.id));
    });
  }

  // Function to view employee details
  async function viewEmployee(id) {
    try {
      const response = await fetch(`/api/employees/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch employee details');
      }
      
      const employee = await response.json();
      
      // Create and show view modal
      const modal = document.createElement('div');
      modal.className = 'modal fade';
      modal.id = 'viewEmployeeModal';
      modal.setAttribute('tabindex', '-1');
      modal.setAttribute('aria-labelledby', 'viewEmployeeModalLabel');
      modal.setAttribute('aria-hidden', 'true');
      
      modal.innerHTML = `
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="viewEmployeeModalLabel">Employee Details</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div class="row">
                <div class="col-md-6">
                  <p><strong>Employee Number:</strong> ${employee.empNo}</p>
                  <p><strong>Name:</strong> ${employee.employeeName}</p>
                  <p><strong>Designation:</strong> ${employee.designation}</p>
                  <p><strong>Department:</strong> ${employee.department}</p>
                  <p><strong>Work Site:</strong> ${employee.workSite}</p>
                </div>
                <div class="col-md-6">
                  <p><strong>Join Date:</strong> ${formatDate(employee.joinDate)}</p>
                  <p><strong>Status:</strong> ${employee.status}</p>
                  <p><strong>Phone:</strong> ${employee.phone || 'N/A'}</p>
                  <p><strong>Address:</strong> ${employee.address || 'N/A'}</p>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      const bsModal = new bootstrap.Modal(modal);
      bsModal.show();
      
      modal.addEventListener('hidden.bs.modal', () => {
        modal.remove();
      });
    } catch (error) {
      console.error('Error fetching employee details:', error);
      showToast('Error fetching employee details', 'danger');
    }
  }

  // Function to edit employee
  async function editEmployee(id) {
    try {
      const response = await fetch(`/api/employees/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch employee details');
      }
      
      const employee = await response.json();
      
      // Create and show edit modal
      const modal = document.createElement('div');
      modal.className = 'modal fade';
      modal.id = 'editEmployeeModal';
      modal.setAttribute('tabindex', '-1');
      modal.setAttribute('aria-labelledby', 'editEmployeeModalLabel');
      modal.setAttribute('aria-hidden', 'true');
      
      modal.innerHTML = `
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="editEmployeeModalLabel">Edit Employee</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form id="editEmployeeForm">
                <input type="hidden" id="employeeId" value="${employee._id}">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="empNo" class="form-label">Employee Number</label>
                    <input type="text" class="form-control" id="empNo" value="${employee.empNo}" required>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="employeeName" class="form-label">Name</label>
                    <input type="text" class="form-control" id="employeeName" value="${employee.employeeName}" required>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="designation" class="form-label">Designation</label>
                    <input type="text" class="form-control" id="designation" value="${employee.designation}" required>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="department" class="form-label">Department</label>
                    <input type="text" class="form-control" id="department" value="${employee.department}" required>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="workSite" class="form-label">Work Site</label>
                    <input type="text" class="form-control" id="workSite" value="${employee.workSite}" required>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="joinDate" class="form-label">Join Date</label>
                    <input type="date" class="form-control" id="joinDate" value="${employee.joinDate.split('T')[0]}" required>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="phone" class="form-label">Phone</label>
                    <input type="tel" class="form-control" id="phone" value="${employee.phone || ''}">
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="status" class="form-label">Status</label>
                    <select class="form-select" id="status" required>
                      <option value="active" ${employee.status === 'active' ? 'selected' : ''}>Active</option>
                      <option value="inactive" ${employee.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                    </select>
                  </div>
                </div>
                <div class="mb-3">
                  <label for="address" class="form-label">Address</label>
                  <textarea class="form-control" id="address" rows="3">${employee.address || ''}</textarea>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-primary" id="saveEmployeeBtn">Save Changes</button>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      const bsModal = new bootstrap.Modal(modal);
      bsModal.show();
      
      // Add event listener for save button
      modal.querySelector('#saveEmployeeBtn').addEventListener('click', async () => {
        try {
          const formData = {
            empNo: modal.querySelector('#empNo').value,
            employeeName: modal.querySelector('#employeeName').value,
            designation: modal.querySelector('#designation').value,
            department: modal.querySelector('#department').value,
            workSite: modal.querySelector('#workSite').value,
            joinDate: modal.querySelector('#joinDate').value,
            phone: modal.querySelector('#phone').value,
            address: modal.querySelector('#address').value,
            status: modal.querySelector('#status').value
          };
          
          const updateResponse = await fetch(`/api/employees/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(formData)
          });
          
          if (!updateResponse.ok) {
            throw new Error('Failed to update employee');
          }
          
          bsModal.hide();
          showToast('Employee updated successfully');
          fetchEmployees(); // Refresh the table
        } catch (error) {
          console.error('Error updating employee:', error);
          showToast('Error updating employee', 'danger');
        }
      });
      
      modal.addEventListener('hidden.bs.modal', () => {
        modal.remove();
      });
    } catch (error) {
      console.error('Error fetching employee details:', error);
      showToast('Error fetching employee details', 'danger');
    }
  }

  // Fetch employees when the page loads
  fetchEmployees();
}); 