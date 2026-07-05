# The Kidz Planet - Backend API

A comprehensive e-commerce backend powered by NestJS, TypeORM, and PostgreSQL.

## 🚀 Features

- ✅ **Product Management** - Full CRUD with CSV import/export
- ✅ **Category Management** - Organize products into categories
- ✅ **Order Management** - Track orders from creation to delivery
- ✅ **Customer Management** - Customer profiles and order history
- ✅ **Wishlist** - Customer wishlist functionality
- ✅ **Reviews & Testimonials** - Product reviews and customer testimonials
- ✅ **File Upload** - Image upload for products and categories
- ✅ **Inventory Management** - Stock tracking and alerts
- ✅ **Discount System** - Coupon codes and promotions
- ✅ **Dashboard Analytics** - Sales statistics and reports
- ✅ **Authentication** - JWT-based auth system
- ✅ **API Documentation** - Auto-generated Swagger docs

## 📋 Prerequisites

- **Node.js** >= 18.0.0
- **PostgreSQL** >= 14.0
- **npm** or **yarn**

## 🛠️ Installation

1. **Clone and navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
NODE_ENV=development
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=kidz_planet

# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRATION=7d

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
```

4. **Create PostgreSQL database:**
```bash
# Using psql
psql -U postgres
CREATE DATABASE kidz_planet;
\q
```

Or use pgAdmin or any PostgreSQL client.

5. **Start the application:**
```bash
# Development mode with hot-reload
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## 📚 API Documentation

Once the server is running, access:

- **Swagger UI:** http://localhost:3000/api
- **API Base URL:** http://localhost:3000

The Swagger documentation provides interactive testing for all endpoints.

## 📁 Project Structure

```
backend/
├── src/
│   ├── auth/              # Authentication module
│   ├── categories/        # Category management
│   ├── customers/         # Customer management
│   ├── dashboard/         # Analytics and statistics
│   ├── database/          # Database config and seeding
│   ├── discounts/         # Discount and coupon system
│   ├── inventory/         # Inventory management
│   ├── orders/            # Order management
│   ├── products/          # Product management
│   ├── reviews/           # Reviews and testimonials
│   ├── upload/            # File upload handling
│   ├── wishlist/          # Wishlist functionality
│   ├── common/            # Shared utilities
│   ├── app.module.ts      # Main application module
│   └── main.ts            # Application entry point
├── uploads/               # Uploaded files directory
├── .env                   # Environment variables
├── .env.example           # Environment template
├── package.json           # Dependencies
└── tsconfig.json          # TypeScript configuration
```

## 🔑 Key Endpoints

### Products
- `GET /products` - List all products (with pagination)
- `GET /products/:id` - Get product details
- `POST /products` - Create new product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product
- `GET /products/export/csv` - Export to CSV
- `POST /products/import/csv` - Import from CSV

### Categories
- `GET /categories` - List all categories
- `POST /categories` - Create category
- `PUT /categories/:id` - Update category
- `DELETE /categories/:id` - Delete category

### Orders
- `GET /orders` - List all orders
- `GET /orders/:id` - Get order details
- `POST /orders` - Create new order
- `PUT /orders/:id` - Update order status

### Wishlist
- `GET /wishlist/customer/:id` - Get customer wishlist
- `POST /wishlist` - Add to wishlist
- `DELETE /wishlist/:id` - Remove from wishlist

### Reviews
- `GET /reviews` - List all reviews
- `GET /reviews/testimonials` - Get testimonials
- `GET /reviews/product/:id` - Get product reviews
- `POST /reviews` - Create review
- `PATCH /reviews/:id/approve` - Approve review

### Upload
- `POST /upload/single` - Upload single file
- `POST /upload/multiple` - Upload multiple files

### Dashboard
- `GET /dashboard/stats` - Get dashboard statistics

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "name": "Admin"
  }
}
```

### Using the Token
Include the token in the Authorization header:
```
Authorization: Bearer <your-token>
```

## 💾 Database Schema

The application uses PostgreSQL with TypeORM. Key entities include:

- **Product** - Product information with pricing, stock, images
- **Category** - Product categories
- **Order** - Customer orders with line items
- **Customer** - Customer profiles
- **Wishlist** - Customer wishlist items
- **Review** - Product reviews and testimonials
- **Discount** - Coupon codes and promotions

## 📤 File Uploads

Files are stored in the `uploads/` directory with organized subdirectories:
- `uploads/products/` - Product images
- `uploads/categories/` - Category images

Access uploaded files at: `http://localhost:3000/uploads/...`

## 🔄 CSV Import/Export

### Exporting Products
```http
GET /products/export/csv
```
Downloads a CSV file with all products.

### Importing Products
```http
POST /products/import/csv
Content-Type: multipart/form-data

file: <your-csv-file>
```

**CSV Format:**
The system supports Shopify CSV format with columns:
- Handle, Title, Body (HTML), Variant Price, Variant Compare At Price
- Variant Inventory Qty, Image Src, Published, Status, etc.

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📦 Building for Production

```bash
# Build the application
npm run build

# Run production build
npm run start:prod
```

## 🔧 Configuration

### CORS
Configure allowed origins in `.env`:
```env
CORS_ORIGIN=http://localhost:5173,https://yourdomain.com
```

### File Upload Limits
```env
MAX_FILE_SIZE=5242880  # 5MB in bytes
```

### Database Synchronization
In production, set `synchronize: false` in `app.module.ts` and use migrations:
```typescript
TypeOrmModule.forRoot({
  // ...
  synchronize: false, // Disable auto-sync in production
  // ...
})
```

## 🚨 Error Handling

The API uses standard HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

Error responses follow this format:
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

## 📊 Performance Tips

1. **Database Indexing** - Add indexes for frequently queried fields
2. **Pagination** - Always use pagination for list endpoints
3. **Caching** - Implement Redis for frequently accessed data
4. **Image Optimization** - Compress images before upload
5. **Query Optimization** - Use TypeORM query builder for complex queries

## 🔄 API Versioning

Currently using v1. For future versions, use URL versioning:
```
/api/v1/products
/api/v2/products
```

## 🤝 Integration with Frontend

See [API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md) for detailed frontend integration instructions including:
- Axios setup
- Service layer examples
- React component integration
- Error handling patterns
- Best practices

## 📝 Scripts

```bash
# Development
npm run start:dev      # Start with hot-reload
npm run start:debug    # Start in debug mode

# Production
npm run build          # Build the project
npm run start:prod     # Run production build

# Code Quality
npm run format         # Format code with Prettier
npm run lint          # Lint code

# Testing
npm run test          # Run unit tests
npm run test:e2e      # Run end-to-end tests
npm run test:cov      # Generate coverage report
```

## 🐛 Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running: `sudo service postgresql status`
- Check database credentials in `.env`
- Ensure database exists: `psql -U postgres -l`

### Port Already in Use
Change the port in `.env`:
```env
PORT=3001
```

### Module Import Errors
Clear node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeORM Synchronization Issues
If tables aren't created, check:
1. Database connection in `.env`
2. `synchronize: true` in `app.module.ts` (development only)
3. Entity paths in TypeORM config

## 📮 Support

For issues or questions:
1. Check the [API Integration Guide](./API_INTEGRATION_GUIDE.md)
2. Review Swagger documentation at `/api`
3. Check existing issues in the repository
4. Contact the development team

## 📄 License

This project is licensed under the MIT License.

---

**Powered by:**
- NestJS
- TypeORM
- PostgreSQL
- Swagger/OpenAPI

**Last Updated:** February 28, 2026
