import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface ServiceHealth {
  name: string;
  status: "connected" | "error" | "not_configured";
  latencyMs?: number;
  error?: string;
  details?: string;
}

async function checkService(
  name: string,
  checkFn: () => Promise<{ ok: boolean; details?: string }>
): Promise<ServiceHealth> {
  const envCheck = () => {
    switch (name) {
      case "RevenueCat": return !!process.env.REVENUECAT_API_KEY;
      case "Sentry": return !!process.env.SENTRY_TOKEN;
      case "PostHog": return !!(process.env.POSTHOG_API_KEY && process.env.POSTHOG_PROJECT_ID);
      case "App Store Connect": return !!(process.env.APPSTORE_KEY_ID && process.env.APPSTORE_ISSUER_ID);
      case "Google Play": return !!(process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64);
      case "Firebase": return !!(process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64);
      case "Neon Postgres": return !!process.env.DATABASE_URL;
      default: return true;
    }
  };

  if (!envCheck()) {
    return { name, status: "not_configured" };
  }

  const start = Date.now();
  try {
    const result = await checkFn();
    const latencyMs = Date.now() - start;
    return {
      name,
      status: result.ok ? "connected" : "error",
      latencyMs,
      details: result.details,
      error: result.ok ? undefined : result.details,
    };
  } catch (error) {
    return {
      name,
      status: "error",
      latencyMs: Date.now() - start,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function GET() {
  const services = await Promise.all([
    checkService("RevenueCat", async () => {
      const res = await fetch(
        "https://api.revenuecat.com/v2/projects/projc4678a43/metrics/overview",
        {
          headers: {
            Authorization: `Bearer ${process.env.REVENUECAT_API_KEY}`,
            Accept: "application/json",
          },
        }
      );
      return { ok: res.ok, details: res.ok ? "API v2 responding" : `HTTP ${res.status}` };
    }),

    checkService("Sentry", async () => {
      const org = process.env.SENTRY_ORG || "shinobi-japanese";
      const res = await fetch(
        `https://sentry.io/api/0/organizations/${org}/`,
        {
          headers: {
            Authorization: `Bearer ${process.env.SENTRY_TOKEN}`,
          },
        }
      );
      return { ok: res.ok, details: res.ok ? "Organization accessible" : `HTTP ${res.status}` };
    }),

    checkService("PostHog", async () => {
      const res = await fetch(
        `https://us.posthog.com/api/projects/${process.env.POSTHOG_PROJECT_ID}/`,
        {
          headers: {
            Authorization: `Bearer ${process.env.POSTHOG_API_KEY}`,
          },
        }
      );
      return { ok: res.ok, details: res.ok ? "Project accessible" : `HTTP ${res.status}` };
    }),

    checkService("Firebase", async () => {
      // Quick Firestore check
      const { google } = await import("googleapis");
      const credentialsBase64 = process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64;
      let auth;
      if (credentialsBase64) {
        const credentials = JSON.parse(Buffer.from(credentialsBase64, "base64").toString("utf-8"));
        auth = new google.auth.GoogleAuth({ credentials, scopes: ["https://www.googleapis.com/auth/datastore"] });
      } else {
        auth = new google.auth.GoogleAuth({
          keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
          scopes: ["https://www.googleapis.com/auth/datastore"],
        });
      }
      const client = await auth.getClient();
      await client.getAccessToken();
      return { ok: true, details: "Firestore auth valid" };
    }),

    checkService("Google Play", async () => {
      const { google } = await import("googleapis");
      const credentialsBase64 = process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64;
      let auth;
      if (credentialsBase64) {
        const credentials = JSON.parse(Buffer.from(credentialsBase64, "base64").toString("utf-8"));
        auth = new google.auth.GoogleAuth({ credentials, scopes: ["https://www.googleapis.com/auth/androidpublisher"] });
      } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        auth = new google.auth.GoogleAuth({
          keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
          scopes: ["https://www.googleapis.com/auth/androidpublisher"],
        });
      } else {
        return { ok: false, details: "No credentials" };
      }
      const client = await auth.getClient();
      await client.getAccessToken();
      return { ok: true, details: "Auth valid" };
    }),

    checkService("App Store Connect", async () => {
      const jwt = (await import("jsonwebtoken")).default;
      const keyId = process.env.APPSTORE_KEY_ID;
      const issuerId = process.env.APPSTORE_ISSUER_ID;
      const privateKey = process.env.APPSTORE_PRIVATE_KEY;
      if (!keyId || !issuerId || !privateKey) {
        return { ok: false, details: "Missing credentials" };
      }
      // Just verify we can generate a JWT (don't make API call to save rate limit)
      jwt.sign({}, privateKey, {
        algorithm: "ES256",
        expiresIn: "1m",
        audience: "appstoreconnect-v1",
        issuer: issuerId,
        header: { alg: "ES256", kid: keyId, typ: "JWT" },
      });
      return { ok: true, details: "JWT generation OK" };
    }),

    checkService("Neon Postgres", async () => {
      const { neon } = await import("@neondatabase/serverless");
      const sql = neon(process.env.DATABASE_URL!);
      const result = await sql`SELECT 1 as ping`;
      return { ok: result.length > 0, details: "Database responding" };
    }),
  ]);

  const allOk = services.every(s => s.status === "connected");
  const configured = services.filter(s => s.status !== "not_configured").length;

  return NextResponse.json({
    overall: allOk ? "healthy" : "degraded",
    configured,
    total: services.length,
    services,
    timestamp: new Date().toISOString(),
  });
}
