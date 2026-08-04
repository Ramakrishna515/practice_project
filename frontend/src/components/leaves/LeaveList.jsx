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
  Button,
  Chip
} from '@mui/material';
import { Add, CheckCircleOutline } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { leaveAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function LeaveList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const canApprove = ['Admin', 'HR', 'Manager'].includes(user?.role);

  useEffect(() => {
    loadLeaves();
  }, []);

  const loadLeaves = async () => {
    try {
      const response = await leaveAPI.getMyLeaves();
      setLeaves(response.data.leaves || []);
    } catch (error) {
      console.error('Error loading leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Approved': return 'success';
      case 'Rejected': return 'error';
      case 'Pending': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">My Leave Applications</Typography>
        <Box display="flex" gap={2}>
          {canApprove && (
            <Button
              variant="outlined"
              startIcon={<CheckCircleOutline />}
              onClick={() => navigate('/leaves/approvals')}
            >
              Approve Leaves
            </Button>
          )}
          <Button
            variant="outlined"
            onClick={() => navigate('/leaves/types')}
          >
            Manage Leave Types
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/leaves/apply')}
          >
            Apply for Leave
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee</TableCell>
              <TableCell>Leave Type</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Days</TableCell>
              <TableCell>Reporting Manager</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">Loading...</TableCell>
              </TableRow>
            ) : leaves.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No leave applications found. Click "Apply for Leave" to create one.
                </TableCell>
              </TableRow>
            ) : (
              leaves.map((leave) => (
                <TableRow key={leave._id}>
                  <TableCell>
                    {leave.employee?.personalInfo
                      ? `${leave.employee.personalInfo.firstName} ${leave.employee.personalInfo.lastName} (${leave.employee.employeeId})`
                      : 'N/A'}
                  </TableCell>
                  <TableCell>{leave.leaveType?.leaveTypeName || 'N/A'}</TableCell>
                  <TableCell>{new Date(leave.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(leave.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>{leave.numberOfDays}</TableCell>
                  <TableCell>
                    {leave.reportingManager
                      ? `${leave.reportingManager.personalInfo?.firstName} ${leave.reportingManager.personalInfo?.lastName}`
                      : '—'}
                  </TableCell>
                  <TableCell>{leave.reason}</TableCell>
                  <TableCell>
                    <Chip
                      label={leave.status}
                      color={getStatusColor(leave.status)}
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
