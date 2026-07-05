import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface SuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, SuccessResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<SuccessResponse<T>> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    return next.handle().pipe(
      map(data => {
        // Don't wrap if already wrapped or if it's a special response
        if (data && (data.success !== undefined || data.access_token || data.meta)) {
          return data;
        }

        // Generate appropriate success message based on HTTP method
        let message = 'Operation completed successfully';
        
        switch (method) {
          case 'POST':
            message = 'Resource created successfully';
            break;
          case 'PUT':
          case 'PATCH':
            message = 'Resource updated successfully';
            break;
          case 'DELETE':
            message = 'Resource deleted successfully';
            break;
          case 'GET':
            message = 'Data retrieved successfully';
            break;
        }

        // If data already has a message field, use it
        if (data && typeof data === 'object' && 'message' in data) {
          message = data.message;
          delete data.message;
        }

        return {
          success: true,
          message,
          data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
