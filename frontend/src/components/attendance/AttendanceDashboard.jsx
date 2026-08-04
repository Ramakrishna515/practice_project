import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Button,
  IconButton,
  LinearProgress,
  Tooltip
} from '@mui/material';
import {
  People,
  EventBusy,
  CheckCircle,
  Schedule,
  Refresh,
  FiberManualRecord,
  AccessTimeFilled
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { attendanceAPI } from '../../services/api';
import AttendanceTabs from './AttendanceTabs';

const REFRESH_INTERVAL = 15000;

export default function AttendanceDashboard() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [now, setNow] = useState(new Date());

  const loadToday = useCallback(async () => {
    try {
      const response = await attendanceAPI.getToday();
      setRecords(response.data.attendanceRecords || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading today attendance:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadToday();
    const interval = setInterval(() => {
      setNow(new Date());
      loadToday();
    }, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [loadToday]);

  const present = records.filter(r => r.status === 'Present');
  const checkedInNow = records.filter(r => r.checkIn && !r.checkOut);
  const absent = records.filter(r => r.status === 'Absent').length;
  const onLeave = records.filter(r => r.status === 'Leave').length;
  const halfDay = records.filter(r => r.status === 'Half Day').length;
  const totalWorkedToday = records.reduce((sum, r) => sum + (r.workHours || 0), 0);
  const totalOvertime = records.reduce((sum, r) => sum + (r.overtimeHours || 0), 0);

  const fmtTime = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const hoursLabel = (h) => {
    if (!h) return '0h';
    const hrs = Math.floor(h);
    const mins = Math.round((h - hrs) * 60);
    return `${hrs}h ${mins}m`;
  };

  const statusColor = (status) => {
    switch (status) {
      case 'Present': return 'success';
      case 'Absent': return 'error';
      case 'Half Day': return 'warning';
      case 'Leave': return 'info';
      case 'Holiday': return 'secondary';
      default: return 'default';
    }
  };

  const StatCard = ({ title, value, sub, icon, color }) => (
    <Card elevation={3} sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography color="text.secondary" variant="subtitle2">
              {title}
            </Typography>
            <Typography variant="h4" sx={{ mt: 1, fontWeight: 700 }}>
              {value}
            </Typography>
            {sub && (
              <Typography variant="caption" color="text.secondary">
                {sub}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: color, width: 48, height: 48 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <AttendanceTabs />
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Attendance Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {now.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={2}>
          <Chip
            icon={<FiberManualRecord sx={{ fontSize: 12, color: 'error.main' }} />}
            label={`Live · Updated ${lastUpdated ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '...'}`}
            variant="outlined"
            size="small"
          />
          <Tooltip title="Refresh now">
            <IconButton onClick={loadToday} disabled={loading}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AccessTimeFilled />}
            onClick={() => navigate('/attendance/checkin')}
          >
            Check In / Out
          </Button>
        </Box>
      </Box>

      {/* Live clock */}
      <Card elevation={3} sx={{ mb: 3, background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', color: 'white' }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <Box display="flex" alignItems="center" gap={2}>
                <AccessTimeFilled sx={{ fontSize: 48 }} />
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
                    {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {now.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{present.length}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Present Today</Typography>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{checkedInNow.length}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>In Office Now</Typography>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{hoursLabel(totalWorkedToday)}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Hours</Typography>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{hoursLabel(totalOvertime)}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Overtime</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Stat cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={6} md={3}>
          <StatCard title="Present" value={present.length} sub="marked present today" icon={<CheckCircle />} color="#2e7d32" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard title="In Office Now" value={checkedInNow.length} sub="currently checked in" icon={<People />} color="#1976d2" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard title="Absent" value={absent} sub="no show today" icon={<EventBusy />} color="#d32f2f" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard title="On Leave" value={onLeave + halfDay} sub={`${halfDay} half day`} icon={<Schedule />} color="#ed6c02" />
        </Grid>
      </Grid>

      {/* Live table */}
      <Paper elevation={3}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell>Employee</TableCell>
                <TableCell>Check In</TableCell>
                <TableCell>Hours</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Shift</TableCell>
                <TableCell>Location</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">Loading live attendance...</TableCell>
                </TableRow>
              ) : records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No attendance recorded today yet.
                  </TableCell>
                </TableRow>
              ) : (
                records.map((record) => {
                  const emp = record.employee;
                  const isLive = record.checkIn && !record.checkOut;
                  const hours = isLive ? (record.currentHours || 0) : (record.workHours || 0);
                  const pct = record.shift?.endTime
                    ? Math.min(100, (hours / 9) * 100)
                    : 0;
                  return (
                    <TableRow key={record._id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.9rem' }}>
                            {emp?.personalInfo?.firstName?.[0] || '?'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {emp?.personalInfo?.firstName} {emp?.personalInfo?.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {emp?.employeeId}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {record.checkIn ? (
                          <Box>
                            <Typography variant="body2">{fmtTime(record.checkIn)}</Typography>
                            {isLive && (
                              <Typography variant="caption" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <FiberManualRecord sx={{ fontSize: 10 }} /> working now
                              </Typography>
                            )}
                          </Box>
                        ) : '—'}
                      </TableCell>
                      <TableCell>
                        {record.checkIn ? (
                          <Box width={100}>
                            <Typography variant="body2">{hoursLabel(hours)}</Typography>
                            <LinearProgress
                              variant="determinate"
                              value={pct}
                              color={pct >= 100 ? 'success' : 'primary'}
                              sx={{ height: 4, borderRadius: 2 }}
                            />
                          </Box>
                        ) : '—'}
                      </TableCell>
                      <TableCell>
                        <Chip label={record.status} color={statusColor(record.status)} size="small" />
                      </TableCell>
                      <TableCell>{record.shift?.shiftName || '—'}</TableCell>
                      <TableCell>
                        {record.checkInLocation?.address || (record.checkInLocation?.latitude ? 'GPS ✓' : '—')}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
