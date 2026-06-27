import { useState } from 'react';
import toast from 'react-hot-toast';

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SvAZpZ6KBrxSkv';

export const useRazorpay = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  // Helper to dynamically load the Razorpay CDN script
  const loadScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  /**
   * Initiates the Razorpay payment modal
   * @param {Object} orderData - Razorpay order metadata from backend (orderId, amount, currency, bookingId)
   * @param {Object} user - Current user profile info (name, email, phone)
   * @param {Function} onSuccess - Success callback after verification (signature details)
   * @param {Function} onFailure - Failure callback
   */
  const initiatePayment = async (orderData, user, onSuccess, onFailure) => {
    setIsProcessing(true);
    const isScriptLoaded = await loadScript();

    if (!isScriptLoaded) {
      setIsProcessing(false);
      toast.error('Razorpay SDK failed to load. Are you offline?');
      if (onFailure) onFailure('Razorpay script loading failed.');
      return;
    }

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: orderData.amount, // Amount in paise
      currency: orderData.currency,
      name: 'TurfBook',
      description: 'Turf Slot Booking Payment',
      image: 'https://images.unsplash.com/photo-1518605072045-941297a9bae1?auto=format&fit=crop&w=150&h=150&q=80', // Default logo
      order_id: orderData.orderId,
      prefill: {
        name: user.name || '',
        email: user.email || '',
        contact: user.phone || '',
      },
      notes: {
        bookingId: orderData.bookingId,
      },
      theme: {
<<<<<<< HEAD
        color: '#AAEE00', // Lime green design system accent
=======
        color: '#1A1A1A', // Premium dark slate/near black design accent
>>>>>>> 2f0a177e57ef9730224c412cf58f241a1c9f170b
      },
      handler: async function (response) {
        setIsProcessing(false);
        toast.success('Payment authorized. Verifying signature...');
        
        if (onSuccess) {
          onSuccess({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            bookingId: orderData.bookingId,
          });
        }
      },
      modal: {
        ondismiss: function () {
          setIsProcessing(false);
          toast.error('Payment cancelled by the user.');
          if (onFailure) onFailure('Payment modal dismissed.');
        },
      },
    };

    try {
      const razorpayObject = new window.Razorpay(options);
      razorpayObject.open();
    } catch (err) {
      setIsProcessing(false);
      console.error('Error opening Razorpay modal:', err.message);
      toast.error('Failed to open payment gateway.');
      if (onFailure) onFailure(err.message);
    }
  };

  return {
    initiatePayment,
    isProcessing,
  };
};

export default useRazorpay;
