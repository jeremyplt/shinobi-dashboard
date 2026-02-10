/**
 * Vercel Cron endpoint for daily metric snapshots
 * Runs daily at 6:00 AM UTC via Vercel Cron
 * 
 * This endpoint is authenticated via CRON_SECRET (set in Vercel env)
 * Vercel automatically adds the Authorization header for cron requests
 */

import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { fetchRevenueCatOverview } from "@/lib/data/revenuecat";
import { fetchSentryIssues } from "@/lib/data/sentry";

export const dynamic = "force-dynamic";

async function ensureTable(sql: ReturnType<typeof neon>) {
  await sql`
    CREATE TABLE IF NOT EXISTS daily_snapshots (
      id SERIAL PRIMARY KEY,
      date DATE NOT NULL,
      mrr INTEGER NOT NULL DEFAULT 0,
      subscribers INTEGER NOT NULL DEFAULT 0,
      active_trials INTEGER NOT NULL DEFAULT 0,
      revenue_28d INTEGER NOT NULL DEFAULT 0,
      active_users_28d INTEGER NOT NULL DEFAULT 0,
      new_customers_28d INTEGER NOT NULL DEFAULT 0,
      transactions_28d INTEGER NOT NULL DEFAULT 0,
      sentry_unresolved INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(date)
    )
  `;
}

export async function GET(request: Request) {
  // Verify this is a Vercel cron request or has our secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const snapshotSecret = process.env.SNAPSHOT_SECRET;

  const isVercelCron = cronSecret && authHeader === `Bearer ${cronSecret}`;
  const isManual = snapshotSecret && new URL(request.url).searchParams.get("secret") === snapshotSecret;

  if (!isVercelCron && !isManual) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "DATABASE_URL not configured" }, { status: 500 });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    await ensureTable(sql);

    const [rcOverview, sentryIssues] = await Promise.allSettled([
      fetchRevenueCatOverview(),
      fetchSentryIssues(25),
    ]);

    const rc = rcOverview.status === "fulfilled" ? rcOverview.value : null;
    const issues = sentryIssues.status === "fulfilled" ? sentryIssues.value : [];

    const today = new Date().toISOString().split("T")[0];

    await sql`
      INSERT INTO daily_snapshots (
        date, mrr, subscribers, active_trials, revenue_28d,
        active_users_28d, new_customers_28d, transactions_28d, sentry_unresolved
      ) VALUES (
        ${today},
        ${rc?.mrr || 0},
        ${rc?.activeSubscriptions || 0},
        ${rc?.activeTrials || 0},
        ${rc?.revenue28d || 0},
        ${rc?.activeUsers28d || 0},
        ${rc?.newCustomers28d || 0},
        ${rc?.transactions28d || 0},
        ${issues.length}
      )
      ON CONFLICT (date) DO UPDATE SET
        mrr = EXCLUDED.mrr,
        subscribers = EXCLUDED.subscribers,
        active_trials = EXCLUDED.active_trials,
        revenue_28d = EXCLUDED.revenue_28d,
        active_users_28d = EXCLUDED.active_users_28d,
        new_customers_28d = EXCLUDED.new_customers_28d,
        transactions_28d = EXCLUDED.transactions_28d,
        sentry_unresolved = EXCLUDED.sentry_unresolved,
        created_at = NOW()
    `;

    return NextResponse.json({
      success: true,
      date: today,
      snapshot: {
        mrr: rc?.mrr || 0,
        subscribers: rc?.activeSubscriptions || 0,
        activeTrials: rc?.activeTrials || 0,
        revenue28d: rc?.revenue28d || 0,
        sentryUnresolved: issues.length,
      },
    });
  } catch (error) {
    console.error("Cron snapshot error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
