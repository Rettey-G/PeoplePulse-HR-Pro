# PeoplePulse HR Pro

A comprehensive HR management system with leave management capabilities.

## Features

- Employee Management
- Leave Management System
  - Annual Leave
  - Sick Leave
  - Emergency Leave
  - Family Care Leave
  - Parental Leave (Maternity/Paternity)
- Real-time Updates
- Three-tier Access Control (Admin, HR, Employee)
- Responsive Design

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: MongoDB
- Real-time Communication: Socket.io

## Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/Rettey-G/PeoplePulse-HR-Pro.git
cd PeoplePulse-HR-Pro
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
MONGODB_URI=your_mongodb_uri = mongodb+srv://Rettey:Adhu1447@cluster0.spr2o17.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your_jwt_secret = Adhu1447
PORT=3000
```

4. Start the server:
```bash
npm start
```

## Project Structure

```
PeoplePulse-HR-Pro/
├── public/              # Static files
│   ├── css/            # Stylesheets
│   └── js/             # Client-side JavaScript
├── src/                # Source files
│   ├── auth/          # Authentication pages
│   ├── employees/     # Employee management pages
│   └── leaves/        # Leave management pages
├── server/            # Backend code
│   ├── models/       # Database models
│   ├── routes/       # API routes
│   └── middleware/   # Custom middleware
├── .env              # Environment variables
├── .gitignore        # Git ignore file
└── README.md         # Project documentation
```

## API Documentation

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user info

### Employees
- GET `/api/employees` - Get all employees
- GET `/api/employees/:id` - Get employee by ID
- POST `/api/employees` - Create new employee
- PUT `/api/employees/:id` - Update employee
- DELETE `/api/employees/:id` - Delete employee

### Leaves
- GET `/api/leaves/:id/balances` - Get leave balances
- POST `/api/leaves/request` - Request leave
- PATCH `/api/leaves/:id/status` - Update leave status
- GET `/api/leaves/:id/history` - Get leave history

## License

MIT License 