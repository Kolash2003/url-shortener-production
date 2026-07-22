import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import AnalyticsHeader from "@/components/analytics/AnalyticsHeader";
import ClickTrendChart from "@/components/analytics/ClickTrendChart";
import GeographySection from "@/components/analytics/GeographySection";
import ReferrersTable from "@/components/analytics/ReferrersTable";
import DevicesBrowsers from "@/components/analytics/DevicesBrowsers";
import LinkSettingsPanel from "@/components/analytics/LinkSettingsPanel";
import { api } from "@/lib/api";
import { toast } from "sonner";

export interface AnalyticsLink {
  id: string;
  slug: string;
  original: string;
  short: string;
  totalClicks: number;
  status: string;
  passwordProtected: boolean;
}

export interface AnalyticsData {
  link: AnalyticsLink;
  trend: { date: string; clicks: number }[];
  referrers: { referrer: string; count: number }[];
  geography: { country: string; count: number }[];
  devices: { device: string; count: number }[];
  browsers: { browser: string; count: number }[];
  recentClicks: { time: string; referrer: string; country: string; device: string; browser: string }[];
}

const LinkAnalytics = () => {
  const { slug } = useParams();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api.get<{ success: boolean } & AnalyticsData>(`/analytics/${slug}?days=${days}`)
      .then((res) => setData(res))
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : "Failed to load analytics");
      })
      .finally(() => setLoading(false));
  }, [slug, days]);

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <DashboardSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <DashboardNavbar />
            <main className="flex-1 overflow-auto p-6 flex items-center justify-center">
              <p className="text-sm font-mono text-muted-foreground">Loading analytics...</p>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (!data || !data.link) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <DashboardSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <DashboardNavbar />
            <main className="flex-1 overflow-auto p-6">
              <p className="text-sm font-mono text-muted-foreground">No analytics data available.</p>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <DashboardNavbar />
          <main className="flex-1 overflow-auto">
            <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6">
              {/* Main content */}
              <div className="flex-1 min-w-0 space-y-6">
                <AnalyticsHeader link={data.link} geography={data.geography} days={days} />
                <ClickTrendChart trend={data.trend} days={days} onDaysChange={setDays} />
                <GeographySection geography={data.geography} />
                <ReferrersTable referrers={data.referrers} totalClicks={data.link.totalClicks} />
                <DevicesBrowsers devices={data.devices} browsers={data.browsers} />
              </div>

              {/* Settings sidebar */}
              <div className="w-full lg:w-[280px] shrink-0">
                <div className="lg:sticky lg:top-20">
                  <LinkSettingsPanel link={data.link} />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default LinkAnalytics;
