import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    fetchStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchSuccess: (state, action) => {
      state.loading = false;
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(n => !n.isRead).length;
    },
    fetchFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
    markReadSuccess: (state, action) => {
      const notification = state.notifications.find(n => n._id === action.payload);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllReadSuccess: (state) => {
      state.notifications = state.notifications.map(n => ({ ...n, isRead: true }));
      state.unreadCount = 0;
    },
  },
});

export const {
  fetchStart,
  fetchSuccess,
  fetchFailure,
  addNotification,
  markReadSuccess,
  markAllReadSuccess,
} = notificationSlice.actions;

export default notificationSlice.reducer;
