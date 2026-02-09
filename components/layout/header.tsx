"use client";

import { Calendar } from "lucide-react";

export function Header() {
  return (
    <header className="h-16 border-b border-[#1e1e2e] bg-[#0a0a0f] px-6 flex items-center justify-between">
      <h1 className="text-xl font-semibold text-[#f1f5f9]">Dashboard</h1>
      
      <div className="flex items-center gap-2 text-sm text-[#94a3b8]">
        <Calendar className="w-4 h-4" />
        <span>{new Date().toLocaleDateString("en-US", { 
          month: "long", 
          day: "numeric", 
          year: "numeric" 
        })}</span>
      </div>
    </header>
  );
}
