import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  Chip,
  Button
} from '@mui/material';
import { attendanceAPI } from '../../services/api';

export default function AttendanceList() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadAttendance();
  }, [startDate, endDate]);

  const loadAttendance = async () => {
    try {
      const response = await attendanceAPI.getAttendance({ startDate, endDate });
      setAttendance(response.data.attendance || []);
    } catch (error) {
      console.error('Error loading attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    return date ? new Date(date).toLocaleString() : 'N/A';
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Attendance Records
      </Typography>

      <Box display="flex" gap={2} mb={3}>
        <TextField
          type="date"
          label="Start Date"
          InputLabelProps={{ shrink: true }}
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <TextField
          type="date"
          label="End Date"
          InputLabelProps={{ shrink: true }}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <Button variant="outlined" onClick={loadAttendance}>
          Filter
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Check In</TableCell>
              <TableCell>Check Out</TableCell>
              <TableCell>Hours Worked</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">Loading...</TableCell>
              </TableRow>
            ) : attendance.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">No attendance records found</TableCell>
              </TableRow>
            ) : (
              attendance.map((record) => (
                <TableRow key={record._id}>
                  <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                  <TableCell>{formatTime(record.checkIn)}</TableCell>
                  <TableCell>{formatTime(record.checkOut)}</TableCell>
                  <TableCell>{record.totalHours || 0} hrs</TableCell>
                  <TableCell>
                    <Chip
                      label={record.status}
                      color={record.status === 'Present' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
