import { Server } from 'socket.io';
import SlotLock from '../models/SlotLock.js';

let io = null;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
  });

  // Share across application controllers/cron jobs
  global.io = io;

  io.on('connection', (socket) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`🔌 Client connected: ${socket.id}`);
    }

    // Join Turf Room (by turfId + date)
    socket.on('join-turf-room', ({ turfId, date }) => {
      const roomName = `${turfId}_${date}`;
      socket.join(roomName);
      if (process.env.NODE_ENV !== 'production') {
        console.log(`👤 Client ${socket.id} joined room: ${roomName}`);
      }
    });

    // Leave Turf Room
    socket.on('leave-turf-room', ({ turfId, date }) => {
      const roomName = `${turfId}_${date}`;
      socket.leave(roomName);
      if (process.env.NODE_ENV !== 'production') {
        console.log(`👤 Client ${socket.id} left room: ${roomName}`);
      }
    });

    // Lock Slot (Temporary 5-minute lock during checkout checkout)
    socket.on('lock-slot', async ({ turfId, date, slotId, userId }) => {
      const roomName = `${turfId}_${date}`;
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes lock

      try {
        // Create slot lock in DB
        const lock = await SlotLock.create({
          turfId,
          date,
          slotId,
          lockedBy: userId,
          expiresAt,
        });

        // Broadcast to everyone else in the room
        socket.to(roomName).emit('slot-locked', {
          turfId,
          date,
          slotId,
          lockedBy: userId,
          expiresAt,
        });

        if (process.env.NODE_ENV !== 'production') {
          console.log(`🔒 Slot ${slotId} locked in room ${roomName} by ${userId}`);
        }
      } catch (error) {
        // If slot is already locked, mongoose index will trigger duplicate key error (code 11000)
        console.error('Error locking slot via socket:', error.message);
        socket.emit('lock-failed', { slotId, message: 'This slot is already being booked by someone else.' });
      }
    });

    // Unlock Slot (Manual release or cancellation of checkout)
    socket.on('unlock-slot', async ({ turfId, date, slotId }) => {
      const roomName = `${turfId}_${date}`;
      try {
        await SlotLock.deleteOne({ turfId, date, slotId });

        // Broadcast release to everyone in the room
        io.to(roomName).emit('slot-unlocked', { turfId, date, slotId });

        if (process.env.NODE_ENV !== 'production') {
          console.log(`🔓 Slot ${slotId} unlocked in room ${roomName}`);
        }
      } catch (error) {
        console.error('Error unlocking slot:', error.message);
      }
    });

    socket.on('disconnect', () => {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`🔌 Client disconnected: ${socket.id}`);
      }
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
