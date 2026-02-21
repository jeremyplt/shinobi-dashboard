"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { GitPullRequest, ExternalLink, Clock, Filter } from "lucide-react";

interface PR {
  id: number;
  number: number;
  title: string;
  repo: string;
  url: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  draft: boolean;
  labels: string[];
  base: string;
  head: string;
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

const REPO_COLORS: Record<string, string> = {
  shinobiapp: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "shinobi-admin": "bg-violet-500/20 text-violet-400 border-violet-500/30",
  "shinobi-dashboard": "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  "self-made-theme": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "self-made-theme-app": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  "self-made-theme-licence": "bg-teal-500/20 text-teal-400 border-teal-500/30",
  "second-brain": "bg-green-500/20 text-green-400 border-green-500/30",
  "email-campaigns": "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

export default function PRsPage() {
  const [prs, setPrs] = useState<PR[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/github/prs")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setPrs(d.prs || []);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  const repos = useMemo(() => {
    const counts: Record<string, number> = {};
    prs.forEach((p) => {
      counts[p.repo] = (counts[p.repo] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [prs]);

  const filtered = useMemo(() => {
    return prs.filter((p) => {
      if (filter !== "all" && p.repo !== filter) return false;
      if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !`#${p.number}`.includes(search))
        return false;
      return true;
    });
  }, [prs, filter, search]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6366f1]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-red-400">
        <p className="font-medium">Failed to load PRs</p>
        <p className="text-sm mt-1 text-red-400/70">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#f1f5f9]">PR Queue</h1>
          <p className="text-[#94a3b8] mt-1">
            {prs.length} open PRs across {repos.length} repos
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[#1e1e2e] hover:bg-[#2a2a3e] rounded-lg text-sm text-[#94a3b8] transition"
        >
          Refresh
        </button>
      </div>

      {/* Repo filter chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            filter === "all"
              ? "bg-[#6366f1]/20 text-[#6366f1] border border-[#6366f1]/30"
              : "bg-[#1e1e2e] text-[#94a3b8] border border-transparent hover:bg-[#2a2a3e]"
          }`}
        >
          All ({prs.length})
        </button>
        {repos.map(([repo, count]) => (
          <button
            key={repo}
            onClick={() => setFilter(filter === repo ? "all" : repo)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
              filter === repo
                ? REPO_COLORS[repo] || "bg-gray-500/20 text-gray-400 border-gray-500/30"
                : "bg-[#1e1e2e] text-[#94a3b8] border-transparent hover:bg-[#2a2a3e]"
            }`}
          >
            {repo} ({count})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
        <input
          type="text"
          placeholder="Filter PRs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[#1e1e2e] border border-[#2a2a3e] rounded-lg text-sm text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#6366f1]/50"
        />
      </div>

      {/* PR List */}
      <div className="space-y-2">
        {filtered.map((pr, i) => (
          <motion.a
            key={pr.id}
            href={pr.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.02 }}
            className="flex items-start gap-3 p-4 bg-[#12121a] hover:bg-[#1e1e2e] rounded-xl border border-[#1e1e2e] hover:border-[#2a2a3e] transition group"
          >
            <GitPullRequest className="w-4 h-4 mt-1 text-green-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${
                    REPO_COLORS[pr.repo] || "bg-gray-500/20 text-gray-400 border-gray-500/30"
                  }`}
                >
                  {pr.repo}
                </span>
                <span className="text-[#64748b] text-xs">#{pr.number}</span>
                <span className="text-[#f1f5f9] text-sm font-medium truncate">{pr.title}</span>
                {pr.draft && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-[#2a2a3e] rounded text-[#64748b]">
                    DRAFT
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-[#64748b]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {timeAgo(pr.createdAt)}
                </span>
                <span>
                  {pr.base} ← {pr.head}
                </span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-[#64748b] opacity-0 group-hover:opacity-100 transition shrink-0 mt-1" />
          </motion.a>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center text-[#64748b] py-16">
          <GitPullRequest className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No PRs found</p>
        </div>
      )}
    </div>
  );
}
