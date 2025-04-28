document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    if (!isAuthenticated()) {
        window.location.href = '/src/auth/login.html';
        return;
    }

    // Load employees for dropdown
    try {
        const response = await fetch('/api/employees', {
            headers: getAuthHeader()
        });
        const employees = await response.json();
        
        const dropdown = document.getElementById('employee-dropdown');
        employees.forEach(emp => {
            const option = document.createElement('option');
            option.value = emp._id;
            option.textContent = emp.name;
            dropdown.appendChild(option);
        });

        // Handle employee selection
        dropdown.addEventListener('change', async (e) => {
            const empId = e.target.value;
            if (!empId) return;
            
            const balanceResponse = await fetch(`/api/leaves/${empId}/balances`, {
                headers: getAuthHeader()
            });
            const balances = await balanceResponse.json();
            
            updateUI(balances);
        });
    } catch (error) {
        console.error('Error loading employees:', error);
        alert('Failed to load employee data');
    }
});

function updateUI(data) {
    // Update basic information
    document.getElementById('employee-name').textContent = data.name;
    document.getElementById('employee-department').textContent = data.department;
    
    // Update leave balances
    document.getElementById('annual-balance').textContent = 
        `${data.leaveBalances.annual.accrued - data.leaveBalances.annual.used} days`;
    document.getElementById('sick-balance').textContent = 
        `${data.leaveBalances.sick.accrued - data.leaveBalances.sick.used} days`;
    document.getElementById('emergency-balance').textContent = 
        `${data.leaveBalances.emergency.accrued - data.leaveBalances.emergency.used} days`;
    document.getElementById('family-care-balance').textContent = 
        `${data.leaveBalances.familyCare.accrued - data.leaveBalances.familyCare.used} days`;
    
    // Handle gender-specific leave display
    const parentalItem = document.getElementById('parental-leave-item');
    if (data.gender === 'female') {
        parentalItem.textContent = `Maternity Leave: ${data.leaveBalances.parental.accrued - data.leaveBalances.parental.used}/60 days`;
    } else {
        parentalItem.textContent = `Paternity Leave: ${data.leaveBalances.parental.accrued - data.leaveBalances.parental.used}/3 days`;
    }

    // Update leave history
    const historyTable = document.getElementById('leave-history');
    historyTable.innerHTML = ''; // Clear existing rows
    
    data.leaveHistory.forEach(leave => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${leave.type}</td>
            <td>${new Date(leave.startDate).toLocaleDateString()}</td>
            <td>${new Date(leave.endDate).toLocaleDateString()}</td>
            <td class="status-${leave.status}">${leave.status}</td>
        `;
        historyTable.appendChild(row);
    });
}

// Socket.io for real-time updates
const socket = io();
socket.on('leaveUpdate', (data) => {
    if (data.employeeId === document.getElementById('employee-dropdown').value) {
        updateUI(data);
    }
}); 