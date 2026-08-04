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
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Snackbar,
  Alert,
  Chip
} from '@mui/material';
import { Add, Edit, Delete, Schedule } from '@mui/icons-material';
import { attendanceAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import AttendanceTabs from './AttendanceTabs';

const emptyForm = { shiftName: '', startTime: '', endTime: '', breakDuration: 60 };

export default function ShiftList() {
  const { user } = useAuth();
  const isAdmin = ['Admin', 'HR'].includes(user?.role);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentShift, setCurrentShift] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const loadShifts = useCallback(async () => {
    try {
      const response = await attendanceAPI.getShifts();
      setShifts(response.data.shifts || []);
    } catch (error) {
      console.error('Error loading shifts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadShifts();
  }, [loadShifts]);

  const handleOpenDialog = (shift = null) => {
    if (shift) {
      setEditMode(true);
      setCurrentShift(shift);
      setFormData({
        shiftName: shift.shiftName,
        startTime: shift.startTime,
        endTime: shift.endTime,
        breakDuration: shift.breakDuration || 60
      });
    } else {
      setEditMode(false);
      setCurrentShift(null);
      setFormData(emptyForm);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData(emptyForm);
  };

  const handleSubmit = async () => {
    try {
      const data = { ...formData, breakDuration: Number(formData.breakDuration) || 0 };
      if (editMode) {
        await attendanceAPI.updateShift(currentShift._id, data);
        showSnackbar('Shift updated successfully!', 'success');
      } else {
        await attendanceAPI.createShift(data);
        showSnackbar('Shift created successfully!', 'success');
      }
      handleCloseDialog();
      loadShifts();
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Failed to save shift', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this shift?')) {
      try {
        await attendanceAPI.deleteShift(id);
        showSnackbar('Shift deleted successfully!', 'success');
        loadShifts();
      } catch (error) {
        showSnackbar('Failed to delete shift', 'error');
      }
    }
  };

  const fmt12 = (t) => {
    if (!t) return '—';
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  return (
    <Box>
      <AttendanceTabs />
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Shifts</Typography>
        {isAdmin && (
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
            Add Shift
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Shift Name</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>End Time</TableCell>
              <TableCell>Break Duration</TableCell>
              <TableCell>Status</TableCell>
              {isAdmin && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 6 : 5} align="center">Loading...</TableCell>
              </TableRow>
            ) : shifts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 6 : 5} align="center">No shifts found</TableCell>
              </TableRow>
            ) : (
              shifts.map((shift) => (
                <TableRow key={shift._id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Schedule color="primary" fontSize="small" />
                      {shift.shiftName}
                    </Box>
                  </TableCell>
                  <TableCell>{fmt12(shift.startTime)}</TableCell>
                  <TableCell>{fmt12(shift.endTime)}</TableCell>
                  <TableCell>{shift.breakDuration} min</TableCell>
                  <TableCell>
                    <Chip label={shift.isActive ? 'Active' : 'Inactive'} color={shift.isActive ? 'success' : 'default'} size="small" />
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      <IconButton size="small" onClick={() => handleOpenDialog(shift)}>
                        <Edit />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(shift._id)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Shift' : 'Add Shift'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 2 }}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Shift Name"
                value={formData.shiftName}
                onChange={(e) => setFormData({ ...formData, shiftName: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                required
                fullWidth
                type="time"
                label="Start Time"
                InputLabelProps={{ shrink: true }}
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                required
                fullWidth
                type="time"
                label="End Time"
                InputLabelProps={{ shrink: true }}
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Break Duration (minutes)"
                value={formData.breakDuration}
                onChange={(e) => setFormData({ ...formData, breakDuration: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.shiftName || !formData.startTime || !formData.endTime}
          >
            {editMode ? 'Update' : 'Create'}
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
