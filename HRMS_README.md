# Complete HRMS (Human Resource Management System)

A full-stack HRMS application built with React, Node.js, Express, and MongoDB.

---

## 🎯 Features

### ✅ Completed Modules

1. **Employee Master Data Management**
   - Complete employee lifecycle management
   - Personal, contact, and employment information
   - Document management
   - Employee search and filtering

2. **Organization Structure**
   - Department management
   - Designation hierarchy
   - Organizational chart
   - Reporting relationships

3. **Employee Onboarding**
   - Onboarding workflow management
   - Task and document checklists
   - Training schedules
   - Status tracking

4. **Attendance Management**
   - Check-in/Check-out system
   - Attendance tracking
   - Overtime calculation
   - Shift management
   - Attendance reports

5. **Leave Management**
   - Multiple leave types
   - Leave application and approval workflow
   - Leave balance tracking
   - Leave calendar

6. **Payroll Management**
   - Salary structure management
   - Automated payslip generation
   - Earnings and deductions
   - Payroll processing

7. **Dashboard & Analytics**
   - Real-time statistics
   - Employee metrics
   - Attendance summaries
   - Leave summaries
   - Payroll summaries

8. **Authentication & Authorization**
   - JWT-based authentication
   - Role-based access control (Admin, HR, Manager, Employee)
   - Secure password management

---

## 🏗️ Technology Stack

### Backend
- **Framework**: Node.js + Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs for password hashing
- **File Upload**: Multer

### Frontend
- **Framework**: React 19.2.0
- **UI Library**: Material-UI (MUI)
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios
- **State Management**: React Context API

---

## 📁 Project Structure

```
practice_project/
├── backend/
│   ├── models/              # 12 MongoDB models
│   │   ├── User.js
│   │   ├── Employee.js
│   │   ├── Department.js
│   │   ├── Designation.js
│   │   ├── Onboarding.js
│   │   ├── Attendance.js
│   │   ├── Shift.js
│   │   ├── LeaveType.js
│   │   ├── LeaveBalance.js
│   │   ├── LeaveApplication.js
│   │   ├── SalaryStructure.js
│   │   └── Payslip.js
│   │
│   ├── controllers/         # 7 controllers
│   │   ├── authController.js
│   │   ├── employeeController.js
│   │   ├── organizationController.js
│   │   ├── onboardingController.js
│   │   ├── attendanceController.js
│   │   ├── leaveController.js
│   │   ├── payrollController.js
│   │   └── dashboardController.js
│   │
│   ├── routes/              # 8 route files
│   │   ├── auth.js
│   │   ├── employees.js
│   │   ├── organization.js
│   │   ├── onboarding.js
│   │   ├── attendance.js
│   │   ├── leaves.js
│   │   ├── payroll.js
│   │   └── dashboard.js
│   │
│   ├── middleware/
│   │   └── auth.js         # JWT auth + role-based access
│   │
│   └── server.js            # Main server file
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx
│   │   │   │
│   │   │   ├── common/
│   │   │   │   └── Layout.jsx
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   └── Dashboard.jsx
│   │   │   │
│   │   │   ├── employees/
│   │   │   │   ├── EmployeeList.jsx
│   │   │   │   ├── EmployeeForm.jsx
│   │   │   │   └── EmployeeDetails.jsx
│   │   │   │
│   │   │   ├── organization/
│   │   │   │   ├── DepartmentList.jsx
│   │   │   │   ├── DesignationList.jsx
│   │   │   │   └── OrgChart.jsx
│   │   │   │
│   │   │   ├── onboarding/
│   │   │   │   ├── OnboardingList.jsx
│   │   │   │   └── OnboardingDetails.jsx
│   │   │   │
│   │   │   ├── attendance/
│   │   │   │   ├── AttendanceList.jsx
│   │   │   │   ├── AttendanceCalendar.jsx
│   │   │   │   └── CheckInOut.jsx
│   │   │   │
│   │   │   ├── leaves/
│   │   │   │   ├── LeaveList.jsx
│   │   │   │   ├── LeaveApplication.jsx
│   │   │   │   ├── LeaveApproval.jsx
│   │   │   │   └── LeaveBalance.jsx
│   │   │   │
│   │   │   └── payroll/
│   │   │       ├── SalaryStructureList.jsx
│   │   │       ├── PayslipList.jsx
│   │   │       └── PayslipGenerate.jsx
│   │   │
│   │   ├── services/
│   │   │   └── api.js       # Comprehensive API service
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   │
│   │   └── App.js           # Main app with routing
│   │
│   └── package.json
│
└── HRMS_ARCHITECTURE.md     # Detailed architecture document
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (running on localhost:27017)
- npm or yarn

### Installation

**1. Clone and install backend dependencies:**
```bash
cd backend
npm install
```

**2. Install frontend dependencies:**
```bash
cd frontend
npm install
```

### Running the Application

**Start MongoDB:**
```bash
# Make sure MongoDB is running
mongod
```

**Start Backend Server:**
```bash
cd backend
npm start
# Server runs on http://localhost:5001
```

**Start Frontend:**
```bash
cd frontend
npm start
# App runs on http://localhost:3000
```

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/change-password` - Change password

### Employees
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get employee by ID
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee
- `GET /api/employees/search` - Search employees

### Organization
- `GET /api/organization/departments` - Get departments
- `POST /api/organization/departments` - Create department
- `GET /api/organization/designations` - Get designations
- `POST /api/organization/designations` - Create designation

### Attendance
- `POST /api/attendance/checkin` - Check in
- `POST /api/attendance/checkout` - Check out
- `GET /api/attendance` - Get attendance records
- `GET /api/attendance/employee/:empId` - Get employee attendance

### Leaves
- `GET /api/leaves` - Get leave applications
- `POST /api/leaves` - Apply leave
- `PUT /api/leaves/:id/approve` - Approve leave
- `PUT /api/leaves/:id/reject` - Reject leave
- `GET /api/leaves/balance/:empId` - Get leave balance

### Payroll
- `GET /api/payroll/salary-structures` - Get salary structures
- `POST /api/payroll/salary-structures` - Create salary structure
- `POST /api/payroll/payslips/generate` - Generate payslips
- `GET /api/payroll/payslips` - Get payslips

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/attendance` - Get attendance summary
- `GET /api/dashboard/leaves` - Get leave summary
- `GET /api/dashboard/payroll` - Get payroll summary

---

## 👥 User Roles

### Admin
- Full system access
- Manage all modules
- System configuration

### HR
- Employee management
- Payroll processing
- Leave management
- Reports

### Manager
- Team management
- Leave approvals
- Attendance approvals
- View team reports

### Employee
- Self-service portal
- View own details
- Apply for leaves
- View payslips
- Mark attendance

---

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Role-based access control
- ✅ Protected API routes
- ✅ Secure password reset
- ✅ Input validation

---

## 📊 Database Models

1. **User** - Authentication and authorization
2. **Employee** - Employee master data
3. **Department** - Organizational departments
4. **Designation** - Job positions
5. **Onboarding** - New hire onboarding
6. **Attendance** - Daily attendance records
7. **Shift** - Work shifts
8. **LeaveType** - Types of leaves
9. **LeaveBalance** - Employee leave balances
10. **LeaveApplication** - Leave requests
11. **SalaryStructure** - Employee salary details
12. **Payslip** - Monthly payslips

---

## 🎨 UI Features

- ✅ Responsive Material-UI design
- ✅ Dark/Light theme support
- ✅ Intuitive navigation
- ✅ Data tables with search and pagination
- ✅ Form validation
- ✅ Dashboard with statistics
- ✅ Role-based UI elements

---

## 🔧 Environment Variables

Create `.env` file in backend:
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/hrms
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

---

## 📝 Default Test User

After running the application, register a new user or use:

```json
{
  "email": "admin@hrms.com",
  "password": "admin123",
  "role": "Admin"
}
```

---

## 🎯 Next Steps

1. ✅ Complete HRMS system built
2. → Test all modules
3. → Add data validation
4. → Setup Docker (docker-compose.yml ready)
5. → Deploy to production

---

## 📚 Documentation

- [Architecture Document](./HRMS_ARCHITECTURE.md)
- [API Documentation](./HRMS_ARCHITECTURE.md#api-endpoints-design)
- [Docker Setup](./DOCKER_LEARNING.md)

---

## 🤝 Support

For issues or questions:
- Check HRMS_ARCHITECTURE.md for detailed information
- Review API endpoints in the documentation
- Check console logs for errors

---

## 📄 License

MIT License

---

**Built with ❤️ using React, Node.js, Express, and MongoDB**
