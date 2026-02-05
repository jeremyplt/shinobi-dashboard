'use client';

import { useEffect, useState } from 'react';

interface SentryIssue {
  id: string;
  title: string;
  count: string;
  userCount: number;
  lastSeen: string;
}

export default function SentryWidget() {
  const [issues, setIssues] = useState<SentryIssue[]>([
    {
      id: '72253359',
      title: 'Error: Unable to download a file: response has status 403',
      count: '54519',
      userCount: 3059,
      lastSeen: '2 min ago',
    },
    {
      id: '27410667',
      title: 'FirebaseError: Failed to get document because the client is offline',
      count: '13345',
      userCount: 211,
      lastSeen: '5 min ago',
    },
    {
      id: '92096707',
      title: 'Error: Failed to load all assets',
      count: '2363',
      userCount: 242,
      lastSeen: '12 min ago',
    },
  ]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">🐛 Top Sentry Errors</h2>
        <a 
          href="https://shinobi-japanese.sentry.io/issues/" 
          target="_blank"
          className="text-sm text-blue-600 hover:underline"
        >
          View All →
        </a>
      </div>

      <div className="space-y-4">
        {issues.map((issue) => (
          <div key={issue.id} className="border-b border-gray-200 pb-4 last:border-0">
            <a
              href={`https://shinobi-japanese.sentry.io/issues/${issue.id}/`}
              target="_blank"
              className="text-sm font-medium text-gray-900 hover:text-blue-600"
            >
              {issue.title}
            </a>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
              <span>📊 {parseInt(issue.count).toLocaleString()} events</span>
              <span>👥 {issue.userCount.toLocaleString()} users</span>
              <span>⏰ {issue.lastSeen}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-red-50 rounded-lg">
        <p className="text-sm text-red-800">
          <span className="font-bold">⚠️ Action Required:</span> 403 errors affecting 3k+ users
        </p>
      </div>
    </div>
  );
}
