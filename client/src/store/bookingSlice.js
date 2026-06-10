import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentBooking: {
    turfId: null,
    turfName: '',
    sport: '',
    date: '',
    slots: [], // array of objects: { _id, startTime, endTime, price }
    totalAmount: 0,
    advancePaid: 0,
    remainingAmount: 0,
  },
  checkoutStep: 1, // 1: Slot Selected, 2: Login, 3: Payment, 4: Confirmed
  loading: false,
  error: null,
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    initiateBooking: (state, action) => {
      const { turfId, turfName, sport, date, slots, pricing, totalAmount, advancePaid, remainingAmount } = action.payload;
      const finalTotalAmount = totalAmount !== undefined ? totalAmount : slots.reduce((sum, slot) => sum + (pricing || 0), 0);
      const finalAdvancePaid = advancePaid !== undefined ? advancePaid : Math.round(finalTotalAmount * 0.20);
      const finalRemainingAmount = remainingAmount !== undefined ? remainingAmount : finalTotalAmount - finalAdvancePaid;

      state.currentBooking = {
        turfId,
        turfName,
        sport,
        date,
        slots,
        totalAmount: finalTotalAmount,
        advancePaid: finalAdvancePaid,
        remainingAmount: finalRemainingAmount,
      };
      state.checkoutStep = 1;
    },
    updateCheckoutStep: (state, action) => {
      state.checkoutStep = action.payload;
    },
    clearBooking: (state) => {
      state.currentBooking = {
        turfId: null,
        turfName: '',
        sport: '',
        date: '',
        slots: [],
        totalAmount: 0,
        advancePaid: 0,
        remainingAmount: 0,
      };
      state.checkoutStep = 1;
    },
  },
});

export const { initiateBooking, updateCheckoutStep, clearBooking } = bookingSlice.actions;
export default bookingSlice.reducer;
