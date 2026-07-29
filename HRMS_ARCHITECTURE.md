# HRMS System Architecture & Design

Complete Human Resource Management System - Technical Specification

---

## System Overview

**Tech Stack:**
- **Frontend**: React (existing)
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Authentication**: JWT

**Modules:**
1. Employee Master Data
2. Organization Structure
3. Employee Onboarding
4. Attendance Management
5. Leave Management
6. Payroll Management
7. Dashboard & Analytics
8. Authentication & Authorization

---

## Database Schema Design

### 1. Employee Master Data

```javascript
// Collection: employees
{
  _id: ObjectId,
  employeeId: String (unique, auto-generated),
  
  // Personal Information
  personalInfo: {
    firstName: String,
    middleName: String,
    lastName: String,
    dateOfBirth: Date,
    gender: String (Male/Female/Other),
    maritalStatus: String,
    bloodGroup: String,
    profilePhoto: String (URL)
  },
  
  // Contact Information
  contactInfo: {
    email: String (unique),
    phone: String,
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String
    },
    currentAddress: {
      street: String,
      city: String,
      state: String,
      country: String,
      pincode: String
    },
    permanentAddress: {
      street: String,
      city: String,
      state: String,
      country: String,
      pincode: String
    }
  },
  
  // Employment Details
  employmentInfo: {
    joiningDate: Date,
    employmentType: String (Permanent/Contract/Intern),
    probationPeriod: Number (months),
    confirmationDate: Date,
    department: ObjectId (ref: departments),
    designation: ObjectId (ref: designations),
    reportingManager: ObjectId (ref: employees),
    workLocation: String,
    employmentStatus: String (Active/Inactive/Resigned/Terminated)
  },
  
  // Documents
  documents: [{
    documentType: String,
    documentName: String,
    documentUrl: String,
    uploadedDate: Date
  }],
  
  // Bank Details
  bankDetails: {
    accountHolderName: String,
    accountNumber: String,
    bankName: String,
    ifscCode: String,
    branch: String
  },
  
  // System Fields
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId (ref: users),
  isActive: Boolean
}
```

### 2. Organization Structure

```javascript
// Collection: departments
{
  _id: ObjectId,
  departmentCode: String (unique),
  departmentName: String,
  description: String,
  parentDepartment: ObjectId (ref: departments, null for root),
  headOfDepartment: ObjectId (ref: employees),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}

// Collection: designations
{
  _id: ObjectId,
  designationCode: String (unique),
  designationName: String,
  level: Number (hierarchy level),
  department: ObjectId (ref: departments),
  reportsTo: ObjectId (ref: designations),
  description: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Employee Onboarding

```javascript
// Collection: onboarding
{
  _id: ObjectId,
  employee: ObjectId (ref: employees),
  onboardingStatus: String (Pending/In Progress/Completed),
  startDate: Date,
  completionDate: Date,
  
  // Document Checklist
  documents: [{
    documentName: String,
    isRequired: Boolean,
    isSubmitted: Boolean,
    submittedDate: Date,
    documentUrl: String
  }],
  
  // Task Checklist
  tasks: [{
    taskName: String,
    description: String,
    assignedTo: ObjectId (ref: employees),
    dueDate: Date,
    status: String (Pending/Completed),
    completedDate: Date,
    remarks: String
  }],
  
  // Training Schedule
  trainings: [{
    trainingName: String,
    trainer: String,
    scheduledDate: Date,
    duration: Number (hours),
    status: String (Scheduled/Completed/Cancelled),
    completionDate: Date
  }],
  
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId (ref: users)
}
```

### 4. Attendance Management

```javascript
// Collection: attendance
{
  _id: ObjectId,
  employee: ObjectId (ref: employees),
  date: Date,
  
  // Time Records
  checkIn: Date,
  checkOut: Date,
  workHours: Number,
  overtimeHours: Number,
  
  // Status
  status: String (Present/Absent/Half Day/Leave/Holiday),
  shift: ObjectId (ref: shifts),
  
  // Location (if using geo-location)
  checkInLocation: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  checkOutLocation: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  
  remarks: String,
  approvedBy: ObjectId (ref: employees),
  createdAt: Date,
  updatedAt: Date
}

// Collection: shifts
{
  _id: ObjectId,
  shiftName: String,
  startTime: String (HH:mm),
  endTime: String (HH:mm),
  breakDuration: Number (minutes),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 5. Leave Management

```javascript
// Collection: leaveTypes
{
  _id: ObjectId,
  leaveTypeName: String,
  leaveCode: String (unique),
  maxDaysPerYear: Number,
  carryForward: Boolean,
  maxCarryForwardDays: Number,
  isPaid: Boolean,
  description: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}

// Collection: leaveBalance
{
  _id: ObjectId,
  employee: ObjectId (ref: employees),
  year: Number,
  leaveType: ObjectId (ref: leaveTypes),
  totalDays: Number,
  usedDays: Number,
  remainingDays: Number,
  createdAt: Date,
  updatedAt: Date
}

// Collection: leaveApplications
{
  _id: ObjectId,
  employee: ObjectId (ref: employees),
  leaveType: ObjectId (ref: leaveTypes),
  
  startDate: Date,
  endDate: Date,
  numberOfDays: Number,
  isHalfDay: Boolean,
  halfDayPeriod: String (Morning/Afternoon),
  
  reason: String,
  status: String (Pending/Approved/Rejected/Cancelled),
  
  approver: ObjectId (ref: employees),
  approvedDate: Date,
  rejectionReason: String,
  
  appliedDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 6. Payroll Management

```javascript
// Collection: salaryStructures
{
  _id: ObjectId,
  employee: ObjectId (ref: employees),
  effectiveFrom: Date,
  
  // Earnings
  earnings: {
    basicSalary: Number,
    hra: Number,
    conveyanceAllowance: Number,
    medicalAllowance: Number,
    specialAllowance: Number,
    otherAllowances: [{
      name: String,
      amount: Number
    }]
  },
  
  // Deductions
  deductions: {
    providentFund: Number,
    professionalTax: Number,
    incomeTax: Number,
    otherDeductions: [{
      name: String,
      amount: Number
    }]
  },
  
  // Calculations
  grossSalary: Number,
  totalDeductions: Number,
  netSalary: Number,
  
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}

// Collection: payslips
{
  _id: ObjectId,
  employee: ObjectId (ref: employees),
  month: Number,
  year: Number,
  
  // Pay Period
  payPeriodStart: Date,
  payPeriodEnd: Date,
  paymentDate: Date,
  
  // Salary Details
  salaryStructure: ObjectId (ref: salaryStructures),
  
  // Attendance Impact
  workingDays: Number,
  presentDays: Number,
  absentDays: Number,
  leaveDays: Number,
  
  // Overtime
  overtimeHours: Number,
  overtimeAmount: Number,
  
  // Final Amounts
  grossEarnings: Number,
  totalDeductions: Number,
  netPay: Number,
  
  // Payment Status
  status: String (Draft/Processed/Paid),
  paymentMode: String (Bank Transfer/Cash/Cheque),
  
  remarks: String,
  generatedBy: ObjectId (ref: users),
  createdAt: Date,
  updatedAt: Date
}
```

### 7. Users & Authentication

```javascript
// Collection: users
{
  _id: ObjectId,
  employee: ObjectId (ref: employees),
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  
  role: String (Admin/HR/Manager/Employee),
  permissions: [String],
  
  isActive: Boolean,
  lastLogin: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Endpoints Design

### Authentication APIs

```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login user
POST   /api/auth/logout            - Logout user
POST   /api/auth/forgot-password   - Request password reset
POST   /api/auth/reset-password    - Reset password
GET    /api/auth/profile           - Get current user profile
PUT    /api/auth/change-password   - Change password
```

### Employee Master APIs

```
GET    /api/employees              - Get all employees (with filters)
GET    /api/employees/:id          - Get employee by ID
POST   /api/employees              - Create new employee
PUT    /api/employees/:id          - Update employee
DELETE /api/employees/:id          - Delete employee
GET    /api/employees/search       - Search employees
POST   /api/employees/:id/upload   - Upload employee document
GET    /api/employees/:id/documents - Get employee documents
```

### Organization Structure APIs

```
# Departments
GET    /api/departments            - Get all departments
GET    /api/departments/:id        - Get department by ID
POST   /api/departments            - Create department
PUT    /api/departments/:id        - Update department
DELETE /api/departments/:id        - Delete department
GET    /api/departments/tree       - Get org tree

# Designations
GET    /api/designations           - Get all designations
GET    /api/designations/:id       - Get designation by ID
POST   /api/designations           - Create designation
PUT    /api/designations/:id       - Update designation
DELETE /api/designations/:id       - Delete designation
```

### Onboarding APIs

```
GET    /api/onboarding             - Get all onboarding records
GET    /api/onboarding/:id         - Get onboarding by ID
POST   /api/onboarding             - Create onboarding
PUT    /api/onboarding/:id         - Update onboarding
DELETE /api/onboarding/:id         - Delete onboarding
PUT    /api/onboarding/:id/task    - Update task status
PUT    /api/onboarding/:id/document - Update document status
```

### Attendance APIs

```
GET    /api/attendance             - Get attendance records
GET    /api/attendance/:id         - Get attendance by ID
POST   /api/attendance/checkin     - Check in
POST   /api/attendance/checkout    - Check out
PUT    /api/attendance/:id         - Update attendance
GET    /api/attendance/employee/:empId - Get employee attendance
GET    /api/attendance/report      - Generate attendance report

# Shifts
GET    /api/shifts                 - Get all shifts
POST   /api/shifts                 - Create shift
PUT    /api/shifts/:id             - Update shift
DELETE /api/shifts/:id             - Delete shift
```

### Leave Management APIs

```
# Leave Types
GET    /api/leave-types            - Get all leave types
POST   /api/leave-types            - Create leave type
PUT    /api/leave-types/:id        - Update leave type
DELETE /api/leave-types/:id        - Delete leave type

# Leave Applications
GET    /api/leaves                 - Get all leave applications
GET    /api/leaves/:id             - Get leave by ID
POST   /api/leaves                 - Apply for leave
PUT    /api/leaves/:id             - Update leave application
DELETE /api/leaves/:id             - Cancel leave
PUT    /api/leaves/:id/approve     - Approve leave
PUT    /api/leaves/:id/reject      - Reject leave

# Leave Balance
GET    /api/leave-balance/:empId   - Get employee leave balance
PUT    /api/leave-balance/:empId   - Update leave balance
```

### Payroll APIs

```
# Salary Structure
GET    /api/salary-structures      - Get all salary structures
GET    /api/salary-structures/:id  - Get salary structure by ID
POST   /api/salary-structures      - Create salary structure
PUT    /api/salary-structures/:id  - Update salary structure
DELETE /api/salary-structures/:id  - Delete salary structure

# Payslips
GET    /api/payslips               - Get all payslips
GET    /api/payslips/:id           - Get payslip by ID
POST   /api/payslips/generate      - Generate payslips for month
PUT    /api/payslips/:id           - Update payslip
GET    /api/payslips/employee/:empId - Get employee payslips
GET    /api/payslips/:id/download  - Download payslip PDF
POST   /api/payslips/process       - Process salary payments
```

### Dashboard APIs

```
GET    /api/dashboard/stats        - Get dashboard statistics
GET    /api/dashboard/attendance   - Get attendance summary
GET    /api/dashboard/leaves       - Get leave summary
GET    /api/dashboard/employees    - Get employee count by dept
GET    /api/dashboard/payroll      - Get payroll summary
GET    /api/dashboard/recent       - Get recent activities
```

---

## Frontend Component Structure

```
frontend/src/
├── components/
│   ├── common/
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Breadcrumb.jsx
│   │   ├── DataTable.jsx
│   │   ├── Modal.jsx
│   │   ├── FormInput.jsx
│   │   └── Charts/
│   │
│   ├── auth/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── ForgotPassword.jsx
│   │   └── ResetPassword.jsx
│   │
│   ├── dashboard/
│   │   ├── Dashboard.jsx
│   │   ├── StatsCard.jsx
│   │   ├── AttendanceChart.jsx
│   │   ├── LeaveChart.jsx
│   │   └── RecentActivities.jsx
│   │
│   ├── employees/
│   │   ├── EmployeeList.jsx
│   │   ├── EmployeeForm.jsx
│   │   ├── EmployeeDetails.jsx
│   │   ├── EmployeeDocuments.jsx
│   │   └── EmployeeSearch.jsx
│   │
│   ├── organization/
│   │   ├── DepartmentList.jsx
│   │   ├── DepartmentForm.jsx
│   │   ├── DesignationList.jsx
│   │   ├── DesignationForm.jsx
│   │   └── OrgChart.jsx
│   │
│   ├── onboarding/
│   │   ├── OnboardingList.jsx
│   │   ├── OnboardingForm.jsx
│   │   ├── OnboardingDetails.jsx
│   │   ├── TaskChecklist.jsx
│   │   └── DocumentChecklist.jsx
│   │
│   ├── attendance/
│   │   ├── AttendanceList.jsx
│   │   ├── AttendanceCalendar.jsx
│   │   ├── CheckInOut.jsx
│   │   ├── AttendanceReport.jsx
│   │   └── ShiftManagement.jsx
│   │
│   ├── leaves/
│   │   ├── LeaveList.jsx
│   │   ├── LeaveApplication.jsx
│   │   ├── LeaveApproval.jsx
│   │   ├── LeaveBalance.jsx
│   │   ├── LeaveCalendar.jsx
│   │   └── LeaveTypeManagement.jsx
│   │
│   └── payroll/
│       ├── SalaryStructureList.jsx
│       ├── SalaryStructureForm.jsx
│       ├── PayslipList.jsx
│       ├── PayslipGenerate.jsx
│       ├── PayslipView.jsx
│       └── PayrollReport.jsx
│
├── services/
│   ├── api.js
│   ├── authService.js
│   ├── employeeService.js
│   ├── attendanceService.js
│   ├── leaveService.js
│   └── payrollService.js
│
├── utils/
│   ├── constants.js
│   ├── helpers.js
│   ├── validators.js
│   └── dateUtils.js
│
├── context/
│   ├── AuthContext.js
│   └── ThemeContext.js
│
├── hooks/
│   ├── useAuth.js
│   ├── useFetch.js
│   └── useForm.js
│
└── App.js
```

---

## Backend Structure

```
backend/
├── models/
│   ├── Employee.js
│   ├── Department.js
│   ├── Designation.js
│   ├── Onboarding.js
│   ├── Attendance.js
│   ├── Shift.js
│   ├── LeaveType.js
│   ├── LeaveBalance.js
│   ├── LeaveApplication.js
│   ├── SalaryStructure.js
│   ├── Payslip.js
│   └── User.js
│
├── controllers/
│   ├── authController.js
│   ├── employeeController.js
│   ├── organizationController.js
│   ├── onboardingController.js
│   ├── attendanceController.js
│   ├── leaveController.js
│   ├── payrollController.js
│   └── dashboardController.js
│
├── routes/
│   ├── auth.js
│   ├── employees.js
│   ├── organization.js
│   ├── onboarding.js
│   ├── attendance.js
│   ├── leaves.js
│   ├── payroll.js
│   └── dashboard.js
│
├── middleware/
│   ├── auth.js
│   ├── roleCheck.js
│   ├── validation.js
│   └── errorHandler.js
│
├── utils/
│   ├── emailService.js
│   ├── pdfGenerator.js
│   ├── dateCalculator.js
│   └── constants.js
│
├── config/
│   └── database.js
│
└── server.js
```

---

## Role-Based Access Control

### Roles

1. **Admin** - Full system access
2. **HR** - Employee management, payroll, reports
3. **Manager** - Team management, approvals
4. **Employee** - Self-service portal

### Permissions Matrix

| Module | Admin | HR | Manager | Employee |
|--------|-------|-----|---------|----------|
| Employee Master | CRUD | CRUD | Read | Read (Self) |
| Organization | CRUD | Read | Read | Read |
| Onboarding | CRUD | CRUD | Read | Read (Self) |
| Attendance | CRUD | CRUD | Approve | Mark (Self) |
| Leave | CRUD | CRUD | Approve | Apply (Self) |
| Payroll | CRUD | CRUD | Read | Read (Self) |
| Dashboard | All | All | Team | Personal |

---

## Development Phases

### Phase 1: Foundation (Week 1)
- Database setup
- Authentication system
- User roles & permissions
- Basic dashboard

### Phase 2: Core Modules (Week 2-3)
- Employee Master
- Organization Structure
- Attendance Management

### Phase 3: HR Modules (Week 4-5)
- Leave Management
- Employee Onboarding
- Payroll Management

### Phase 4: Enhancement (Week 6)
- Dashboard & Analytics
- Reports
- Email notifications
- PDF generation

### Phase 5: Testing & Deployment (Week 7)
- Integration testing
- Bug fixes
- Docker setup
- Deployment

---

## Technical Decisions

1. **State Management**: React Context API + useState/useReducer
2. **UI Framework**: Material-UI (already in dependencies)
3. **API Communication**: Axios
4. **Form Handling**: Formik + Yup validation
5. **Charts**: Recharts or Chart.js
6. **Date Handling**: date-fns
7. **File Upload**: Multer
8. **PDF Generation**: PDFKit or Puppeteer
9. **Authentication**: JWT with httpOnly cookies

---

## Next Steps

1. ✅ Architecture designed
2. → Create database models
3. → Build authentication system
4. → Implement each module step-by-step
5. → Integration testing
6. → Docker configuration

---

**Ready to start implementation!**
