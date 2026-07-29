import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  MenuItem,
  Grid,
  Snackbar,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { payrollAPI, employeeAPI } from '../../services/api';

export default function PayslipGenerate() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    employee: '',
    month: '',
    year: new Date().getFullYear(),
    basicSalary: '',
    hra: '',
    da: '',
    ta: '',
    pf: '',
    tax: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const response = await employeeAPI.getAll({ limit: 100 });
      setEmployees(response.data.employees || []);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const calculateNetSalary = () => {
    const basic = parseFloat(formData.basicSalary) || 0;
    const hra = parseFloat(formData.hra) || 0;
    const da = parseFloat(formData.da) || 0;
    const ta = parseFloat(formData.ta) || 0;
    const pf = parseFloat(formData.pf) || 0;
    const tax = parseFloat(formData.tax) || 0;
    
    const totalAllowances = hra + da + ta;
    const totalDeductions = pf + tax;
    const netSalary = basic + totalAllowances - totalDeductions;
    
    return { totalAllowances, totalDeductions, netSalary };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { totalAllowances, totalDeductions, netSalary } = calculateNetSalary();
      
      await payrollAPI.generatePayslip({
        ...formData,
        totalAllowances,
        totalDeductions,
        netSalary
      });
      
      showSnackbar('Payslip generated successfully!', 'success');
      setTimeout(() => navigate('/payroll/payslips'), 1500);
    } catch (error) {
      showSnackbar('Failed to generate payslip', 'error');
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const { totalAllowances, totalDeductions, netSalary } = calculateNetSalary();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Generate Payslip
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card elevation={3}>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      required
                      fullWidth
                      select
                      label="Employee"
                      value={formData.employee}
                      onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
                    >
                      <MenuItem value="">Select Employee</MenuItem>
                      {employees.map((emp) => (
                        <MenuItem key={emp._id} value={emp._id}>
                          {emp.employeeId} - {emp.personalInfo?.firstName} {emp.personalInfo?.lastName}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      required
                      fullWidth
                      select
                      label="Month"
                      value={formData.month}
                      onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                    >
                      {months.map((month) => (
                        <MenuItem key={month} value={month}>{month}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      required
                      fullWidth
                      type="number"
                      label="Year"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h6">Earnings</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      required
                      fullWidth
                      type="number"
                      label="Basic Salary"
                      value={formData.basicSalary}
                      onChange={(e) => setFormData({ ...formData, basicSalary: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="HRA"
                      value={formData.hra}
                      onChange={(e) => setFormData({ ...formData, hra: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="DA (Dearness Allowance)"
                      value={formData.da}
                      onChange={(e) => setFormData({ ...formData, da: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="TA (Travel Allowance)"
                      value={formData.ta}
                      onChange={(e) => setFormData({ ...formData, ta: e.target.value })}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h6">Deductions</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="PF (Provident Fund)"
                      value={formData.pf}
                      onChange={(e) => setFormData({ ...formData, pf: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Tax"
                      value={formData.tax}
                      onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Box display="flex" gap={2}>
                      <Button variant="outlined" onClick={() => navigate('/payroll/payslips')}>
                        Cancel
                      </Button>
                      <Button type="submit" variant="contained">
                        Generate Payslip
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Summary
              </Typography>
              <Box my={2}>
                <Typography variant="subtitle2" color="text.secondary">Total Allowances</Typography>
                <Typography variant="h5">₹{totalAllowances.toLocaleString()}</Typography>
              </Box>
              <Box my={2}>
                <Typography variant="subtitle2" color="text.secondary">Total Deductions</Typography>
                <Typography variant="h5" color="error">₹{totalDeductions.toLocaleString()}</Typography>
              </Box>
              <Box my={2}>
                <Typography variant="subtitle2" color="text.secondary">Net Salary</Typography>
                <Typography variant="h4" color="success">₹{netSalary.toLocaleString()}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
