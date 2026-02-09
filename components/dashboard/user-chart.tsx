"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatNumber } from "@/lib/utils";

// Generate sample data
function generateData() {
  const data = [];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  let value = 1800;
  
  for (const month of months) {
    value += Math.random() * 250 + 150;
    data.push({ month, value: Math.round(value) });
  }
  
  return data;
}

export function UserGrowthChart() {
  const data = generateData();

  return (
    <Card className="bg-[#111118] border-[#1e1e2e]">
      <CardHeader>
        <CardTitle className="text-[#f1f5f9]">User Growth</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
            <XAxis
              dataKey="month"
              stroke="#94a3b8"
              style={{ fontSize: "12px" }}
            />
            <YAxis
              stroke="#94a3b8"
              style={{ fontSize: "12px" }}
              tickFormatter={(value) => formatNumber(value)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#111118",
                border: "1px solid #1e1e2e",
                borderRadius: "8px",
                color: "#f1f5f9",
              }}
              formatter={(value: number | undefined) => [formatNumber(value ?? 0), "Users"]}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
