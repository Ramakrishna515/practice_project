import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Snackbar,
  Alert,
  Avatar,
  Divider,
  CircularProgress,
  TextField,
  Paper
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  AccessTimeFilled,
  MyLocation
} from '@mui/icons-material';
import { attendanceAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import AttendanceTabs from './AttendanceTabs';

export default function CheckInOut() {
  const { user } = useAuth();
  const [now, setNow] = useState(new Date());
  const [todayRecord, setTodayRecord] = useState(null);
  const [stats, setStats] = useState({ totalDays: 0, present: 0, absent: 0, halfDay: 0, leave: 0, totalWorkHours: 0, totalOvertimeHours: 0 });
  const [location, setLocation] = useState({ latitude: null, longitude: null, address: '' });
  const [capturing, setCapturing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const employeeId = user?.employee?._id;

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const loadData = useCallback(async () => {
    if (!employeeId) {
      setLoading(false);
      return;
    }
    try {
      const today = new Date();
      const iso = today.toISOString().split('T')[0];
      const [todayRes, allRes] = await Promise.all([
        attendanceAPI.getEmployeeAttendance(employeeId, { startDate: iso, endDate: iso }),
        attendanceAPI.getEmployeeAttendance(employeeId)
      ]);
      setTodayRecord(todayRes.data.attendanceRecords?.[0] || null);
      setStats(allRes.data.stats || {});
    } catch (error) {
      console.error('Error loading attendance:', error);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, [loadData]);

  const captureLocation = () => {
    if (!navigator.geolocation) {
      showSnackbar('Geolocation not supported by this browser', 'warning');
      return;
    }
    setCapturing(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}&zoom=16`
          );
          const data = await res.json();
          setLocation({ ...coords, address: data.display_name || 'GPS captured' });
        } catch (err) {
          setLocation({ ...coords, address: 'GPS captured' });
        }
        showSnackbar('Location captured', 'success');
        setCapturing(false);
      },
      () => {
        showSnackbar('Location permission denied. You can enter the address manually.', 'warning');
        setCapturing(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const buildLocationPayload = () => {
    const hasGps = location.latitude != null;
    return {
      latitude: location.latitude,
      longitude: location.longitude,
      address: location.address || (hasGps ? 'GPS captured' : undefined)
    };
  };

  const handleCheckIn = async () => {
    if (!employeeId) return showSnackbar('No employee linked to your account', 'error');
    setBusy(true);
    try {
      await attendanceAPI.checkIn({ employeeId, location: buildLocationPayload() });
      showSnackbar('Checked in successfully!', 'success');
      loadData();
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Check-in failed', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleCheckOut = async () => {
    if (!employeeId) return showSnackbar('No employee linked to your account', 'error');
    setBusy(true);
    try {
      await attendanceAPI.checkOut({ employeeId, location: buildLocationPayload() });
      showSnackbar('Checked out successfully!', 'success');
      loadData();
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Check-out failed', 'error');
    } finally {
      setBusy(false);
    }
  };

  const workHoursLive = todayRecord?.checkIn && !todayRecord?.checkOut
    ? Math.max(0, (now - new Date(todayRecord.checkIn)) / (1000 * 60 * 60))
    : (todayRecord?.workHours || 0);

  const hoursLabel = (h) => {
    const hrs = Math.floor(h);
    const mins = Math.round((h - hrs) * 60);
    return `${hrs}h ${mins}m`;
  };

  const fmtTime = (d) => d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—';

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!employeeId) {
    return (
      <Card elevation={3}>
        <CardContent>
          <Alert severity="warning">
            No employee record is linked to your account. Please contact your administrator to link your employee profile.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const isCheckedIn = !!todayRecord?.checkIn;
  const isCheckedOut = !!todayRecord?.checkOut;

  return (
    <Box>
      <AttendanceTabs />
      <Typography variant="h4" gutterBottom>
        Attendance Check-In / Out
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        {now.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      </Typography>

      <Grid container spacing={3}>
        {/* Clock + check in/out */}
        <Grid item xs={12} md={5}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center" py={3}>
                <Avatar sx={{ width: 72, height: 72, bgcolor: 'primary.main', mb: 2 }}>
                  <AccessTimeFilled sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h2" sx={{ fontWeight: 700 }}>
                  {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" mb={3}>
                  {now.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}
                </Typography>

                <Chip
                  label={isCheckedOut ? 'Checked Out' : isCheckedIn ? 'Checked In' : 'Not Checked In'}
                  color={isCheckedOut ? 'default' : isCheckedIn ? 'success' : 'warning'}
                  size="medium"
                  sx={{ mb: 2 }}
                />

                {todayRecord?.checkIn && (
                  <Box textAlign="center" mb={2}>
                    <Typography color="text.secondary">Checked in at</Typography>
                    <Typography variant="h6">{fmtTime(todayRecord.checkIn)}</Typography>
                    {!isCheckedOut && (
                      <>
                        <Typography color="text.secondary" mt={1}>Working time</Typography>
                        <Typography variant="h6" color="success.main">{hoursLabel(workHoursLive)}</Typography>
                      </>
                    )}
                    {todayRecord?.checkOut && (
                      <>
                        <Typography color="text.secondary" mt={1}>Checked out at</Typography>
                        <Typography variant="h6">{fmtTime(todayRecord.checkOut)}</Typography>
                      </>
                    )}
                  </Box>
                )}

                <Box mt={2} display="flex" gap={2}>
                  {!isCheckedIn ? (
                    <Button
                      variant="contained"
                      color="success"
                      size="large"
                      startIcon={<CheckCircle />}
                      onClick={handleCheckIn}
                      disabled={busy}
                    >
                      {busy ? 'Checking in...' : 'Check In'}
                    </Button>
                  ) : !isCheckedOut ? (
                    <Button
                      variant="contained"
                      color="error"
                      size="large"
                      startIcon={<Cancel />}
                      onClick={handleCheckOut}
                      disabled={busy}
                    >
                      {busy ? 'Checking out...' : 'Check Out'}
                    </Button>
                  ) : (
                    <Chip label="Day completed" color="success" />
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Location + stats */}
        <Grid item xs={12} md={7}>
          <Grid container spacing={2} mb={2}>
            <Grid item xs={6}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">Present</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.present}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">Absent</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }} color="error">{stats.absent}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">Total Hours</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{hoursLabel(stats.totalWorkHours)}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">Overtime</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }} color="warning.main">{hoursLabel(stats.totalOvertimeHours)}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Paper elevation={3} sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Location</Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<MyLocation />}
                onClick={captureLocation}
                disabled={capturing}
              >
                {capturing ? 'Capturing...' : 'Use My Location'}
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  placeholder="Office address or captured GPS location"
                  value={location.address}
                  onChange={(e) => setLocation({ ...location, address: e.target.value })}
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Latitude"
                  value={location.latitude ?? ''}
                  onChange={(e) => setLocation({ ...location, latitude: e.target.value })}
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Longitude"
                  value={location.longitude ?? ''}
                  onChange={(e) => setLocation({ ...location, longitude: e.target.value })}
                  size="small"
                />
              </Grid>
            </Grid>
          </Paper>
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
