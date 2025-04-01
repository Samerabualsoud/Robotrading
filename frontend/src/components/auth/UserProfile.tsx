import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Divider,
  Avatar
} from '@mui/material';
import { 
  AccountCircle, 
  Security, 
  Logout 
} from '@mui/icons-material';

import { logout } from '../../store/slices/authSlice';

interface UserProfileProps {
  user: any;
}

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const dispatch = useDispatch();
  
  // Handle logout
  const handleLogout = () => {
    dispatch(logout());
  };
  
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar sx={{ width: 64, height: 64, mr: 2, bgcolor: 'primary.main' }}>
            <AccountCircle fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="h5">
              {user.name || `MT5 Account ${user.mtAccounts?.[0]?.login}`}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user.mtAccounts?.[0]?.server}
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Typography variant="h6" gutterBottom>
          Account Information
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Login ID
            </Typography>
            <Typography variant="body1">
              {user.mtAccounts?.[0]?.login}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Account Type
            </Typography>
            <Typography variant="body1">
              {user.mtAccounts?.[0]?.accountType || 'Demo'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Currency
            </Typography>
            <Typography variant="body1">
              {user.mtAccounts?.[0]?.currency || 'USD'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Leverage
            </Typography>
            <Typography variant="body1">
              1:{user.mtAccounts?.[0]?.leverage || '100'}
            </Typography>
          </Grid>
        </Grid>
        
        <Divider sx={{ mb: 3 }} />
        
        <Typography variant="h6" gutterBottom>
          Security Settings
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <Button
              variant="outlined"
              startIcon={<Security />}
              fullWidth
            >
              Change MT5 Password
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Logout />}
              onClick={handleLogout}
              fullWidth
            >
              Logout
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default UserProfile;
