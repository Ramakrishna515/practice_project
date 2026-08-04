import React from 'react';
import { Tabs, Tab, Paper } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

const tabs = [
  { label: 'Dashboard', value: '/attendance' },
  { label: 'Check-In / Out', value: '/attendance/checkin' },
  { label: 'Records', value: '/attendance/list' },
  { label: 'Calendar', value: '/attendance/calendar' },
  { label: 'Report', value: '/attendance/report' },
  { label: 'Shifts', value: '/attendance/shifts' }
];

export default function AttendanceTabs() {
  const navigate = useNavigate();
  const location = useLocation();

  const current = tabs.find(t => location.pathname === t.value)?.value || '/attendance';

  return (
    <Paper elevation={1} sx={{ mb: 3 }}>
      <Tabs
        value={current}
        onChange={(e, value) => navigate(value)}
        variant="scrollable"
        scrollButtons="auto"
        textColor="primary"
        indicatorColor="primary"
      >
        {tabs.map((tab) => (
          <Tab key={tab.value} label={tab.label} value={tab.value} />
        ))}
      </Tabs>
    </Paper>
  );
}
