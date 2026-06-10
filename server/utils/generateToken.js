import jwt from 'jsonwebtoken';

const generateToken = (res, userId, role) => {
  const secret = process.env.JWT_SECRET || 'secret_key_tb_123';
  const token = jwt.sign({ id: userId, role }, secret, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  };

  res.cookie('token', token, cookieOptions);
  return token;
};

export default generateToken;
