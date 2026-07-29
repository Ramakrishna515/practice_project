import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Divider
} from '@mui/material';
import { EventAvailable, Event, EventBusy } from '@mui/icons-material';
import { leaveAPI } from '../../services/api';

export default function LeaveBalance() {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaveBalances();
  }, []);

  const loadLeaveBalances = async () => {
    try {
      const response = await leaveAPI.getLeaveBalance();
      setBalances(response.data.balances || []);
    } catch (error) {
      console.error('Error loading balances:', error);
    } finally {
      setLoading(false);
    }
  };

  const LeaveCard = ({ balance }) => {
    const total = balance.totalLeaves || 0;
    const used = balance.usedLeaves || 0;
    const available = total - used;
    const percentage = total > 0 ? (used / total) * 100 : 0;

    return (
      <Card elevation={3}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <EventAvailable color="primary" />
            <Typography variant="h6">
              {balance.leaveType?.leaveName || 'Leave Type'}
            </Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Typography variant="subtitle2" color="text.secondary">Total</Typography>
              <Typography variant="h5">{total}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="subtitle2" color="text.secondary">Used</Typography>
              <Typography variant="h5" color="error">{used}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="subtitle2" color="text.secondary">Available</Typography>
              <Typography variant="h5" color="success">{available}</Typography>
            </Grid>
          </Grid>
          <Box mt={2}>
            <Typography variant="caption" color="text.secondary">
              {percentage.toFixed(0)}% used
            </Typography>
            <LinearProgress
              variant="determinate"
              value={percentage}
              sx={{ mt: 1, height: 8, borderRadius: 1 }}
            />
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Leave Balance
      </Typography>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : balances.length === 0 ? (
        <Card elevation={3}>
          <CardContent>
            <Typography align="center" color="text.secondary">
              No leave balance information available
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {balances.map((balance) => (
            <Grid item xs={12} md={6} lg={4} key={balance._id}>
              <LeaveCard balance={balance} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
