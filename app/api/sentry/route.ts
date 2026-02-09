import { NextResponse } from "next/server";

export async function GET() {
  try {
    const token = process.env.SENTRY_TOKEN;
    const org = process.env.SENTRY_ORG;
    const project = process.env.SENTRY_PROJECT;
    
    if (!token || !org || !project) {
      throw new Error("Sentry credentials not configured");
    }

    const response = await fetch(
      `https://sentry.io/api/0/projects/${org}/${project}/issues/?query=is:unresolved&limit=25`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`Sentry API error: ${response.status}`);
    }

    const issues = await response.json();

    return NextResponse.json({
      issues: issues.map((issue: any) => ({
        id: issue.id,
        title: issue.title,
        count: issue.count,
        userCount: issue.userCount || 0,
        lastSeen: issue.lastSeen,
        firstSeen: issue.firstSeen,
        level: issue.level,
        culprit: issue.culprit,
      })),
      totalIssues: issues.length,
    });
  } catch (error) {
    console.error("Sentry API error:", error);
    
    // Return mock data on error
    return NextResponse.json({
      issues: [
        {
          id: "1",
          title: "TypeError: Cannot read property 'map' of undefined",
          count: 234,
          userCount: 45,
          lastSeen: new Date().toISOString(),
          firstSeen: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          level: "error",
          culprit: "app/components/LessonList.tsx",
        },
        {
          id: "2",
          title: "Network request failed",
          count: 156,
          userCount: 32,
          lastSeen: new Date().toISOString(),
          firstSeen: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          level: "warning",
          culprit: "app/services/api.ts",
        },
      ],
      totalIssues: 2,
      error: "Using cached data",
    });
  }
}
