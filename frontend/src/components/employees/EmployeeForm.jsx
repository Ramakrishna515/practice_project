import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Divider,
  CircularProgress
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { employeeAPI, organizationAPI } from '../../services/api';

export default function EmployeeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
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

  const loadEmployee = async () => {
    try {
      setLoading(true);
      const response = await employeeAPI.getById(id);
      const employee = response.data.employee;

      // Format dates for input fields
      if (employee.personalInfo.dateOfBirth) {
        employee.personalInfo.dateOfBirth = employee.personalInfo.dateOfBirth.split('T')[0];
      }
      if (employee.employmentInfo.joiningDate) {
        employee.employmentInfo.joiningDate = employee.employmentInfo.joiningDate.split('T')[0];
      }

      setFormData(employee);
    } catch (error) {
      console.error('Error loading employee:', error);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        await employeeAPI.update(id, formData);
        alert('Employee updated successfully!');
      } else {
        await employeeAPI.create(formData);
        alert('Employee created successfully!');
      }
      navigate('/employees');
    } catch (error) {
      console.error('Error saving employee:', error);
      alert('Error saving employee: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
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
      <Typography variant="h4" gutterBottom>
        {isEdit ? 'Edit Employee' : 'Add New Employee'}
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <form onSubmit={handleSubmit}>
          {/* Personal Information */}
          <Typography variant="h6" gutterBottom>
            Personal Information
          </Typography>
          <Divider sx={{ mb: 2 }} />

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

          {/* Contact Information */}
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Contact Information
          </Typography>
          <Divider sx={{ mb: 2 }} />

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

          {/* Employment Information */}
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Employment Information
          </Typography>
          <Divider sx={{ mb: 2 }} />

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
                {designations.map((desig) => (
                  <MenuItem key={desig._id} value={desig._id}>
                    {desig.designationName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
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

          {/* Bank Details */}
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Bank Details
          </Typography>
          <Divider sx={{ mb: 2 }} />

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

          {/* Action Buttons */}
          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
            >
              {loading ? 'Saving...' : (isEdit ? 'Update Employee' : 'Create Employee')}
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/employees')}
            >
              Cancel
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}
