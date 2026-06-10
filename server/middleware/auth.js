import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_tb_123');

      // Fetch user from DB (or attach decoded parameters directly if connection not active)
      try {
        req.user = await User.findById(decoded.id).select('-passwordHash');
      } catch (dbErr) {
        req.user = decoded; // Failover directly to token values if DB offline
      }

      if (!req.user) {
        req.user = decoded; // Failover
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token signature failed.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no session token.' });
  }
};
