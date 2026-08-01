import { NextApiRequest, NextApiResponse } from 'next';
import { AuthService } from './service';
import { LoginDto, RegisterDto, RefreshTokenDto, ChangePasswordDto, validateDto } from './dto';
import { successResponse } from '../../core/types/response';
import { errorHandler } from '../../core/errors/error-handler';
import { ValidationError } from '../../core/errors/app-errors';
import { AuthenticatedRequest } from '../../core/middleware/auth';

export class AuthController {
  constructor(private authService: AuthService) {}

  async login(req: NextApiRequest, res: NextApiResponse) {
    try {
      const dto = validateDto(LoginDto, req.body);
      const result = await this.authService.login(dto);
      
      res.status(200).json(successResponse(result, 'Login successful'));
    } catch (error) {
      errorHandler(error as Error, res);
    }
  }

  async register(req: NextApiRequest, res: NextApiResponse) {
    try {
      const dto = validateDto(RegisterDto, req.body);
      const result = await this.authService.register(dto);
      
      res.status(201).json(successResponse(result, 'Registration successful'));
    } catch (error) {
      errorHandler(error as Error, res);
    }
  }

  async refresh(req: NextApiRequest, res: NextApiResponse) {
    try {
      const dto = validateDto(RefreshTokenDto, req.body);
      const tokens = await this.authService.refreshTokens(dto);
      
      res.status(200).json(successResponse(tokens, 'Token refreshed'));
    } catch (error) {
      errorHandler(error as Error, res);
    }
  }

  async changePassword(req: AuthenticatedRequest, res: NextApiResponse) {
    try {
      if (!req.user) {
        throw new ValidationError('Not authenticated');
      }
      
      const dto = validateDto(ChangePasswordDto, req.body);
      await this.authService.changePassword(req.user.userId, dto);
      
      res.status(200).json(successResponse(null, 'Password changed successfully'));
    } catch (error) {
      errorHandler(error as Error, res);
    }
  }

  async me(req: AuthenticatedRequest, res: NextApiResponse) {
    try {
      if (!req.user) {
        throw new ValidationError('Not authenticated');
      }
      
      res.status(200).json(successResponse({
        id: req.user.userId,
        email: req.user.email,
        role: req.user.role,
      }, 'Success'));
    } catch (error) {
      errorHandler(error as Error, res);
    }
  }
}
