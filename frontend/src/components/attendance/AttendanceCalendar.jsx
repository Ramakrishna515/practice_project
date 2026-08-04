import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Divider
} from '@mui/material';
import { ChevronLeft, ChevronRight, Today } from '@mui/icons-material';
import { Button } from '@mui/material';
import { attendanceAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import AttendanceTabs from './AttendanceTabs';

export default function AttendanceCalendar() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const loadAttendance = useCallback(async () => {
    try {
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString().split('T')[0];
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).toISOString().split('T')[0];
      const params = { startDate, endDate };
      if (user?.employee?._id) params.employee = user.employee._id;
      const response = await attendanceAPI.getAll({ ...params, limit: 50 });
      setAttendance(response.data.attendanceRecords || []);
    } catch (error) {
      console.error('Error loading attendance:', error);
    }
  }, [currentMonth, user]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const changeMonth = (delta) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + delta, 1));
  };

  const goToday = () => {
    const d = new Date();
    setCurrentMonth(new Date(d.getFullYear(), d.getMonth(), 1));
  };

  const getDaysInMonth = () => {
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  };

  const getAttendanceForDay = (day) => {
    if (!day) return null;
    const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toISOString().split('T')[0];
    return attendance.find(a => a.date?.split('T')[0] === dateStr);
  };

  const days = getDaysInMonth();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const present = attendance.filter(a => a.status === 'Present').length;
  const absent = attendance.filter(a => a.status === 'Absent').length;
  const leave = attendance.filter(a => a.status === 'Leave').length;
  const halfDay = attendance.filter(a => a.status === 'Half Day').length;

  return (
    <Box>
      <AttendanceTabs />
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="h4">Attendance Calendar</Typography>
      </Box>

      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton onClick={() => changeMonth(-1)}>
            <ChevronLeft />
          </IconButton>
          <Typography variant="h6" sx={{ minWidth: 180, textAlign: 'center' }}>
            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </Typography>
          <IconButton onClick={() => changeMonth(1)}>
            <ChevronRight />
          </IconButton>
        </Box>
        <Button variant="outlined" startIcon={<Today />} onClick={goToday} size="small">
          Today
        </Button>
      </Box>

      {/* Legend / summary */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Typography variant="body2" color="text.secondary">Present</Typography>
            <Typography variant="h6" color="success.main">{present}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="body2" color="text.secondary">Absent</Typography>
            <Typography variant="h6" color="error.main">{absent}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="body2" color="text.secondary">Leave</Typography>
            <Typography variant="h6" color="info.main">{leave}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="body2" color="text.secondary">Half Day</Typography>
            <Typography variant="h6" color="warning.main">{halfDay}</Typography>
          </Grid>
        </Grid>
        <Divider sx={{ my: 1 }} />
        <Box display="flex" gap={2} flexWrap="wrap">
          <Chip size="small" sx={{ bgcolor: '#e8f5e9' }} label="Present" />
          <Chip size="small" sx={{ bgcolor: '#ffebee' }} label="Absent" />
          <Chip size="small" sx={{ bgcolor: '#e3f2fd' }} label="Leave" />
          <Chip size="small" sx={{ bgcolor: '#fff3e0' }} label="Half Day" />
        </Box>
      </Paper>

      <Paper elevation={3} sx={{ p: 2 }}>
        <Grid container spacing={1}>
          {weekDays.map((day) => (
            <Grid item xs={12 / 7} key={day}>
              <Box textAlign="center" fontWeight="bold" py={1} color="text.secondary">
                {day}
              </Box>
            </Grid>
          ))}
          {days.map((day, index) => {
            const att = getAttendanceForDay(day);
            const bg = !day ? 'transparent'
              : att?.status === 'Present' ? '#e8f5e9'
              : att?.status === 'Half Day' ? '#fff3e0'
              : att?.status === 'Leave' ? '#e3f2fd'
              : att ? '#ffebee' : 'white';
            return (
              <Grid item xs={12 / 7} key={index}>
                <Card
                  variant="outlined"
                  sx={{
                    minHeight: 80,
                    bgcolor: bg,
                    border: !day ? 'none' : undefined,
                    transition: 'transform 0.1s',
                    '&:hover': { transform: day ? 'scale(1.03)' : undefined }
                  }}
                >
                  <CardContent sx={{ p: 1 }}>
                    {day ? (
                      <>
                        <Typography variant="body2" fontWeight="bold">
                          {day}
                        </Typography>
                        {att ? (
                          <Box mt={0.5}>
                            <Chip
                              label={att.status}
                              size="small"
                              sx={{ fontSize: '0.65rem', height: 20 }}
                              color={
                                att.status === 'Present' ? 'success'
                                : att.status === 'Half Day' ? 'warning'
                                : att.status === 'Leave' ? 'info'
                                : 'error'
                              }
                            />
                            {att.checkIn && (
                              <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                                {new Date(att.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </Typography>
                            )}
                          </Box>
                        ) : (
                          <Typography variant="caption" color="text.disabled">—</Typography>
                        )}
                      </>
                    ) : null}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Paper>
    </Box>
  );
}
