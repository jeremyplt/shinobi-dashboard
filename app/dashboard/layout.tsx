import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { PageTransition } from "@/components/layout/page-transition";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Sidebar />
      <div className="pl-64">
        <Header />
        <main className="p-6">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
