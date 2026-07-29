import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { Business, Person } from '@mui/icons-material';
import { organizationAPI, employeeAPI } from '../../services/api';

export default function OrgChart() {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrgData();
  }, []);

  const loadOrgData = async () => {
    try {
      const [deptRes, empRes] = await Promise.all([
        organizationAPI.getDepartments(),
        employeeAPI.getAll({ limit: 100 })
      ]);
      setDepartments(deptRes.data.departments || []);
      setEmployees(empRes.data.employees || []);
    } catch (error) {
      console.error('Error loading org data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEmployeesForDept = (deptId) => {
    return employees.filter(e => e.employmentInfo?.department?._id === deptId);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Organization Chart
      </Typography>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <Grid container spacing={3}>
          {departments.map((dept) => {
            const deptEmployees = getEmployeesForDept(dept._id);
            return (
              <Grid item xs={12} md={6} lg={4} key={dept._id}>
                <Card elevation={3}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Business color="primary" />
                      <Typography variant="h6">
                        {dept.departmentName}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {dept.departmentCode}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Head: {dept.headOfDepartment || 'Not assigned'}
                    </Typography>
                    <Box mt={2}>
                      <Typography variant="subtitle2" gutterBottom>
                        Employees ({deptEmployees.length})
                      </Typography>
                      {deptEmployees.slice(0, 5).map((emp) => (
                        <Box key={emp._id} display="flex" alignItems="center" gap={1} py={0.5}>
                          <Person fontSize="small" color="action" />
                          <Typography variant="body2">
                            {emp.personalInfo?.firstName} {emp.personalInfo?.lastName}
                          </Typography>
                        </Box>
                      ))}
                      {deptEmployees.length > 5 && (
                        <Typography variant="caption" color="text.secondary">
                          +{deptEmployees.length - 5} more
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}
