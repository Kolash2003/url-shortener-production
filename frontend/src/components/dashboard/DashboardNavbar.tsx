import { ChevronDown, LogOut, Key, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useLinks } from "@/context/LinksContext";
import { useAuth } from "@/context/AuthContext";

/* Notifications section disabled for production
interface Notification {
  id: string;
  icon: "link" | "click" | "warning" | "success";
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const defaultNotifications: Notification[] = [
  { id: "1", icon: "click", title: "Milestone reached", description: "snip.dev/mdn-js hit 2,400 clicks", time: "2m ago", read: false },
  { id: "2", icon: "warning", title: "Link expiring soon", description: "snip.dev/v-deploy expires in 24h", time: "1h ago", read: false },
  { id: "3", icon: "link", title: "New link created", description: "snip.dev/gh-repo was created", time: "2h ago", read: true },
  { id: "4", icon: "success", title: "Export complete", description: "Your CSV export is ready to download", time: "5h ago", read: true },
];

const iconMap = {
  link: Link2,
  click: MousePointerClick,
  warning: AlertTriangle,
  success: CheckCircle2,
};

const iconColorMap = {
  link: "text-primary",
  click: "text-primary",
  warning: "text-yellow-400",
  success: "text-emerald-400",
};
*/

const DashboardNavbar = () => {
  const { searchQuery, setSearchQuery } = useLinks();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  // const [notifications, setNotifications] = useState<Notification[]>(defaultNotifications);

  // const unreadCount = notifications.filter((n) => !n.read).length;

  // const markAllRead = () => {
  //   setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  // };

  // const markRead = (id: string) => {
  //   setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  // };

  // const clearAll = () => {
  //   setNotifications([]);
  // };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-[0_1px_8px_hsl(187_100%_50%/0.08)]">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />

      <span className="font-mono text-lg font-bold text-primary select-none">
        snip.dev
      </span>

      <div className="flex-1 flex justify-center max-w-md mx-auto">
        <Input
          placeholder="Search your links..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-8 bg-secondary border-border font-mono text-xs placeholder:text-muted-foreground focus-visible:ring-primary/40"
        />
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications popover disabled for production
        <Popover>
          <PopoverTrigger asChild>
            <button className="relative text-muted-foreground hover:text-foreground transition-colors">
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
              <span className="text-sm font-heading font-semibold text-foreground">Notifications</span>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-[11px] font-mono text-primary hover:underline">
                    Mark all read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button onClick={clearAll} className="text-[11px] font-mono text-muted-foreground hover:text-foreground">
                    Clear
                  </button>
                )}
              </div>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Bell size={24} className="text-muted-foreground/30 mb-2" />
                  <p className="text-xs font-mono text-muted-foreground">No notifications</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const Icon = iconMap[n.icon];
                  return (
                    <button
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/60 ${!n.read ? "bg-primary/5" : ""}`}
                    >
                      <div className={`mt-0.5 shrink-0 ${iconColorMap[n.icon]}`}>
                        <Icon size={15} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-heading ${!n.read ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                          {n.title}
                        </p>
                        <p className="text-[11px] font-mono text-muted-foreground truncate">{n.description}</p>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground shrink-0 mt-0.5">{n.time}</span>
                    </button>
                  );
                })
              )}
            </div>
          </PopoverContent>
        </Popover>
        */}

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1.5 outline-none">
            <Avatar className="h-7 w-7 border border-border">
              <AvatarImage src={user?.avatar} alt={user?.name || "User"} />
              <AvatarFallback className="bg-secondary text-xs font-mono text-foreground">
                {user?.name
                  ? user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                  : "JD"}
              </AvatarFallback>
            </Avatar>
            <ChevronDown size={14} className="text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem className="gap-2 text-xs font-mono" onClick={() => navigate("/dashboard/profile")}>
              <User size={14} /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 text-xs font-mono" onClick={() => navigate("/dashboard/settings")}>
              <Key size={14} /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 text-xs font-mono text-destructive" onClick={logout}>
              <LogOut size={14} /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default DashboardNavbar;
