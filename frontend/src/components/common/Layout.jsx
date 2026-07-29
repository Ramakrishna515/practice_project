import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
  Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  PersonAdd as PersonAddIcon,
  AccessTime as AccessTimeIcon,
  EventNote as EventNoteIcon,
  AccountBalance as AccountBalanceIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const drawerWidthExpanded = 240;
const drawerWidthCollapsed = 65;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Employees', icon: <PeopleIcon />, path: '/employees' },
  { text: 'Organization', icon: <BusinessIcon />, path: '/organization/departments' },
  { text: 'Onboarding', icon: <PersonAddIcon />, path: '/onboarding' },
  { text: 'Attendance', icon: <AccessTimeIcon />, path: '/attendance' },
  { text: 'Leaves', icon: <EventNoteIcon />, path: '/leaves' },
  { text: 'Payroll', icon: <AccountBalanceIcon />, path: '/payroll/payslips' }
];

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerExpanded, setDrawerExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isPathActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const drawer = (isCollapsed) => (
    <Box>
      <Toolbar sx={{ minHeight: 64, display: 'flex', justifyContent: 'center' }}>
        {!isCollapsed && (
          <Typography variant="h6" noWrap component="div">
            HRMS
          </Typography>
        )}
        {isCollapsed && (
          <Typography variant="h6" component="div">
            HR
          </Typography>
        )}
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <Tooltip key={item.text} title={isCollapsed ? item.text : ''} placement="right">
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => navigate(item.path)}
                selected={isPathActive(item.path)}
                sx={{
                  minHeight: 48,
                  justifyContent: isCollapsed ? 'center' : 'initial',
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: isCollapsed ? 0 : 3,
                    justifyContent: 'center',
                    color: isPathActive(item.path) ? 'primary.main' : 'inherit'
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!isCollapsed && <ListItemText primary={item.text} />}
              </ListItemButton>
            </ListItem>
          </Tooltip>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Human Resource Management System
          </Typography>
          <Typography variant="body1" sx={{ mr: 2 }}>
            {user?.username} ({user?.role})
          </Typography>
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidthExpanded,
            mt: 8
          }
        }}
      >
        {drawer(false)}
      </Drawer>

      {/* Desktop Collapsible Drawer */}
      <Drawer
        variant="permanent"
        onMouseEnter={() => setDrawerExpanded(true)}
        onMouseLeave={() => setDrawerExpanded(false)}
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerExpanded ? drawerWidthExpanded : drawerWidthCollapsed,
            transition: 'width 0.3s',
            overflowX: 'hidden',
            mt: 8
          }
        }}
      >
        {drawer(!drawerExpanded)}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          ml: {
            xs: 0,
            sm: `${drawerExpanded ? drawerWidthExpanded : drawerWidthCollapsed}px`
          },
          mt: 8,
          transition: 'margin-left 0.3s ease-in-out',
          width: {
            xs: '100%',
            sm: `calc(100% - ${drawerExpanded ? drawerWidthExpanded : drawerWidthCollapsed}px)`
          }
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
