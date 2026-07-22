import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import StatsOverview from "@/components/dashboard/StatsOverview";
import RecentLinksTable from "@/components/dashboard/RecentLinksTable";

const Dashboard = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <DashboardNavbar />
          <main className="flex-1 p-4 lg:p-6 space-y-6 overflow-auto">
            <StatsOverview />
            <RecentLinksTable />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
