import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';
    let errors: Record<string, string[]> | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || exception.message;
        error = responseObj.error || error;
        errors = responseObj.errors;
      } else {
        message = String(exceptionResponse) || exception.message;
      }
    } else if (exception instanceof Error) {
      message = exception.message || 'Unknown error occurred';
      this.logger.error(`Unhandled error: ${message}`, exception.stack);
    } else {
      message = String(exception) || 'Unknown error occurred';
      this.logger.error(`Unhandled exception: ${message}`);
    }

    const responsePayload = {
      success: false,
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(errors && { errors }),
    };

    // Log errors for debugging
    if (status >= 500) {
      this.logger.error(`${request.method} ${request.url}`, {
        statusCode: status,
        message,
        error,
        exception,
      });
    } else {
      this.logger.warn(`${request.method} ${request.url} - ${status} ${message}`);
    }

    response.status(status).json(responsePayload);
  }
}
