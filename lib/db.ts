import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export interface DailyMetrics {
  date: string; // YYYY-MM-DD
  mrr_cents: number | null;
  active_subscribers: number | null;
  new_subscribers: number | null;
  churned_subscribers: number | null;
  active_trials: number | null;
  crash_free_rate: number | null;
  total_errors: number | null;
  ios_rating: number | null;
  android_rating: number | null;
  ios_reviews_count: number | null;
  android_reviews_count: number | null;
}

export interface StoredMetrics extends DailyMetrics {
  id: number;
  created_at: string;
}

/**
 * Get historical metrics for the last N days
 */
export async function getHistoricalMetrics(
  days: number
): Promise<StoredMetrics[]> {
  const rows = await sql`
    SELECT *
    FROM daily_metrics
    WHERE date >= CURRENT_DATE - ${days}
    ORDER BY date ASC
  `;
  return rows as StoredMetrics[];
}

/**
 * Insert or update a daily snapshot (upsert on date)
 */
export async function insertDailySnapshot(
  metrics: DailyMetrics
): Promise<StoredMetrics> {
  const rows = await sql`
    INSERT INTO daily_metrics (
      date, mrr_cents, active_subscribers, new_subscribers,
      churned_subscribers, active_trials, crash_free_rate,
      total_errors, ios_rating, android_rating,
      ios_reviews_count, android_reviews_count
    ) VALUES (
      ${metrics.date},
      ${metrics.mrr_cents},
      ${metrics.active_subscribers},
      ${metrics.new_subscribers},
      ${metrics.churned_subscribers},
      ${metrics.active_trials},
      ${metrics.crash_free_rate},
      ${metrics.total_errors},
      ${metrics.ios_rating},
      ${metrics.android_rating},
      ${metrics.ios_reviews_count},
      ${metrics.android_reviews_count}
    )
    ON CONFLICT (date) DO UPDATE SET
      mrr_cents = EXCLUDED.mrr_cents,
      active_subscribers = EXCLUDED.active_subscribers,
      new_subscribers = EXCLUDED.new_subscribers,
      churned_subscribers = EXCLUDED.churned_subscribers,
      active_trials = EXCLUDED.active_trials,
      crash_free_rate = EXCLUDED.crash_free_rate,
      total_errors = EXCLUDED.total_errors,
      ios_rating = EXCLUDED.ios_rating,
      android_rating = EXCLUDED.android_rating,
      ios_reviews_count = EXCLUDED.ios_reviews_count,
      android_reviews_count = EXCLUDED.android_reviews_count
    RETURNING *
  `;
  return rows[0] as StoredMetrics;
}

/**
 * Get the most recent snapshot
 */
export async function getLatestMetrics(): Promise<StoredMetrics | null> {
  const rows = await sql`
    SELECT * FROM daily_metrics
    ORDER BY date DESC
    LIMIT 1
  `;
  return (rows[0] as StoredMetrics) ?? null;
}
