import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const Settings = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [displayName, setDisplayName] = useState(user?.name || "");
  const [email] = useState(user?.email || "");
  const [defaultDomain, setDefaultDomain] = useState("snip.dev");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [changingPw, setChangingPw] = useState(false);

  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    if (displayName !== user?.name) {
      updateProfile({ name: displayName });
    }
    setSaving(false);
    toast.success("Settings saved");
  };

  const onChangePassword = async () => {
    setPwError(null);
    if (!currentPw || !newPw || !confirmPw) {
      setPwError("All password fields are required");
      return;
    }
    if (newPw.length < 8) {
      setPwError("New password must be at least 8 characters");
      return;
    }
    if (newPw !== confirmPw) {
      setPwError("New passwords do not match");
      return;
    }
    if (currentPw === newPw) {
      setPwError("New password must differ from current password");
      return;
    }
    setChangingPw(true);
    try {
      await changePassword(currentPw, newPw);
      toast.success("Password changed successfully");
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    } catch {
      setPwError("Unable to change password. Please try again.");
    } finally {
      setChangingPw(false);
    }
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <DashboardNavbar />
          <main className="flex-1 p-4 lg:p-6 overflow-auto">
            <div className="mx-auto max-w-[600px] space-y-6">
              <h1 className="text-xl font-heading font-bold text-foreground">Settings</h1>

              {/* Profile */}
              <Card className="p-5 space-y-4 border-border bg-card">
                <h2 className="text-sm font-heading font-semibold text-foreground">Profile</h2>
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14 border-2 border-border">
                    <AvatarImage src={user?.avatar} alt={user?.name || "User"} />
                    <AvatarFallback className="bg-secondary text-foreground font-mono">{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-heading font-semibold text-foreground">{user?.name}</p>
                    <p className="text-[11px] font-mono text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-mono text-muted-foreground">Display Name</Label>
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="h-9 font-mono text-xs bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-mono text-muted-foreground">Email</Label>
                    <Input
                      value={email}
                      disabled
                      className="h-9 font-mono text-xs bg-muted/50 border-border cursor-not-allowed opacity-70"
                    />
                    <p className="text-[10px] font-mono text-muted-foreground">Contact support to change your email</p>
                  </div>
                </div>
              </Card>

              {/* Change Password */}
              <Card className="p-5 space-y-4 border-border bg-card">
                <h2 className="text-sm font-heading font-semibold text-foreground">Change Password</h2>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-mono text-muted-foreground">Current Password</Label>
                    <div className="relative">
                      <Input
                        type={showCurrent ? "text" : "password"}
                        value={currentPw}
                        onChange={(e) => setCurrentPw(e.target.value)}
                        placeholder="Enter current password"
                        className="h-9 pr-9 font-mono text-xs bg-secondary border-border"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent(!showCurrent)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showCurrent ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-mono text-muted-foreground">New Password</Label>
                    <div className="relative">
                      <Input
                        type={showNew ? "text" : "password"}
                        value={newPw}
                        onChange={(e) => setNewPw(e.target.value)}
                        placeholder="Enter new password"
                        className="h-9 pr-9 font-mono text-xs bg-secondary border-border"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showNew ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-mono text-muted-foreground">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        type={showConfirm ? "text" : "password"}
                        value={confirmPw}
                        onChange={(e) => setConfirmPw(e.target.value)}
                        placeholder="Confirm new password"
                        className="h-9 pr-9 font-mono text-xs bg-secondary border-border"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirm ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>
                  </div>

                  {pwError && (
                    <p className="text-[10px] font-mono text-destructive bg-destructive/10 px-3 py-2 rounded-sm">{pwError}</p>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="font-mono text-xs"
                    onClick={onChangePassword}
                    disabled={changingPw}
                  >
                    {changingPw ? <Loader2 size={12} className="animate-spin" /> : null}
                    Update Password
                  </Button>
                </div>
              </Card>

              {/* Link Defaults */}
              <Card className="p-5 space-y-4 border-border bg-card">
                <h2 className="text-sm font-heading font-semibold text-foreground">Link Defaults</h2>
                <div className="space-y-1">
                  <Label className="text-[11px] font-mono text-muted-foreground">Default Domain</Label>
                  <Input
                    value={defaultDomain}
                    onChange={(e) => setDefaultDomain(e.target.value)}
                    className="h-9 font-mono text-xs bg-secondary border-border"
                  />
                </div>
              </Card>

              {/* Danger Zone */}
              <Card className="p-5 space-y-4 border-border bg-card">
                <h2 className="text-sm font-heading font-semibold text-destructive">Danger Zone</h2>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-heading text-foreground">Delete Account</p>
                    <p className="text-[11px] text-muted-foreground">Permanently delete your account and all data</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-mono text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => toast.error("Account deletion requires confirmation via email")}
                  >
                    Delete
                  </Button>
                </div>
              </Card>

              <div className="flex justify-end">
                <Button variant="cta" size="sm" className="font-mono text-xs" onClick={save} disabled={saving}>
                  {saving ? <Loader2 size={12} className="animate-spin" /> : null}
                  Save Changes
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Settings;
