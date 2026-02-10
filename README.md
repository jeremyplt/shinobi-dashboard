# 🥷 Shinobi Dashboard

A comprehensive analytics and management dashboard for **Shinobi Japanese** — a Japanese language learning app.

**Live:** [shinobi-dashboard-jeremyplts-projects.vercel.app](https://shinobi-dashboard-jeremyplts-projects.vercel.app)

## Features

### 📊 Dashboard Overview
- KPI cards: MRR, subscribers, total users, crash-free rate, average rating
- MRR goal progress widget ($30k target)
- Revenue history chart (from Firestore events)
- User growth chart
- Error/crash rate trends
- Recent reviews and errors summary

### 📈 Analytics (PostHog)
- DAU / WAU / MAU with trend charts
- User retention (D1, D7, D30)
- Session stats (count, avg duration, per user)
- Top events table

### ⭐ Reviews
- Centralized App Store + Google Play reviews
- **Reply to reviews** directly from dashboard
- AI-suggested reply templates
- Sentiment analysis (Positive/Negative/Critical/Mixed)
- Search, filter by platform/rating, sort

### 💰 Revenue (RevenueCat)
- MRR, ARR, ARPU
- MRR goal progress with animated bar
- Historical revenue from Firestore events
- Subscription activity (new, renewals, churns)
- 90-day summary

### 🐛 Errors (Sentry)
- Unresolved issues with Sentry links
- Error event trends (90d)
- Android crash-free rate
- ANR rate monitoring
- Impact-based coloring

### ⚙️ Settings
- API health monitoring for all 7 services
- Latency tracking
- Environment info

### 📱 Mobile
- Responsive design
- Bottom tab navigation on mobile
- Collapsible sidebar on desktop

## Tech Stack

- **Framework:** Next.js 16 + React 19
- **Styling:** Tailwind CSS 3 + shadcn/ui
- **Charts:** Recharts
- **Animations:** Framer Motion
- **Database:** Neon PostgreSQL (daily snapshots)
- **Deployment:** Vercel

## Data Sources

| Service | Purpose |
|---------|---------|
| RevenueCat | MRR, subscribers, revenue, trials |
| PostHog | DAU/MAU, retention, sessions, events |
| Sentry | Errors, crashes, ANR rates |
| Firebase/Firestore | Users, revenue events |
| App Store Connect | iOS reviews + replies |
| Google Play Console | Android reviews + replies |
| Neon Postgres | Historical metric snapshots |

## Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in API keys

# Run development server
npm run dev
```

## Environment Variables

Required in `.env.local` (and Vercel):

```
# RevenueCat
REVENUECAT_API_KEY=

# Sentry
SENTRY_TOKEN=
SENTRY_ORG=
SENTRY_PROJECT=

# PostHog
POSTHOG_API_KEY=
POSTHOG_PROJECT_ID=

# Firebase / Google Play
GOOGLE_APPLICATION_CREDENTIALS=
GOOGLE_APPLICATION_CREDENTIALS_BASE64=
FIREBASE_PROJECT_ID=
GOOGLE_PLAY_PACKAGE=

# App Store Connect
APPSTORE_KEY_ID=
APPSTORE_ISSUER_ID=
APPSTORE_PRIVATE_KEY=

# Neon Postgres
DATABASE_URL=

# Cron/Snapshot
CRON_SECRET=
SNAPSHOT_SECRET=
```

## Cron Jobs

Daily metric snapshot runs at 6:00 AM UTC via Vercel Cron:
- Saves MRR, subscribers, trials, revenue to Neon Postgres
- Enables historical MRR evolution charts

## Architecture

```
app/
├── dashboard/
│   ├── page.tsx         # Overview
│   ├── analytics/       # PostHog analytics
│   ├── reviews/         # App Store + Google Play reviews
│   ├── revenue/         # RevenueCat metrics
│   ├── errors/          # Sentry errors
│   └── settings/        # API health status
├── api/
│   ├── analytics/       # PostHog endpoints
│   ├── charts/          # Chart data endpoints
│   ├── cron/            # Vercel cron jobs
│   ├── health/          # Service health checks
│   ├── reviews/         # Reviews + reply
│   ├── sentry/          # Sentry data
│   ├── snapshot/        # Metric snapshots
│   └── stats/           # Dashboard KPI stats
components/
├── analytics/           # PostHog chart components
├── dashboard/           # Overview widgets
├── errors/              # Error list components
├── layout/              # Sidebar, header, nav
├── revenue/             # Revenue charts
├── reviews/             # Review cards + filters
└── ui/                  # shadcn/ui base components
lib/
├── api/                 # App Store + Google Play API clients
├── data/                # Server-side data fetching + cache
└── utils.ts             # Formatting helpers
```
