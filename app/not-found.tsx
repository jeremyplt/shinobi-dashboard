import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <Card className="bg-[#111118] border-[#1e1e2e] max-w-md w-full">
        <CardContent className="p-8 text-center space-y-6">
          <div className="text-6xl">🥷</div>
          <div>
            <h1 className="text-2xl font-bold text-[#f1f5f9] mb-2">
              Page Not Found
            </h1>
            <p className="text-sm text-[#94a3b8]">
              The ninja vanished. This page doesn&apos;t exist.
            </p>
          </div>
          <Link href="/dashboard">
            <Button className="bg-[#6366f1] hover:bg-[#5558e6] text-white">
              <Home className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
