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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Chip
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { leaveAPI } from '../../services/api';

export default function LeaveTypeManagement() {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentLeaveType, setCurrentLeaveType] = useState(null);
  const [formData, setFormData] = useState({
    leaveName: '',
    leaveCode: '',
    totalDays: '',
    description: '',
    isPaid: true,
    carryForward: false
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    loadLeaveTypes();
  }, []);

  const loadLeaveTypes = async () => {
    try {
      const response = await leaveAPI.getLeaveTypes();
      setLeaveTypes(response.data.leaveTypes || []);
    } catch (error) {
      console.error('Error loading leave types:', error);
      showSnackbar('Failed to load leave types', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenDialog = (leaveType = null) => {
    if (leaveType) {
      setEditMode(true);
      setCurrentLeaveType(leaveType);
      setFormData({
        leaveName: leaveType.leaveName,
        leaveCode: leaveType.leaveCode,
        totalDays: leaveType.totalDays,
        description: leaveType.description || '',
        isPaid: leaveType.isPaid !== false,
        carryForward: leaveType.carryForward === true
      });
    } else {
      setEditMode(false);
      setCurrentLeaveType(null);
      setFormData({
        leaveName: '',
        leaveCode: '',
        totalDays: '',
        description: '',
        isPaid: true,
        carryForward: false
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      leaveName: '',
      leaveCode: '',
      totalDays: '',
      description: '',
      isPaid: true,
      carryForward: false
    });
  };

  const handleSubmit = async () => {
    try {
      if (editMode) {
        await leaveAPI.updateLeaveType(currentLeaveType._id, formData);
        showSnackbar('Leave type updated successfully!', 'success');
      } else {
        await leaveAPI.createLeaveType(formData);
        showSnackbar('Leave type created successfully!', 'success');
      }
      handleCloseDialog();
      loadLeaveTypes();
    } catch (error) {
      console.error('Error saving leave type:', error);
      showSnackbar(error.response?.data?.message || 'Failed to save leave type', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this leave type?')) {
      try {
        await leaveAPI.deleteLeaveType(id);
        showSnackbar('Leave type deleted successfully!', 'success');
        loadLeaveTypes();
      } catch (error) {
        console.error('Error deleting leave type:', error);
        showSnackbar('Failed to delete leave type', 'error');
      }
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Leave Type Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Leave Type
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Leave Code</TableCell>
              <TableCell>Leave Name</TableCell>
              <TableCell>Total Days</TableCell>
              <TableCell>Paid/Unpaid</TableCell>
              <TableCell>Carry Forward</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : leaveTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No leave types found. Click "Add Leave Type" to create one.
                </TableCell>
              </TableRow>
            ) : (
              leaveTypes.map((type) => (
                <TableRow key={type._id}>
                  <TableCell>{type.leaveCode}</TableCell>
                  <TableCell>{type.leaveName}</TableCell>
                  <TableCell>{type.totalDays} days</TableCell>
                  <TableCell>
                    <Chip
                      label={type.isPaid ? 'Paid' : 'Unpaid'}
                      color={type.isPaid ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={type.carryForward ? 'Yes' : 'No'}
                      color={type.carryForward ? 'primary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{type.description || 'N/A'}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(type)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(type._id)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Leave Type' : 'Add Leave Type'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              required
              fullWidth
              label="Leave Name"
              placeholder="e.g., Casual Leave, Sick Leave"
              value={formData.leaveName}
              onChange={(e) => setFormData({ ...formData, leaveName: e.target.value })}
            />
            <TextField
              required
              fullWidth
              label="Leave Code"
              placeholder="e.g., CL, SL, PL"
              value={formData.leaveCode}
              onChange={(e) => setFormData({ ...formData, leaveCode: e.target.value })}
            />
            <TextField
              required
              fullWidth
              type="number"
              label="Total Days Per Year"
              value={formData.totalDays}
              onChange={(e) => setFormData({ ...formData, totalDays: e.target.value })}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <Box display="flex" gap={2}>
              <TextField
                select
                fullWidth
                label="Type"
                value={formData.isPaid ? 'paid' : 'unpaid'}
                onChange={(e) => setFormData({ ...formData, isPaid: e.target.value === 'paid' })}
                SelectProps={{ native: true }}
              >
                <option value="paid">Paid Leave</option>
                <option value="unpaid">Unpaid Leave</option>
              </TextField>
              <TextField
                select
                fullWidth
                label="Carry Forward"
                value={formData.carryForward ? 'yes' : 'no'}
                onChange={(e) => setFormData({ ...formData, carryForward: e.target.value === 'yes' })}
                SelectProps={{ native: true }}
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </TextField>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.leaveName || !formData.leaveCode || !formData.totalDays}
          >
            {editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
