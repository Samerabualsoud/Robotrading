import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, CssBaseline, useMediaQuery, useTheme } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { selectSidebarOpen, setIsMobile } from '../../store/slices/uiSlice';
import Sidebar from '../navigation/Sidebar';
import Header from '../navigation/Header';
import NotificationCenter from '../notifications/NotificationCenter';

const MainLayout: React.FC = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const sidebarOpen = useSelector(selectSidebarOpen);
  
  // Update isMobile state when screen size changes
  React.useEffect(() => {
    dispatch(setIsMobile(isMobile));
  }, [isMobile, dispatch]);
  
  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <CssBaseline />
      
      {/* Header */}
      <Header />
      
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${sidebarOpen ? 240 : 0}px)` },
          ml: { sm: sidebarOpen ? '240px' : 0 },
          mt: '64px',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          overflow: 'auto',
          height: 'calc(100vh - 64px)',
          backgroundColor: 'background.default',
        }}
      >
        <Outlet />
      </Box>
      
      {/* Notification Center */}
      <NotificationCenter />
    </Box>
  );
};

export default MainLayout;
