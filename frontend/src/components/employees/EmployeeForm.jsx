import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Divider,
  CircularProgress,
  Tabs,
  Tab,
  Card,
  CardContent,
  Snackbar,
  Alert,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { employeeAPI, organizationAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} style={{ paddingTop: 24 }}>
      {value === index && children}
    </div>
  );
}

export default function EmployeeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = Boolean(id);
  const isAdminHR = ['Admin', 'HR'].includes(user?.role);

  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' // 'success' | 'error' | 'warning' | 'info'
  });
  const [createAccount, setCreateAccount] = useState(false);
  const [accountData, setAccountData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'Employee'
  });
  const [linkedUser, setLinkedUser] = useState(null);
  const [linking, setLinking] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Info
    personalInfo: {
      firstName: '',
      middleName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
      maritalStatus: '',
      bloodGroup: '',
    },
    // Contact Info
    contactInfo: {
      email: '',
      phone: '',
      emergencyContact: {
        name: '',
        relationship: '',
        phone: ''
      },
      currentAddress: {
        street: '',
        city: '',
        state: '',
        country: '',
        pincode: ''
      }
    },
    // Employment Info
    employmentInfo: {
      joiningDate: '',
      employmentType: 'Permanent',
      probationPeriod: 3,
      department: '',
      designation: '',
      reportingManager: '',
      workLocation: '',
      employmentStatus: 'Active'
    },
    // Bank Details
    bankDetails: {
      accountHolderName: '',
      accountNumber: '',
      bankName: '',
      ifscCode: '',
      branch: ''
    }
  });

  useEffect(() => {
    loadDepartments();
    loadDesignations();
    if (isAdminHR) {
      loadEmployees();
    }
    if (isEdit) {
      loadEmployee();
    }
  }, [id]);

  const loadDepartments = async () => {
    try {
      const response = await organizationAPI.getDepartments();
      setDepartments(response.data.departments);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const loadDesignations = async () => {
    try {
      const response = await organizationAPI.getDesignations();
      setDesignations(response.data.designations);
    } catch (error) {
      console.error('Error loading designations:', error);
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await employeeAPI.getAll({ limit: 100 });
      setEmployees(response.data.employees || []);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const loadEmployee = async () => {
    try {
      setLoading(true);
      const response = await employeeAPI.getById(id);
      const employee = response.data.employee;

      // Format dates for input fields
      if (employee.personalInfo?.dateOfBirth) {
        employee.personalInfo.dateOfBirth = employee.personalInfo.dateOfBirth.split('T')[0];
      }
      if (employee.employmentInfo?.joiningDate) {
        employee.employmentInfo.joiningDate = employee.employmentInfo.joiningDate.split('T')[0];
      }

      // Convert populated department/designation to IDs
      if (employee.employmentInfo?.department?._id) {
        employee.employmentInfo.department = employee.employmentInfo.department._id;
      }
      if (employee.employmentInfo?.designation?._id) {
        employee.employmentInfo.designation = employee.employmentInfo.designation._id;
      }
      if (employee.employmentInfo?.reportingManager?._id) {
        employee.employmentInfo.reportingManager = employee.employmentInfo.reportingManager._id;
      }

      // Ensure all nested objects exist
      const formattedEmployee = {
        personalInfo: employee.personalInfo || {},
        contactInfo: {
          ...employee.contactInfo,
          emergencyContact: employee.contactInfo?.emergencyContact || { name: '', relationship: '', phone: '' },
          currentAddress: employee.contactInfo?.currentAddress || { street: '', city: '', state: '', country: '', pincode: '' }
        },
        employmentInfo: employee.employmentInfo || {},
        bankDetails: employee.bankDetails || {}
      };

      setFormData(formattedEmployee);
      setLinkedUser(employee.linkedUser || null);
    } catch (error) {
      console.error('Error loading employee:', error);
      showSnackbar('Failed to load employee data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (section, field, value, subField = null) => {
    setFormData(prev => {
      if (subField) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: {
              ...prev[section][field],
              [subField]: value
            }
          }
        };
      } else {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: value
          }
        };
      }
    });
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const validateTab = (tabIndex) => {
    const errors = [];

    switch (tabIndex) {
      case 0: // Personal Info
        if (!formData.personalInfo.firstName?.trim()) {
          errors.push('First Name is required');
        }
        if (!formData.personalInfo.lastName?.trim()) {
          errors.push('Last Name is required');
        }
        break;

      case 1: // Contact Info
        if (!formData.contactInfo.email?.trim()) {
          errors.push('Email is required');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactInfo.email)) {
          errors.push('Valid email is required');
        }
        if (!formData.contactInfo.phone?.trim()) {
          errors.push('Phone number is required');
        }
        break;

      case 2: // Employment Info
        if (!formData.employmentInfo.joiningDate) {
          errors.push('Joining Date is required');
        }
        break;

      case 3: // Bank Details (optional)
        // No required fields
        break;

      case 4: // Login Account
        if (createAccount) {
          if (!accountData.username?.trim()) {
            errors.push('Username is required');
          }
          if (!accountData.email?.trim()) {
            errors.push('Account email is required');
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountData.email)) {
            errors.push('Valid account email is required');
          }
          if (!accountData.password?.trim()) {
            errors.push('Password is required');
          } else if (accountData.password.length < 6) {
            errors.push('Password must be at least 6 characters');
          }
        }
        break;

      default:
        break;
    }

    return errors;
  };

  const handleNextTab = () => {
    const errors = validateTab(currentTab);
    if (errors.length > 0) {
      showSnackbar(errors.join(', '), 'error');
      return;
    }
    setCurrentTab(currentTab + 1);
  };

  const handlePreviousTab = () => {
    setCurrentTab(currentTab - 1);
  };

  const cleanFormData = (data) => {
    // Remove empty strings and convert to undefined
    const cleaned = JSON.parse(JSON.stringify(data, (key, value) => {
      if (value === '') return undefined;
      return value;
    }));

    // Remove undefined values
    return JSON.parse(JSON.stringify(cleaned));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cleanedData = cleanFormData(formData);

      if (isEdit) {
        await employeeAPI.update(id, cleanedData);
        showSnackbar('Employee updated successfully!', 'success');
        setTimeout(() => navigate('/employees'), 1500);
      } else {
        const payload = { ...cleanedData };
        if (createAccount) {
          payload.userAccount = {
            createAccount: true,
            username: accountData.username,
            email: accountData.email,
            password: accountData.password,
            role: accountData.role
          };
        }
        await employeeAPI.create(payload);
        showSnackbar('Employee created successfully!', 'success');
        setTimeout(() => navigate('/employees'), 1500);
      }
    } catch (error) {
      console.error('Error saving employee:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save employee';
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAccountChange = (field, value) => {
    setAccountData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLinkAccount = async () => {
    const errors = [];
    if (!accountData.username?.trim()) errors.push('Username is required');
    if (!accountData.email?.trim()) {
      errors.push('Account email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountData.email)) {
      errors.push('Valid account email is required');
    }
    if (!accountData.password?.trim()) {
      errors.push('Password is required');
    } else if (accountData.password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }
    if (errors.length > 0) {
      showSnackbar(errors.join(', '), 'error');
      return;
    }

    setLinking(true);
    try {
      await employeeAPI.linkUser(id, accountData);
      showSnackbar('Login account linked successfully!', 'success');
      loadEmployee();
    } catch (error) {
      console.error('Error linking account:', error);
      showSnackbar(error.response?.data?.message || 'Failed to link account', 'error');
    } finally {
      setLinking(false);
    }
  };

  const handleUnlinkAccount = async () => {
    setLinking(true);
    try {
      await employeeAPI.unlinkUser(id);
      showSnackbar('Login account unlinked successfully!', 'success');
      setLinkedUser(null);
      loadEmployee();
    } catch (error) {
      console.error('Error unlinking account:', error);
      showSnackbar(error.response?.data?.message || 'Failed to unlink account', 'error');
    } finally {
      setLinking(false);
    }
  };

  if (loading && isEdit) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          {isEdit ? 'Edit Employee' : 'Add New Employee'}
        </Typography>
        <Button variant="outlined" onClick={() => navigate('/employees')}>
          Back to List
        </Button>
      </Box>

      <Card elevation={3}>
        <CardContent>
          <Tabs
            value={currentTab}
            onChange={(e, newValue) => setCurrentTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
          >
            <Tab label="Personal Info" />
            <Tab label="Contact Info" />
            <Tab label="Employment" />
            <Tab label="Bank Details" />
            <Tab label="Login Account" />
          </Tabs>

          <form onSubmit={handleSubmit}>
            {/* Tab 1: Personal Information */}
            <TabPanel value={currentTab} index={0}>

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                required
                fullWidth
                label="First Name"
                value={formData.personalInfo.firstName}
                onChange={(e) => handleChange('personalInfo', 'firstName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Middle Name"
                value={formData.personalInfo.middleName}
                onChange={(e) => handleChange('personalInfo', 'middleName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                required
                fullWidth
                label="Last Name"
                value={formData.personalInfo.lastName}
                onChange={(e) => handleChange('personalInfo', 'lastName', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="date"
                label="Date of Birth"
                InputLabelProps={{ shrink: true }}
                value={formData.personalInfo.dateOfBirth}
                onChange={(e) => handleChange('personalInfo', 'dateOfBirth', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="Gender"
                value={formData.personalInfo.gender}
                onChange={(e) => handleChange('personalInfo', 'gender', e.target.value)}
              >
                <MenuItem value="">Select Gender</MenuItem>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="Marital Status"
                value={formData.personalInfo.maritalStatus}
                onChange={(e) => handleChange('personalInfo', 'maritalStatus', e.target.value)}
              >
                <MenuItem value="">Select Status</MenuItem>
                <MenuItem value="Single">Single</MenuItem>
                <MenuItem value="Married">Married</MenuItem>
                <MenuItem value="Divorced">Divorced</MenuItem>
                <MenuItem value="Widowed">Widowed</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Blood Group"
                value={formData.personalInfo.bloodGroup}
                onChange={(e) => handleChange('personalInfo', 'bloodGroup', e.target.value)}
              />
            </Grid>
          </Grid>

            </TabPanel>

            {/* Tab 2: Contact Information */}
            <TabPanel value={currentTab} index={1}>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                type="email"
                label="Email"
                value={formData.contactInfo.email}
                onChange={(e) => handleChange('contactInfo', 'email', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Phone"
                value={formData.contactInfo.phone}
                onChange={(e) => handleChange('contactInfo', 'phone', e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Emergency Contact
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Emergency Contact Name"
                value={formData.contactInfo.emergencyContact.name}
                onChange={(e) => handleChange('contactInfo', 'emergencyContact', e.target.value, 'name')}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Relationship"
                value={formData.contactInfo.emergencyContact.relationship}
                onChange={(e) => handleChange('contactInfo', 'emergencyContact', e.target.value, 'relationship')}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Emergency Phone"
                value={formData.contactInfo.emergencyContact.phone}
                onChange={(e) => handleChange('contactInfo', 'emergencyContact', e.target.value, 'phone')}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Current Address
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street"
                value={formData.contactInfo.currentAddress.street}
                onChange={(e) => handleChange('contactInfo', 'currentAddress', e.target.value, 'street')}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="City"
                value={formData.contactInfo.currentAddress.city}
                onChange={(e) => handleChange('contactInfo', 'currentAddress', e.target.value, 'city')}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="State"
                value={formData.contactInfo.currentAddress.state}
                onChange={(e) => handleChange('contactInfo', 'currentAddress', e.target.value, 'state')}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Country"
                value={formData.contactInfo.currentAddress.country}
                onChange={(e) => handleChange('contactInfo', 'currentAddress', e.target.value, 'country')}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Pincode"
                value={formData.contactInfo.currentAddress.pincode}
                onChange={(e) => handleChange('contactInfo', 'currentAddress', e.target.value, 'pincode')}
              />
            </Grid>
          </Grid>

            </TabPanel>

            {/* Tab 3: Employment Information */}
            <TabPanel value={currentTab} index={2}>

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                required
                fullWidth
                type="date"
                label="Joining Date"
                InputLabelProps={{ shrink: true }}
                value={formData.employmentInfo.joiningDate}
                onChange={(e) => handleChange('employmentInfo', 'joiningDate', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="Employment Type"
                value={formData.employmentInfo.employmentType}
                onChange={(e) => handleChange('employmentInfo', 'employmentType', e.target.value)}
              >
                <MenuItem value="Permanent">Permanent</MenuItem>
                <MenuItem value="Contract">Contract</MenuItem>
                <MenuItem value="Intern">Intern</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Probation Period (months)"
                value={formData.employmentInfo.probationPeriod}
                onChange={(e) => handleChange('employmentInfo', 'probationPeriod', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="Department"
                value={formData.employmentInfo.department}
                onChange={(e) => handleChange('employmentInfo', 'department', e.target.value)}
              >
                <MenuItem value="">Select Department</MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept._id} value={dept._id}>
                    {dept.departmentName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="Designation"
                value={formData.employmentInfo.designation}
                onChange={(e) => handleChange('employmentInfo', 'designation', e.target.value)}
              >
                <MenuItem value="">Select Designation</MenuItem>
                {designations.map((desig) => (
                  <MenuItem key={desig._id} value={desig._id}>
                    {desig.designationName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            {isAdminHR && (
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  select
                  label="Reporting Manager"
                  value={formData.employmentInfo.reportingManager}
                  onChange={(e) => handleChange('employmentInfo', 'reportingManager', e.target.value)}
                >
                  <MenuItem value="">No Manager</MenuItem>
                  {employees
                    .filter((emp) => emp._id !== id)
                    .map((emp) => (
                      <MenuItem key={emp._id} value={emp._id}>
                        {emp.employeeId} - {emp.personalInfo?.firstName} {emp.personalInfo?.lastName}
                      </MenuItem>
                    ))}
                </TextField>
              </Grid>
            )}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Work Location"
                value={formData.employmentInfo.workLocation}
                onChange={(e) => handleChange('employmentInfo', 'workLocation', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="Employment Status"
                value={formData.employmentInfo.employmentStatus}
                onChange={(e) => handleChange('employmentInfo', 'employmentStatus', e.target.value)}
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
                <MenuItem value="Resigned">Resigned</MenuItem>
                <MenuItem value="Terminated">Terminated</MenuItem>
              </TextField>
            </Grid>
          </Grid>

            </TabPanel>

            {/* Tab 4: Bank Details */}
            <TabPanel value={currentTab} index={3}>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Account Holder Name"
                value={formData.bankDetails.accountHolderName}
                onChange={(e) => handleChange('bankDetails', 'accountHolderName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Account Number"
                value={formData.bankDetails.accountNumber}
                onChange={(e) => handleChange('bankDetails', 'accountNumber', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Bank Name"
                value={formData.bankDetails.bankName}
                onChange={(e) => handleChange('bankDetails', 'bankName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="IFSC Code"
                value={formData.bankDetails.ifscCode}
                onChange={(e) => handleChange('bankDetails', 'ifscCode', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Branch"
                value={formData.bankDetails.branch}
                onChange={(e) => handleChange('bankDetails', 'branch', e.target.value)}
              />
            </Grid>
          </Grid>

            </TabPanel>

            {/* Tab 5: Login Account */}
            <TabPanel value={currentTab} index={4}>

          {!isEdit ? (
            <>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={createAccount}
                    onChange={(e) => setCreateAccount(e.target.checked)}
                  />
                }
                label="Create a login account for this employee"
              />

              {createAccount && (
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      required
                      fullWidth
                      label="Username"
                      value={accountData.username}
                      onChange={(e) => handleAccountChange('username', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      required
                      fullWidth
                      type="email"
                      label="Login Email"
                      value={accountData.email}
                      onChange={(e) => handleAccountChange('email', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      required
                      fullWidth
                      type="password"
                      label="Password (min 6 characters)"
                      value={accountData.password}
                      onChange={(e) => handleAccountChange('password', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      select
                      label="Role"
                      value={accountData.role}
                      onChange={(e) => handleAccountChange('role', e.target.value)}
                    >
                      <MenuItem value="Employee">Employee</MenuItem>
                      <MenuItem value="Manager">Manager</MenuItem>
                      <MenuItem value="HR">HR</MenuItem>
                      <MenuItem value="Admin">Admin</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
              )}
            </>
          ) : linkedUser ? (
            <>
              <Alert severity="success" sx={{ mb: 2 }}>
                This employee has a linked login account.
              </Alert>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Username"
                    value={linkedUser.username}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={linkedUser.email}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Role"
                    value={linkedUser.role}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Status"
                    value={linkedUser.isActive ? 'Active' : 'Inactive'}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleUnlinkAccount}
                    disabled={linking}
                  >
                    {linking ? 'Processing...' : 'Unlink Account'}
                  </Button>
                </Grid>
              </Grid>
            </>
          ) : (
            <>
              <Alert severity="info" sx={{ mb: 2 }}>
                No login account linked. Create one now to let this employee log in and use attendance/leave modules.
              </Alert>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    required
                    fullWidth
                    label="Username"
                    value={accountData.username}
                    onChange={(e) => handleAccountChange('username', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    required
                    fullWidth
                    type="email"
                    label="Login Email"
                    value={accountData.email}
                    onChange={(e) => handleAccountChange('email', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    required
                    fullWidth
                    type="password"
                    label="Password (min 6 characters)"
                    value={accountData.password}
                    onChange={(e) => handleAccountChange('password', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Role"
                    value={accountData.role}
                    onChange={(e) => handleAccountChange('role', e.target.value)}
                  >
                    <MenuItem value="Employee">Employee</MenuItem>
                    <MenuItem value="Manager">Manager</MenuItem>
                    <MenuItem value="HR">HR</MenuItem>
                    <MenuItem value="Admin">Admin</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    onClick={handleLinkAccount}
                    disabled={linking}
                  >
                    {linking ? 'Linking...' : 'Link Account'}
                  </Button>
                </Grid>
              </Grid>
            </>
          )}

            </TabPanel>

            {/* Action Buttons */}
            <Divider sx={{ my: 3 }} />
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {currentTab > 0 && (
                  <Button
                    variant="outlined"
                    onClick={handlePreviousTab}
                  >
                    Previous
                  </Button>
                )}
                {currentTab < 4 && (
                  <Button
                    variant="contained"
                    onClick={handleNextTab}
                  >
                    Next
                  </Button>
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/employees')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : (isEdit ? 'Update Employee' : 'Save Employee')}
                </Button>
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
