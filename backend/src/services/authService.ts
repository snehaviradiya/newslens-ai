// Authentication Service backed by PostgreSQL through Prisma

import { AppError } from '../middleware/errorHandler.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import { prisma } from '../utils/prisma.js';
import { RegisterInput, LoginInput } from '../validators/authValidator.js';

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}

const sanitizeUser = (user: any): SafeUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

export const authService = {
  // Register a new user
  register: async (input: RegisterInput): Promise<{ user: SafeUser; token: string }> => {
    const normalizedEmail = input.email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      throw new AppError('An account with this email address already exists.', 409);
    }

    const passwordHash = await hashPassword(input.password);
    const created = await prisma.user.create({
      data: {
        name: input.name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: (input.role as any) || 'USER',
      },
    });

    const token = signToken({
      userId: created.id,
      email: created.email,
      role: created.role,
    });

    return { user: sanitizeUser(created), token };
  },

  // Login existing user
  login: async (input: LoginInput): Promise<{ user: SafeUser; token: string }> => {
    const normalizedEmail = input.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }

    const isPasswordValid = await comparePassword(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password.', 401);
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return { user: sanitizeUser(user), token };
  },

  // Get user profile by ID
  getUserById: async (userId: string): Promise<SafeUser> => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('User not found.', 404);
    }
    return sanitizeUser(user);
  },
};
