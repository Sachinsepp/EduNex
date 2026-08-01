import { sign, verify, TokenExpiredError, JsonWebTokenError, Secret } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { config } from '../../config';
import { logger } from '../../core/logger';
import { ValidationError, UnauthorizedError, ConflictError, NotFoundError } from '../../core/errors/app-errors';
import { TokenPayload } from '../../core/types/user';
import { IAuthRepository, IStudentRepository, ITeacherRepository, StudentWithPassword, TeacherWithPassword } from './repository';
import { LoginDto, RegisterDto, RefreshTokenDto, ChangePasswordDto } from './dto';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUserResponse {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'teacher';
}

export class AuthService {
  constructor(
    private authRepository: IAuthRepository,
    private studentRepository: IStudentRepository,
    private teacherRepository: ITeacherRepository
  ) {}

  async login(dto: LoginDto): Promise<{ user: AuthUserResponse; tokens: AuthTokens }> {
    const user = await this.authRepository.findByEmail(dto.email);
    
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isValidPassword = await bcrypt.compare(dto.password, user.password);
    
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const tokens = await this.generateTokens(user);
    
    logger.info('User logged in', { userId: user.id, email: user.email });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      tokens,
    };
  }

  async register(dto: RegisterDto): Promise<{ user: AuthUserResponse; tokens: AuthTokens }> {
    const existingUser = await this.authRepository.findByEmail(dto.email);
    
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    let user: { id: string; email: string; name: string; role: 'student' | 'teacher'; password: string };
    if (dto.role === 'student') {
      const student = await this.studentRepository.create({
        email: dto.email,
        name: dto.name,
        password: hashedPassword,
        grade: dto.grade || '10th Grade',
        teacherId: dto.teacherId || '',
        role: 'student',
      } as StudentWithPassword);
      user = {
        id: student.id,
        email: student.email,
        name: student.name,
        role: student.role,
        password: student.password,
      };
    } else {
      const teacher = await this.teacherRepository.create({
        email: dto.email,
        name: dto.name,
        password: hashedPassword,
        role: 'teacher',
      } as TeacherWithPassword);
      user = {
        id: teacher.id,
        email: teacher.email,
        name: teacher.name,
        role: teacher.role,
        password: teacher.password,
      };
    }

    const tokens = await this.generateTokens(user);
    
    logger.info('User registered', { userId: user.id, email: user.email, role: user.role });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      tokens,
    };
  }

  async refreshTokens(dto: RefreshTokenDto): Promise<AuthTokens> {
    try {
      const decoded = verify(dto.refreshToken, config.JWT_REFRESH_SECRET) as TokenPayload;
      
      const user = await this.authRepository.findById(decoded.userId);
      
      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      return await this.generateTokens(user);
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedError('Refresh token expired');
      }
      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedError('Invalid refresh token');
      }
      throw error;
    }
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.authRepository.findById(userId);
    
    if (!user) {
      throw new NotFoundError('User');
    }

    const isValidPassword = await bcrypt.compare(dto.currentPassword, user.password);
    
    if (!isValidPassword) {
      throw new ValidationError('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);
    
    await this.authRepository.updatePassword(userId, hashedPassword);
    
    logger.info('Password changed', { userId });
  }

  async validateToken(token: string): Promise<TokenPayload> {
    try {
      return verify(token, config.JWT_SECRET) as TokenPayload;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedError('Token expired');
      }
      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedError('Invalid token');
      }
      throw error;
    }
  }

  private async generateTokens(user: { id: string; email: string; name: string; role: 'student' | 'teacher' }): Promise<AuthTokens> {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const jwtSecret = config.JWT_SECRET as string;
    const jwtRefreshSecret = config.JWT_REFRESH_SECRET as string;
    const expiresIn = config.JWT_EXPIRES_IN as string;
    const refreshExpiresIn = config.JWT_REFRESH_EXPIRES_IN as string;

    const accessToken = sign(payload, jwtSecret, { expiresIn } as any);
    const refreshToken = sign(payload, jwtRefreshSecret, { expiresIn: refreshExpiresIn } as any);

    return { accessToken, refreshToken };
  }
}
