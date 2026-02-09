# 🥷 Shinobi Dashboard

A premium, dark-themed SaaS analytics dashboard for Shinobi Japanese language learning app. Built with Next.js 16, TypeScript, Tailwind CSS, and Framer Motion.

![Dashboard Preview](https://via.placeholder.com/1200x600/0a0a0f/6366f1?text=Shinobi+Dashboard)

## ✨ Features

### 📊 Dashboard Overview
- **KPI Cards** with real-time metrics:
  - Monthly Recurring Revenue (MRR)
  - Active Subscribers
  - Crash-Free Rate
  - Average App Rating
- **Trend indicators** showing month-over-month changes
- **Interactive charts** for revenue and user growth
- **Recent activity** summaries for reviews and errors

### 💰 Revenue Analytics
- **MRR Trends** - Track monthly recurring revenue over time
- **Subscriber Growth** - Monitor active subscription growth
- **Plan Breakdown** - Revenue distribution by subscription type (Monthly/Annual/Lifetime)
- Real-time integration with **RevenueCat API**

### ⭐ Reviews Management
- **Unified review feed** from App Store and Google Play
- **Rating distribution** with visual breakdown
- **Platform statistics** - iOS vs Android metrics
- **Review cards** with star ratings, user info, and app version
- Real-time integration with **App Store Connect** and **Google Play APIs**

### 🐛 Error Tracking
- **Sentry integration** for real-time error monitoring
- **Error severity levels** (error, warning, info)
- **Event counts** and affected user statistics
- **Quick navigation** to specific error details
- Real-time integration with **Sentry API**

### 🎨 Design Features
- **Dark mode only** - Premium dark theme with custom color palette
- **Smooth animations** - Framer Motion for page transitions and interactions
- **Responsive design** - Works on desktop, tablet, and mobile
- **Collapsible sidebar** - Adaptive navigation with expand/collapse
- **Mobile-friendly** - Touch-optimized with mobile menu
- **Skeleton loading states** - Graceful loading experience
- **Error handling** - Fallback to cached data with clear error banners

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 3
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **Animations**: Framer Motion
- **APIs**:
  - RevenueCat (subscription metrics)
  - Sentry (error tracking)
  - App Store Connect (iOS reviews)
  - Google Play (Android reviews)

## 📦 Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Add your API credentials to .env.local

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🔑 Environment Variables

```env
# RevenueCat
REVENUECAT_API_KEY=sk_...

# Sentry
SENTRY_TOKEN=sntryu_...
SENTRY_ORG=shinobi-japanese
SENTRY_PROJECT=shinobi-japanese-react-native

# App Store Connect
APPSTORE_KEY_ID=8VY82RZ6RY
APPSTORE_ISSUER_ID=aff10297-...
APPSTORE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."

# Google Play
GOOGLE_PLAY_PACKAGE=com.shinobiapp.shinobi
GOOGLE_APPLICATION_CREDENTIALS=/path/to/firebase-shinobi.json
```

## 📁 Project Structure

```
app/
├── api/                    # API routes
│   ├── revenue/           # RevenueCat integration
│   ├── reviews/           # App Store + Google Play
│   ├── sentry/            # Sentry error tracking
│   └── stats/             # Aggregated statistics
├── dashboard/             # Dashboard pages
│   ├── page.tsx           # Overview
│   ├── revenue/           # Revenue analytics
│   ├── reviews/           # Review management
│   └── errors/            # Error tracking
└── layout.tsx             # Root layout

components/
├── layout/                # Layout components
│   ├── sidebar.tsx        # Navigation sidebar
│   ├── header.tsx         # Top header
│   └── page-transition.tsx # Page animations
├── dashboard/             # Dashboard components
│   ├── kpi-cards.tsx      # Metric cards
│   ├── mrr-chart.tsx      # Revenue chart
│   ├── user-chart.tsx     # User growth chart
│   ├── reviews-summary.tsx # Recent reviews
│   └── errors-summary.tsx  # Top errors
├── revenue/               # Revenue components
│   ├── mrr-chart.tsx
│   ├── subscriber-chart.tsx
│   └── plan-breakdown.tsx
├── reviews/               # Review components
│   ├── review-card.tsx
│   └── platform-stats.tsx
└── errors/                # Error components
    └── error-list.tsx

lib/
├── api/                   # API clients
│   ├── revenuecat.ts
│   ├── sentry.ts
│   ├── appstore.ts
│   └── googleplay.ts
└── utils.ts               # Utility functions
```

## 🎨 Color Palette

```css
/* Dark Theme */
--background: #0a0a0f     /* Near black */
--card: #111118           /* Card background */
--border: #1e1e2e         /* Subtle borders */
--primary: #6366f1        /* Indigo accent */
--success: #22c55e        /* Green */
--warning: #f59e0b        /* Amber */
--error: #ef4444          /* Red */
--text-primary: #f1f5f9   /* White-ish */
--text-secondary: #94a3b8 /* Slate */
```

## 🔒 Security

- API keys stored in environment variables
- JWT authentication for App Store Connect
- Service account auth for Google Play
- No sensitive data in client-side code
- HTTPS-only in production

## 📈 Performance

- Server-side rendering for initial load
- Client-side data fetching for real-time updates
- Optimized bundle size
- Lazy loading for components
- Cached API responses with fallbacks

## 🚢 Deployment

Deployed on **Vercel** with automatic deployments from `master` branch:

```bash
# Manual deployment
vercel --prod

# View deployments
vercel ls shinobi-dashboard
```

## 📝 Development Checklist

- [x] Dark mode theme
- [x] Responsive layout (desktop, tablet, mobile)
- [x] TypeScript strict mode
- [x] API integrations (RevenueCat, Sentry, App Store, Google Play)
- [x] KPI cards with trends
- [x] Interactive charts
- [x] Review management
- [x] Error tracking
- [x] Page transitions
- [x] Loading states
- [x] Error handling
- [x] Mobile sidebar
- [x] Vercel deployment

## 🐛 Known Issues

- App Store Connect and Google Play APIs may return cached data during API downtime
- Rate limits apply to external APIs (check respective documentation)

## 📄 License

Private - All rights reserved

## 👤 Author

Built for Shinobi Japanese language learning app

---

**Last Updated**: February 2026
