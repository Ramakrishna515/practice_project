import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Snackbar,
  Alert
} from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import { attendanceAPI } from '../../services/api';

export default function CheckInOut() {
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCheckIn = async () => {
    try {
      const response = await attendanceAPI.checkIn();
      setCheckedIn(true);
      setCheckInTime(new Date());
      showSnackbar('Checked in successfully!', 'success');
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Check-in failed', 'error');
    }
  };

  const handleCheckOut = async () => {
    try {
      await attendanceAPI.checkOut();
      setCheckedIn(false);
      showSnackbar('Checked out successfully!', 'success');
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Check-out failed', 'error');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Attendance Check-In/Out
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center" py={4}>
                <Typography variant="h6" gutterBottom>
                  Current Status
                </Typography>
                <Chip
                  label={checkedIn ? 'Checked In' : 'Not Checked In'}
                  color={checkedIn ? 'success' : 'default'}
                  size="large"
                  sx={{ my: 2 }}
                />
                {checkInTime && (
                  <Typography color="text.secondary">
                    Checked in at: {checkInTime.toLocaleTimeString()}
                  </Typography>
                )}
                <Box mt={4}>
                  {!checkedIn ? (
                    <Button
                      variant="contained"
                      color="success"
                      size="large"
                      startIcon={<CheckCircle />}
                      onClick={handleCheckIn}
                    >
                      Check In
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="error"
                      size="large"
                      startIcon={<Cancel />}
                      onClick={handleCheckOut}
                    >
                      Check Out
                    </Button>
                  )}
                </Box>
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
