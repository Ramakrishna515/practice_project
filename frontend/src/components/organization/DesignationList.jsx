import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Snackbar,
  Alert
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { organizationAPI } from '../../services/api';

export default function DesignationList() {
  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentDesig, setCurrentDesig] = useState(null);
  const [formData, setFormData] = useState({
    designationName: '',
    designationCode: '',
    department: '',
    level: '',
    description: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    loadDesignations();
    loadDepartments();
  }, []);

  const loadDesignations = async () => {
    try {
      const response = await organizationAPI.getDesignations();
      setDesignations(response.data.designations);
    } catch (error) {
      console.error('Error loading designations:', error);
      showSnackbar('Failed to load designations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await organizationAPI.getDepartments();
      setDepartments(response.data.departments);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenDialog = (desig = null) => {
    if (desig) {
      setEditMode(true);
      setCurrentDesig(desig);
      setFormData({
        designationName: desig.designationName,
        designationCode: desig.designationCode,
        department: desig.department?._id || '',
        level: desig.level || '',
        description: desig.description || ''
      });
    } else {
      setEditMode(false);
      setCurrentDesig(null);
      setFormData({
        designationName: '',
        designationCode: '',
        department: '',
        level: '',
        description: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      designationName: '',
      designationCode: '',
      department: '',
      level: '',
      description: ''
    });
  };

  const handleSubmit = async () => {
    try {
      // Clean form data - remove empty strings for ObjectId fields
      const cleanedData = { ...formData };
      if (!cleanedData.department || cleanedData.department === '') {
        delete cleanedData.department;
      }
      if (!cleanedData.description || cleanedData.description === '') {
        delete cleanedData.description;
      }
      if (!cleanedData.level || cleanedData.level === '') {
        delete cleanedData.level;
      }

      if (editMode) {
        await organizationAPI.updateDesignation(currentDesig._id, cleanedData);
        showSnackbar('Designation updated successfully!', 'success');
      } else {
        await organizationAPI.createDesignation(cleanedData);
        showSnackbar('Designation created successfully!', 'success');
      }
      handleCloseDialog();
      loadDesignations();
    } catch (error) {
      console.error('Error saving designation:', error);
      showSnackbar(error.response?.data?.message || 'Failed to save designation', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this designation?')) {
      try {
        await organizationAPI.deleteDesignation(id);
        showSnackbar('Designation deleted successfully!', 'success');
        loadDesignations();
      } catch (error) {
        console.error('Error deleting designation:', error);
        showSnackbar('Failed to delete designation', 'error');
      }
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Designations</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Designation
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Designation Name</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Level</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : designations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No designations found. Click "Add Designation" to create one.
                </TableCell>
              </TableRow>
            ) : (
              designations.map((desig) => (
                <TableRow key={desig._id}>
                  <TableCell>{desig.designationCode}</TableCell>
                  <TableCell>{desig.designationName}</TableCell>
                  <TableCell>{desig.department?.departmentName || 'N/A'}</TableCell>
                  <TableCell>{desig.level || 'N/A'}</TableCell>
                  <TableCell>{desig.description || 'N/A'}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(desig)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(desig._id)}
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
        <DialogTitle>{editMode ? 'Edit Designation' : 'Add Designation'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              required
              fullWidth
              label="Designation Name"
              value={formData.designationName}
              onChange={(e) => setFormData({ ...formData, designationName: e.target.value })}
            />
            <TextField
              required
              fullWidth
              label="Designation Code"
              value={formData.designationCode}
              onChange={(e) => setFormData({ ...formData, designationCode: e.target.value })}
            />
            <TextField
              select
              fullWidth
              label="Department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            >
              <MenuItem value="">Select Department</MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept._id} value={dept._id}>
                  {dept.departmentName}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Level (e.g., Junior, Senior, Lead)"
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value })}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.designationName || !formData.designationCode}
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
