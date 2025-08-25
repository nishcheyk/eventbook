
import User from './user.schema';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

interface RegisterDTO {
  name: string;
  email: string;
  phone: string;
  password: string;
}

interface LoginDTO {
  email: string;
  password: string;
}

export const registerUserService = async ({ name, email, phone, password }: RegisterDTO) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error: any = new Error('Email already exists');
    error.statusCode = 400;
    throw error;
  }

  const hash = await bcrypt.hash(password, 10);
  const user = new User({ name, email, phone, password: hash });
  await user.save();
  return user;
};

export const loginUserService = async ({ email, password }: LoginDTO) => {
  const user = await User.findOne({ email });
  if (!user) {
    const error: any = new Error('User not found');
    error.statusCode = 401;
    throw error;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    const error: any = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  if (!process.env.JWT_SECRET) {
    const error: any = new Error('Server config error: JWT_SECRET not set');
    error.statusCode = 500;
    throw error;
  }

  const token = jwt.sign(
    { userId: user._id, isAdmin: user.isAdmin, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isAdmin: user.isAdmin,
    },
  };
};
