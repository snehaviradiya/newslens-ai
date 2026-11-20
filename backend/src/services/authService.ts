// Authentication Service with PostgreSQL (Prisma) and In-Memory Fallback

import crypto from 'crypto';
import { AppError } from '../middleware/errorHandler.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import { prisma } from '../utils/prisma.js';
import { RegisterInput, LoginInput } from '../validators/authValidator.js';
import { logger } from '../utils/logger.js';

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}

// In-memory user store for offline/standalone execution
const memoryUsers = new Map<string, { id: string; name: string; email: string; passwordHash: string; role: string; createdAt: Date }>();

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

    // Check duplicate in Prisma if DB is accessible
    try {
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
    } catch (err: any) {
      if (err instanceof AppError) throw err;

      // Fallback to in-memory store if DB query failed (e.g. no DB connection in standalone test)
      logger.warn('Database query failed in authService.register, using in-memory store fallback:', err.message);

      if (memoryUsers.has(normalizedEmail)) {
        throw new AppError('An account with this email address already exists.', 409);
      }

      const passwordHash = await hashPassword(input.password);
      const user = {
        id: crypto.randomUUID(),
        name: input.name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: input.role || 'USER',
        createdAt: new Date(),
      };

      memoryUsers.set(normalizedEmail, user);

      const token = signToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return { user: sanitizeUser(user), token };
    }
  },

  // Login existing user
  login: async (input: LoginInput): Promise<{ user: SafeUser; token: string }> => {
    const normalizedEmail = input.email.toLowerCase().trim();

    try {
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
    } catch (err: any) {
      if (err instanceof AppError) throw err;

      // Fallback to in-memory store
      logger.warn('Database query failed in authService.login, using in-memory store fallback:', err.message);

      const memoryUser = memoryUsers.get(normalizedEmail);
      if (!memoryUser) {
        throw new AppError('Invalid email or password.', 401);
      }

      const isPasswordValid = await comparePassword(input.password, memoryUser.passwordHash);
      if (!isPasswordValid) {
        throw new AppError('Invalid email or password.', 401);
      }

      const token = signToken({
        userId: memoryUser.id,
        email: memoryUser.email,
        role: memoryUser.role,
      });

      return { user: sanitizeUser(memoryUser), token };
    }
  },

  // Get user profile by ID
  getUserById: async (userId: string): Promise<SafeUser> => {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new AppError('User not found.', 404);
      }
      return sanitizeUser(user);
    } catch (err: any) {
      if (err instanceof AppError) throw err;

      // Check in-memory
      for (const u of memoryUsers.values()) {
        if (u.id === userId) {
          return sanitizeUser(u);
        }
      }

      throw new AppError('User not found.', 404);
    }
  },
};
