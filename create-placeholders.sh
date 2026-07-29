#!/bin/bash

cd /Users/ramakrishna/practice_project/frontend/src/components

# Create placeholder component function
create_placeholder() {
    local filepath=$1
    local componentName=$(basename "$filepath" .jsx)
    
    cat > "$filepath" << COMPONENT
import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

export default function $componentName() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        $componentName
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography>
          This is the $componentName component. Full implementation coming soon.
        </Typography>
      </Paper>
    </Box>
  );
}
COMPONENT
}

# Employee components
create_placeholder "employees/EmployeeForm.jsx"
create_placeholder "employees/EmployeeDetails.jsx"

# Organization components
create_placeholder "organization/DepartmentList.jsx"
create_placeholder "organization/DesignationList.jsx"
create_placeholder "organization/OrgChart.jsx"

# Onboarding components
create_placeholder "onboarding/OnboardingList.jsx"
create_placeholder "onboarding/OnboardingDetails.jsx"

# Attendance components
create_placeholder "attendance/AttendanceList.jsx"
create_placeholder "attendance/AttendanceCalendar.jsx"
create_placeholder "attendance/CheckInOut.jsx"

# Leave components
create_placeholder "leaves/LeaveList.jsx"
create_placeholder "leaves/LeaveApplication.jsx"
create_placeholder "leaves/LeaveApproval.jsx"
create_placeholder "leaves/LeaveBalance.jsx"

# Payroll components
create_placeholder "payroll/SalaryStructureList.jsx"
create_placeholder "payroll/PayslipList.jsx"
create_placeholder "payroll/PayslipGenerate.jsx"

echo "All placeholder components created successfully!"
