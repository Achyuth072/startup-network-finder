import { useState } from 'react';
import axios from 'axios';

const useSearch = (onCreditUpdate) => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const performSearch = async (query) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/search', { query });
      setResult(response.data.result);
      
      // Update credits if callback provided
      if (onCreditUpdate && response.data.creditsRemaining !== undefined) {
        onCreditUpdate(response.data.creditsRemaining);
      }

      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Search failed. Please try again.';
      setError(errorMessage);
      
      // Handle credit exhaustion
      if (err.response?.status === 403) {
        setError('No credits remaining. Please check your email for recharge instructions.');
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResult(null);
    setError(null);
  };

  return {
    result,
    loading,
    error,
    performSearch,
    clearResults
  };
};

export default useSearch;