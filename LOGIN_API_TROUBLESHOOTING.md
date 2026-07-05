# Login API Network Error - Troubleshooting Guide

## Issue Summary
Network error when calling login API from portal

## Root Causes Identified

### 1. **Port Conflict (EADDRINUSE)**
The server was unable to start because port 3000 was already in use by another process.

**Solution:** Kill existing processes on port 3000 before starting the dev server.

```powershell
# Find processes using port 3000
Get-NetTCPConnection -LocalPort 3000

# Kill the process (replace PID with actual process ID)
Stop-Process -Id <PID> -Force
```

### 2. **Incorrect Admin Credentials**  
The seeded admin email has a typo: `admin@thekidzplannet.com` (note: "plannet" with double 'n')

**Correct Login Credentials:**
- **Email:** `admin@thekidzplannet.com`
- **Password:** `admin123`
- **Portal:** `admin`

### 3. **Code Syntax Errors**
There were syntax errors in the products.service.ts that prevented successful compilation:
- Misplaced logger statement in update method

**Fixed:** All syntax errors have been corrected.

## How to Start the Server Correctly

1. **Kill any existing Node.js processes on port 3000:**
```powershell
Get-NetTCPConnection -LocalPort 3000 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

2. **Start the development server:**
```powershell
npm run start:dev
```

3. **Wait for the server to fully start** (you should see):
```
🚀 Application is running on: http://localhost:3000
📚 Swagger API docs: http://localhost:3000/api
```

## Testing the Login API

### Using PowerShell:
```powershell
$body = @{
    email = 'admin@thekidzplannet.com'
    password = 'admin123'
    portal = 'admin'
} | ConvertTo-Json

$response = Invoke-RestMethod `
    -Uri 'http://localhost:3000/auth/login' `
    -Method Post `
    -Body $body `
    -ContentType 'application/json'

$response | ConvertTo-Json -Depth 5
```

### Using cURL (if available):
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@thekidzplannet.com",
    "password": "admin123",
    "portal": "admin"
  }'
```

### Using JavaScript/Frontend:
```javascript
const loginData = {
  email: 'admin@thekidzplannet.com',
  password: 'admin123',
  portal: 'admin'
};

try {
  const response = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(loginData)
  });
  
  const result = await response.json();
  
  if (result.message === 'Login successful') {
    console.log('Token:', result.access_token);
    console.log('User:', result.customer);
  }
} catch (error) {
  console.error('Network error:', error);
}
```

## Expected Success Response

When login is successful, you'll receive:

```json
{
  "message": "Login successful",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "customer": {
    "id": 1,
    "name": "Admin",
    "email": "admin@thekidzplannet.com",
    "phone": "+1234567890",
    "role": "admin",
    "city": "Admin City",
    "address": "Admin Address",
    "joinedDate": "2026-04-11T10:00:00.000Z"
  }
}
```

## Common Errors & Solutions

### ❌ "Unable to connect to the remote server"
**Cause:** Server is not running or port 3000 is not listening.  
**Solution:** Ensure the dev server is started and running without errors.

### ❌ `{"success":false,"statusCode":401,"message":"Invalid email or password"}`
**Cause:** Wrong credentials provided.  
**Solution:** Use the correct credentials: `admin@thekidzplannet.com` / `admin123`

### ❌ "Error: listen EADDRINUSE: address already in use :::3000"
**Cause:** Another process is using port 3000.  
**Solution:** Kill the process and restart the server.

### ❌ CORS Error
**Cause:** Frontend origin not allowed.  
**Solution:** Add your frontend URL to CORS_ORIGIN in .env file:
```
CORS_ORIGIN=http://localhost:5173,http://localhost:5174,...
```

## Environment Variables Check

Make sure your `.env` file has:

```env
# Development Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=kidz_planet

# JWT
JWT_SECRET=kidz-planet-secret-key-2026
JWT_EXPIRATION=7d

# Server
PORT=3000

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
```

## Database Connection

Ensure PostgreSQL is running and the database exists:

```powershell
# Check if PostgreSQL service is running
Get-Service -Name postgresql*

# Connect to PostgreSQL
psql -U postgres

# Check if database exists
\l

# If database doesn't exist, create it
CREATE DATABASE kidz_planet;
```

## Verification Checklist

✅ PostgreSQL service is running  
✅ Database `kidz_planet` exists  
✅ No processes using port 3000  
✅ Dev server started successfully  
✅ No compilation errors  
✅ Using correct admin credentials  
✅ CORS configured for your frontend URL  

## API Doc & Testing

- **Swagger UI:** http://localhost:3000/api
- Test all endpoints interactively
- View request/response schemas
- See validation requirements

## Support

If you continue to experience issues:

1. Check server logs in the terminal
2. Verify database connection in logs
3. Test with Swagger UI at http://localhost:3000/api  
4. Check browser console for CORS errors
5. Ensure you're using the standardized response format

## Response Format

All API responses now follow this format:

**Success:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {...},
  "timestamp": "2026-04-11T10:30:00.000Z"
}
```

**Error:**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error message",
  "error": "Error Type",
  "timestamp": "2026-04-11T10:30:00.000Z",
  "path": "/api/endpoint"
}
```
