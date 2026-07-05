/**
 * Response Helper Utilities
 * Standardized response formatting for API endpoints
 */

export interface ApiSuccessResponse<T = any> {
  success: true;
  message: string;
  data: T;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path?: string;
  errors?: Record<string, string[]>;
}

export class ResponseHelper {
  /**
   * Create a standardized success response
   */
  static success<T>(data: T, message: string): ApiSuccessResponse<T> {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Success messages for common operations
   */
  static readonly messages = {
    // Auth messages
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful',
    REGISTER_SUCCESS: 'Registration successful',
    PASSWORD_CHANGED: 'Password changed successfully',
    
    // CRUD messages
    CREATED: 'Resource created successfully',
    UPDATED: 'Resource updated successfully',
    DELETED: 'Resource deleted successfully',
    RETRIEVED: 'Data retrieved successfully',
    
    // Product messages
    PRODUCT_CREATED: 'Product created successfully',
    PRODUCT_UPDATED: 'Product updated successfully',
    PRODUCT_DELETED: 'Product deleted successfully',
    PRODUCTS_IMPORTED: 'Products imported successfully',
    
    // Category messages
    CATEGORY_CREATED: 'Category created successfully',
    CATEGORY_UPDATED: 'Category updated successfully',
    CATEGORY_DELETED: 'Category deleted successfully',
    
    // Order messages
    ORDER_CREATED: 'Order created successfully',
    ORDER_UPDATED: 'Order updated successfully',
    ORDER_CANCELLED: 'Order cancelled successfully',
    ORDER_STATUS_UPDATED: 'Order status updated successfully',
    
    // Customer messages
    CUSTOMER_CREATED: 'Customer created successfully',
    CUSTOMER_UPDATED: 'Customer updated successfully',
    CUSTOMER_DELETED: 'Customer deleted successfully',
    
    // Review messages
    REVIEW_CREATED: 'Review submitted successfully',
    REVIEW_UPDATED: 'Review updated successfully',
    REVIEW_DELETED: 'Review deleted successfully',
    REVIEW_APPROVED: 'Review approved successfully',
    
    // Wishlist messages
    ADDED_TO_WISHLIST: 'Product added to wishlist',
    REMOVED_FROM_WISHLIST: 'Product removed from wishlist',
    
    // Newsletter messages
    SUBSCRIBED: 'Successfully subscribed to newsletter',
    UNSUBSCRIBED: 'Successfully unsubscribed from newsletter',
    
    // Upload messages
    FILE_UPLOADED: 'File uploaded successfully',
    FILES_UPLOADED: 'Files uploaded successfully',
    
    // Inventory messages
    INVENTORY_UPDATED: 'Inventory updated successfully',
    STOCK_ADJUSTED: 'Stock adjusted successfully',
  };

  /**
   * Error messages for common scenarios
   */
  static readonly errorMessages = {
    // Auth errors
    INVALID_CREDENTIALS: 'Invalid email or password',
    UNAUTHORIZED: 'You are not authorized to access this resource',
    FORBIDDEN: 'Access denied',
    TOKEN_EXPIRED: 'Your session has expired. Please login again',
    
    // Validation errors
    VALIDATION_FAILED: 'Validation failed',
    INVALID_INPUT: 'Invalid input data',
    REQUIRED_FIELD: 'This field is required',
    
    // Resource errors
    NOT_FOUND: 'Resource not found',
    ALREADY_EXISTS: 'Resource already exists',
    DUPLICATE_ENTRY: 'Duplicate entry detected',
    
    // Operation errors
    OPERATION_FAILED: 'Operation failed',
    CREATE_FAILED: 'Failed to create resource',
    UPDATE_FAILED: 'Failed to update resource',
    DELETE_FAILED: 'Failed to delete resource',
    
    // File errors
    FILE_TOO_LARGE: 'File size exceeds maximum allowed size',
    INVALID_FILE_TYPE: 'Invalid file type',
    UPLOAD_FAILED: 'File upload failed',
    
    // Stock errors
    INSUFFICIENT_STOCK: 'Insufficient stock available',
    OUT_OF_STOCK: 'Product is out of stock',
    
    // Server errors
    INTERNAL_ERROR: 'An internal server error occurred',
    DATABASE_ERROR: 'Database operation failed',
  };
}
