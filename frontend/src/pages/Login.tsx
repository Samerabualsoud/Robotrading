import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { 
  AccountCircle, 
  Lock, 
  Business, 
  Login 
} from '@mui/icons-material';

import { RootState } from '../store';
import { login } from '../store/slices/authSlice';

const LoginPage: React.FC = () => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  
  // Form state
  const [server, setServer] = useState('');
  const [login_id, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState('demo');
  
  // Common MT5 servers
  const demoServers = [
    'MetaQuotes-Demo',
    'ICMarkets-Demo',
    'Pepperstone-Demo',
    'FXCM-Demo',
    'OANDA-Demo'
  ];
  
  const liveServers = [
    'MetaQuotes-Live',
    'ICMarkets-Live',
    'Pepperstone-Live',
    'FXCM-Live',
    'OANDA-Live'
  ];
  
  // Handle login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    dispatch(login({
      server,
      login: login_id,
      password
    }));
  };
  
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: 'background.default',
        padding: 2
      }}
    >
      <Card sx={{ maxWidth: 500, width: '100%' }}>
        <CardContent>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Forex AI Trading Platform
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Login with your MetaTrader 5 account
            </Typography>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleLogin}>
            <Grid container spacing={3}>
              {/* Account Type */}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Account Type</InputLabel>
                  <Select
                    value={accountType}
                    label="Account Type"
                    onChange={(e) => setAccountType(e.target.value)}
                    startAdornment={<Business sx={{ mr: 1 }} />}
                  >
                    <MenuItem value="demo">Demo Account</MenuItem>
                    <MenuItem value="live">Live Account</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              {/* Server */}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>MT5 Server</InputLabel>
                  <Select
                    value={server}
                    label="MT5 Server"
                    onChange={(e) => setServer(e.target.value)}
                    startAdornment={<Business sx={{ mr: 1 }} />}
                  >
                    <MenuItem value="" disabled>
                      Select a server
                    </MenuItem>
                    <Divider />
                    {accountType === 'demo' ? (
                      demoServers.map((server) => (
                        <MenuItem key={server} value={server}>
                          {server}
                        </MenuItem>
                      ))
                    ) : (
                      liveServers.map((server) => (
                        <MenuItem key={server} value={server}>
                          {server}
                        </MenuItem>
                      ))
                    )}
                    <Divider />
                    <MenuItem value="custom">Custom Server</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              {/* Custom Server */}
              {server === 'custom' && (
                <Grid item xs={12}>
                  <TextField
                    label="Custom Server Address"
                    fullWidth
                    value={server === 'custom' ? '' : server}
                    onChange={(e) => setServer(e.target.value)}
                  />
                </Grid>
              )}
              
              {/* Login ID */}
              <Grid item xs={12}>
                <TextField
                  label="MT5 Login ID"
                  fullWidth
                  value={login_id}
                  onChange={(e) => setLoginId(e.target.value)}
                  InputProps={{
                    startAdornment: <AccountCircle sx={{ mr: 1 }} />
                  }}
                />
              </Grid>
              
              {/* Password */}
              <Grid item xs={12}>
                <TextField
                  label="MT5 Password"
                  type="password"
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    startAdornment: <Lock sx={{ mr: 1 }} />
                  }}
                />
              </Grid>
              
              {/* Submit Button */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  disabled={isLoading || !server || !login_id || !password}
                  startIcon={isLoading ? <CircularProgress size={20} /> : <Login />}
                >
                  {isLoading ? 'Connecting...' : 'Login to MT5'}
                </Button>
              </Grid>
            </Grid>
          </form>
          
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              This platform connects directly to your MetaTrader 5 account.
              No additional registration is required.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Your credentials are securely transmitted and never stored.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;
