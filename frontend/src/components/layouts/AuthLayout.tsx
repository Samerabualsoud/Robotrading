import React from 'react';
import { Box, Typography, Container, useTheme } from '@mui/material';
import { Outlet } from 'react-router-dom';

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
      }}
    >
      <Container component="main" maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
          }}
        >
          {children || <Outlet />}
        </Box>
      </Container>
      
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="body2" color="white" align="center">
            © {new Date().getFullYear()} Forex AI Trading Platform. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default AuthLayout;
