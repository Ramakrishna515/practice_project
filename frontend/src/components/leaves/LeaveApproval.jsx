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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert
} from '@mui/material';
import { leaveAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function LeaveApproval() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [action, setAction] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadPendingLeaves();
  }, []);

  const loadPendingLeaves = async () => {
    try {
      const response = await leaveAPI.getPendingLeaves();
      setLeaves(response.data.leaves || []);
    } catch (error) {
      console.error('Error loading leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const isReportingManager = (leave) =>
    !!user?.employee?._id &&
    !!leave.reportingManager?._id &&
    String(user.employee._id) === String(leave.reportingManager._id);

  const handleOpenDialog = (leave, actionType) => {
    setSelectedLeave(leave);
    setAction(actionType);
    setOpenDialog(true);
  };

  const handleApproveReject = async () => {
    try {
      if (action === 'approve') {
        await leaveAPI.approveLeave(selectedLeave._id, { remarks });
        showSnackbar('Leave approved successfully!', 'success');
      } else {
        await leaveAPI.rejectLeave(selectedLeave._id, { rejectionReason: remarks });
        showSnackbar('Leave rejected successfully!', 'success');
      }
      setOpenDialog(false);
      setRemarks('');
      loadPendingLeaves();
    } catch (error) {
      showSnackbar('Action failed', 'error');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Leave Approvals
      </Typography>

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
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center">Loading...</TableCell>
              </TableRow>
            ) : leaves.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  No pending leave approvals
                </TableCell>
              </TableRow>
            ) : (
              leaves.map((leave) => (
                <TableRow key={leave._id}>
                  <TableCell>
                    {leave.employee?.personalInfo?.firstName} {leave.employee?.personalInfo?.lastName}
                  </TableCell>
                  <TableCell>{leave.leaveType?.leaveTypeName}</TableCell>
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
                    <Chip label="Pending" color="warning" size="small" />
                  </TableCell>
                  <TableCell>
                    {isReportingManager(leave) ? (
                      <>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() => handleOpenDialog(leave, 'approve')}
                          sx={{ mr: 1 }}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={() => handleOpenDialog(leave, 'reject')}
                        >
                          Reject
                        </Button>
                      </>
                    ) : (
                      <Chip label="View only" size="small" variant="outlined" />
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {action === 'approve' ? 'Approve Leave' : 'Reject Leave'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Remarks (Optional)"
            multiline
            rows={4}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleApproveReject}
            variant="contained"
            color={action === 'approve' ? 'success' : 'error'}
          >
            {action === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>

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
