import React from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  IconButton, 
  Box,
  Typography,
  useTheme
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ShowChart as ChartIcon,
  AccountBalance as AccountIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
  Psychology as PsychologyIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectSidebarOpen, setSidebarOpen } from '../../store/slices/uiSlice';

const Sidebar: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const sidebarOpen = useSelector(selectSidebarOpen);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Trading', icon: <ChartIcon />, path: '/trading' },
    { text: 'Account', icon: <AccountIcon />, path: '/account' },
    { text: 'History', icon: <HistoryIcon />, path: '/history' },
    { text: 'Model Settings', icon: <PsychologyIcon />, path: '/model' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const handleCloseSidebar = () => {
    dispatch(setSidebarOpen(false));
  };

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={sidebarOpen}
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          backgroundColor: theme.palette.background.paper,
          borderRight: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: theme.spacing(0, 1),
          ...theme.mixins.toolbar,
          minHeight: '64px !important',
        }}
      >
        <Typography variant="h6" noWrap component="div" sx={{ ml: 2, fontWeight: 'bold' }}>
          Forex AI Trading
        </Typography>
        <IconButton onClick={handleCloseSidebar}>
          <ChevronLeftIcon />
        </IconButton>
      </Box>
      
      <Divider />
      
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            onClick={() => handleNavigate(item.path)}
            selected={location.pathname === item.path}
            sx={{
              '&.Mui-selected': {
                backgroundColor: `${theme.palette.primary.main}20`,
                borderLeft: `4px solid ${theme.palette.primary.main}`,
                '&:hover': {
                  backgroundColor: `${theme.palette.primary.main}30`,
                },
              },
              '&:hover': {
                backgroundColor: `${theme.palette.action.hover}`,
              },
              pl: location.pathname === item.path ? 1.5 : 2,
            }}
          >
            <ListItemIcon 
              sx={{ 
                color: location.pathname === item.path ? theme.palette.primary.main : 'inherit',
                minWidth: '40px'
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              primaryTypographyProps={{
                fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                color: location.pathname === item.path ? theme.palette.primary.main : 'inherit',
              }}
            />
          </ListItem>
        ))}
      </List>
      
      <Box sx={{ flexGrow: 1 }} />
      
      <Divider />
      
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Version 1.0.0
        </Typography>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
