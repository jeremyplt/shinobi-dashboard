'use client';

import { useEffect, useState } from 'react';

interface Review {
  rating: number;
  text: string;
  version: string;
  device: string;
}

interface ReviewsWidgetProps {
  platform: 'google' | 'apple';
}

export default function ReviewsWidget({ platform }: ReviewsWidgetProps) {
  const [reviews, setReviews] = useState<Review[]>([
    {
      rating: 5,
      text: 'so far, so good. I really like how you can click on any of the words and get a full detailed breakdown...',
      version: '1.2.7',
      device: 'Galaxy S22',
    },
    {
      rating: 3,
      text: 'I really like the app, but it keeps closing itself. Can\'t read anything because the app keeps closing...',
      version: '1.2.7',
      device: 'Galaxy S25+',
    },
    {
      rating: 5,
      text: 'One of the best learning apps ever. Very intuitive and fun!',
      version: '1.2.7',
      device: 'Pixel 9',
    },
  ]);

  const platformName = platform === 'google' ? 'Google Play' : 'App Store';
  const platformEmoji = platform === 'google' ? '🤖' : '🍎';
  const platformUrl = platform === 'google' 
    ? 'https://play.google.com/store/apps/details?id=com.shinobiapp.shinobi'
    : 'https://apps.apple.com/app/shinobi-japanese/id123456789';

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">
          {platformEmoji} {platformName} Reviews
        </h2>
        <a 
          href={platformUrl}
          target="_blank"
          className="text-sm text-blue-600 hover:underline"
        >
          View All →
        </a>
      </div>

      <div className="space-y-4">
        {reviews.map((review, i) => (
          <div key={i} className="border-b border-gray-200 pb-4 last:border-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-yellow-500">
                {'⭐'.repeat(review.rating)}
              </div>
              <span className="text-xs text-gray-600">
                v{review.version} • {review.device}
              </span>
            </div>
            <p className="text-sm text-gray-700">
              {review.text}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <span className="font-bold">💡 Insight:</span> Crash complaints increasing - check Sentry
        </p>
      </div>
    </div>
  );
}
