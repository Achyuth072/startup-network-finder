import React, { useState } from 'react';
import { Container, Typography, Alert } from '@mui/material';
import SearchBox from '../components/Search/SearchBox';
import SearchResult from '../components/Search/SearchResult';
import Navbar from '../components/Layout/Navbar';
import axios from 'axios';

const SearchPage = () => {
  const [user, setUser] = useState(null);
  const [searchResult, setSearchResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (query) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/search', { query });
      setSearchResult(response.data.result);
      setUser(prevUser => ({
        ...prevUser,
        credits: response.data.creditsRemaining
      }));
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'An error occurred while performing the search'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <div>
      <Navbar user={user} onLogout={handleLogout} />
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Search Investors & Mentors
        </Typography>
        
        {user?.credits === 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            You have no credits remaining. Please check your email for recharge instructions.
          </Alert>
        )}

        <SearchBox onSearch={handleSearch} isLoading={isLoading} />
        <SearchResult 
          result={searchResult} 
          error={error}
          creditsRemaining={user?.credits}
        />
      </Container>
    </div>
  );
};

export default SearchPage;