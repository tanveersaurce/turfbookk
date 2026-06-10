import { useSelector, useDispatch } from 'react-redux';
import { initiateBooking as initiateAction, updateCheckoutStep, clearBooking } from '../store/bookingSlice';
import { bookingService, paymentService } from '../services/api';
import { useState } from 'react';

export const useBooking = () => {
  const dispatch = useDispatch();
  const { currentBooking, checkoutStep } = useSelector((state) => state.booking);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const startBookingFlow = (bookingPayload) => {
    dispatch(initiateAction(bookingPayload));
  };

  const createBookingOnServer = async (bookingData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await bookingService.create(bookingData);
      if (response.success) {
        setLoading(false);
        return { success: true, data: response.data };
      } else {
        setLoading(false);
        setError(response.message || 'Failed to create booking.');
        return { success: false, message: response.message };
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to create booking.';
      setLoading(false);
      setError(message);
      return { success: false, message };
    }
  };

  const getMyBookingsList = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await bookingService.getBookings();
      setLoading(false);
      if (response.success) {
        return { success: true, data: response.data };
      }
      return { success: false, message: response.message };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to load bookings.';
      setLoading(false);
      setError(message);
      return { success: false, message };
    }
  };

  const cancelUserBooking = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await bookingService.cancel(id);
      setLoading(false);
      if (response.success) {
        return { success: true, data: response.data };
      }
      return { success: false, message: response.message };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to cancel booking.';
      setLoading(false);
      setError(message);
      return { success: false, message };
    }
  };

  const createPaymentOrder = async (bookingId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await paymentService.createOrder(bookingId);
      setLoading(false);
      if (response.success) {
        return { success: true, data: response.data };
      }
      return { success: false, message: response.message };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to create payment order.';
      setLoading(false);
      setError(message);
      return { success: false, message };
    }
  };

  const verifyPaymentSignature = async (paymentData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await paymentService.verifyPayment(paymentData);
      setLoading(false);
      if (response.success) {
        dispatch(updateCheckoutStep(4)); // Confirmed step
        return { success: true, data: response.data };
      }
      return { success: false, message: response.message };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to verify payment.';
      setLoading(false);
      setError(message);
      return { success: false, message };
    }
  };

  const getBookingReceiptData = async (bookingId) => {
    try {
      const response = await paymentService.getReceipt(bookingId);
      if (response.success) {
        return { success: true, data: response.data };
      }
      return { success: false, message: response.message };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to get receipt details.';
      return { success: false, message };
    }
  };

  const setCheckoutStep = (step) => {
    dispatch(updateCheckoutStep(step));
  };

  const resetBookingFlow = () => {
    dispatch(clearBooking());
  };

  return {
    currentBooking,
    checkoutStep,
    loading,
    error,
    startBookingFlow,
    createBooking: createBookingOnServer,
    getMyBookings: getMyBookingsList,
    cancelBooking: cancelUserBooking,
    createPaymentOrder,
    verifyPaymentSignature,
    getBookingReceiptData,
    setCheckoutStep,
    resetBooking: resetBookingFlow,
  };
};

export default useBooking;
