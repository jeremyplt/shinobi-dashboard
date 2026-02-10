/**
 * Support data aggregator
 * Combines negative reviews, Sentry issues, and future Brevo emails
 * into a unified support view
 */

import { fetchReviews, type Review } from "@/lib/data/reviews";

export type TicketSource = "review" | "sentry" | "email";
export type TicketStatus = "open" | "replied" | "resolved" | "ignored";
export type TicketPriority = "critical" | "high" | "medium" | "low";

export interface SupportTicket {
  id: string;
  source: TicketSource;
  title: string;
  body: string;
  author: string;
  authorEmail?: string;
  platform?: "ios" | "android";
  rating?: number;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  replyText?: string;
  sentryLink?: string;
  metadata?: Record<string, string>;
}

export interface SupportStats {
  total: number;
  open: number;
  replied: number;
  avgResponseTime?: number;
  bySource: Record<TicketSource, number>;
  byPriority: Record<TicketPriority, number>;
}

function reviewToTicket(review: Review): SupportTicket {
  const rating = review.rating;
  
  let priority: TicketPriority = "low";
  if (rating === 1) priority = "critical";
  else if (rating === 2) priority = "high";
  else if (rating === 3) priority = "medium";

  return {
    id: `review-${review.id}`,
    source: "review",
    title: review.title || `${rating}★ review from ${review.reviewerNickname}`,
    body: review.body,
    author: review.reviewerNickname,
    platform: review.platform,
    rating,
    priority,
    status: "open",
    createdAt: review.createdDate,
    metadata: {
      version: review.version || "Unknown",
    },
  };
}

function sentryIssueToTicket(issue: {
  id: string;
  title: string;
  count: string;
  userCount: number;
  lastSeen: string;
  firstSeen: string;
}): SupportTicket {
  const users = issue.userCount;
  let priority: TicketPriority = "low";
  if (users > 500) priority = "critical";
  else if (users > 100) priority = "high";
  else if (users > 20) priority = "medium";

  return {
    id: `sentry-${issue.id}`,
    source: "sentry",
    title: issue.title,
    body: `${issue.count} events affecting ${users} users. First seen: ${new Date(issue.firstSeen).toLocaleDateString()}`,
    author: `${users} users affected`,
    priority,
    status: "open",
    createdAt: issue.lastSeen,
    sentryLink: `https://shinobi-japanese.sentry.io/issues/${issue.id}/`,
    metadata: {
      events: issue.count,
      users: String(users),
    },
  };
}

export async function fetchSupportData(): Promise<{
  tickets: SupportTicket[];
  stats: SupportStats;
}> {
  const tickets: SupportTicket[] = [];

  // 1. Fetch negative reviews (≤3 stars)
  try {
    const reviewsData = await fetchReviews();
    const negativeReviews = reviewsData.reviews.filter((r) => r.rating <= 3);
    tickets.push(...negativeReviews.map(reviewToTicket));
  } catch (e) {
    console.error("Support: failed to fetch reviews", e);
  }

  // 2. Fetch Sentry issues
  try {
    const sentryToken = process.env.SENTRY_TOKEN;
    if (sentryToken) {
      const res = await fetch(
        "https://sentry.io/api/0/projects/shinobi-japanese/shinobi-japanese-react-native/issues/?query=is:unresolved&limit=20&sort=freq",
        {
          headers: { Authorization: `Bearer ${sentryToken}` },
          next: { revalidate: 300 },
        }
      );
      if (res.ok) {
        const issues = await res.json();
        // Only include issues with significant user impact
        const significantIssues = issues.filter(
          (i: { userCount: number }) => i.userCount >= 10
        );
        tickets.push(...significantIssues.map(sentryIssueToTicket));
      }
    }
  } catch (e) {
    console.error("Support: failed to fetch Sentry issues", e);
  }

  // Sort by priority then date
  const priorityOrder: Record<TicketPriority, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };
  tickets.sort((a, b) => {
    const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (pDiff !== 0) return pDiff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Calculate stats
  const bySource: Record<TicketSource, number> = { review: 0, sentry: 0, email: 0 };
  const byPriority: Record<TicketPriority, number> = { critical: 0, high: 0, medium: 0, low: 0 };
  let open = 0;
  let replied = 0;

  for (const t of tickets) {
    bySource[t.source]++;
    byPriority[t.priority]++;
    if (t.status === "open") open++;
    if (t.status === "replied") replied++;
  }

  return {
    tickets,
    stats: {
      total: tickets.length,
      open,
      replied,
      bySource,
      byPriority,
    },
  };
}
