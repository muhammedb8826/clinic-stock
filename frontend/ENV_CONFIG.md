# Frontend Environment Configuration

## Quick Setup

Both `lib/api.ts` and `contexts/auth-context.tsx` now use the environment variable `NEXT_PUBLIC_API_URL`.

### For Development

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### For Production

Set the environment variable in your deployment platform:

```env
NEXT_PUBLIC_API_URL=https://wanofi-api.daminaa.org
```

## How It Works

Both files use the same pattern:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://wanofi-api.daminaa.org';
```

- **Development:** Set `NEXT_PUBLIC_API_URL=http://localhost:4000` in `.env.local`
- **Production:** Set `NEXT_PUBLIC_API_URL=https://wanofi-api.daminaa.org` (or leave empty to use default)

## Files Updated

✅ `lib/api.ts` - Already using environment variables
✅ `contexts/auth-context.tsx` - Now updated to use environment variables

## Notes

- The `NEXT_PUBLIC_` prefix is required for Next.js to expose the variable to the browser
- `.env.local` is for local development only (gitignored by default)
- Restart your dev server after changing environment variables
- The default fallback is set to your production URL: `https://wanofi-api.daminaa.org`

