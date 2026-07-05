# Backend Setup Checklist

Follow these steps to set up and run the backend:

## ✅ Step 1: Install Dependencies

```bash
cd backend
npm install
```

**Expected outcome:** All packages installed successfully without errors.

---

## ✅ Step 2: Install PostgreSQL

### Windows:
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run the installer
3. Set a password for the `postgres` user (remember this!)
4. Default port: 5432

### Verify Installation:
```bash
psql --version
```

---

## ✅ Step 3: Create Database

### Method 1: Using psql
```bash
psql -U postgres
# Enter password when prompted
CREATE DATABASE kidz_planet;
\l  # List databases to verify
\q  # Quit
```

### Method 2: Using pgAdmin
1. Open pgAdmin
2. Right-click on "Databases"
3. Create > Database
4. Name: `kidz_planet`
5. Save

---

## ✅ Step 4: Configure Environment

1. Copy the example environment file:
```bash
copy .env.example .env
```

2. Edit `.env` file with your settings:
```env
NODE_ENV=development
PORT=3000

# Database - UPDATE THESE!
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD_HERE
DB_DATABASE=kidz_planet

# JWT - CHANGE IN PRODUCTION!
JWT_SECRET=your-very-secure-secret-key-change-this
JWT_EXPIRATION=7d

# CORS - Add your frontend URL
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
```

**Important:** 
- Replace `YOUR_POSTGRES_PASSWORD_HERE` with your actual PostgreSQL password
- Change `JWT_SECRET` to a strong random string in production

---

## ✅ Step 5: Start the Backend

```bash
npm run start:dev
```

**Expected output:**
```
🚀 Application is running on: http://localhost:3000
📚 Swagger API docs: http://localhost:3000/api
```

---

## ✅ Step 6: Verify Installation

### Test the API:
1. Open browser: http://localhost:3000
2. Check Swagger docs: http://localhost:3000/api
3. Try a test endpoint:
   ```bash
   curl http://localhost:3000/products
   ```

### Check Database Tables:
```bash
psql -U postgres -d kidz_planet
\dt  # List all tables
```

You should see tables: products, categories, customers, orders, etc.

---

## ✅ Step 7: Test with Sample Data (Optional)

The backend automatically creates a default admin user on startup.

To add sample products:
1. Go to Swagger docs: http://localhost:3000/api
2. Use the POST /products endpoint
3. Or import from CSV: POST /products/import/csv

---

## 🔧 Troubleshooting

### Problem: Database Connection Failed
**Solution:**
- Check PostgreSQL is running:
  ```bash
  # Windows (Command Prompt as Admin)
  sc query postgresql-x64-14
  
  # If not running:
  net start postgresql-x64-14
  ```
- Verify credentials in `.env`
- Check database exists: `psql -U postgres -l`

### Problem: Port 3000 Already in Use
**Solution:**
- Change port in `.env`: `PORT=3001`
- Or find and kill process using port 3000:
  ```bash
  # Windows
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  ```

### Problem: Module Not Found
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Problem: TypeORM Sync Issues
**Solution:**
- Ensure `synchronize: true` in `src/app.module.ts` (development only)
- Drop and recreate database:
  ```bash
  psql -U postgres
  DROP DATABASE kidz_planet;
  CREATE DATABASE kidz_planet;
  \q
  ```
- Restart the backend

### Problem: CORS Errors from Frontend
**Solution:**
- Add your frontend URL to `CORS_ORIGIN` in `.env`
- Restart the backend

---

## 📝 Next Steps

1. **Test the API:**
   - Use Swagger UI: http://localhost:3000/api
   - Use Postman or Insomnia
   - Or use curl/fetch from frontend

2. **Create Admin Account:**
   - Use POST /auth/register endpoint
   - Or check if default admin was created

3. **Import Products:**
   - Use CSV import: POST /products/import/csv
   - Or create manually via Swagger

4. **Integrate with Frontend:**
   - Copy `FRONTEND_SERVICE_EXAMPLE.js` to your frontend
   - Update API_BASE_URL
   - Start making API calls

5. **Read Documentation:**
   - [README.md](./README.md) - Backend overview
   - [API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md) - API endpoints
   - [FRONTEND_SERVICE_EXAMPLE.js](./FRONTEND_SERVICE_EXAMPLE.js) - Service examples

---

## 🚀 Production Deployment

When deploying to production:

1. **Update Environment Variables:**
   ```env
   NODE_ENV=production
   DB_HOST=your-production-db-host
   JWT_SECRET=very-strong-random-string
   CORS_ORIGIN=https://yourdomain.com
   ```

2. **Disable Auto-Sync:**
   In `src/app.module.ts`:
   ```typescript
   synchronize: false, // IMPORTANT FOR PRODUCTION!
   ```

3. **Build and Run:**
   ```bash
   npm run build
   npm run start:prod
   ```

4. **Use Environment-Based Configuration:**
   - Database: Use managed PostgreSQL (AWS RDS, Azure, etc.)
   - Files: Use cloud storage (S3, Azure Blob)
   - Logs: Implement proper logging
   - Monitoring: Add health checks and monitoring

---

## 📞 Support

If you encounter issues:
1. Check this checklist carefully
2. Review error messages
3. Check the [README.md](./README.md)
4. Check Swagger docs for endpoint details
5. Contact the development team

---

**Last Updated:** February 28, 2026
