/**
 * Daily metric snapshot endpoint
 * Saves current metrics to Neon Postgres for historical charts
 * 
 * Call via cron job: POST /api/snapshot?secret=<SNAPSHOT_SECRET>
 * This stores a point-in-time snapshot of MRR, subscribers, trials, etc.
 */

import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { fetchRevenueCatOverview } from "@/lib/data/revenuecat";
import { fetchSentryIssues } from "@/lib/data/sentry";

export const dynamic = "force-dynamic";

// Ensure the table exists
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function ensureTable(sql: any) {
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

export async function POST(request: Request) {
  // Verify secret
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const expectedSecret = process.env.SNAPSHOT_SECRET;

  if (!expectedSecret || secret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "DATABASE_URL not configured" }, { status: 500 });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    await ensureTable(sql);

    // Fetch current metrics
    const [rcOverview, sentryIssues] = await Promise.allSettled([
      fetchRevenueCatOverview(),
      fetchSentryIssues(25),
    ]);

    const rc = rcOverview.status === "fulfilled" ? rcOverview.value : null;
    const issues = sentryIssues.status === "fulfilled" ? sentryIssues.value : [];

    const today = new Date().toISOString().split("T")[0];

    // Upsert (insert or update if exists)
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
    console.error("Snapshot error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

/**
 * GET - Fetch historical snapshots for charts
 */
export async function GET(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "DATABASE_URL not configured", data: [] }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "90");

    const sql = neon(process.env.DATABASE_URL);
    await ensureTable(sql);

    const rows = await sql`
      SELECT * FROM daily_snapshots
      WHERE date >= CURRENT_DATE - ${days}::INTEGER
      ORDER BY date ASC
    `;

    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error("Snapshot fetch error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error", data: [] },
      { status: 500 }
    );
  }
}
