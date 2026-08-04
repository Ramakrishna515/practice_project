import React, { useState, useEffect, useCallback } from 'react';
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
  Button,
  MenuItem,
  Grid,
  TablePagination
} from '@mui/material';
import { attendanceAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import AttendanceTabs from './AttendanceTabs';

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

export default function AttendanceList() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    employee: user?.employee?._id || '',
    date: '',
    status: ''
  });

  const loadAttendance = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page: page + 1, limit: rowsPerPage };
      if (filters.employee) params.employee = filters.employee;
      if (filters.date) params.date = filters.date;
      if (filters.status) params.status = filters.status;

      const response = await attendanceAPI.getAll(params);
      setAttendance(response.data.attendanceRecords || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error('Error loading attendance:', error);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, filters]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const handleFilter = () => {
    setPage(0);
    loadAttendance();
  };

  const handleClear = () => {
    setFilters({ employee: '', date: '', status: '' });
    setPage(0);
  };

  const formatTime = (date) => date ? new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
  const hoursLabel = (h) => {
    if (!h) return '0h';
    return `${Math.floor(h)}h ${Math.round((h - Math.floor(h)) * 60)}m`;
  };

  return (
    <Box>
      <AttendanceTabs />
      <Typography variant="h4" gutterBottom>
        Attendance Records
      </Typography>

      {/* Filters */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Status"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              size="small"
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="Present">Present</MenuItem>
              <MenuItem value="Absent">Absent</MenuItem>
              <MenuItem value="Half Day">Half Day</MenuItem>
              <MenuItem value="Leave">Leave</MenuItem>
              <MenuItem value="Holiday">Holiday</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box display="flex" gap={1}>
              <Button variant="contained" onClick={handleFilter}>Apply Filters</Button>
              <Button variant="outlined" onClick={handleClear}>Clear</Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Check In</TableCell>
              <TableCell>Check Out</TableCell>
              <TableCell>Hours</TableCell>
              <TableCell>Overtime</TableCell>
              <TableCell>Shift</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">Loading...</TableCell>
              </TableRow>
            ) : attendance.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">No attendance records found</TableCell>
              </TableRow>
            ) : (
              attendance.map((record) => (
                <TableRow key={record._id} hover>
                  <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                  <TableCell>{formatTime(record.checkIn)}</TableCell>
                  <TableCell>{formatTime(record.checkOut)}</TableCell>
                  <TableCell>{hoursLabel(record.workHours)}</TableCell>
                  <TableCell>
                    {record.overtimeHours > 0 ? (
                      <Chip label={hoursLabel(record.overtimeHours)} color="warning" size="small" />
                    ) : '—'}
                  </TableCell>
                  <TableCell>{record.shift?.shiftName || '—'}</TableCell>
                  <TableCell>
                    <Chip label={record.status} color={statusColor(record.status)} size="small" />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </TableContainer>
    </Box>
  );
}
