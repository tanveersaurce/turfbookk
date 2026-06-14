import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token = null;

  // 1. Check cookies first (production practice for HTTP-only cookies)
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } 
  // 2. Check Authorization header (Authorization: Bearer <token>) as fallback
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no session token.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_tb_123');

    // Attach user information to request
    req.user = await User.findById(decoded.id).select('-passwordHash');

    if (!req.user) {
      return res.status(404).json({ success: false, message: 'User belonging to this token no longer exists.' });
    }

    if (!req.user.isActive) {
      return res.status(403).json({ success: false, message: 'This account has been deactivated.' });
    }

    if (req.user.role === 'owner' && req.user.isApproved === false) {
      return res.status(403).json({ success: false, message: 'Your account is pending Admin approval. Please wait.' });
    }

    next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    return res.status(401).json({ success: false, message: 'Not authorized, token signature failed.' });
  }
};
