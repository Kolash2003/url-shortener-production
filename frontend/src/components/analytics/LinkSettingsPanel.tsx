import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { SHORT_DOMAIN } from "@/lib/config";
import { useLinks } from "@/context/LinksContext";
import { toast } from "sonner";
import type { AnalyticsLink } from "@/pages/LinkAnalytics";

const today = new Date();
today.setHours(0, 0, 0, 0);

const LinkSettingsPanel = ({ link }: { link: AnalyticsLink }) => {
  const { updateLink } = useLinks();
  const [alias, setAlias] = useState(link.slug);
  const [expiry, setExpiry] = useState<Date | undefined>();
  const [passwordProtect, setPasswordProtect] = useState(link.passwordProtected);
  const [password, setPassword] = useState("");
  const [utmOpen, setUtmOpen] = useState(false);

  const handlePasswordToggle = (checked: boolean) => {
    setPasswordProtect(checked);
    if (!checked) {
      // Remove password protection
      updateLink(link.id, { passwordProtected: false, password: null } as any)
        .then(() => toast.success("Password protection removed"))
        .catch(() => toast.error("Failed to remove password"));
    }
  };

  const handleSetPassword = () => {
    if (!password.trim()) {
      toast.error("Enter a password");
      return;
    }
    updateLink(link.id, { passwordProtected: true, password: password.trim() } as any)
      .then(() => {
        toast.success("Password set");
        setPassword("");
      })
      .catch(() => toast.error("Failed to set password"));
  };

  return (
    <div className="rounded-sm border border-border bg-card p-4 space-y-5">
      <h3 className="text-sm font-heading font-semibold text-foreground">
        Link Settings
      </h3>

      {/* Alias */}
      <div className="space-y-1.5">
        <Label className="text-[11px] font-mono text-muted-foreground">
          Custom Alias
        </Label>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-mono text-muted-foreground">{SHORT_DOMAIN}/</span>
          <Input
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            className="h-7 font-mono text-xs bg-secondary border-border flex-1"
          />
        </div>
      </div>

      {/* Expiry */}
      <div className="space-y-1.5">
        <Label className="text-[11px] font-mono text-muted-foreground">
          Expiry Date
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full h-7 justify-start text-xs font-mono",
                !expiry && "text-muted-foreground"
              )}
            >
              <CalendarIcon size={12} className="mr-1.5" />
              {expiry ? format(expiry, "PPP") : "No expiry set"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={expiry}
              onSelect={setExpiry}
              disabled={(date) => date < today}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-[11px] font-mono text-muted-foreground">
            Password Protect
          </Label>
          <Switch
            checked={passwordProtect}
            onCheckedChange={handlePasswordToggle}
          />
        </div>
        {passwordProtect && (
          <div className="flex items-center gap-2">
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-7 font-mono text-xs bg-secondary border-border flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              className="h-7 font-mono text-xs"
              onClick={handleSetPassword}
            >
              Set
            </Button>
          </div>
        )}
      </div>

      {/* UTM */}
      <Collapsible open={utmOpen} onOpenChange={setUtmOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors">
          UTM Parameters
          <ChevronDown
            size={14}
            className={cn("transition-transform", utmOpen && "rotate-180")}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          {["utm_source", "utm_medium", "utm_campaign"].map((param) => (
            <Input
              key={param}
              placeholder={param}
              className="h-7 font-mono text-xs bg-secondary border-border"
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default LinkSettingsPanel;
