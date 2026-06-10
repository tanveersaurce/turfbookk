import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import turfReducer from './turfSlice';
import bookingReducer from './bookingSlice';
import notificationReducer from './notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    turf: turfReducer,
    booking: bookingReducer,
    notifications: notificationReducer,
  },
});
export default store;
