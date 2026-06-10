import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin;

export const useSocket = (turfId, date) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lockedSlots, setLockedSlots] = useState([]); // Array of locked slot objects: { slotId, expiresAt, lockedBy }
  const [realtimeBookedSlots, setRealtimeBookedSlots] = useState([]); // Array of slot ids booked in real-time
  const [realtimeCancelledSlots, setRealtimeCancelledSlots] = useState([]); // Array of slot ids cancelled in real-time

  useEffect(() => {
    // 1. Initialize socket connection
    const socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      if (turfId && date) {
        // Automatically join room if parameters are provided
        socket.emit('join-turf-room', { turfId, date });
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // 2. Setup listeners for real-time slot updates
    
    // Listen to slot-locked event
    socket.on('slot-locked', (payload) => {
      if (payload.turfId === turfId && payload.date === date) {
        setLockedSlots((prev) => {
          // Prevent duplicates
          if (prev.some((s) => s.slotId === payload.slotId)) return prev;
          return [...prev, { slotId: payload.slotId, expiresAt: payload.expiresAt, lockedBy: payload.lockedBy }];
        });
      }
    });

    // Listen to slot-unlocked event (e.g. locks expired or manual unlock)
    socket.on('slot-unlocked', (payload) => {
      if (payload.turfId === turfId && payload.date === date) {
        setLockedSlots((prev) => prev.filter((s) => s.slotId !== payload.slotId));
      }
    });

    // Listen to slot-booked event
    socket.on('slot-booked', (payload) => {
      if (payload.turfId === turfId && payload.date === date) {
        // Remove from locked slots if it was locked
        setLockedSlots((prev) => prev.filter((s) => s.slotId !== payload.slotId));
        setRealtimeBookedSlots((prev) => [...new Set([...prev, payload.slotId])]);
        // Remove from cancelled if it was previously cancelled
        setRealtimeCancelledSlots((prev) => prev.filter((id) => id !== payload.slotId));
      }
    });

    // Listen to slot-cancelled event
    socket.on('slot-cancelled', (payload) => {
      if (payload.turfId === turfId && payload.date === date) {
        setRealtimeBookedSlots((prev) => prev.filter((id) => id !== payload.slotId));
        setRealtimeCancelledSlots((prev) => [...new Set([...prev, payload.slotId])]);
      }
    });

    // Cleanup on unmount or parameters change
    return () => {
      if (socketRef.current) {
        if (turfId && date) {
          socketRef.current.emit('leave-turf-room', { turfId, date });
        }
        socketRef.current.disconnect();
      }
    };
  }, [turfId, date]);

  // Methods to emit actions from components
  
  const lockSlot = (slotId, userId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('lock-slot', { turfId, date, slotId, userId });
      
      // Update local state optimistically for the locker
      setLockedSlots((prev) => {
        if (prev.some((s) => s.slotId === slotId)) return prev;
        return [...prev, { slotId, expiresAt: new Date(Date.now() + 5 * 60 * 1000), lockedBy: userId }];
      });
    }
  };

  const unlockSlot = (slotId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('unlock-slot', { turfId, date, slotId });
      
      // Update local state optimistically
      setLockedSlots((prev) => prev.filter((s) => s.slotId !== slotId));
    }
  };

  return {
    isConnected,
    lockedSlots,
    realtimeBookedSlots,
    realtimeCancelledSlots,
    lockSlot,
    unlockSlot,
  };
};

export default useSocket;
