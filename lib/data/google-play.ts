/**
 * Google Play Developer Reporting API - crash/ANR rates
 * Uses the playdeveloperreporting v1beta1 API
 * Requires service account to have Play Console access
 */

import { google } from "googleapis";
import { cached } from "./cache";

const PACKAGE_NAME =
  process.env.GOOGLE_PLAY_PACKAGE || "com.shinobiapp.shinobi";

// --- Types ---

export interface DailyCrashRate {
  date: string; // YYYY-MM-DD
  crashRate: number;
  userPerceivedCrashRate: number;
  distinctUsers: number;
}

export interface DailyAnrRate {
  date: string;
  anrRate: number;
  userPerceivedAnrRate: number;
  distinctUsers: number;
}

// --- Auth ---

function getAuth() {
  const credentialsBase64 = process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64;
  if (credentialsBase64) {
    const credentials = JSON.parse(
      Buffer.from(credentialsBase64, "base64").toString("utf-8")
    );
    return new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/playdeveloperreporting"],
    });
  }

  const credentialsPath =
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    "/root/.openclaw/workspace/.credentials/firebase-shinobi.json";
  return new google.auth.GoogleAuth({
    keyFile: credentialsPath,
    scopes: ["https://www.googleapis.com/auth/playdeveloperreporting"],
  });
}

// --- API Functions ---

interface TimelineRow {
  startTime: { year: number; month: number; day: number };
  metrics: Array<{
    decimalValue?: { value: string };
  }>;
}

/**
 * Fetch daily crash rates from Google Play Developer Reporting
 */
export async function fetchCrashRates(
  days: number = 90
): Promise<DailyCrashRate[]> {
  return cached(`googleplay:crash:${days}`, async () => {
    const auth = getAuth();
    const reporting = google.playdeveloperreporting({
      version: "v1beta1",
      auth,
    });

    // Calculate date range (max freshness is usually 2 days ago)
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 2);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);

    const result = await reporting.vitals.crashrate.query({
      name: `apps/${PACKAGE_NAME}/crashRateMetricSet`,
      requestBody: {
        timelineSpec: {
          aggregationPeriod: "DAILY",
          startTime: {
            year: startDate.getFullYear(),
            month: startDate.getMonth() + 1,
            day: startDate.getDate(),
          },
          endTime: {
            year: endDate.getFullYear(),
            month: endDate.getMonth() + 1,
            day: endDate.getDate(),
          },
        },
        dimensions: [],
        metrics: [
          "crashRate",
          "userPerceivedCrashRate",
          "distinctUsers",
        ],
      },
    });

    const rows = (result.data.rows as TimelineRow[]) || [];

    return rows.map((row) => {
      const { year, month, day } = row.startTime;
      const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const vals = row.metrics.map(
        (m) => parseFloat(m.decimalValue?.value || "0")
      );

      return {
        date,
        crashRate: vals[0] || 0,
        userPerceivedCrashRate: vals[1] || 0,
        distinctUsers: vals[2] || 0,
      };
    });
  }, 60 * 60 * 1000); // 1 hour cache
}

/**
 * Fetch daily ANR rates from Google Play Developer Reporting
 */
export async function fetchAnrRates(
  days: number = 90
): Promise<DailyAnrRate[]> {
  return cached(`googleplay:anr:${days}`, async () => {
    const auth = getAuth();
    const reporting = google.playdeveloperreporting({
      version: "v1beta1",
      auth,
    });

    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 2);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);

    const result = await reporting.vitals.anrrate.query({
      name: `apps/${PACKAGE_NAME}/anrRateMetricSet`,
      requestBody: {
        timelineSpec: {
          aggregationPeriod: "DAILY",
          startTime: {
            year: startDate.getFullYear(),
            month: startDate.getMonth() + 1,
            day: startDate.getDate(),
          },
          endTime: {
            year: endDate.getFullYear(),
            month: endDate.getMonth() + 1,
            day: endDate.getDate(),
          },
        },
        dimensions: [],
        metrics: [
          "anrRate",
          "userPerceivedAnrRate",
          "distinctUsers",
        ],
      },
    });

    const rows = (result.data.rows as TimelineRow[]) || [];

    return rows.map((row) => {
      const { year, month, day } = row.startTime;
      const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const vals = row.metrics.map(
        (m) => parseFloat(m.decimalValue?.value || "0")
      );

      return {
        date,
        anrRate: vals[0] || 0,
        userPerceivedAnrRate: vals[1] || 0,
        distinctUsers: vals[2] || 0,
      };
    });
  }, 60 * 60 * 1000);
}

/**
 * Get the latest crash-free rate (percentage)
 */
export async function getCrashFreeRate(): Promise<number> {
  try {
    const crashRates = await fetchCrashRates(7);
    if (crashRates.length === 0) return 0;

    // Average of last 7 days
    const avgCrashRate =
      crashRates.reduce((sum, r) => sum + r.userPerceivedCrashRate, 0) /
      crashRates.length;

    return Math.round((1 - avgCrashRate) * 10000) / 100; // e.g., 99.87%
  } catch (error) {
    console.error("getCrashFreeRate failed:", error);
    return 0;
  }
}
