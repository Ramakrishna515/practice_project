import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  People,
  Business,
  EventNote,
  AccountBalance,
  TrendingUp
} from '@mui/icons-material';
import { dashboardAPI, employeeAPI, leaveAPI, attendanceAPI } from '../../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalDepartments: 0,
    pendingLeaves: 0,
    activeEmployees: 0
  });
  const [recentEmployees, setRecentEmployees] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load data with error handling for each API
      let employees = [];
      let leaves = [];
      let attendance = [];

      try {
        const employeesRes = await employeeAPI.getAll({ limit: 100 });
        employees = employeesRes.data.employees || [];
      } catch (error) {
        console.error('Error loading employees:', error);
      }

      try {
        const leavesRes = await leaveAPI.getMyLeaves();
        leaves = leavesRes.data.leaves || [];
      } catch (error) {
        console.error('Error loading leaves:', error);
      }

      try {
        const attendanceRes = await attendanceAPI.getAttendance({});
        attendance = attendanceRes.data.attendance || [];
      } catch (error) {
        console.error('Error loading attendance:', error);
      }

      setStats({
        totalEmployees: employees.length,
        totalDepartments: new Set(employees.map(e => e.employmentInfo?.department?._id)).size,
        pendingLeaves: leaves.filter(l => l.status === 'Pending').length,
        activeEmployees: employees.filter(e => e.employmentInfo?.employmentStatus === 'Active').length
      });

      setRecentEmployees(employees.slice(0, 5));
      setTodayAttendance(attendance.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <Card elevation={3}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography color="text.secondary" variant="subtitle2">
              {title}
            </Typography>
            <Typography variant="h4" sx={{ mt: 1 }}>
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: color,
              borderRadius: '50%',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Total Employees"
            value={stats.totalEmployees}
            icon={<People sx={{ color: 'white' }} />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Departments"
            value={stats.totalDepartments}
            icon={<Business sx={{ color: 'white' }} />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Pending Leaves"
            value={stats.pendingLeaves}
            icon={<EventNote sx={{ color: 'white' }} />}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Active Employees"
            value={stats.activeEmployees}
            icon={<TrendingUp sx={{ color: 'white' }} />}
            color="#9c27b0"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Employees
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Employee ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Department</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentEmployees.map((emp) => (
                    <TableRow key={emp._id}>
                      <TableCell>{emp.employeeId}</TableCell>
                      <TableCell>
                        {emp.personalInfo?.firstName} {emp.personalInfo?.lastName}
                      </TableCell>
                      <TableCell>{emp.employmentInfo?.department?.departmentName || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Attendance
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Check In</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {todayAttendance.map((att) => (
                    <TableRow key={att._id}>
                      <TableCell>{new Date(att.date).toLocaleDateString()}</TableCell>
                      <TableCell>{att.checkIn ? new Date(att.checkIn).toLocaleTimeString() : 'N/A'}</TableCell>
                      <TableCell>{att.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
