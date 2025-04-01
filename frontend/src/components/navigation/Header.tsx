import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Badge, 
  Menu, 
  MenuItem, 
  Box,
  Avatar,
  Tooltip,
  Divider,
  ListItemIcon,
  useTheme
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { setSidebarOpen, toggleDarkMode, selectDarkMode, selectNotifications } from '../../store/slices/uiSlice';
import { logout, selectUser } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const darkMode = useSelector(selectDarkMode);
  const user = useSelector(selectUser);
  const notifications = useSelector(selectNotifications);
  
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = React.useState<null | HTMLElement>(null);
  
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };
  
  const handleToggleSidebar = () => {
    dispatch(setSidebarOpen(true));
  };
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };
  
  const handleToggleTheme = () => {
    dispatch(toggleDarkMode());
  };
  
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;
  
  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: theme.zIndex.drawer + 1,
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
      }}
    >
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="open drawer"
          onClick={handleToggleSidebar}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          Forex AI Trading Platform
        </Typography>
        
        <Box sx={{ display: 'flex' }}>
          <IconButton 
            color="inherit" 
            onClick={handleToggleTheme}
            sx={{ ml: 1 }}
          >
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
          
          <IconButton
            color="inherit"
            onClick={handleNotificationMenuOpen}
            sx={{ ml: 1 }}
          >
            <Badge badgeContent={unreadNotificationsCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          
          <Tooltip title="Account settings">
            <IconButton
              edge="end"
              aria-label="account of current user"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
              sx={{ ml: 1 }}
            >
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32,
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  fontSize: '1rem',
                }}
              >
                {user?.name?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
      
      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            {user?.name || 'User'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.mtAccounts?.[0]?.accountNumber || 'No account'}
          </Typography>
        </Box>
        
        <Divider />
        
        <MenuItem onClick={() => { handleMenuClose(); navigate('/account'); }}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          My Account
        </MenuItem>
        
        <MenuItem onClick={() => { handleMenuClose(); navigate('/settings'); }}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
      
      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationAnchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(notificationAnchorEl)}
        onClose={handleNotificationMenuClose}
        PaperProps={{
          sx: {
            width: 320,
            maxHeight: 400,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            Notifications
          </Typography>
        </Box>
        
        <Divider />
        
        {notifications.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No notifications
            </Typography>
          </Box>
        ) : (
          notifications.slice(0, 5).map((notification) => (
            <MenuItem 
              key={notification.id} 
              onClick={handleNotificationMenuClose}
              sx={{
                backgroundColor: notification.read ? 'transparent' : `${theme.palette.primary.main}10`,
                borderLeft: notification.read ? 'none' : `4px solid ${theme.palette.primary.main}`,
              }}
            >
              <Box sx={{ width: '100%' }}>
                <Typography variant="body2" sx={{ fontWeight: notification.read ? 'normal' : 'bold' }}>
                  {notification.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(notification.timestamp).toLocaleString()}
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}
        
        {notifications.length > 5 && (
          <>
            <Divider />
            <MenuItem 
              onClick={() => { 
                handleNotificationMenuClose(); 
                // In a real app, navigate to notifications page
              }}
              sx={{ justifyContent: 'center' }}
            >
              <Typography variant="body2" color="primary">
                View all notifications
              </Typography>
            </MenuItem>
          </>
        )}
      </Menu>
    </AppBar>
  );
};

export default Header;
