"use client";

import { useEffect, useState } from "react";
import { MRRChart } from "@/components/revenue/mrr-chart";
import { SubscriberChart } from "@/components/revenue/subscriber-chart";
import { PlanBreakdown } from "@/components/revenue/plan-breakdown";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

// Generate mock data for charts
function generateMRRData() {
  const data = [];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  let mrr = 8000;
  
  for (const month of months) {
    mrr += Math.random() * 1000 + 500;
    data.push({ date: month, mrr: Math.round(mrr) });
  }
  
  return data;
}

function generateSubscriberData() {
  const data = [];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  let subs = 320;
  
  for (const month of months) {
    subs += Math.random() * 50 + 20;
    data.push({ date: month, subscribers: Math.round(subs) });
  }
  
  return data;
}

export default function RevenuePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const planData = [
    { name: "Monthly", value: 4200, color: "#6366f1" },
    { name: "Annual", value: 6800, color: "#22c55e" },
    { name: "Lifetime", value: 1450, color: "#f59e0b" },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[#f1f5f9]">Revenue</h1>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-[400px] bg-[#111118]" />
          <Skeleton className="h-[400px] bg-[#111118]" />
        </div>
        <Skeleton className="h-[400px] bg-[#111118]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#f1f5f9]">Revenue</h1>

      {error && (
        <Card className="bg-[#f59e0b]/10 border-[#f59e0b]/50">
          <CardContent className="flex items-center gap-2 py-3">
            <AlertCircle className="w-4 h-4 text-[#f59e0b]" />
            <span className="text-sm text-[#f59e0b]">
              API connection error — showing sample data
            </span>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <MRRChart data={generateMRRData()} />
        <SubscriberChart data={generateSubscriberData()} />
      </div>

      <PlanBreakdown data={planData} />
    </div>
  );
}
