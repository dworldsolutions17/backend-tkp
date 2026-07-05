import { HttpException, HttpStatus } from '@nestjs/common';

export interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  timestamp?: string;
  path?: string;
  errors?: Record<string, string[]>;
}

/**
 * Custom exception for validation errors
 */
export class ValidationException extends HttpException {
  constructor(errors: Record<string, string[]>, message: string = 'Validation failed') {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message,
        error: 'Bad Request',
        errors,
        timestamp: new Date().toISOString(),
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

/**
 * Custom exception for resource not found errors
 */
export class ResourceNotFoundException extends HttpException {
  constructor(resource: string, identifier: string | number) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message: `${resource} with ${identifier} not found`,
        error: 'Not Found',
        timestamp: new Date().toISOString(),
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

/**
 * Custom exception for duplicate resource errors
 */
export class DuplicateResourceException extends HttpException {
  constructor(resource: string, field: string, value: string) {
    super(
      {
        statusCode: HttpStatus.CONFLICT,
        message: `${resource} with ${field} "${value}" already exists`,
        error: 'Conflict',
        timestamp: new Date().toISOString(),
      },
      HttpStatus.CONFLICT,
    );
  }
}

/**
 * Custom exception for authentication errors
 */
export class AuthenticationException extends HttpException {
  constructor(message: string = 'Authentication failed') {
    super(
      {
        statusCode: HttpStatus.UNAUTHORIZED,
        message,
        error: 'Unauthorized',
        timestamp: new Date().toISOString(),
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

/**
 * Custom exception for authorization errors
 */
export class AuthorizationException extends HttpException {
  constructor(message: string = 'Access denied') {
    super(
      {
        statusCode: HttpStatus.FORBIDDEN,
        message,
        error: 'Forbidden',
        timestamp: new Date().toISOString(),
      },
      HttpStatus.FORBIDDEN,
    );
  }
}

/**
 * Custom exception for bad request errors
 */
export class BadRequestException extends HttpException {
  constructor(message: string, errors?: Record<string, string[]>) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message,
        error: 'Bad Request',
        errors,
        timestamp: new Date().toISOString(),
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

/**
 * Custom exception for internal server errors
 */
export class InternalServerErrorException extends HttpException {
  constructor(message: string = 'Internal server error') {
    super(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message,
        error: 'Internal Server Error',
        timestamp: new Date().toISOString(),
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
