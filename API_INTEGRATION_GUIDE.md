# The Kidz Planet - Backend API Integration Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [API Base URL](#api-base-url)
3. [Authentication](#authentication)
4. [API Endpoints](#api-endpoints)
5. [Frontend Integration](#frontend-integration)
6. [Error Handling](#error-handling)

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)
- npm or yarn

### Installation

```bash
cd backend
npm install
```

### Environment Setup

Create a `.env` file based on `.env.example`:

```env
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=kidz_planet

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRATION=7d

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:5174

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DESTINATION=./uploads
```

### Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`  
Swagger documentation: `http://localhost:3000/api`

---

## API Base URL

**Development:** `http://localhost:3000`  
**Production:** Your deployed backend URL

---

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Login/Register
```http
POST /auth/login
POST /auth/register
```

---

## API Endpoints

### 🛍️ Products

#### Get All Products (with pagination & filters)
```http
GET /products?page=1&limit=10&category=1&search=toy&status=active
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `category` (number): Filter by category ID
- `search` (string): Search in product names
- `status` (string): Filter by status (active/draft/inactive)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "ANTI-GRAVITY ADVENTURE RAIL TRACK TOY",
      "description": "Amazing toy...",
      "price": 3949.00,
      "originalPrice": 5140.00,
      "sku": "TOY-001",
      "badge": "SALE",
      "rating": 4.8,
      "reviewCount": 24,
      "discount": 23,
      "inStock": true,
      "stock": 50,
      "images": ["/uploads/products/image1.jpg"],
      "category": {
        "id": 2,
        "name": "Toys"
      },
      "isFeatured": true,
      "isBestSeller": true
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

#### Get Single Product
```http
GET /products/:id
```

#### Create Product
```http
POST /products
Content-Type: application/json

{
  "name": "Product Name",
  "description": "Product description",
  "price": 1999.00,
  "originalPrice": 2999.00,
  "categoryId": 2,
  "stock": 50,
  "images": ["/uploads/products/image.jpg"],
  "sku": "TOY-001",
  "badge": "SALE",
  "discount": 30,
  "isFeatured": false,
  "isBestSeller": false
}
```

#### Update Product
```http
PUT /products/:id
```

#### Delete Product
```http
DELETE /products/:id
```

#### Export Products to CSV
```http
GET /products/export/csv
```

#### Import Products from CSV
```http
POST /products/import/csv
Content-Type: multipart/form-data

file: <csv-file>
```

---

### 📂 Categories

#### Get All Categories
```http
GET /categories?page=1&limit=10
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Baby Care",
      "description": "Everything for your baby",
      "slug": "baby-care",
      "image": "/uploads/categories/baby-care.jpg"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 8,
    "totalPages": 1
  }
}
```

#### Get Single Category
```http
GET /categories/:id
```

#### Create Category
```http
POST /categories
{
  "name": "Category Name",
  "description": "Category description",
  "slug": "category-name",
  "image": "/uploads/categories/image.jpg"
}
```

#### Update Category
```http
PUT /categories/:id
```

#### Delete Category
```http
DELETE /categories/:id
```

---

### 🛒 Orders

#### Get All Orders
```http
GET /orders?page=1&limit=10&status=pending
```

#### Get Single Order
```http
GET /orders/:id
```

#### Create Order
```http
POST /orders
{
  "customerId": 1,
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "0300-1234567",
  "shippingAddress": "123 Street, City",
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "price": 1999.00
    }
  ],
  "subtotal": 3998.00,
  "discount": 0,
  "shippingCost": 200.00,
  "total": 4198.00,
  "notes": "Please deliver after 5 PM"
}
```

#### Update Order Status
```http
PUT /orders/:id
{
  "status": "confirmed" // pending, confirmed, processing, shipped, delivered, cancelled
}
```

---

### 👥 Customers

#### Get All Customers
```http
GET /customers?page=1&limit=10
```

#### Get Single Customer
```http
GET /customers/:id
```

#### Create Customer
```http
POST /customers
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "0300-1234567",
  "city": "Lahore",
  "address": "123 Street"
}
```

#### Update Customer
```http
PUT /customers/:id
```

---

### ❤️ Wishlist

#### Get Customer Wishlist
```http
GET /wishlist/customer/:customerId
```

**Response:**
```json
[
  {
    "id": 1,
    "customerId": 1,
    "productId": 5,
    "product": {
      "id": 5,
      "name": "Product Name",
      "price": 1999.00,
      "images": ["/uploads/products/image.jpg"]
    },
    "createdAt": "2026-02-28T10:00:00.000Z"
  }
]
```

#### Add to Wishlist
```http
POST /wishlist
{
  "customerId": 1,
  "productId": 5
}
```

#### Remove from Wishlist (by ID)
```http
DELETE /wishlist/:id
```

#### Remove from Wishlist (by product)
```http
DELETE /wishlist/customer/:customerId/product/:productId
```

#### Clear Wishlist
```http
DELETE /wishlist/customer/:customerId/clear
```

---

### ⭐ Reviews & Testimonials

#### Get All Reviews
```http
GET /reviews?page=1&limit=10&productId=5&isApproved=true
```

#### Get Product Reviews
```http
GET /reviews/product/:productId?approved=true
```

#### Get Product Rating
```http
GET /reviews/product/:productId/rating
```

**Response:**
```json
{
  "average": 4.5,
  "count": 24
}
```

#### Get Testimonials
```http
GET /reviews/testimonials?approved=true
```

**Response:**
```json
[
  {
    "id": 1,
    "customerName": "AMNA, GUJRANWALA",
    "text": "The toys we ordered exceeded our expectations!",
    "rating": 5.0,
    "isTestimonial": true,
    "isApproved": true
  }
]
```

#### Create Review
```http
POST /reviews
{
  "productId": 5,
  "customerId": 1,
  "customerName": "John Doe",
  "customerLocation": "Lahore",
  "text": "Great product! My kids love it.",
  "rating": 5,
  "isTestimonial": false
}
```

#### Approve Review
```http
PATCH /reviews/:id/approve
```

#### Update Review
```http
PUT /reviews/:id
```

#### Delete Review
```http
DELETE /reviews/:id
```

---

### 📤 File Upload

#### Upload Single Image
```http
POST /upload/single
Content-Type: multipart/form-data

file: <image-file>
folder: "products" // or "categories"
```

**Response:**
```json
{
  "url": "/uploads/products/1709110800000-abc123.jpg"
}
```

#### Upload Multiple Images
```http
POST /upload/multiple
Content-Type: multipart/form-data

files: [<image-file1>, <image-file2>]
folder: "products"
```

**Response:**
```json
{
  "urls": [
    "/uploads/products/image1.jpg",
    "/uploads/products/image2.jpg"
  ]
}
```

---

### 💰 Discounts

#### Get All Discounts
```http
GET /discounts
```

#### Create Discount
```http
POST /discounts
{
  "code": "SAVE20",
  "type": "percentage",
  "value": 20,
  "minPurchase": 1000,
  "validFrom": "2026-03-01",
  "validTo": "2026-03-31"
}
```

---

### 📊 Dashboard Statistics

#### Get Dashboard Stats
```http
GET /dashboard/stats
```

**Response:**
```json
{
  "totalRevenue": 125000,
  "totalOrders": 458,
  "totalCustomers": 234,
  "totalProducts": 120,
  "recentOrders": [...],
  "topProducts": [...],
  "salesByMonth": [...]
}
```

---

## Frontend Integration

### Setting up Axios

Create an API client in your frontend:

```javascript
// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Example: Fetching Products

```javascript
// src/services/productService.js
import api from './api';

export const productService = {
  // Get all products
  getAll: async (params) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  // Get single product
  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Create product
  create: async (data) => {
    const response = await api.post('/products', data);
    return response.data;
  },

  // Update product
  update: async (id, data) => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  // Delete product
  delete: async (id) => {
    await api.delete(`/products/${id}`);
  },
};
```

### Example: Using in React Component

```jsx
// src/pages/Products.jsx
import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 12 });

  useEffect(() => {
    fetchProducts();
  }, [pagination.page]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getAll(pagination);
      setProducts(response.data);
      setPagination(prev => ({ ...prev, total: response.meta.total }));
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
```

### Example: Wishlist Integration

```javascript
// src/services/wishlistService.js
import api from './api';

export const wishlistService = {
  getByCustomer: async (customerId) => {
    const response = await api.get(`/wishlist/customer/${customerId}`);
    return response.data;
  },

  add: async (customerId, productId) => {
    const response = await api.post('/wishlist', { customerId, productId });
    return response.data;
  },

  remove: async (customerId, productId) => {
    await api.delete(`/wishlist/customer/${customerId}/product/${productId}`);
  },
};
```

### Example: File Upload

```javascript
// src/services/uploadService.js
import api from './api';

export const uploadService = {
  uploadSingle: async (file, folder = 'products') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await api.post('/upload/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    
    return response.data.url;
  },

  uploadMultiple: async (files, folder = 'products') => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('folder', folder);

    const response = await api.post('/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    
    return response.data.urls;
  },
};
```

---

## Error Handling

The API returns errors in the following format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

### Frontend Error Handling

```javascript
try {
  const response = await productService.getAll();
  // Handle success
} catch (error) {
  if (error.response) {
    // Server responded with error
    console.error('Error:', error.response.data.message);
    
    switch (error.response.status) {
      case 401:
        // Redirect to login
        break;
      case 404:
        // Show not found message
        break;
      default:
        // Show generic error
    }
  } else if (error.request) {
    // Request made but no response
    console.error('Network error');
  } else {
    // Something else happened
    console.error('Error:', error.message);
  }
}
```

---

## Data Schema Examples

### Product Object
```typescript
{
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  sku?: string;
  badge?: string;
  rating: number;
  reviewCount: number;
  discount: number;
  inStock: boolean;
  stock: number;
  images: string[];
  categoryId: number;
  category: Category;
  status: 'active' | 'draft' | 'inactive';
  isFeatured: boolean;
  isBestSeller: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Category Object
```typescript
{
  id: number;
  name: string;
  description?: string;
  slug: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Order Object
```typescript
{
  id: number;
  orderNumber: string;
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  notes?: string;
  orderDate: Date;
  updatedAt: Date;
}
```

---

## Best Practices

1. **Always use pagination** for list endpoints to avoid performance issues
2. **Cache frequently accessed data** (categories, featured products)
3. **Implement debouncing** for search functionality
4. **Handle loading states** properly in the UI
5. **Validate data** on both frontend and backend
6. **Use environment variables** for API URLs
7. **Implement proper error boundaries** in React
8. **Add retry logic** for failed requests
9. **Compress images** before uploading
10. **Use optimistic UI updates** for better UX

---

## Support

For issues or questions:
- Check the Swagger documentation at `/api`
- Review the source code in the backend repository
- Contact the development team

---

**Last Updated:** February 28, 2026  
**API Version:** 1.0.0
