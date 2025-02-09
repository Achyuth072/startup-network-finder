import React from 'react';
import Login from '../components/Login/Login';
import { Box } from '@mui/material';

const LoginPage = () => {
  return (
    <Box 
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default'
      }}
    >
      <Login />
    </Box>
  );
};

export default LoginPage;