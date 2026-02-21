import { NextResponse } from "next/server";

const REPOS = [
  "shinobiapp",
  "shinobi-admin",
  "shinobi-dashboard",
  "self-made-theme",
  "self-made-theme-app",
  "self-made-theme-licence",
  "second-brain",
  "email-campaigns",
];

const OWNER = "jeremyplt";

export async function GET() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "GITHUB_TOKEN not configured" }, { status: 500 });
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github.v3+json",
  };

  const results = await Promise.allSettled(
    REPOS.map(async (repo) => {
      const res = await fetch(
        `https://api.github.com/repos/${OWNER}/${repo}/pulls?state=open&per_page=100&sort=created&direction=desc`,
        { headers, next: { revalidate: 300 } }
      );
      if (!res.ok) throw new Error(`${repo}: ${res.status}`);
      const data = await res.json();
      return data.map((pr: any) => ({
        id: pr.id,
        number: pr.number,
        title: pr.title,
        repo,
        url: pr.html_url,
        author: pr.user?.login || "unknown",
        createdAt: pr.created_at,
        updatedAt: pr.updated_at,
        draft: pr.draft,
        labels: pr.labels?.map((l: any) => l.name) || [],
        base: pr.base.ref,
        head: pr.head.ref,
      }));
    })
  );

  const prs = results
    .filter((r): r is PromiseFulfilledResult<any[]> => r.status === "fulfilled")
    .flatMap((r) => r.value)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json({ prs, total: prs.length });
}
