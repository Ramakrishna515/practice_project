import React, { useEffect, useState } from 'react';
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
  TextField,
  IconButton
} from '@mui/material';
import { Add, Edit, Visibility, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { employeeAPI } from '../../services/api';

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadEmployees();
  }, [search]);

  const loadEmployees = async () => {
    try {
      const response = await employeeAPI.getAll({ search, limit: 100 });
      setEmployees(response.data.employees);
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await employeeAPI.delete(id);
        loadEmployees();
      } catch (error) {
        console.error('Error deleting employee:', error);
      }
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Employees</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/employees/new')}
        >
          Add Employee
        </Button>
      </Box>

      <Box mb={2}>
        <TextField
          fullWidth
          label="Search employees"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, employee ID, email..."
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Designation</TableCell>
              <TableCell>Status</TableCell>
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
            ) : employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No employees found
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
                <TableRow key={employee._id}>
                  <TableCell>{employee.employeeId}</TableCell>
                  <TableCell>
                    {employee.personalInfo.firstName} {employee.personalInfo.lastName}
                  </TableCell>
                  <TableCell>{employee.contactInfo.email}</TableCell>
                  <TableCell>
                    {employee.employmentInfo.department?.departmentName || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {employee.employmentInfo.designation?.designationName || 'N/A'}
                  </TableCell>
                  <TableCell>{employee.employmentInfo.employmentStatus}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/employees/${employee._id}`)}
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/employees/${employee._id}/edit`)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(employee._id)}
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
    </Box>
  );
}
