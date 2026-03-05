# 🚀 Quick Start Guide - CekReput SEO Deployment

## ✅ What's Done

All SEO implementation is complete and the build passes successfully. You're ready to deploy!

---

## 🔧 Before You Deploy (5 Minutes)

### Step 1: Get Google Analytics ID (2 min)

1. Go to [Google Analytics](https://analytics.google.com/)
2. Sign in with your Google account
3. Click **Admin** → **Create Property**
4. Enter property name: "CekReput"
5. Copy your **Measurement ID** (format: `G-XXXXXXXXXX`)

### Step 2: Verify with Google Search Console (2 min)

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click **Add Property**
3. Enter your domain: `cekreput.com`
4. Choose **HTML tag** verification method
5. Copy the verification code

### Step 3: Update .env File (1 min)

Open `apps/web/.env` and update these values:

```bash
# Replace with your actual domain
VITE_SITE_URL=https://cekreput.com

# Paste your GA4 Measurement ID from Step 1
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Paste your verification code from Step 2
VITE_GOOGLE_SITE_VERIFICATION=your_actual_verification_code_here
```

### Optional: Update Social Media Links

Open `apps/web/src/pages/Home.tsx` and update lines 22-26:

```javascript
"sameAs": [
  "https://twitter.com/your_actual_username",
  "https://facebook.com/your_actual_page",
  "https://instagram.com/your_actual_username"
]
```

And update the support email on line 29:

```javascript
"email": "your_actual_support_email@cekreput.com"
```

---

## 📦 Deploy

### Build for Production

```bash
cd apps/web
npm run build
```

This will:
- Compile TypeScript
- Bundle and optimize assets
- Inject your environment variables
- Generate sitemap.xml automatically

### Deploy to Your Hosting

Upload the contents of the `dist/` folder to your hosting provider.

**Popular hosting options:**
- Vercel: `vercel deploy`
- Netlify: Drag & drop `dist/` folder
- Cloudflare Pages: Connect Git repo
- Traditional hosting: Upload via FTP

---

## 📊 After Deployment

### 1. Submit Sitemap to Google

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Select your property
3. Go to **Sitemaps** in the left menu
4. Enter `sitemap.xml` and click **Submit**

### 2. Submit to Bing

1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Add your site
3. Submit sitemap: `https://cekreput.com/sitemap.xml`

### 3. Verify Everything Works

- [ ] Site loads correctly
- [ ] Meta tags appear in page source
- [ ] Google Analytics is tracking (check Real-Time in GA4)
- [ ] Sitemap is accessible at `https://cekreput.com/sitemap.xml`
- [ ] robots.txt is accessible at `https://cekreput.com/robots.txt`

---

## 🧪 Test Your SEO

### Google Tools

- [Rich Results Test](https://search.google.com/test/rich-results) - Test structured data
- [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly) - Check mobile optimization
- [PageSpeed Insights](https://pagespeed.web.dev/) - Check performance

### What to Look For

✅ **Structured Data**: Organization and WebSite schemas detected  
✅ **Meta Tags**: Title, description, OG tags present  
✅ **Mobile**: Responsive design passes  
✅ **Performance**: Core Web Vitals in green  

---

## 📈 Monitor Performance

### Weekly Checks

- Google Search Console → **Coverage** (check for errors)
- Google Search Console → **Performance** (track clicks/impressions)
- Google Analytics → **Acquisition** (track traffic sources)

### Monthly Reviews

- Top search queries
- Click-through rates
- Bounce rates
- Page load times

---

## 🆘 Troubleshooting

### Build Fails

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Meta Tags Not Showing

- Check `.env` file exists and has correct values
- Rebuild: `npm run build`
- Clear browser cache and CDN cache

### Sitemap Not Found

- Ensure `public/sitemap.xml` is uploaded to your server
- Check file is accessible at `https://cekreput.com/sitemap.xml`

---

## 📞 Need Help?

- **Documentation**: See `SEO_IMPLEMENTATION.md` for technical details
- **Checklist**: See `DEPLOYMENT_CHECKLIST.md` for complete steps
- **Summary**: See `SEO_SUMMARY.md` for overview

---

**Last Updated:** March 4, 2026  
**Build Status:** ✅ Passing  
**Ready to Deploy:** Yes
