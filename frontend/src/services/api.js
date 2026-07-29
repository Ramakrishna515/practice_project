import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  changePassword: (data) => api.put('/auth/change-password', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data)
};

// Employee API
export const employeeAPI = {
  getAll: (params) => api.get('/employees', { params }),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
  search: (query) => api.get('/employees/search', { params: { query } }),
  uploadDocument: (id, data) => api.post(`/employees/${id}/upload`, data),
  getDocuments: (id) => api.get(`/employees/${id}/documents`)
};

// Organization API
export const organizationAPI = {
  // Departments
  getDepartments: () => api.get('/organization/departments'),
  getDepartmentById: (id) => api.get(`/organization/departments/${id}`),
  createDepartment: (data) => api.post('/organization/departments', data),
  updateDepartment: (id, data) => api.put(`/organization/departments/${id}`, data),
  deleteDepartment: (id) => api.delete(`/organization/departments/${id}`),
  getDepartmentTree: () => api.get('/organization/departments/tree'),

  // Designations
  getDesignations: () => api.get('/organization/designations'),
  getDesignationById: (id) => api.get(`/organization/designations/${id}`),
  createDesignation: (data) => api.post('/organization/designations', data),
  updateDesignation: (id, data) => api.put(`/organization/designations/${id}`, data),
  deleteDesignation: (id) => api.delete(`/organization/designations/${id}`)
};

// Onboarding API
export const onboardingAPI = {
  getAll: (params) => api.get('/onboarding', { params }),
  getById: (id) => api.get(`/onboarding/${id}`),
  create: (data) => api.post('/onboarding', data),
  update: (id, data) => api.put(`/onboarding/${id}`, data),
  delete: (id) => api.delete(`/onboarding/${id}`),
  updateTask: (id, taskId, data) => api.put(`/onboarding/${id}/task/${taskId}`, data),
  updateDocument: (id, docId, data) => api.put(`/onboarding/${id}/document/${docId}`, data)
};

// Attendance API
export const attendanceAPI = {
  getAll: (params) => api.get('/attendance', { params }),
  getById: (id) => api.get(`/attendance/${id}`),
  checkIn: (data) => api.post('/attendance/checkin', data),
  checkOut: (data) => api.post('/attendance/checkout', data),
  update: (id, data) => api.put(`/attendance/${id}`, data),
  getEmployeeAttendance: (empId, params) => api.get(`/attendance/employee/${empId}`, { params }),
  getReport: (params) => api.get('/attendance/report', { params }),

  // Shifts
  getShifts: () => api.get('/attendance/shifts/all'),
  createShift: (data) => api.post('/attendance/shifts', data),
  updateShift: (id, data) => api.put(`/attendance/shifts/${id}`, data),
  deleteShift: (id) => api.delete(`/attendance/shifts/${id}`)
};

// Leave API
export const leaveAPI = {
  // Leave Types
  getLeaveTypes: () => api.get('/leaves/types'),
  createLeaveType: (data) => api.post('/leaves/types', data),
  updateLeaveType: (id, data) => api.put(`/leaves/types/${id}`, data),
  deleteLeaveType: (id) => api.delete(`/leaves/types/${id}`),

  // Leave Applications
  getAll: (params) => api.get('/leaves', { params }),
  getById: (id) => api.get(`/leaves/${id}`),
  applyLeave: (data) => api.post('/leaves', data),
  getMyLeaves: () => api.get('/leaves/my-leaves'),
  getPendingLeaves: () => api.get('/leaves/pending'),
  update: (id, data) => api.put(`/leaves/${id}`, data),
  cancel: (id) => api.delete(`/leaves/${id}`),
  approveLeave: (id, data) => api.put(`/leaves/${id}/approve`, data),
  rejectLeave: (id, data) => api.put(`/leaves/${id}/reject`, data),

  // Leave Balance
  getLeaveBalance: () => api.get('/leaves/balance'),
  getBalance: (empId, params) => api.get(`/leaves/balance/${empId}`, { params }),
  updateBalance: (empId, data) => api.put(`/leaves/balance/${empId}`, data)
};

// Payroll API
export const payrollAPI = {
  // Salary Structure
  getSalaryStructures: (params) => api.get('/payroll/salary-structures', { params }),
  getSalaryStructureById: (id) => api.get(`/payroll/salary-structures/${id}`),
  createSalaryStructure: (data) => api.post('/payroll/salary-structures', data),
  updateSalaryStructure: (id, data) => api.put(`/payroll/salary-structures/${id}`, data),
  deleteSalaryStructure: (id) => api.delete(`/payroll/salary-structures/${id}`),

  // Payslips
  getPayslips: (params) => api.get('/payroll/payslips', { params }),
  getPayslipById: (id) => api.get(`/payroll/payslips/${id}`),
  getEmployeePayslips: (empId) => api.get(`/payroll/payslips/employee/${empId}`),
  generatePayslip: (data) => api.post('/payroll/payslips/generate', data),
  generatePayslips: (data) => api.post('/payroll/payslips/generate', data),
  updatePayslip: (id, data) => api.put(`/payroll/payslips/${id}`, data),
  processPayslips: (data) => api.post('/payroll/payslips/process', data)
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getAttendanceSummary: (params) => api.get('/dashboard/attendance', { params }),
  getLeaveSummary: () => api.get('/dashboard/leaves'),
  getEmployeesByDepartment: () => api.get('/dashboard/employees'),
  getPayrollSummary: () => api.get('/dashboard/payroll'),
  getRecentActivities: () => api.get('/dashboard/recent')
};
