import { Request, Response } from 'express';
import User from './user.schema';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hash });
    res.status(201).json({ message: 'User Registered!' });
  } catch (err: any) {
   
    if (err.code === 11000 && err.keyPattern?.email) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'No user' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign(
    { userId: user._id, isAdmin: user.isAdmin, email:user.email }, 
    process.env.JWT_SECRET!
  );
  res.json({ token });
};
