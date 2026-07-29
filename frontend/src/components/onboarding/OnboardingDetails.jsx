import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

export default function OnboardingDetails() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        OnboardingDetails
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography>
          This is the OnboardingDetails component. Full implementation coming soon.
        </Typography>
      </Paper>
    </Box>
  );
}
