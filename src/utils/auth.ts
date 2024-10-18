import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const generateToken = (user: any) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: '1d' });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET!);
};

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};
