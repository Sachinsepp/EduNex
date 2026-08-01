import { AppError, ValidationError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError, RateLimitError, InternalServerError, ExternalServiceError } from './app-errors';
import { logger } from '../logger';

interface ErrorResponse {
  success: false;
  message: string;
  error?: {
    code: string;
    details?: Record<string, unknown>;
  };
}

interface NextApiResponse<T = unknown> {
  status(code: number): NextApiResponse<T>;
  json(data: T): void;
  end(): void;
}

export class ErrorHandler {
  static handle(err: Error, res: NextApiResponse): void {
    if (err instanceof AppError) {
      logger.warn(err.message, {
        code: err.code,
        statusCode: err.statusCode,
        metadata: err.metadata,
      });

      const response: ErrorResponse = {
        success: false,
        message: err.message,
        error: err.code ? { code: err.code } : undefined,
      };

      if (err.metadata) {
        response.error!.details = err.metadata;
      }

      res.status(err.statusCode).json(response);
      return;
    }

    if (err instanceof ValidationError) {
      res.status(400).json({
        success: false,
        message: err.message,
        error: { code: 'VALIDATION_ERROR' },
      });
      return;
    }

    if (err instanceof UnauthorizedError) {
      res.status(401).json({
        success: false,
        message: err.message,
        error: { code: 'UNAUTHORIZED' },
      });
      return;
    }

    if (err instanceof ForbiddenError) {
      res.status(403).json({
        success: false,
        message: err.message,
        error: { code: 'FORBIDDEN' },
      });
      return;
    }

    if (err instanceof NotFoundError) {
      res.status(404).json({
        success: false,
        message: err.message,
        error: { code: 'NOT_FOUND' },
      });
      return;
    }

    if (err instanceof ConflictError) {
      res.status(409).json({
        success: false,
        message: err.message,
        error: { code: 'CONFLICT' },
      });
      return;
    }

    if (err instanceof RateLimitError) {
      res.status(429).json({
        success: false,
        message: err.message,
        error: { code: 'RATE_LIMIT' },
      });
      return;
    }

    if (err instanceof ExternalServiceError) {
      res.status(502).json({
        success: false,
        message: err.message,
        error: { code: 'EXTERNAL_SERVICE_ERROR' },
      });
      return;
    }

    logger.error(err.message, { stack: err.stack });

    const response: ErrorResponse = {
      success: false,
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : err.message,
      error: { code: 'INTERNAL_SERVER_ERROR' },
    };

    res.status(500).json(response);
  }
}

export const errorHandler = ErrorHandler.handle.bind(ErrorHandler);
