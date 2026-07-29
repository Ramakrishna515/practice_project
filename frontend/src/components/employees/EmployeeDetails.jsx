import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  Chip,
  Card,
  CardContent,
  CircularProgress,
  Avatar,
  Tabs,
  Tab
} from '@mui/material';
import {
  Edit,
  ArrowBack,
  Email,
  Phone,
  Business,
  Work,
  CalendarToday,
  AccountBalance
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { employeeAPI } from '../../services/api';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} style={{ paddingTop: 24 }}>
      {value === index && children}
    </div>
  );
}

export default function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState(0);

  useEffect(() => {
    loadEmployee();
  }, [id]);

  const loadEmployee = async () => {
    try {
      setLoading(true);
      const response = await employeeAPI.getById(id);
      setEmployee(response.data.employee);
    } catch (error) {
      console.error('Error loading employee:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!employee) {
    return (
      <Box>
        <Typography variant="h5">Employee not found</Typography>
        <Button onClick={() => navigate('/employees')} sx={{ mt: 2 }}>
          Back to List
        </Button>
      </Box>
    );
  }

  const { personalInfo, contactInfo, employmentInfo, bankDetails } = employee;

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/employees')}
          >
            Back
          </Button>
          <Typography variant="h4">Employee Details</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Edit />}
          onClick={() => navigate(`/employees/${id}/edit`)}
        >
          Edit Employee
        </Button>
      </Box>

      {/* Profile Card */}
      <Card elevation={3} sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={3}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: 'primary.main',
                fontSize: '2.5rem'
              }}
            >
              {personalInfo.firstName[0]}{personalInfo.lastName[0]}
            </Avatar>
            <Box flex={1}>
              <Typography variant="h4">
                {personalInfo.firstName} {personalInfo.middleName} {personalInfo.lastName}
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {employee.employeeId}
              </Typography>
              <Box display="flex" gap={2} mt={1}>
                <Chip
                  icon={<Email />}
                  label={contactInfo.email}
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  icon={<Phone />}
                  label={contactInfo.phone}
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  label={employmentInfo.employmentStatus}
                  color={employmentInfo.employmentStatus === 'Active' ? 'success' : 'default'}
                />
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Tabbed Details */}
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
          </Tabs>

          {/* Tab 1: Personal Information */}
          <TabPanel value={currentTab} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  First Name
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {personalInfo.firstName}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Last Name
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {personalInfo.lastName}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Date of Birth
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formatDate(personalInfo.dateOfBirth)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Gender
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {personalInfo.gender || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Marital Status
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {personalInfo.maritalStatus || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Blood Group
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {personalInfo.bloodGroup || 'N/A'}
                </Typography>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Tab 2: Contact Information */}
          <TabPanel value={currentTab} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {contactInfo.email}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Phone
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {contactInfo.phone}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Emergency Contact
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {contactInfo.emergencyContact?.name || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Relationship
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {contactInfo.emergencyContact?.relationship || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Phone
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {contactInfo.emergencyContact?.phone || 'N/A'}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Current Address
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Street
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {contactInfo.currentAddress?.street || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="subtitle2" color="text.secondary">
                  City
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {contactInfo.currentAddress?.city || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="subtitle2" color="text.secondary">
                  State
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {contactInfo.currentAddress?.state || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="subtitle2" color="text.secondary">
                  Country
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {contactInfo.currentAddress?.country || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="subtitle2" color="text.secondary">
                  Pincode
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {contactInfo.currentAddress?.pincode || 'N/A'}
                </Typography>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Tab 3: Employment Information */}
          <TabPanel value={currentTab} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Joining Date
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formatDate(employmentInfo.joiningDate)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Employment Type
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {employmentInfo.employmentType}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Department
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {employmentInfo.department?.departmentName || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Designation
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {employmentInfo.designation?.designationName || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Work Location
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {employmentInfo.workLocation || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Employment Status
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {employmentInfo.employmentStatus}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Probation Period
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {employmentInfo.probationPeriod || 0} months
                </Typography>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Tab 4: Bank Details */}
          <TabPanel value={currentTab} index={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Account Holder Name
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {bankDetails?.accountHolderName || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Account Number
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {bankDetails?.accountNumber || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Bank Name
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {bankDetails?.bankName || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  IFSC Code
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {bankDetails?.ifscCode || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Branch
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {bankDetails?.branch || 'N/A'}
                </Typography>
              </Grid>
            </Grid>
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
}
