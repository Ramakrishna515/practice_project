import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Button,
  Divider,
  LinearProgress
} from '@mui/material';
import { ArrowBack, CheckCircle, RadioButtonUnchecked } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { onboardingAPI } from '../../services/api';

export default function OnboardingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkflow();
  }, [id]);

  const loadWorkflow = async () => {
    try {
      const response = await onboardingAPI.getWorkflowById(id);
      setWorkflow(response.data.workflow);
      setTasks(response.data.workflow?.tasks || []);
    } catch (error) {
      console.error('Error loading workflow:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskToggle = async (taskId, completed) => {
    try {
      await onboardingAPI.updateTaskStatus(id, taskId, { completed: !completed });
      loadWorkflow();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  if (loading || !workflow) {
    return <Box>Loading...</Box>;
  }

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/onboarding')}
        >
          Back
        </Button>
        <Typography variant="h4">
          Onboarding Details
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Employee Information
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="text.secondary">Name</Typography>
              <Typography variant="body1" gutterBottom>
                {workflow.employee?.personalInfo?.firstName} {workflow.employee?.personalInfo?.lastName}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>Employee ID</Typography>
              <Typography variant="body1" gutterBottom>
                {workflow.employee?.employeeId}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>Department</Typography>
              <Typography variant="body1" gutterBottom>
                {workflow.employee?.employmentInfo?.department?.departmentName || 'N/A'}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>Status</Typography>
              <Chip
                label={workflow.status}
                color={workflow.status === 'Completed' ? 'success' : 'warning'}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Onboarding Tasks
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {completedTasks} of {totalTasks} completed
                </Typography>
              </Box>
              <LinearProgress variant="determinate" value={progress} sx={{ mb: 3 }} />
              
              <List>
                {tasks.map((task, index) => (
                  <ListItem
                    key={task._id || index}
                    button
                    onClick={() => handleTaskToggle(task._id, task.completed)}
                    sx={{
                      borderRadius: 1,
                      mb: 1,
                      bgcolor: task.completed ? 'action.hover' : 'background.paper',
                      '&:hover': { bgcolor: 'action.selected' }
                    }}
                  >
                    <Checkbox
                      checked={task.completed}
                      icon={<RadioButtonUnchecked />}
                      checkedIcon={<CheckCircle color="success" />}
                    />
                    <ListItemText
                      primary={task.taskName}
                      secondary={task.description}
                      sx={{
                        textDecoration: task.completed ? 'line-through' : 'none'
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
