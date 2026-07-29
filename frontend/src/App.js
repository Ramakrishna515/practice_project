import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

// Import components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import Layout from './components/common/Layout';

// Employee components
import EmployeeList from './components/employees/EmployeeList';
import EmployeeForm from './components/employees/EmployeeForm';
import EmployeeDetails from './components/employees/EmployeeDetails';

// Organization components
import DepartmentList from './components/organization/DepartmentList';
import DesignationList from './components/organization/DesignationList';
import OrgChart from './components/organization/OrgChart';

// Onboarding components
import OnboardingList from './components/onboarding/OnboardingList';
import OnboardingDetails from './components/onboarding/OnboardingDetails';

// Attendance components
import AttendanceList from './components/attendance/AttendanceList';
import AttendanceCalendar from './components/attendance/AttendanceCalendar';
import CheckInOut from './components/attendance/CheckInOut';

// Leave components
import LeaveList from './components/leaves/LeaveList';
import LeaveApplication from './components/leaves/LeaveApplication';
import LeaveApproval from './components/leaves/LeaveApproval';
import LeaveBalance from './components/leaves/LeaveBalance';
import LeaveTypeManagement from './components/leaves/LeaveTypeManagement';

// Payroll components
import SalaryStructureList from './components/payroll/SalaryStructureList';
import PayslipList from './components/payroll/PayslipList';
import PayslipGenerate from './components/payroll/PayslipGenerate';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// App Routes Component
function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />

        {/* Employee Routes */}
        <Route path="employees">
          <Route index element={<EmployeeList />} />
          <Route path="new" element={<EmployeeForm />} />
          <Route path=":id" element={<EmployeeDetails />} />
          <Route path=":id/edit" element={<EmployeeForm />} />
        </Route>

        {/* Organization Routes */}
        <Route path="organization">
          <Route path="departments" element={<DepartmentList />} />
          <Route path="designations" element={<DesignationList />} />
          <Route path="chart" element={<OrgChart />} />
        </Route>

        {/* Onboarding Routes */}
        <Route path="onboarding">
          <Route index element={<OnboardingList />} />
          <Route path=":id" element={<OnboardingDetails />} />
        </Route>

        {/* Attendance Routes */}
        <Route path="attendance">
          <Route index element={<AttendanceList />} />
          <Route path="calendar" element={<AttendanceCalendar />} />
          <Route path="checkin" element={<CheckInOut />} />
        </Route>

        {/* Leave Routes */}
        <Route path="leaves">
          <Route index element={<LeaveList />} />
          <Route path="apply" element={<LeaveApplication />} />
          <Route path="approvals" element={<LeaveApproval />} />
          <Route path="balance" element={<LeaveBalance />} />
          <Route path="types" element={<LeaveTypeManagement />} />
        </Route>

        {/* Payroll Routes */}
        <Route path="payroll">
          <Route path="salary-structures" element={<SalaryStructureList />} />
          <Route path="payslips" element={<PayslipList />} />
          <Route path="generate" element={<PayslipGenerate />} />
        </Route>
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

// Main App Component
export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}
