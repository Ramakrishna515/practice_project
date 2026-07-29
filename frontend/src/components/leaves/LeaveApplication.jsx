import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  MenuItem,
  Snackbar,
  Alert,
  Grid
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { leaveAPI } from '../../services/api';

export default function LeaveApplication() {
  const navigate = useNavigate();
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadLeaveTypes();
  }, []);

  const loadLeaveTypes = async () => {
    try {
      const response = await leaveAPI.getLeaveTypes();
      setLeaveTypes(response.data.leaveTypes || []);
    } catch (error) {
      console.error('Error loading leave types:', error);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await leaveAPI.applyLeave(formData);
      showSnackbar('Leave application submitted successfully!', 'success');
      setTimeout(() => navigate('/leaves'), 1500);
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Failed to apply leave', 'error');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Apply for Leave
      </Typography>

      <Card elevation={3}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  select
                  label="Leave Type"
                  value={formData.leaveType}
                  onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                >
                  <MenuItem value="">Select Leave Type</MenuItem>
                  {leaveTypes.map((type) => (
                    <MenuItem key={type._id} value={type._id}>
                      {type.leaveTypeName} ({type.maxDaysPerYear} days available)
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6} />
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  type="date"
                  label="Start Date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  type="date"
                  label="End Date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Reason"
                  multiline
                  rows={4}
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <Box display="flex" gap={2}>
                  <Button variant="outlined" onClick={() => navigate('/leaves')}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="contained">
                    Submit Application
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

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
