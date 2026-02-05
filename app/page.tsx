/**
 * Shinobi Japanese - Performance Monitoring Dashboard
 * 
 * Aggregates metrics from:
 * - Sentry (errors)
 * - Firebase Performance
 * - RevenueCat (MRR)
 * - Google Play/App Store (reviews)
 * - User stats
 */

import SentryWidget from '@/components/SentryWidget';
import RevenueCatWidget from '@/components/RevenueCatWidget';
import ReviewsWidget from '@/components/ReviewsWidget';
import QuickStats from '@/components/QuickStats';

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          🥷 Shinobi Japanese Dashboard
        </h1>
        <p className="text-gray-600">
          Real-time performance monitoring • Last updated: {new Date().toLocaleTimeString()}
        </p>
      </div>

      {/* Quick Stats */}
      <QuickStats />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Revenue */}
        <RevenueCatWidget />

        {/* Sentry Errors */}
        <SentryWidget />

        {/* Reviews */}
        <ReviewsWidget platform="google" />
        <ReviewsWidget platform="apple" />
      </div>
    </main>
  );
}
