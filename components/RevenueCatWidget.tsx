'use client';

import { useEffect, useState } from 'react';

interface RevenueData {
  mrr: number;
  subscribers: number;
  churnRate: number;
  ltv: number;
}

export default function RevenueCatWidget() {
  const [data, setData] = useState<RevenueData>({
    mrr: 12000,
    subscribers: 1200,
    churnRate: 5.2,
    ltv: 480,
  });

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">💵 RevenueCat Metrics</h2>
        <a 
          href="https://app.revenuecat.com" 
          target="_blank"
          className="text-sm text-blue-600 hover:underline"
        >
          Dashboard →
        </a>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">MRR</p>
          <p className="text-2xl font-bold text-green-600">
            ${data.mrr.toLocaleString()}
          </p>
          <p className="text-xs text-green-600 mt-1">🎯 Goal: $30k</p>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Subscribers</p>
          <p className="text-2xl font-bold text-blue-600">
            {data.subscribers.toLocaleString()}
          </p>
          <p className="text-xs text-blue-600 mt-1">+8% this month</p>
        </div>

        <div className="p-4 bg-yellow-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Churn Rate</p>
          <p className="text-2xl font-bold text-yellow-600">
            {data.churnRate}%
          </p>
          <p className="text-xs text-yellow-600 mt-1">Target: &lt;5%</p>
        </div>

        <div className="p-4 bg-purple-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">LTV</p>
          <p className="text-2xl font-bold text-purple-600">
            ${data.ltv}
          </p>
          <p className="text-xs text-purple-600 mt-1">Per subscriber</p>
        </div>
      </div>

      <div className="mt-4 p-3 bg-green-50 rounded-lg">
        <p className="text-sm text-green-800">
          <span className="font-bold">📈 On Track:</span> 12% MRR growth month-over-month
        </p>
      </div>
    </div>
  );
}
