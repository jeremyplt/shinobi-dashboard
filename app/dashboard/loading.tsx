import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[120px] bg-[#111118] rounded-xl" />
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="lg:col-span-2 h-[400px] bg-[#111118] rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-[180px] bg-[#111118] rounded-xl" />
          <Skeleton className="h-[200px] bg-[#111118] rounded-xl" />
        </div>
      </div>

      {/* More charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-[350px] bg-[#111118] rounded-xl" />
        <Skeleton className="h-[350px] bg-[#111118] rounded-xl" />
      </div>
    </div>
  );
}
