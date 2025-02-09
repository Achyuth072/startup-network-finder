import React from 'react';
import { Paper, Typography, Box, Alert, Divider } from '@mui/material';

const SearchResult = ({ result, error, creditsRemaining }) => {
  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <Box sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="body1" gutterBottom>
          {result}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ display: 'flex', justifyContent: 'flex-end' }}
        >
          Credits remaining: {creditsRemaining}
        </Typography>
      </Paper>
    </Box>
  );
};

export default SearchResult;