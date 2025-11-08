# Arcadeverse - Deployment Guide

Your Google Arcade Points Calculator is now ready to deploy as a unified Next.js application with serverless API functions.

## What's Included

### API Routes (Serverless Functions)
- `/api/health` - Health check endpoint
- `/api/stats` - Get visitor and profile statistics
- `/api/stats/visitor` - Increment visitor count
- `/api/stats/profile-analyzed` - Increment profiles analyzed count
- `/api/leaderboard` - Get and update leaderboard rankings
- `/api/calculate-points` - Calculate points from Google Cloud profile URL
- `/api/test` - Test endpoint to verify API is working

### Utilities
- `lib/badge-utils.ts` - Badge classification and point calculation logic
- `lib/kv.ts` - Vercel KV (Redis) client for persistent storage

## Deployment Steps

### Option 1: Deploy with Vercel (Recommended)

1. **Push to GitHub**
   - Click the GitHub icon button in the top right of v0
   - Or manually push this code to your `AnniiGCP/Arcadeverse` repository

2. **Deploy to Vercel**
   - Click the "Publish" button in v0, OR
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel auto-detects Next.js and deploys

3. **Add Vercel KV Storage**
   - Go to your Vercel Dashboard
   - Navigate to Storage tab
   - Click "Create Database" → "KV"
   - Connect it to your project
   - Environment variables (`KV_REST_API_URL`, `KV_REST_API_TOKEN`) are added automatically

4. **Test Your Deployment**
   \`\`\`bash
   curl https://your-project.vercel.app/api/test
   \`\`\`

### Option 2: Merge with Existing Frontend

If you already have an Arcadeverse frontend:

1. **Copy API Routes**
   \`\`\`
   Copy app/api/* → Your Project/app/api/
   Copy lib/* → Your Project/lib/
   \`\`\`

2. **Update package.json**
   Add these dependencies:
   \`\`\`json
   {
     "axios": "^1.6.7",
     "cheerio": "^1.0.0",
     "@vercel/kv": "^3.0.0"
   }
   \`\`\`

3. **Update Your Frontend API Calls**
   \`\`\`typescript
   // Old (external server)
   fetch('https://your-render-app.onrender.com/api/calculate-points?...')
   
   // New (same deployment)
   fetch('/api/calculate-points?...')
   \`\`\`

4. **Deploy Together**
   - Push everything to GitHub
   - Deploy to Vercel
   - Add Vercel KV storage

## API Usage Examples

### Calculate Points
\`\`\`typescript
const response = await fetch('/api/calculate-points?profileUrl=https://www.cloudskillsboost.google/public_profiles/...')
const data = await response.json()
\`\`\`

### Get Leaderboard
\`\`\`typescript
const response = await fetch('/api/leaderboard')
const data = await response.json()
\`\`\`

### Update Leaderboard
\`\`\`typescript
const response = await fetch('/api/leaderboard', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'John Doe',
    profileUrl: 'https://...',
    totalPoints: 120,
    badges: { /* ... */ }
  })
})
\`\`\`

### Get Stats
\`\`\`typescript
const response = await fetch('/api/stats')
const data = await response.json()
// { visitors: 3730, profilesAnalyzed: 3361 }
\`\`\`

## Environment Variables

These are automatically added when you connect Vercel KV:
- `KV_REST_API_URL` - Your Vercel KV database URL
- `KV_REST_API_TOKEN` - Your Vercel KV authentication token

## Your Data

Initial stats are preserved:
- Visitors: 3730
- Profiles Analyzed: 3361

These values are automatically initialized in Vercel KV on first access.

## Support

- Check deployment status: `https://your-project.vercel.app/api/health`
- Test all endpoints: `https://your-project.vercel.app/api/test`
- For issues, check Vercel logs in your dashboard

## Next Steps

1. Deploy this project to Vercel
2. Set up Vercel KV storage
3. Update your frontend to use the new API endpoints
4. Your website and API functions are now unified in one deployment!
