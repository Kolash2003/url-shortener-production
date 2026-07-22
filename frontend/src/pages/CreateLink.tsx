import { useState, useEffect, useCallback } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ChevronRight, ChevronDown, Check, X, CalendarIcon, Eye, EyeOff,
  Info, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useLinks } from "@/context/LinksContext";
import { SHORT_BASE_URL, SHORT_DOMAIN } from "@/lib/config";
import { copyToClipboard } from "@/lib/utils";

const takenAliases = ["abc12", "center", "gh-repo", "mdn-js"];

const isValidUrl = (url: string) => {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

const CreateLink = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addLink } = useLinks();

  // Section 1
  const [destUrl, setDestUrl] = useState(searchParams.get("url") || "");
  const [urlTouched, setUrlTouched] = useState(!!searchParams.get("url"));
  const urlValid = isValidUrl(destUrl);

  // Section 2
  const [alias, setAlias] = useState("");
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [checkingAlias, setCheckingAlias] = useState(false);
  const [aliasAvailable, setAliasAvailable] = useState<boolean | null>(null);

  // Section 3
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [expiryDate, setExpiryDate] = useState<Date | undefined>();
  const [expiryTime, setExpiryTime] = useState("23:59");
  const [passwordEnabled, setPasswordEnabled] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");
  const [utmTerm, setUtmTerm] = useState("");
  const [utmContent, setUtmContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // Section 4
  const [redirectType, setRedirectType] = useState<301 | 302>(302);
  const [ogTitle, setOgTitle] = useState("");
  const [ogDescription, setOgDescription] = useState("");
  const [ogImage, setOgImage] = useState("");

  const toggle = (key: string) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  // Alias availability check (debounced mock)
  useEffect(() => {
    if (autoGenerate || !alias) {
      setAliasAvailable(null);
      return;
    }
    setCheckingAlias(true);
    const t = setTimeout(() => {
      setAliasAvailable(!takenAliases.includes(alias.toLowerCase()));
      setCheckingAlias(false);
    }, 400);
    return () => clearTimeout(t);
  }, [alias, autoGenerate]);

  const addTag = useCallback(() => {
    const t = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (t && !tags.includes(t) && tags.length < 10) {
      setTags((prev) => [...prev, t]);
    }
    setTagInput("");
  }, [tagInput, tags]);

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  const handleCreate = () => {
    if (!urlValid) {
      toast.error("Enter a valid destination URL");
      return;
    }
    const slug = autoGenerate
      ? Math.random().toString(36).substring(2, 7)
      : alias;
    if (!autoGenerate && !alias) {
      toast.error("Enter an alias or enable auto-generate");
      return;
    }
    addLink(destUrl, slug);
    toast.success(`Link created! ${SHORT_DOMAIN}/${slug} is live.`, {
      action: {
        label: "Copy",
        onClick: () => {
          copyToClipboard(`${SHORT_BASE_URL}/${slug}`).then((ok) =>
            toast.success(ok ? "Copied to clipboard" : "Failed to copy")
          );
        },
      },
    });
    navigate("/dashboard");
  };

  const SectionPanel = ({
    id, label, children,
  }: { id: string; label: string; children: React.ReactNode }) => (
    <Collapsible open={openSections[id]} onOpenChange={() => toggle(id)}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2.5 px-3 border border-border rounded-sm hover:glow-border transition-shadow bg-card text-sm font-heading font-medium text-foreground">
        {label}
        {openSections[id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </CollapsibleTrigger>
      <CollapsibleContent className="px-3 py-3 border border-t-0 border-border rounded-b-sm bg-card space-y-3">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <DashboardNavbar />
          <main className="flex-1 p-4 lg:p-6 overflow-auto">
            <div className="mx-auto max-w-[680px] space-y-6 pb-24">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground">
                <Link to="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
                <ChevronRight size={12} />
                <Link to="/dashboard/links" className="hover:text-foreground transition-colors">My Links</Link>
                <ChevronRight size={12} />
                <span className="text-foreground">New Link</span>
              </nav>

              <h1 className="text-xl font-heading font-bold text-foreground">
                Create a New Short Link
              </h1>

              {/* SECTION 1 — Destination */}
              <div className="space-y-2">
                <Label className="text-sm font-heading font-medium text-foreground">
                  Destination URL
                </Label>
                <Input
                  placeholder="https://your-long-url.com/goes/here"
                  value={destUrl}
                  onChange={(e) => { setDestUrl(e.target.value); setUrlTouched(true); }}
                  className="h-11 font-mono text-sm bg-secondary border-border"
                />
                {urlTouched && destUrl && (
                  <div className="flex items-center gap-1.5 text-[11px] font-mono">
                    {urlValid ? (
                      <>
                        <Check size={12} className="text-primary" />
                        <span className="text-primary">Valid URL</span>
                      </>
                    ) : (
                      <>
                        <X size={12} className="text-destructive" />
                        <span className="text-destructive">Invalid URL — must start with http:// or https://</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* SECTION 2 — Short Link */}
              <div className="space-y-2">
                <Label className="text-sm font-heading font-medium text-foreground">
                  Short Link
                </Label>
                <div className="flex items-center">
                  <span className="h-10 flex items-center px-3 bg-muted border border-r-0 border-border rounded-l-sm font-mono text-sm text-muted-foreground select-none">
                    {SHORT_DOMAIN}/
                  </span>
                  <Input
                    placeholder={autoGenerate ? "auto-generated" : "my-alias"}
                    value={alias}
                    onChange={(e) => setAlias(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))}
                    disabled={autoGenerate}
                    className="rounded-l-none font-mono text-sm bg-secondary border-border"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setAutoGenerate(!autoGenerate)}
                    className={cn(
                      "px-2 py-0.5 rounded-sm text-[11px] font-mono border transition-colors",
                      autoGenerate
                        ? "bg-primary/15 border-primary/40 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/30"
                    )}
                  >
                    Auto-generate
                  </button>
                  {!autoGenerate && alias && (
                    <Badge variant="outline" className="font-mono text-[10px] border-border text-muted-foreground">
                      {alias.length}/32
                    </Badge>
                  )}
                  {!autoGenerate && alias && (
                    <span className="text-[11px] font-mono flex items-center gap-1">
                      {checkingAlias ? (
                        <><Loader2 size={11} className="animate-spin text-muted-foreground" /><span className="text-muted-foreground">Checking…</span></>
                      ) : aliasAvailable === true ? (
                        <><Check size={11} className="text-primary" /><span className="text-primary">Available</span></>
                      ) : aliasAvailable === false ? (
                        <><X size={11} className="text-destructive" /><span className="text-destructive">Taken</span></>
                      ) : null}
                    </span>
                  )}
                </div>
              </div>

              {/* SECTION 3 — Options */}
              <div className="space-y-2">
                <p className="text-sm font-heading font-medium text-foreground">Options</p>
                <div className="space-y-1.5">
                  {/* Expiry */}
                  <SectionPanel id="expiry" label="Expiry Date">
                    <div className="flex items-center gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className={cn("font-mono text-xs gap-1.5 w-[180px] justify-start", !expiryDate && "text-muted-foreground")}>
                            <CalendarIcon size={13} />
                            {expiryDate ? format(expiryDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={expiryDate}
                            onSelect={setExpiryDate}
                            disabled={(d) => d < new Date()}
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                      <Input
                        type="time"
                        value={expiryTime}
                        onChange={(e) => setExpiryTime(e.target.value)}
                        className="h-8 w-[120px] font-mono text-xs bg-secondary border-border"
                      />
                    </div>
                  </SectionPanel>

                  {/* Password */}
                  <SectionPanel id="password" label="Password Protect">
                    <div className="flex items-center gap-2 mb-2">
                      <Switch checked={passwordEnabled} onCheckedChange={setPasswordEnabled} />
                      <span className="text-xs font-mono text-muted-foreground">
                        {passwordEnabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                    {passwordEnabled && (
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-8 pr-9 font-mono text-xs bg-secondary border-border"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                      </div>
                    )}
                  </SectionPanel>

                  {/* UTM */}
                  <SectionPanel id="utm" label="UTM Parameters">
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "Source", value: utmSource, set: setUtmSource, ph: "e.g. twitter" },
                        { label: "Medium", value: utmMedium, set: setUtmMedium, ph: "e.g. social" },
                        { label: "Campaign", value: utmCampaign, set: setUtmCampaign, ph: "e.g. launch" },
                        { label: "Term", value: utmTerm, set: setUtmTerm, ph: "e.g. url-shortener" },
                      ].map((f) => (
                        <div key={f.label} className="space-y-1">
                          <Label className="text-[11px] font-mono text-muted-foreground">{f.label}</Label>
                          <Input value={f.value} onChange={(e) => f.set(e.target.value)} placeholder={f.ph} className="h-8 font-mono text-xs bg-secondary border-border" />
                        </div>
                      ))}
                      <div className="col-span-2 space-y-1">
                        <Label className="text-[11px] font-mono text-muted-foreground">Content</Label>
                        <Input value={utmContent} onChange={(e) => setUtmContent(e.target.value)} placeholder="e.g. hero-cta" className="h-8 font-mono text-xs bg-secondary border-border" />
                      </div>
                    </div>
                  </SectionPanel>

                  {/* Tags */}
                  <SectionPanel id="tags" label="Tags">
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {tags.map((tag) => (
                        <span key={tag} className="flex items-center gap-1 px-2 py-0.5 rounded-sm text-[11px] font-mono border border-primary/30 text-primary bg-primary/10">
                          {tag}
                          <button onClick={() => removeTag(tag)} className="hover:text-foreground"><X size={10} /></button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-1.5">
                      <Input
                        placeholder="Add a tag…"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                        className="h-8 font-mono text-xs bg-secondary border-border"
                      />
                      <Button variant="outline" size="sm" onClick={addTag} className="h-8 text-xs font-mono">Add</Button>
                    </div>
                  </SectionPanel>

                </div>
              </div>

              {/* SECTION 4 — Advanced */}
              <div className="space-y-3">
                <p className="text-sm font-heading font-medium text-foreground">Advanced</p>

                {/* Redirect type */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Label className="text-[11px] font-mono text-muted-foreground">Redirect Type</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info size={12} className="text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-[240px] text-xs font-mono">
                        <p><strong>301 Permanent:</strong> Browsers cache the redirect. Better for SEO.</p>
                        <p className="mt-1"><strong>302 Temporary:</strong> No caching. Use for A/B tests or temporary links.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex gap-1.5">
                    {([301, 302] as const).map((code) => (
                      <button
                        key={code}
                        onClick={() => setRedirectType(code)}
                        className={cn(
                          "px-3 py-1.5 rounded-sm text-xs font-mono border transition-colors",
                          redirectType === code
                            ? "bg-primary/15 border-primary/40 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/30"
                        )}
                      >
                        {code} {code === 301 ? "Permanent" : "Temporary"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom OG */}
                <div className="space-y-2">
                  <Label className="text-[11px] font-mono text-muted-foreground">Custom Open Graph</Label>
                  <div className="space-y-1.5">
                    <Input placeholder="OG Title" value={ogTitle} onChange={(e) => setOgTitle(e.target.value)} className="h-8 font-mono text-xs bg-secondary border-border" />
                    <Input placeholder="OG Description" value={ogDescription} onChange={(e) => setOgDescription(e.target.value)} className="h-8 font-mono text-xs bg-secondary border-border" />
                    <Input placeholder="OG Image URL" value={ogImage} onChange={(e) => setOgImage(e.target.value)} className="h-8 font-mono text-xs bg-secondary border-border" />
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky bottom bar */}
            <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm">
              <div className="mx-auto max-w-[680px] flex items-center justify-end gap-2 py-3 px-4 lg:px-6">
                <Button variant="outline" size="sm" className="font-mono text-xs" onClick={() => navigate("/dashboard/links")}>
                  Cancel
                </Button>
                <Button variant="cta" size="sm" className="font-mono text-xs" onClick={handleCreate}>
                  Create Link
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default CreateLink;
