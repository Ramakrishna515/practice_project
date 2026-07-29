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
  IconButton
} from '@mui/material';
import { Download, Visibility } from '@mui/icons-material';
import { payrollAPI } from '../../services/api';

export default function PayslipList() {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayslips();
  }, []);

  const loadPayslips = async () => {
    try {
      const response = await payrollAPI.getPayslips();
      setPayslips(response.data.payslips || []);
    } catch (error) {
      console.error('Error loading payslips:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Payslips
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Month</TableCell>
              <TableCell>Year</TableCell>
              <TableCell>Basic Salary</TableCell>
              <TableCell>Allowances</TableCell>
              <TableCell>Deductions</TableCell>
              <TableCell>Net Salary</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">Loading...</TableCell>
              </TableRow>
            ) : payslips.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No payslips available
                </TableCell>
              </TableRow>
            ) : (
              payslips.map((slip) => (
                <TableRow key={slip._id}>
                  <TableCell>{slip.month}</TableCell>
                  <TableCell>{slip.year}</TableCell>
                  <TableCell>₹{slip.basicSalary?.toLocaleString()}</TableCell>
                  <TableCell>₹{slip.totalAllowances?.toLocaleString()}</TableCell>
                  <TableCell>₹{slip.totalDeductions?.toLocaleString()}</TableCell>
                  <TableCell>₹{slip.netSalary?.toLocaleString()}</TableCell>
                  <TableCell>{slip.status}</TableCell>
                  <TableCell>
                    <IconButton size="small">
                      <Visibility />
                    </IconButton>
                    <IconButton size="small">
                      <Download />
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
