# Quick Fix: Seed Script Error

## Problem
Getting error: `Cannot find module 'tsconfig-paths/register'` when running `npm run seed`

## Solution

The seed script now requires the project to be **built first** before running.

### Run These Commands:

```bash
# 1. Build the project
npm run build

# 2. Run the seed script
npm run seed
```

That's it! The seed script will now run from the compiled JavaScript files in the `dist` folder.

---

## Why This Happens

The production seed script (`npm run seed`) runs compiled JavaScript from `dist/seed.js`, which doesn't require TypeScript dependencies like `tsconfig-paths`.

This is intentional because:
- ✅ Works in production without dev dependencies
- ✅ Faster execution
- ✅ Matches how the app runs in production (`npm run start:prod`)

## For Development

If you're developing and want to run the TypeScript source directly:

```bash
npm run seed:dev
```

This requires `ts-node` and `tsconfig-paths` to be installed (available in development).

## Deployment Workflow

Always build before seeding in production:

```bash
npm ci --only=production  # Install production dependencies
npm run build             # Compile TypeScript to JavaScript
npm run seed              # Seed database
npm run start:prod        # Start application
```

