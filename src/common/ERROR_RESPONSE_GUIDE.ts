/**
 * ERROR RESPONSE DOCUMENTATION
 * 
 * All API responses follow a consistent error format for better frontend integration
 */

/**
 * SUCCESS RESPONSE (200, 201, etc.)
 * {
 *   "id": 1,
 *   "name": "Product Name",
 *   ...data
 * }
 * 
 * OR with pagination:
 * {
 *   "data": [...],
 *   "meta": {
 *     "total": 100,
 *     "page": 1,
 *     "limit": 10,
 *     "totalPages": 10,
 *     "hasNextPage": true,
 *     "hasPreviousPage": false
 *   }
 * }
 */

/**
 * ERROR RESPONSE FORMATS
 */

/**
 * 400 - BAD REQUEST
 * {
 *   "statusCode": 400,
 *   "message": "Validation failed",
 *   "error": "Bad Request",
 *   "timestamp": "2026-02-28T12:00:00.000Z",
 *   "path": "/orders",
 *   "errors": {
 *     "customerId": ["Customer ID is required"],
 *     "items[0].productId": ["Product ID is required"],
 *     "shippingAddress": ["Shipping address is required"]
 *   }
 * }
 */

/**
 * 401 - UNAUTHORIZED
 * {
 *   "statusCode": 401,
 *   "message": "Invalid email or password",
 *   "error": "Unauthorized",
 *   "timestamp": "2026-02-28T12:00:00.000Z",
 *   "path": "/auth/login"
 * }
 */

/**
 * 403 - FORBIDDEN
 * {
 *   "statusCode": 403,
 *   "message": "Access denied",
 *   "error": "Forbidden",
 *   "timestamp": "2026-02-28T12:00:00.000Z",
 *   "path": "/admin/dashboard"
 * }
 */

/**
 * 404 - NOT FOUND
 * {
 *   "statusCode": 404,
 *   "message": "Customer with ID 999 not found",
 *   "error": "Not Found",
 *   "timestamp": "2026-02-28T12:00:00.000Z",
 *   "path": "/orders"
 * }
 */

/**
 * 409 - CONFLICT
 * {
 *   "statusCode": 409,
 *   "message": "Customer with email \"user@example.com\" already exists",
 *   "error": "Conflict",
 *   "timestamp": "2026-02-28T12:00:00.000Z",
 *   "path": "/auth/register"
 * }
 */

/**
 * 500 - INTERNAL SERVER ERROR
 * {
 *   "statusCode": 500,
 *   "message": "Failed to create order: Database connection failed",
 *   "error": "Internal Server Error",
 *   "timestamp": "2026-02-28T12:00:00.000Z",
 *   "path": "/orders"
 * }
 */

/**
 * FRONTEND ERROR HANDLING EXAMPLE
 * 
 * try {
 *   const response = await fetch('/api/orders', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify(orderData)
 *   });
 *   
 *   const data = await response.json();
 *   
 *   if (!response.ok) {
 *     // Handle error
 *     if (data.errors) {
 *       // Validation errors - show per-field errors
 *       Object.entries(data.errors).forEach(([field, errors]) => {
 *         console.log(`${field}: ${errors.join(', ')}`);
 *       });
 *     } else {
 *       // Generic error
 *       console.log(data.message);
 *     }
 *     return;
 *   }
 *   
 *   // Handle success
 *   console.log('Order created:', data);
 * } catch (error) {
 *   console.error('Network error:', error);
 * }
 */

/**
 * CUSTOM EXCEPTION USAGE IN SERVICES
 * 
 * import {
 *   BadRequestException,
 *   ResourceNotFoundException,
 *   DuplicateResourceException,
 *   AuthenticationException,
 *   AuthorizationException
 * } from '../common/exceptions/custom.exceptions';
 * 
 * // Validation error
 * if (!customerId) {
 *   throw new BadRequestException('Customer ID is required');
 * }
 * 
 * // Resource not found
 * const customer = await this.customerRepository.findOne(id);
 * if (!customer) {
 *   throw new ResourceNotFoundException('Customer', id);
 * }
 * 
 * // Duplicate resource
 * if (existingUser) {
 *   throw new DuplicateResourceException('Customer', 'email', email);
 * }
 * 
 * // Authentication error
 * if (!isValid) {
 *   throw new AuthenticationException('Invalid credentials');
 * }
 * 
 * // Authorization error
 * if (user.role !== 'admin') {
 *   throw new AuthorizationException('Admin access required');
 * }
 */

export const ERROR_HANDLING_GUIDE = true;
