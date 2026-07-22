import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, QrCode } from "lucide-react";
import { useLinks } from "@/context/LinksContext";

const QRCodes = () => {
  const { links } = useLinks();
  const activeLinks = links.filter((l) => l.status === "Active");

  const downloadQR = (url: string, slug: string) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext("2d")?.drawImage(img, 0, 0);
      const a = document.createElement("a");
      a.download = `qr-${slug}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}&bgcolor=141414&color=00e5ff`;
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <DashboardNavbar />
          <main className="flex-1 p-4 lg:p-6 overflow-auto space-y-6">
            <div>
              <h1 className="text-xl font-heading font-bold text-foreground">QR Codes</h1>
              <p className="text-xs text-muted-foreground mt-1">Generate and download QR codes for your short links.</p>
            </div>

            {activeLinks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <QrCode size={40} className="text-muted-foreground/30 mb-4" />
                <p className="font-heading text-sm text-muted-foreground">No active links to generate QR codes for</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeLinks.map((link) => (
                  <Card key={link.id} className="p-4 border-border bg-card space-y-3">
                    <div className="flex items-center justify-center">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(link.short)}&bgcolor=141414&color=00e5ff`}
                        alt={`QR for ${link.short}`}
                        className="w-32 h-32"
                      />
                    </div>
                    <div className="text-center">
                      <p className="font-mono text-xs text-primary">{link.short}</p>
                      <p className="font-mono text-[10px] text-muted-foreground truncate">{link.original}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full font-mono text-xs gap-1.5"
                      onClick={() => downloadQR(link.short, link.slug)}
                    >
                      <Download size={13} /> Download PNG
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default QRCodes;
