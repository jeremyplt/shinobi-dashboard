/**
 * User growth data from Firestore
 * Aggregates user creation dates into daily buckets
 */

import { runQuery, runAggregation } from "./firebase-admin";
import { cached } from "./cache";

// --- Types ---

export interface DailyUsers {
  date: string; // YYYY-MM-DD
  newUsers: number;
  cumulativeUsers: number;
}

export interface UserOverview {
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
}

// --- Functions ---

/**
 * Get total user count
 */
export async function getTotalUsers(): Promise<number> {
  return cached("users:total", async () => {
    return runAggregation("users");
  }, 30 * 60 * 1000);
}

/**
 * Get user growth data - daily new users with cumulative total
 */
export async function fetchUserGrowth(
  startDate?: string,
  endDate?: string
): Promise<DailyUsers[]> {
  const cacheKey = `users:growth:${startDate || "all"}:${endDate || "now"}`;

  return cached(cacheKey, async () => {
    const where = [];

    if (startDate) {
      where.push({
        field: "createdAt",
        op: "GREATER_THAN_OR_EQUAL",
        value: { timestampValue: new Date(startDate).toISOString() },
      });
    }
    if (endDate) {
      where.push({
        field: "createdAt",
        op: "LESS_THAN_OR_EQUAL",
        value: {
          timestampValue: new Date(endDate + "T23:59:59Z").toISOString(),
        },
      });
    }

    const docs = await runQuery({
      collection: "users",
      where: where.length > 0 ? where : undefined,
      orderBy: [{ field: "createdAt", direction: "ASCENDING" }],
      select: ["createdAt"],
      limit: 100000, // Get all users (up to 100k for growth chart)
    });

    // Aggregate by day
    const dailyMap = new Map<string, number>();

    for (const doc of docs) {
      let createdAt: Date | null = null;

      if (doc.createdAt) {
        if (doc.createdAt instanceof Date) {
          createdAt = doc.createdAt;
        } else if (typeof doc.createdAt === "string") {
          createdAt = new Date(doc.createdAt);
        }
      }

      if (createdAt && !isNaN(createdAt.getTime())) {
        const dateKey = createdAt.toISOString().split("T")[0];
        dailyMap.set(dateKey, (dailyMap.get(dateKey) || 0) + 1);
      }
    }

    // Convert to sorted array with cumulative counts
    const sortedDays = Array.from(dailyMap.entries()).sort(([a], [b]) =>
      a.localeCompare(b)
    );

    let cumulative = 0;
    const result: DailyUsers[] = [];

    if (sortedDays.length > 0) {
      const firstDate = new Date(sortedDays[0][0]);
      const lastDate = new Date(sortedDays[sortedDays.length - 1][0]);
      const dataMap = new Map(sortedDays);

      const current = new Date(firstDate);
      while (current <= lastDate) {
        const dateKey = current.toISOString().split("T")[0];
        const newUsers = dataMap.get(dateKey) || 0;
        cumulative += newUsers;
        result.push({
          date: dateKey,
          newUsers,
          cumulativeUsers: cumulative,
        });
        current.setDate(current.getDate() + 1);
      }
    }

    return result;
  }, 60 * 60 * 1000);
}

/**
 * Get user overview metrics
 */
export async function fetchUserOverview(): Promise<UserOverview> {
  return cached("users:overview", async () => {
    const totalUsers = await getTotalUsers();

    const now = new Date();
    const todayStart = new Date(now.toISOString().split("T")[0]);
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(todayStart);
    monthStart.setDate(monthStart.getDate() - 30);

    const [newUsersToday, newUsersThisWeek, newUsersThisMonth] =
      await Promise.all([
        runAggregation("users", [
          {
            field: "createdAt",
            op: "GREATER_THAN_OR_EQUAL",
            value: { timestampValue: todayStart.toISOString() },
          },
        ]),
        runAggregation("users", [
          {
            field: "createdAt",
            op: "GREATER_THAN_OR_EQUAL",
            value: { timestampValue: weekStart.toISOString() },
          },
        ]),
        runAggregation("users", [
          {
            field: "createdAt",
            op: "GREATER_THAN_OR_EQUAL",
            value: { timestampValue: monthStart.toISOString() },
          },
        ]),
      ]);

    return {
      totalUsers,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
    };
  }, 30 * 60 * 1000);
}
