# API Response Formats & Validation Guide

This document describes the standardized response formats for all API endpoints in The Kidz Planet backend.

## Success Response Format

All successful API responses follow this structure:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* your data here */ },
  "timestamp": "2026-04-11T10:30:00.000Z"
}
```

### Example Success Responses

#### Single Resource (Product)
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": 1,
    "name": "Kids Toy",
    "price": 29.99,
    "stock": 100,
    "categoryId": 5
  },
  "timestamp": "2026-04-11T10:30:00.000Z"
}
```

#### Paginated List
```json
{
  "data": [
    { "id": 1, "name": "Product 1" },
    { "id": 2, "name": "Product 2" }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

#### Authentication
```json
{
  "message": "Login successful",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "customer": {
    "id": 1,
    "email": "customer@example.com",
    "name": "John Doe",
    "role": "customer"
  }
}
```

---

## Error Response Format

All error responses include:
- `success: false` - Indicates the request failed
- `statusCode` - HTTP status code
- `message` - Human-readable error message
- `error` - Error type/category
- `timestamp` - When the error occurred
- `path` - Request path that failed
- `errors` - Validation errors (if applicable)

### Common Error Responses

#### 400 - Bad Request (Validation Failed)
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "timestamp": "2026-04-11T10:30:00.000Z",
  "path": "/products",
  "errors": {
    "name": ["Product name is required", "Product name must not exceed 255 characters"],
    "price": ["Price must be a valid number", "Price must be a positive number"],
    "categoryId": ["Please select a valid category"]
  }
}
```

#### 401 - Unauthorized
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Invalid email or password",
  "error": "Unauthorized",
  "timestamp": "2026-04-11T10:30:00.000Z",
  "path": "/auth/login"
}
```

#### 403 - Forbidden
```json
{
  "success": false,
  "statusCode": 403,
  "message": "Access denied",
  "error": "Forbidden",
  "timestamp": "2026-04-11T10:30:00.000Z",
  "path": "/admin/dashboard"
}
```

#### 404 - Not Found
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Product with 999 not found",
  "error": "Not Found",
  "timestamp": "2026-04-11T10:30:00.000Z",
  "path": "/products/999"
}
```

#### 409 - Conflict (Duplicate)
```json
{
  "success": false,
  "statusCode": 409,
  "message": "Customer with email \"user@example.com\" already exists",
  "error": "Conflict",
  "timestamp": "2026-04-11T10:30:00.000Z",
  "path": "/auth/register"
}
```

#### 500 - Internal Server Error
```json
{
  "success": false,
  "statusCode": 500,
  "message": "Failed to create product: Database connection failed",
  "error": "Internal Server Error",
  "timestamp": "2026-04-11T10:30:00.000Z",
  "path": "/products"
}
```

---

## Validation Messages

All DTOs include comprehensive validation messages. Here are examples:

### Registration Validation
```typescript
{
  "name": "must be a string | is required | must be at least 2 characters | must not exceed 100 characters",
  "email": "must be a valid email address | is required",
  "phone": "must be a string | is required | must be a valid phone number | must be at least 10 characters",
  "password": "must be a string | is required | must be at least 6 characters | must not exceed 50 characters"
}
```

### Product Validation
```typescript
{
  "name": "must be a string | is required | must not exceed 255 characters",
  "description": "must be a string | is required",
  "price": "must be a valid number | must be a positive number",
  "categoryId": "must be a valid number | must select a valid category",
  "stock": "must be a valid number | cannot be negative",
  "status": "must be active, inactive, or discontinued"
}
```

### Order Validation
```typescript
{
  "customerId": "must be an integer | must be a positive number",
  "items": "must be an array | must not be empty",
  "items[].productId": "Product ID is required",
  "items[].quantity": "must be at least 1",
  "shippingAddress": "is required"
}
```

---

## Standard Success Messages

The API uses predefined success messages for consistency:

### Authentication
- `LOGIN_SUCCESS`: "Login successful"
- `LOGOUT_SUCCESS`: "Logout successful"
- `REGISTER_SUCCESS`: "Registration successful"
- `PASSWORD_CHANGED`: "Password changed successfully"

### Products
- `PRODUCT_CREATED`: "Product created successfully"
- `PRODUCT_UPDATED`: "Product updated successfully"
- `PRODUCT_DELETED`: "Product deleted successfully"
- `PRODUCTS_IMPORTED`: "Products imported successfully"

### Orders
- `ORDER_CREATED`: "Order created successfully"
- `ORDER_UPDATED`: "Order updated successfully"
- `ORDER_CANCELLED`: "Order cancelled successfully"
- `ORDER_STATUS_UPDATED`: "Order status updated successfully"

### Reviews
- `REVIEW_CREATED`: "Review submitted successfully"
- `REVIEW_UPDATED`: "Review updated successfully"
- `REVIEW_DELETED`: "Review deleted successfully"
- `REVIEW_APPROVED`: "Review approved successfully"

### Wishlist
- `ADDED_TO_WISHLIST`: "Product added to wishlist"
- `REMOVED_FROM_WISHLIST`: "Product removed from wishlist"

### Newsletter
- `SUBSCRIBED`: "Successfully subscribed to newsletter"
- `UNSUBSCRIBED`: "Successfully unsubscribed from newsletter"

---

## Frontend Integration Examples

### Handling Success Responses
```javascript
try {
  const response = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData)
  });
  
  const result = await response.json();
  
  if (result.success) {
    // Show success message
    showToast(result.message); // "Product created successfully"
    // Use the data
    console.log(result.data);
  }
} catch (error) {
  console.error('Request failed:', error);
}
```

### Handling Validation Errors
```javascript
try {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  
  const result = await response.json();
  
  if (!result.success && result.errors) {
    // Display validation errors next to form fields
    Object.keys(result.errors).forEach(field => {
      const errorMessages = result.errors[field];
      displayFieldError(field, errorMessages[0]);
    });
  }
} catch (error) {
  console.error('Request failed:', error);
}
```

### Handling Different Error Types
```javascript
async function handleApiResponse(response) {
  const result = await response.json();
  
  if (!result.success) {
    switch (result.statusCode) {
      case 400:
        // Validation error - show field errors
        return { type: 'validation', errors: result.errors };
      case 401:
        // Unauthorized - redirect to login
        window.location.href = '/login';
        break;
      case 403:
        // Forbidden - show access denied message
        showError('You do not have permission to perform this action');
        break;
      case 404:
        // Not found - show not found message
        showError(result.message);
        break;
      case 409:
        // Conflict - show duplicate error
        showError(result.message);
        break;
      case 500:
        // Server error - show generic error
        showError('An error occurred. Please try again later.');
        break;
      default:
        showError(result.message || 'An unexpected error occurred');
    }
  }
  
  return result;
}
```

---

## HTTP Status Codes Used

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST (resource created) |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation failed or invalid input |
| 401 | Unauthorized | Authentication failed |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate resource |
| 500 | Internal Server Error | Server-side error |

---

## Best Practices

1. **Always check the `success` field** to determine if the request succeeded
2. **Display `message` to users** - it's a human-readable description
3. **Use `errors` object** for field-level validation error display
4. **Log full error objects** for debugging in development
5. **Handle 401 errors globally** by redirecting to login
6. **Show user-friendly messages** for 500 errors without exposing technical details
7. **Use TypeScript interfaces** on the frontend to match response structures

---

## Utilities Available

### ResponseHelper (Backend)
Located at: `src/common/helpers/response.helper.ts`

```typescript
import { ResponseHelper } from '../common/helpers/response.helper';

// Use predefined messages
return {
  message: ResponseHelper.messages.PRODUCT_CREATED,
  ...productData
};

// Or create custom success response
return ResponseHelper.success(data, 'Custom success message');
```

### Custom Exceptions (Backend)
Located at: `src/common/exceptions/custom.exceptions.ts`

```typescript
// Throw specific exceptions with proper formatting
throw new ResourceNotFoundException('Product', id);
throw new DuplicateResourceException('Customer', 'email', email);
throw new AuthenticationException('Invalid credentials');
throw new BadRequestException('Invalid input', validationErrors);
```

---

## Testing Tips

1. **Test validation** by sending invalid data
2. **Test authentication** with valid/invalid tokens
3. **Test not found** scenarios with non-existent IDs
4. **Test conflicts** by creating duplicate resources
5. **Check response structure** matches the format above

Use tools like Postman or curl to test endpoints:

```bash
# Test validation error
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{"name":"","price":-5}'

# Expected: 400 with validation errors

# Test not found
curl http://localhost:3000/products/99999

# Expected: 404 with proper error message
```
