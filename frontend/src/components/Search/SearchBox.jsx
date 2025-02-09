import React, { useState } from 'react';
import { TextField, Button, Box, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const SearchBox = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        gap: 2,
        maxWidth: 600,
        margin: '0 auto',
        padding: 2,
      }}
    >
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search for investors or mentors..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={isLoading}
      />
      <Button
        type="submit"
        variant="contained"
        disabled={isLoading}
        startIcon={isLoading ? <CircularProgress size={20} /> : <SearchIcon />}
      >
        Search
      </Button>
    </Box>
  );
};

export default SearchBox;