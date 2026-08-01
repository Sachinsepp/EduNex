import { NextApiRequest, NextApiResponse } from 'next';
import { verify, TokenExpiredError, JsonWebTokenError, JwtPayload } from 'jsonwebtoken';
import { config } from '../../config';
import { UnauthorizedError } from '../errors/app-errors';
import { TokenPayload, UserRole } from '../types/user';
import { logger } from '../logger';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: TokenPayload;
}

export interface RequestWithUser<T = unknown> extends AuthenticatedRequest {
  body: T;
}

export function authenticate(
  req: AuthenticatedRequest,
  res: NextApiResponse,
  next: (user: TokenPayload) => void
): void {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      throw new UnauthorizedError('No authorization header');
    }

    const [type, token] = authHeader.split(' ');
    
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedError('Invalid authorization format');
    }

    const decoded = verify(token, config.JWT_SECRET) as TokenPayload;
    req.user = decoded;
    
    next(decoded);
  } catch (error: unknown) {
    if (error instanceof TokenExpiredError) {
      logger.warn('Token expired', { errorMessage: (error as Error).message });
      throw new UnauthorizedError('Token expired');
    }
    
    if (error instanceof JsonWebTokenError) {
      logger.warn('Invalid token', { errorMessage: (error as Error).message });
      throw new UnauthorizedError('Invalid token');
    }
    
    throw error;
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: AuthenticatedRequest, res: NextApiResponse, next: () => void): void => {
    if (!req.user) {
      throw new UnauthorizedError('Not authenticated');
    }

    if (!roles.includes(req.user.role)) {
      throw new UnauthorizedError('Insufficient permissions');
    }

    next();
  };
}

export function optionalAuth(
  req: AuthenticatedRequest,
  res: NextApiResponse,
  next: (user?: TokenPayload) => void
): void {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      next(undefined);
      return;
    }

    const [type, token] = authHeader.split(' ');
    
    if (type !== 'Bearer' || !token) {
      next(undefined);
      return;
    }

    const decoded = verify(token, config.JWT_SECRET) as TokenPayload;
    req.user = decoded;
    next(decoded);
  } catch {
    next(undefined);
  }
}
