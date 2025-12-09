# Vercel Deployment Guide for DreamCap

## Prerequisites
- GitHub account
- Vercel account (free tier works)
- Your code pushed to GitHub

## Step 1: Push to GitHub

Your code is ready! Just commit and push:

```bash
git add .
git commit -m "Add API-free AI support and Vercel deployment config"
git push origin clean-migration
```

## Step 2: Deploy to Vercel

### Option A: Using Vercel Dashboard (Easiest)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Add New Project"
3. Select your `dreamcap` repository
4. Vercel will auto-detect the settings
5. Click "Deploy"

### Option B: Using Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
```

## Step 3: Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

| Name | Value | Where to Use |
|------|-------|--------------|
| `GEMINI_API_KEY` | `AIzaSyDYh4uCoCzQhIEq4xVbFeQUdU37zgOP_RA` | Production |

> **Note**: The browser AI works without any API keys! Gemini is optional for better quality.

## Step 4: Database Setup for Vercel

⚠️ **Important**: SQLite doesn't work on Vercel's serverless environment.

You have **2 options**:

### Option A: Use Browser-Only Mode (Simplest)
- No backend needed
- All AI runs in browser (Transformers.js)
- No API keys needed
- Just deploy the frontend

To do this:
1. Update `vite.config.ts` to remove backend proxy
2. Comment out backend API calls
3. Deploy only the frontend

### Option B: Use Vercel Postgres (Recommended for Production)

1. In Vercel Dashboard:
   - Go to Storage → Create Database → Postgres
   - Copy connection string

2. Update `server/database.js`:
```javascript
// Replace SQLite with Postgres
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});
```

3. Add to Environment Variables:
   - `DATABASE_URL` = (your Vercel Postgres connection string)

## What's Deployed

- ✅ Frontend: Static site from `dist/`
- ✅ Backend API: Serverless functions from `server/`
- ✅ Browser AI: Works automatically (no setup needed)
- ⚠️ Database: Needs Postgres for production (or use browser-only mode)

## Testing After Deployment

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Try generating shots **without API key** (browser AI)
3. Optionally add Gemini key in settings for better quality

## Recommended: Browser-Only Deployment

Since you now have Transformers.js, I recommend deploying **frontend-only**:
- No database needed
- No backend needed  
- All AI runs in browser
- Completely free
- No cold starts

Want me to configure it for browser-only deployment?

## Troubleshooting

**Issue**: "Module not found" errors
- Run `npm install` in both root and `server/` directories

**Issue**: Database errors on Vercel
- Switch to Vercel Postgres or browser-only mode

**Issue**: Large bundle size warning
- This is normal - Transformers.js includes ONNX runtime
- Vercel handles it fine

## Current Configuration

The app is configured for:
- Hybrid deployment (frontend + serverless backend)
- Browser AI as default (no API needed)
- Optional Gemini fallback
- Auto-switching between providers
