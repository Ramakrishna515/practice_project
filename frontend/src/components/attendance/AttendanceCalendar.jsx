import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import { attendanceAPI } from '../../services/api';

export default function AttendanceCalendar() {
  const [attendance, setAttendance] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    loadAttendance();
  }, [currentMonth]);

  const loadAttendance = async () => {
    try {
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
        .toISOString().split('T')[0];
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
        .toISOString().split('T')[0];
      
      const response = await attendanceAPI.getAttendance({ startDate, endDate });
      setAttendance(response.data.attendance || []);
    } catch (error) {
      console.error('Error loading attendance:', error);
    }
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const getAttendanceForDay = (day) => {
    if (!day) return null;
    const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      .toISOString().split('T')[0];
    return attendance.find(a => a.date?.split('T')[0] === dateStr);
  };

  const days = getDaysInMonth();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Attendance Calendar
      </Typography>
      <Typography variant="h6" gutterBottom>
        {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
      </Typography>

      <Paper elevation={3} sx={{ p: 2 }}>
        <Grid container spacing={1}>
          {weekDays.map((day) => (
            <Grid item xs={12 / 7} key={day}>
              <Box textAlign="center" fontWeight="bold" py={1}>
                {day}
              </Box>
            </Grid>
          ))}
          {days.map((day, index) => {
            const att = getAttendanceForDay(day);
            return (
              <Grid item xs={12 / 7} key={index}>
                <Card
                  variant="outlined"
                  sx={{
                    minHeight: 80,
                    bgcolor: !day ? 'transparent' : att?.status === 'Present' ? '#e8f5e9' : att ? '#ffebee' : 'white',
                    border: !day ? 'none' : undefined
                  }}
                >
                  {day && (
                    <CardContent sx={{ p: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        {day}
                      </Typography>
                      {att && (
                        <Chip
                          label={att.status}
                          size="small"
                          color={att.status === 'Present' ? 'success' : 'error'}
                          sx={{ mt: 1, fontSize: '0.7rem' }}
                        />
                      )}
                    </CardContent>
                  )}
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Paper>
    </Box>
  );
}
