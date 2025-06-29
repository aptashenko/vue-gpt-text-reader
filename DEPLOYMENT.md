# 🚀 MVP Deployment Guide

## Quick Deploy Options

### 1. Vercel (Recommended) ⭐

**Setup:**
1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel --prod`

**Environment Variables (set in Vercel dashboard):**
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
VITE_OPENAI_API_KEY=your_openai_api_key
```

**Benefits:**
- ✅ Free tier (100GB bandwidth/month)
- ✅ Automatic deployments
- ✅ Custom domain support
- ✅ SSL certificate included
- ✅ Global CDN

### 2. Netlify (Alternative)

**Setup:**
1. Install Netlify CLI: `npm i -g netlify-cli`
2. Login: `netlify login`
3. Deploy: `netlify deploy --prod`

**Benefits:**
- ✅ Free tier (100GB bandwidth/month)
- ✅ Form handling included
- ✅ Easy custom domains

### 3. GitHub Pages (Free)

**Setup:**
1. Add to package.json:
```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

2. Install: `npm install --save-dev gh-pages`
3. Deploy: `npm run deploy`

**Benefits:**
- ✅ Completely free
- ✅ Integrated with GitHub
- ❌ Limited features

## Pre-Deployment Checklist

### 1. Environment Variables
Create `.env.production` file:
```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_production_supabase_service_key
VITE_OPENAI_API_KEY=your_openai_api_key
```

### 2. Build Test
```bash
npm run build
npm run preview
```

### 3. Database Setup
- Ensure Supabase is properly configured
- Run all SQL scripts in Supabase SQL Editor
- Test admin access

### 4. Security
- ✅ Environment variables are secure
- ✅ RLS policies are active
- ✅ API keys are production-ready

## Deployment Steps

### Vercel (Recommended)

1. **Prepare your code:**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Deploy:**
```bash
vercel --prod
```

3. **Set environment variables in Vercel dashboard:**
   - Go to your project settings
   - Add all VITE_* variables
   - Redeploy if needed

4. **Custom domain (optional):**
   - Add domain in Vercel dashboard
   - Update DNS records

### Netlify Alternative

1. **Deploy:**
```bash
netlify deploy --prod
```

2. **Set environment variables:**
   - Go to Site settings > Environment variables
   - Add all VITE_* variables

## Post-Deployment

### 1. Testing
- ✅ Test user registration/login
- ✅ Test text import (admin)
- ✅ Test language switching
- ✅ Test feedback system
- ✅ Test mobile responsiveness

### 2. Monitoring
- Set up error tracking (Sentry)
- Monitor Supabase usage
- Track OpenAI API usage

### 3. SEO
- Add meta tags
- Submit to search engines
- Set up Google Analytics

## Cost Estimation (Monthly)

### Vercel (Free Tier)
- **Hosting**: $0 (100GB bandwidth)
- **Custom Domain**: $0
- **SSL**: $0

### Supabase (Free Tier)
- **Database**: $0 (500MB, 50,000 rows)
- **Auth**: $0 (50,000 users)
- **Storage**: $0 (1GB)

### OpenAI
- **API Calls**: ~$5-20/month (depending on usage)

### Total: ~$5-20/month for MVP

## Scaling Considerations

### When to upgrade:
- **Vercel**: >100GB bandwidth/month
- **Supabase**: >500MB database or >50,000 users
- **OpenAI**: High usage patterns

### Performance optimization:
- Enable Supabase caching
- Optimize OpenAI prompts
- Implement CDN for assets

## Troubleshooting

### Common Issues:
1. **Environment variables not working**: Check VITE_ prefix
2. **Build fails**: Check Node.js version compatibility
3. **Database errors**: Verify Supabase connection
4. **CORS issues**: Check Supabase RLS policies

### Support:
- Vercel: Excellent documentation and support
- Supabase: Active community and Discord
- OpenAI: API documentation and support 