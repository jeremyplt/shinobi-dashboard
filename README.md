# Shinobi Japanese - Performance Monitoring Dashboard

**Live Monitoring Dashboard** for Shinobi Japanese app metrics.

## 📊 Features

### Quick Stats (Top Row)
- **MRR** - Monthly Recurring Revenue
- **Active Users** - Weekly active users
- **Crash-Free Rate** - Last 7 days stability
- **Avg Rating** - Combined Play Store + App Store

### Widgets

1. **RevenueCat Metrics** 💵
   - MRR (current + goal)
   - Subscribers count
   - Churn rate
   - LTV (Lifetime Value)

2. **Sentry Errors** 🐛
   - Top 3 unresolved errors
   - Event counts
   - Affected users
   - Last seen timestamps
   - Direct links to Sentry

3. **Google Play Reviews** 🤖
   - Recent reviews
   - Ratings + version + device
   - Quick insights

4. **App Store Reviews** 🍎
   - Recent reviews
   - Ratings + version + device
   - Quick insights

## 🚀 Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📡 Data Sources (Currently Mock)

**To connect real data:**

1. **Sentry API**
   ```typescript
   // Add to components/SentryWidget.tsx
   const SENTRY_TOKEN = process.env.SENTRY_TOKEN;
   const response = await fetch(
     'https://sentry.io/api/0/projects/shinobi-japanese/shinobi-japanese-react-native/issues/?query=is:unresolved',
     { headers: { Authorization: `Bearer ${SENTRY_TOKEN}` } }
   );
   ```

2. **RevenueCat API**
   ```typescript
   // Add to components/RevenueCatWidget.tsx
   const REVENUECAT_KEY = process.env.REVENUECAT_SECRET_KEY;
   const response = await fetch(
     'https://api.revenuecat.com/v1/subscribers',
     { headers: { Authorization: `Bearer ${REVENUECAT_KEY}` } }
   );
   ```

3. **Google Play Console API**
   ```typescript
   // Use service account credentials
   // See: skills/googleplay/SKILL.md
   ```

4. **App Store Connect API**
   ```typescript
   // Use JWT authentication
   // See: skills/appstore/SKILL.md
   ```

## 🔐 Environment Variables

Create `.env.local`:

```bash
SENTRY_TOKEN=your_token
REVENUECAT_SECRET_KEY=your_key
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
APPSTORE_ISSUER_ID=your_issuer_id
APPSTORE_KEY_ID=your_key_id
APPSTORE_PRIVATE_KEY=your_private_key
```

## 📦 Deployment

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Option 2: Docker

```bash
# Build Docker image
docker build -t shinobi-dashboard .

# Run container
docker run -p 3000:3000 shinobi-dashboard
```

### Option 3: Self-Hosted

```bash
# Build
npm run build

# Start with PM2
pm2 start npm --name "shinobi-dashboard" -- start
```

## 🎨 Customization

### Update Metrics

Edit `components/QuickStats.tsx` to add/remove metrics.

### Add New Widgets

1. Create component in `components/`
2. Import in `app/page.tsx`
3. Add to grid

Example:
```typescript
// components/FirebaseWidget.tsx
export default function FirebaseWidget() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2>Firebase Performance</h2>
      {/* Your content */}
    </div>
  );
}
```

## 📊 Future Enhancements

- [ ] Real-time data (WebSockets)
- [ ] Historical charts (Chart.js)
- [ ] Alerts/notifications
- [ ] User authentication
- [ ] Custom date ranges
- [ ] Export reports (PDF/CSV)
- [ ] Dark mode
- [ ] Mobile responsive improvements

## 🆘 Troubleshooting

**Build fails with TypeScript errors:**
```bash
rm -rf .next
npm run build
```

**Components not updating:**
```bash
rm -rf .next
npm run dev
```

**API rate limits:**
- Implement caching (Redis/Upstash)
- Add request throttling

---

**Created:** 2026-02-05  
**Status:** ✅ Production-ready (with mock data)  
**Tech Stack:** Next.js 16 + TypeScript + Tailwind CSS  
**Deployment:** Ready for Vercel
