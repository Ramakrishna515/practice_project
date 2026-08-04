import React, { useState } from 'react';
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
  Button,
  MenuItem,
  Grid,
  Chip,
  Card,
  CardContent,
  Alert
} from '@mui/material';
import { attendanceAPI } from '../../services/api';
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

const months = [
  { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
  { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
  { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
  { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' }
];

export default function AttendanceReport() {
  const now = new Date();
  const [filters, setFilters] = useState({ month: now.getMonth() + 1, year: now.getFullYear() });
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const loadReport = async () => {
    try {
      setLoading(true);
      const response = await attendanceAPI.getReport({ month: filters.month, year: filters.year });
      setRecords(response.data.attendanceRecords || []);
      setSearched(true);
    } catch (error) {
      console.error('Error loading report:', error);
    } finally {
      setLoading(false);
    }
  };

  const byEmployee = records.reduce((acc, r) => {
    const id = r.employee?._id || 'unknown';
    if (!acc[id]) {
      acc[id] = {
        employee: r.employee,
        present: 0, absent: 0, leave: 0, halfDay: 0, hours: 0, overtime: 0
      };
    }
    const row = acc[id];
    if (r.status === 'Present') row.present++;
    else if (r.status === 'Absent') row.absent++;
    else if (r.status === 'Leave') row.leave++;
    else if (r.status === 'Half Day') row.halfDay++;
    row.hours += r.workHours || 0;
    row.overtime += r.overtimeHours || 0;
    return acc;
  }, {});

  const summaryRows = Object.values(byEmployee);

  return (
    <Box>
      <AttendanceTabs />
      <Typography variant="h4" gutterBottom>
        Attendance Report
      </Typography>

      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={6} md={3}>
            <TextField
              select
              fullWidth
              label="Month"
              value={filters.month}
              onChange={(e) => setFilters({ ...filters, month: e.target.value })}
              size="small"
            >
              {months.map(m => (
                <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField
              fullWidth
              type="number"
              label="Year"
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: e.target.value })}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box display="flex" gap={1}>
              <Button variant="contained" onClick={loadReport} disabled={loading}>
                {loading ? 'Loading...' : 'Generate Report'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {!searched && !loading && (
        <Alert severity="info">Select a month and year, then click "Generate Report".</Alert>
      )}

      {searched && !loading && (
        <>
          <Grid container spacing={2} mb={3}>
            <Grid item xs={6} md={3}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">Total Records</Typography>
                  <Typography variant="h5">{records.length}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">Present</Typography>
                  <Typography variant="h5" color="success.main">
                    {records.filter(r => r.status === 'Present').length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">Absent</Typography>
                  <Typography variant="h5" color="error.main">
                    {records.filter(r => r.status === 'Absent').length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">Total Hours</Typography>
                  <Typography variant="h5">
                    {Math.round(records.reduce((s, r) => s + (r.workHours || 0), 0))}h
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Typography variant="h6" gutterBottom>
            Employee Summary
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell>Employee</TableCell>
                  <TableCell align="center">Present</TableCell>
                  <TableCell align="center">Absent</TableCell>
                  <TableCell align="center">Leave</TableCell>
                  <TableCell align="center">Half Day</TableCell>
                  <TableCell align="center">Hours</TableCell>
                  <TableCell align="center">Overtime</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {summaryRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">No records for this period</TableCell>
                  </TableRow>
                ) : summaryRows.map((row) => (
                  <TableRow key={row.employee?._id} hover>
                    <TableCell>
                      {row.employee
                        ? `${row.employee.personalInfo?.firstName} ${row.employee.personalInfo?.lastName} (${row.employee.employeeId})`
                        : 'N/A'}
                    </TableCell>
                    <TableCell align="center">{row.present}</TableCell>
                    <TableCell align="center">{row.absent}</TableCell>
                    <TableCell align="center">{row.leave}</TableCell>
                    <TableCell align="center">{row.halfDay}</TableCell>
                    <TableCell align="center">{Math.round(row.hours)}h</TableCell>
                    <TableCell align="center">{Math.round(row.overtime)}h</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="h6" gutterBottom>
            Detailed Records
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell>Date</TableCell>
                  <TableCell>Employee</TableCell>
                  <TableCell>Check In</TableCell>
                  <TableCell>Check Out</TableCell>
                  <TableCell>Hours</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {records.map((r) => (
                  <TableRow key={r._id} hover>
                    <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {r.employee
                        ? `${r.employee.personalInfo?.firstName} ${r.employee.personalInfo?.lastName}`
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {r.checkIn ? new Date(r.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </TableCell>
                    <TableCell>
                      {r.checkOut ? new Date(r.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </TableCell>
                    <TableCell>{r.workHours ? `${Math.round(r.workHours * 10) / 10}h` : '—'}</TableCell>
                    <TableCell>
                      <Chip label={r.status} color={statusColor(r.status)} size="small" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
}
