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
  Grid,
  Snackbar,
  Alert
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { payrollAPI } from '../../services/api';

export default function SalaryStructureList() {
  const [structures, setStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    structureName: '',
    basicSalary: '',
    hra: '',
    da: '',
    ta: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadStructures();
  }, []);

  const loadStructures = async () => {
    try {
      const response = await payrollAPI.getSalaryStructures();
      setStructures(response.data.structures || []);
    } catch (error) {
      console.error('Error loading structures:', error);
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSubmit = async () => {
    try {
      await payrollAPI.createSalaryStructure(formData);
      showSnackbar('Salary structure created successfully!', 'success');
      setOpenDialog(false);
      loadStructures();
    } catch (error) {
      showSnackbar('Failed to create salary structure', 'error');
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Salary Structures</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
        >
          Add Structure
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Structure Name</TableCell>
              <TableCell>Basic Salary</TableCell>
              <TableCell>HRA</TableCell>
              <TableCell>DA</TableCell>
              <TableCell>TA</TableCell>
              <TableCell>Total CTC</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">Loading...</TableCell>
              </TableRow>
            ) : structures.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No salary structures found
                </TableCell>
              </TableRow>
            ) : (
              structures.map((structure) => (
                <TableRow key={structure._id}>
                  <TableCell>{structure.structureName}</TableCell>
                  <TableCell>₹{structure.basicSalary?.toLocaleString()}</TableCell>
                  <TableCell>₹{structure.hra?.toLocaleString()}</TableCell>
                  <TableCell>₹{structure.da?.toLocaleString()}</TableCell>
                  <TableCell>₹{structure.ta?.toLocaleString()}</TableCell>
                  <TableCell>₹{structure.totalCTC?.toLocaleString()}</TableCell>
                  <TableCell>
                    <IconButton size="small">
                      <Edit />
                    </IconButton>
                    <IconButton size="small" color="error">
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Salary Structure</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Structure Name"
                value={formData.structureName}
                onChange={(e) => setFormData({ ...formData, structureName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Basic Salary"
                value={formData.basicSalary}
                onChange={(e) => setFormData({ ...formData, basicSalary: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="HRA"
                value={formData.hra}
                onChange={(e) => setFormData({ ...formData, hra: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="DA (Dearness Allowance)"
                value={formData.da}
                onChange={(e) => setFormData({ ...formData, da: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="TA (Travel Allowance)"
                value={formData.ta}
                onChange={(e) => setFormData({ ...formData, ta: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">Create</Button>
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
