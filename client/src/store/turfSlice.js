import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  searchParams: {
    city: localStorage.getItem('tb_selected_city') || 'Bhopal',
    sport: 'Football',
    date: new Date().toISOString().split('T')[0],
  },
  turfs: [],
  selectedTurf: null,
  loading: false,
  error: null,
};

const turfSlice = createSlice({
  name: 'turf',
  initialState,
  reducers: {
    setSearchParams: (state, action) => {
      state.searchParams = { ...state.searchParams, ...action.payload };
      if (action.payload.city) {
        localStorage.setItem('tb_selected_city', action.payload.city);
      }
    },
    setSelectedCity: (state, action) => {
      state.searchParams.city = action.payload;
      localStorage.setItem('tb_selected_city', action.payload);
    },
    fetchTurfsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchTurfsSuccess: (state, action) => {
      state.loading = false;
      state.turfs = action.payload;
    },
    fetchTurfsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setSelectedTurf: (state, action) => {
      state.selectedTurf = action.payload;
    },
  },
});

export const { 
  setSearchParams, 
  setSelectedCity, 
  fetchTurfsStart, 
  fetchTurfsSuccess, 
  fetchTurfsFailure, 
  setSelectedTurf 
} = turfSlice.actions;
export default turfSlice.reducer;
