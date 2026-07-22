import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { Link2, BarChart3, Calendar, Github, Globe, Loader2, Pencil, Check } from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [editName, setEditName] = useState(false);
  const [editBio, setEditBio] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const planLabels: Record<string, { label: string; color: string }> = {
    hacker: { label: "Hacker", color: "text-primary border-primary/30 bg-primary/10" },
    builder: { label: "Builder", color: "text-blue-400 border-blue-400/30 bg-blue-400/10" },
    scale: { label: "Scale", color: "text-purple-400 border-purple-400/30 bg-purple-400/10" },
  };

  const plan = planLabels[user.plan] || planLabels.hacker;

  const saveName = async () => {
    if (!name.trim() || name.trim() === user.name) {
      setEditName(false);
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 300));
    updateProfile({ name: name.trim() });
    setSaving(false);
    setEditName(false);
    toast.success("Display name updated");
  };

  const saveBio = async () => {
    if (bio === user.bio) {
      setEditBio(false);
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 300));
    updateProfile({ bio });
    setSaving(false);
    setEditBio(false);
    toast.success("Bio updated");
  };

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <DashboardNavbar />
          <main className="flex-1 p-4 lg:p-6 overflow-auto">
            <div className="mx-auto max-w-[700px] space-y-6">
              <h1 className="text-xl font-heading font-bold text-foreground">Profile</h1>

              {/* Avatar & Identity */}
              <Card className="p-5 space-y-4 border-border bg-card">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16 border-2 border-border">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-secondary text-foreground font-mono text-lg">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    {editName ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="h-8 font-mono text-sm bg-secondary border-border max-w-[200px]"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveName();
                            if (e.key === "Escape") {
                              setName(user.name);
                              setEditName(false);
                            }
                          }}
                        />
                        <button onClick={saveName} disabled={saving} className="text-primary hover:text-primary/80">
                          {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-heading font-bold text-foreground">{user.name}</h2>
                        <button onClick={() => setEditName(true)} className="text-muted-foreground hover:text-foreground">
                          <Pencil size={12} />
                        </button>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground font-mono">{user.email}</p>
                    {editBio ? (
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Write a short bio..."
                          className="h-8 font-mono text-xs bg-secondary border-border flex-1"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveBio();
                            if (e.key === "Escape") {
                              setBio(user.bio);
                              setEditBio(false);
                            }
                          }}
                        />
                        <button onClick={saveBio} disabled={saving} className="text-primary hover:text-primary/80">
                          {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2 mt-1.5">
                        <p className="text-xs text-muted-foreground">{user.bio || "No bio set."}</p>
                        <button onClick={() => setEditBio(true)} className="text-muted-foreground hover:text-foreground shrink-0">
                          <Pencil size={11} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`font-mono text-[10px] ${plan.color}`}>
                    {plan.label}
                  </Badge>
                  <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground border-border">
                    Member since {user.createdAt}
                  </Badge>
                </div>
              </Card>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Card className="p-4 border-border bg-card flex items-center gap-3">
                  <div className="w-9 h-9 rounded-sm border border-primary/30 bg-primary/10 flex items-center justify-center shrink-0">
                    <Link2 size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-heading font-bold text-foreground">{user.linksCreated}</p>
                    <p className="text-[11px] font-mono text-muted-foreground">Links Created</p>
                  </div>
                </Card>
                <Card className="p-4 border-border bg-card flex items-center gap-3">
                  <div className="w-9 h-9 rounded-sm border border-primary/30 bg-primary/10 flex items-center justify-center shrink-0">
                    <BarChart3 size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-heading font-bold text-foreground">{user.totalClicks.toLocaleString()}</p>
                    <p className="text-[11px] font-mono text-muted-foreground">Total Clicks</p>
                  </div>
                </Card>
                <Card className="p-4 border-border bg-card flex items-center gap-3">
                  <div className="w-9 h-9 rounded-sm border border-primary/30 bg-primary/10 flex items-center justify-center shrink-0">
                    <Calendar size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-heading font-bold text-foreground">{user.createdAt}</p>
                    <p className="text-[11px] font-mono text-muted-foreground">Joined</p>
                  </div>
                </Card>
              </div>

              {/* Connected Accounts */}
              <Card className="p-5 space-y-4 border-border bg-card">
                <h2 className="text-sm font-heading font-semibold text-foreground">Connected Accounts</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-sm border border-border bg-secondary flex items-center justify-center">
                        <Github size={15} className="text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs font-heading text-foreground">GitHub</p>
                        <p className="text-[11px] font-mono text-muted-foreground">Not connected</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="font-mono text-[11px]"
                      onClick={() => toast.info("OAuth connection coming soon")}
                    >
                      Connect
                    </Button>
                  </div>
                  <Separator className="bg-border" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-sm border border-border bg-secondary flex items-center justify-center">
                        <Globe size={15} className="text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs font-heading text-foreground">Google</p>
                        <p className="text-[11px] font-mono text-muted-foreground">Not connected</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="font-mono text-[11px]"
                      onClick={() => toast.info("OAuth connection coming soon")}
                    >
                      Connect
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Recent Activity — disabled for production
              <Card className="p-5 space-y-4 border-border bg-card">
                <h2 className="text-sm font-heading font-semibold text-foreground">Recent Activity</h2>
                <div className="space-y-3">
                  {[
                    { icon: Link2, action: "Created link", target: "snip.dev/next15", time: "2 hours ago" },
                    { icon: BarChart3, action: "Hit 1,000 clicks on", target: "snip.dev/mdn-js", time: "1 day ago" },
                    { icon: Settings2, action: "Updated profile", target: "", time: "2 days ago" },
                    { icon: Shield, action: "Enabled password protection for", target: "snip.dev/stripe-pay", time: "3 days ago" },
                    { icon: Link2, action: "Deleted expired link", target: "snip.dev/v-deploy", time: "5 days ago" },
                  ].map(({ icon: Icon, action, target, time }, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-7 h-7 rounded-sm border border-border bg-secondary flex items-center justify-center shrink-0">
                          <Icon size={13} className="text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-heading text-foreground truncate">
                            {action}{" "}
                            {target && <span className="font-mono text-primary">{target}</span>}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground shrink-0 ml-2">{time}</span>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="w-full font-mono text-[11px] text-muted-foreground">
                  View all activity <ArrowUpRight size={11} />
                </Button>
              </Card>
              */}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Profile;
