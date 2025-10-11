# Deploying to Vercel

## Quick Start

1. **Push your code to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account
   - Click "Add New Project"
   - Import your `clinic-stock` repository
   - Set the **Root Directory** to `frontend`
   - Configure environment variables (see below)
   - Click "Deploy"

## Environment Variables

Add these in Vercel Project Settings → Environment Variables:

### Required Variables

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend-api.com` | Your backend API URL (e.g., `https://pms.muhdev.com/api` or wherever your NestJS API is hosted) |

### Optional Variables

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `NODE_ENV` | `production` | Environment mode (auto-set by Vercel) |

## Vercel Configuration

The project is configured to:
- Use Next.js 15.5.2
- Build from the `frontend` directory
- Automatically optimize for production
- Support Turbopack (Vercel's infrastructure handles it properly)

## Post-Deployment Steps

1. **Update API CORS settings** - Add your Vercel domain to your backend's CORS allowed origins:
   ```typescript
   // In your NestJS backend (api/src/main.ts)
   app.enableCors({
     origin: [
       'http://localhost:3000',
       'https://your-vercel-app.vercel.app',
       'https://your-custom-domain.com'
     ],
     credentials: true,
   });
   ```

2. **Test the deployment** - Visit your Vercel URL and ensure:
   - ✅ App loads correctly
   - ✅ API calls work (check Network tab in DevTools)
   - ✅ Authentication works
   - ✅ All pages are accessible

3. **Add a custom domain** (optional)
   - Go to Vercel Project Settings → Domains
   - Add your custom domain
   - Update DNS records as instructed

## Troubleshooting

### API Connection Issues
- Verify `NEXT_PUBLIC_API_URL` is set correctly in Vercel
- Check backend CORS configuration includes your Vercel domain
- Ensure backend API is accessible from the internet

### Build Failures
- Check the build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- TypeScript errors will fail the build by default

### Environment Variables Not Working
- Environment variables must start with `NEXT_PUBLIC_` to be accessible in the browser
- Redeploy after changing environment variables

## Local Development

To test locally with production-like environment:

```bash
cd frontend
npm install
npm run dev
```

Set local environment variable (create `.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Build Commands (Auto-configured)

- **Build Command**: `npm run build` (or `cd frontend && npm run build`)
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

## Performance

Vercel automatically provides:
- ✅ Global CDN
- ✅ Automatic HTTPS
- ✅ Image optimization
- ✅ Edge caching
- ✅ Automatic preview deployments for PRs

## Support

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs

