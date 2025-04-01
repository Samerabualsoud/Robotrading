import React from 'react';
import { Box, Typography, TextField, Button, Paper, CircularProgress, Alert } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../../store/slices/authSlice';
import { addNotification } from '../../store/slices/uiSlice';
import { RootState } from '../../store';
import { useNavigate } from 'react-router-dom';

// Validation schema
const validationSchema = Yup.object({
  server: Yup.string().required('Server is required'),
  login: Yup.string().required('Login ID is required'),
  password: Yup.string().required('Password is required'),
});

const LoginForm: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const formik = useFormik({
    initialValues: {
      server: '',
      login: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        dispatch(loginStart());
        
        // In a real app, this would be an API call to your backend
        // For now, we'll simulate a successful login after a delay
        setTimeout(() => {
          // Simulate successful login
          dispatch(loginSuccess({
            user: {
              id: '1',
              email: 'user@example.com',
              name: 'Demo User',
              mtAccounts: [
                {
                  broker: 'Demo Broker',
                  accountNumber: values.login,
                  server: values.server,
                  accountType: 'Demo',
                  lastConnected: new Date().toISOString(),
                }
              ]
            },
            token: 'demo-token-123'
          }));
          
          dispatch(addNotification({
            type: 'success',
            message: 'Successfully logged in to MetaTrader account'
          }));
          
          navigate('/');
        }, 1500);
      } catch (err) {
        dispatch(loginFailure('Failed to login. Please check your credentials.'));
        dispatch(addNotification({
          type: 'error',
          message: 'Failed to login to MetaTrader account'
        }));
      }
    },
  });

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 4, 
        maxWidth: 400, 
        width: '100%',
        borderRadius: 2,
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Login with MT5/MT4
      </Typography>
      
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
        Enter your MetaTrader account credentials to access the trading platform
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <form onSubmit={formik.handleSubmit}>
        <TextField
          fullWidth
          id="server"
          name="server"
          label="MT5/MT4 Server"
          placeholder="e.g., ICMarketsSC-Demo"
          value={formik.values.server}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.server && Boolean(formik.errors.server)}
          helperText={formik.touched.server && formik.errors.server}
          margin="normal"
          variant="outlined"
        />
        
        <TextField
          fullWidth
          id="login"
          name="login"
          label="Login ID"
          placeholder="Your MT5/MT4 account number"
          value={formik.values.login}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.login && Boolean(formik.errors.login)}
          helperText={formik.touched.login && formik.errors.login}
          margin="normal"
          variant="outlined"
        />
        
        <TextField
          fullWidth
          id="password"
          name="password"
          label="Password"
          type="password"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.password && Boolean(formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
          margin="normal"
          variant="outlined"
        />
        
        <Button
          color="primary"
          variant="contained"
          fullWidth
          type="submit"
          disabled={loading}
          sx={{ mt: 3, mb: 2, py: 1.5 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
        </Button>
      </form>
      
      <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
        This platform connects securely to your MetaTrader account.
        Your credentials are never stored and are only used to establish a connection.
      </Typography>
    </Paper>
  );
};

export default LoginForm;
