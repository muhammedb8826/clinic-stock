# Database Seeding Guide

## Overview

The seed script populates your database with initial data including default users, categories, and sample data for testing.

## Important: Build Before Seeding

The seed script now runs from the compiled JavaScript files in the `dist` folder. You **must build** the project before running the seed command.

## Running the Seed Script

### For Production / After Build

```bash
# Step 1: Build the project
npm run build

# Step 2: Run the seed script
npm run seed
```

### For Development (with TypeScript)

If you're in development and have `ts-node` and `tsconfig-paths` installed as dev dependencies:

```bash
npm run seed:dev
```

This runs the TypeScript source directly without needing to build.

## Common Issues and Solutions

### Error: `Cannot find module 'tsconfig-paths/register'`

**Cause:** You're trying to run the TypeScript source directly, but dev dependencies aren't installed (common in production).

**Solution:** 
1. Build the project first: `npm run build`
2. Then run: `npm run seed`

### Error: `Cannot find module './dist/seed.js'`

**Cause:** The project hasn't been built yet.

**Solution:**
```bash
npm run build
npm run seed
```

### Error: Database connection issues

**Cause:** Environment variables not configured.

**Solution:** Ensure your `.env` file has correct database credentials:
```env
DB_HOST=localhost
DB_PORT=5432  # or 3306 for MySQL
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=clinic_stock
```

## What Gets Seeded?

The seed script creates:

1. **Default Admin User**
   - Username: `admin`
   - Password: `admin123`
   - Role: Admin

2. **Categories**
   - Sample medicine categories

3. **Sample Data** (optional)
   - Medicines
   - Suppliers
   - Initial inventory

## Production Deployment Checklist

When deploying to production:

1. ✅ Install dependencies: `npm ci --only=production`
2. ✅ Build the project: `npm run build`
3. ✅ Configure `.env` file with production database credentials
4. ✅ Run seed: `npm run seed`
5. ✅ Start application: `npm run start:prod`

## Alternative: Running Seed File Directly

If you need to run the compiled seed file directly:

```bash
# After building
node dist/seed.js
```

## Troubleshooting on Shared Hosting

If you're on shared hosting (like cPanel with Node.js selector):

1. Make sure you're in the correct directory
2. Use the Node.js version selector to set the correct version
3. Run build: `npm run build`
4. Run seed: `npm run seed`

If you still have issues, you can run directly:
```bash
node dist/seed.js
```

## Script Configuration

- `npm run seed` - Production mode (runs compiled JavaScript)
- `npm run seed:dev` - Development mode (runs TypeScript source)

## Notes

- The seed script is **idempotent** - it checks for existing data before inserting
- Running it multiple times won't create duplicates
- Default passwords should be changed after first login
- In production, consider using database migrations instead of seed scripts

