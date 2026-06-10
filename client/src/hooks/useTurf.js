import { useSelector, useDispatch } from 'react-redux';
import { setSearchParams, fetchTurfsStart, fetchTurfsSuccess, fetchTurfsFailure, setSelectedTurf } from '../store/turfSlice';
import { turfService } from '../services/api';

export const useTurf = () => {
  const dispatch = useDispatch();
  const { searchParams, turfs, selectedTurf, loading, error } = useSelector((state) => state.turf);

  const updateSearchParams = (params) => {
    dispatch(setSearchParams(params));
  };

  const getTurfList = async (filters) => {
    dispatch(fetchTurfsStart());
    try {
      const response = await turfService.getTurfs({ ...searchParams, ...filters });
      if (response.success) {
        dispatch(fetchTurfsSuccess(response.data));
        return { success: true, data: response.data };
      } else {
        dispatch(fetchTurfsFailure(response.message || 'Failed to fetch turfs.'));
        return { success: false, message: response.message };
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to fetch turfs.';
      dispatch(fetchTurfsFailure(message));
      return { success: false, message };
    }
  };

  const getTurfDetails = async (id) => {
    dispatch(fetchTurfsStart());
    try {
      const response = await turfService.getTurfById(id);
      if (response.success) {
        dispatch(setSelectedTurf(response.data));
        return { success: true, data: response.data };
      } else {
        dispatch(fetchTurfsFailure(response.message || 'Failed to load turf.'));
        return { success: false, message: response.message };
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to load turf.';
      dispatch(fetchTurfsFailure(message));
      return { success: false, message };
    }
  };

  const getSlotsForDate = async (id, date) => {
    try {
      const response = await turfService.getSlots(id, date);
      if (response.success) {
        return { success: true, data: response.data };
      }
      return { success: false, message: response.message };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to load slots.';
      return { success: false, message };
    }
  };

  const uploadTurfImages = async (id, formData) => {
    try {
      const response = await turfService.uploadImages(id, formData);
      if (response.success) {
        return { success: true, data: response.data };
      }
      return { success: false, message: response.message };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to upload images.';
      return { success: false, message };
    }
  };

  const getSearchSuggestions = async (q) => {
    try {
      const response = await turfService.getSuggestions(q);
      if (response.success) {
        return { success: true, data: response.data };
      }
      return { success: false, message: response.message };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to get suggestions.';
      return { success: false, message };
    }
  };

  return {
    searchParams,
    turfs,
    selectedTurf,
    loading,
    error,
    updateSearchParams,
    getTurfList,
    getTurfDetails,
    getSlotsForDate,
    uploadTurfImages,
    getSearchSuggestions,
  };
};

export default useTurf;
