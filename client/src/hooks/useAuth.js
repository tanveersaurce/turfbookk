import { useSelector, useDispatch } from 'react-redux';
import { authStart, authSuccess, authFailure, logout as logoutAction, updateProfile } from '../store/authSlice';
import { authService, userService } from '../services/api';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const loginUser = async (credentials) => {
    dispatch(authStart());
    try {
      const response = await authService.login(credentials);
      if (response.success) {
        dispatch(authSuccess({ user: response.data, token: localStorage.getItem('tb_token') }));
        return { success: true };
      } else {
        dispatch(authFailure(response.message || 'Login failed'));
        return { success: false, message: response.message };
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Login failed';
      dispatch(authFailure(message));
      return { success: false, message };
    }
  };

  const registerUser = async (userData) => {
    dispatch(authStart());
    try {
      const response = await authService.register(userData);
      if (response.success) {
        dispatch(authSuccess({ user: response.data, token: localStorage.getItem('tb_token') }));
        return { success: true };
      } else {
        dispatch(authFailure(response.message || 'Registration failed'));
        return { success: false, message: response.message };
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Registration failed';
      dispatch(authFailure(message));
      return { success: false, message };
    }
  };

  const logoutUser = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout request failed:', err.message);
    } finally {
      dispatch(logoutAction());
    }
  };

  const loadCurrentUser = async () => {
    dispatch(authStart());
    try {
      const response = await authService.getMe();
      if (response.success) {
        dispatch(authSuccess({ user: response.data, token: localStorage.getItem('tb_token') }));
        return { success: true, user: response.data };
      } else {
        dispatch(authFailure(response.message || 'Failed to load user.'));
        return { success: false };
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to load user.';
      dispatch(authFailure(message));
      return { success: false, message };
    }
  };

  const updateUserProfileData = async (profileData) => {
    try {
      const response = await userService.updateProfile(profileData);
      if (response.success) {
        dispatch(updateProfile(response.data));
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Profile update failed.';
      return { success: false, message };
    }
  };

  const updateUserAvatarImage = async (formData) => {
    try {
      const response = await userService.updateAvatar(formData);
      if (response.success) {
        dispatch(updateProfile({ avatar: response.data.avatar }));
        return { success: true, avatar: response.data.avatar };
      }
      return { success: false, message: response.message };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Avatar upload failed.';
      return { success: false, message };
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    login: loginUser,
    register: registerUser,
    logout: logoutUser,
    loadCurrentUser,
    updateProfile: updateUserProfileData,
    updateAvatar: updateUserAvatarImage,
  };
};

export default useAuth;
