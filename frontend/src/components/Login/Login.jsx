import React from 'react';
import { Button, Paper, Typography, Container } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

const Login = () => {
  const handleGoogleLogin = () => {
    // Will be implemented to redirect to Google OAuth endpoint
    window.location.href = '/auth/google';
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper 
        elevation={3}
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 4,
        }}
      >
        <Typography component="h1" variant="h5">
          Welcome to Startup Network Finder
        </Typography>
        <Button
          variant="contained"
          startIcon={<GoogleIcon />}
          onClick={handleGoogleLogin}
          sx={{ mt: 3, mb: 2 }}
        >
          Sign in with Google
        </Button>
      </Paper>
    </Container>
  );
};

export default Login;