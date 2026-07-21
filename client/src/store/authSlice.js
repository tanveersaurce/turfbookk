import { createSlice } from '@reduxjs/toolkit';

// Try to retrieve existing session safely
let savedUser = null;
try {
  const userStr = localStorage.getItem('tb_user');
  if (userStr && userStr !== 'undefined' && userStr !== 'null') {
    savedUser = JSON.parse(userStr);
  }
} catch (err) {
  console.error('Failed to parse tb_user from localStorage:', err);
}
const savedToken = localStorage.getItem('tb_token') || null;

const initialState = {
  user: savedUser,
  token: savedToken,
  isAuthenticated: !!savedToken,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    authSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      
      const payload = action.payload || {};
      const userObj = payload.user || payload.data || (payload._id ? payload : null);
      const tokenStr = payload.token || localStorage.getItem('tb_token');
      
      state.user = userObj;
      state.token = tokenStr;
      state.error = null;
      
      if (userObj) {
        localStorage.setItem('tb_user', JSON.stringify(userObj));
      }
      if (tokenStr) {
        localStorage.setItem('tb_token', tokenStr);
      }
    },
    authFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('tb_user');
      localStorage.removeItem('tb_token');
    },
    updateProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('tb_user', JSON.stringify(state.user));
      }
    }
  },
});

export const { authStart, authSuccess, authFailure, logout, updateProfile } = authSlice.actions;
export default authSlice.reducer;
