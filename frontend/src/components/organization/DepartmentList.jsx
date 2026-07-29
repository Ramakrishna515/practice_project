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
  Snackbar,
  Alert
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { organizationAPI } from '../../services/api';

export default function DepartmentList() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentDept, setCurrentDept] = useState(null);
  const [formData, setFormData] = useState({
    departmentName: '',
    departmentCode: '',
    description: '',
    headOfDepartment: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const response = await organizationAPI.getDepartments();
      setDepartments(response.data.departments);
    } catch (error) {
      console.error('Error loading departments:', error);
      showSnackbar('Failed to load departments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenDialog = (dept = null) => {
    if (dept) {
      setEditMode(true);
      setCurrentDept(dept);
      setFormData({
        departmentName: dept.departmentName,
        departmentCode: dept.departmentCode,
        description: dept.description || '',
        headOfDepartment: dept.headOfDepartment || ''
      });
    } else {
      setEditMode(false);
      setCurrentDept(null);
      setFormData({
        departmentName: '',
        departmentCode: '',
        description: '',
        headOfDepartment: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      departmentName: '',
      departmentCode: '',
      description: '',
      headOfDepartment: ''
    });
  };

  const handleSubmit = async () => {
    try {
      // Clean form data - remove empty strings
      const cleanedData = { ...formData };
      if (!cleanedData.headOfDepartment || cleanedData.headOfDepartment === '') {
        delete cleanedData.headOfDepartment;
      }
      if (!cleanedData.description || cleanedData.description === '') {
        delete cleanedData.description;
      }

      if (editMode) {
        await organizationAPI.updateDepartment(currentDept._id, cleanedData);
        showSnackbar('Department updated successfully!', 'success');
      } else {
        await organizationAPI.createDepartment(cleanedData);
        showSnackbar('Department created successfully!', 'success');
      }
      handleCloseDialog();
      loadDepartments();
    } catch (error) {
      console.error('Error saving department:', error);
      showSnackbar(error.response?.data?.message || 'Failed to save department', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await organizationAPI.deleteDepartment(id);
        showSnackbar('Department deleted successfully!', 'success');
        loadDepartments();
      } catch (error) {
        console.error('Error deleting department:', error);
        showSnackbar('Failed to delete department', 'error');
      }
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Departments</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Department
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Department Code</TableCell>
              <TableCell>Department Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Head of Department</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : departments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No departments found. Click "Add Department" to create one.
                </TableCell>
              </TableRow>
            ) : (
              departments.map((dept) => (
                <TableRow key={dept._id}>
                  <TableCell>{dept.departmentCode}</TableCell>
                  <TableCell>{dept.departmentName}</TableCell>
                  <TableCell>{dept.description || 'N/A'}</TableCell>
                  <TableCell>{dept.headOfDepartment || 'N/A'}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(dept)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(dept._id)}
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
        <DialogTitle>{editMode ? 'Edit Department' : 'Add Department'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              required
              fullWidth
              label="Department Name"
              value={formData.departmentName}
              onChange={(e) => setFormData({ ...formData, departmentName: e.target.value })}
            />
            <TextField
              required
              fullWidth
              label="Department Code"
              value={formData.departmentCode}
              onChange={(e) => setFormData({ ...formData, departmentCode: e.target.value })}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <TextField
              fullWidth
              label="Head of Department"
              value={formData.headOfDepartment}
              onChange={(e) => setFormData({ ...formData, headOfDepartment: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.departmentName || !formData.departmentCode}
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
