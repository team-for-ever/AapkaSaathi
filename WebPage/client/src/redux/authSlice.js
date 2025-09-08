import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  profile: null,
  isLoading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      // Store token in localStorage
      localStorage.setItem('token', action.payload.token);
    },
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.profile = null;
      localStorage.removeItem('token');
      localStorage.removeItem('auth');
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    }
  }
});

export const { 
  setCredentials, 
  setProfile, 
  logout, 
  setError, 
  clearError, 
  setLoading 
} = authSlice.actions;

export default authSlice.reducer;
