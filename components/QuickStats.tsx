'use client';

import { useEffect, useState } from 'react';

interface Stats {
  mrr: number;
  activeUsers: number;
  crashFreeRate: number;
  avgRating: number;
}

export default function QuickStats() {
  const [stats, setStats] = useState<Stats>({
    mrr: 12000,
    activeUsers: 5420,
    crashFreeRate: 99.2,
    avgRating: 4.9,
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* MRR */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">MRR</p>
            <p className="text-3xl font-bold text-green-600">
              ${stats.mrr.toLocaleString()}
            </p>
            <p className="text-xs text-green-600 mt-1">+12% this month</p>
          </div>
          <div className="text-4xl">💰</div>
        </div>
      </div>

      {/* Active Users */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Active Users</p>
            <p className="text-3xl font-bold text-blue-600">
              {stats.activeUsers.toLocaleString()}
            </p>
            <p className="text-xs text-blue-600 mt-1">+8% this week</p>
          </div>
          <div className="text-4xl">👥</div>
        </div>
      </div>

      {/* Crash-Free Rate */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Crash-Free</p>
            <p className="text-3xl font-bold text-purple-600">
              {stats.crashFreeRate}%
            </p>
            <p className="text-xs text-purple-600 mt-1">Last 7 days</p>
          </div>
          <div className="text-4xl">🛡️</div>
        </div>
      </div>

      {/* Avg Rating */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Avg Rating</p>
            <p className="text-3xl font-bold text-yellow-600">
              {stats.avgRating} ⭐
            </p>
            <p className="text-xs text-yellow-600 mt-1">50k+ reviews</p>
          </div>
          <div className="text-4xl">📱</div>
        </div>
      </div>
    </div>
  );
}
