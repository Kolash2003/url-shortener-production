import { useState } from "react";
import { Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLinks } from "@/context/LinksContext";
import { SHORT_BASE_URL, SHORT_DOMAIN } from "@/lib/config";
import { copyToClipboard } from "@/lib/utils";

const QuickShorten = () => {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<{ short: string; original: string } | null>(null);
  const { addLink } = useLinks();

  const handleShorten = () => {
    if (!url.trim()) return;
    const slug = Math.random().toString(36).substring(2, 7);
    const short = `${SHORT_DOMAIN}/${slug}`;
    addLink(url.trim(), slug);
    setResult({ short, original: url.trim() });
    setUrl("");
  };

  const copy = async (text: string) => {
    const ok = await copyToClipboard(`${SHORT_BASE_URL}/${text.substring(text.indexOf('/') + 1)}`);
    toast.success(ok ? "Copied to clipboard" : "Failed to copy");
  };

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-heading font-semibold text-foreground">
        Quick Shorten
      </h2>
      <div className="flex gap-2">
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste a URL to shorten instantly"
          className="flex-1 h-9 font-mono text-xs bg-secondary border-border placeholder:text-muted-foreground"
          onKeyDown={(e) => e.key === "Enter" && handleShorten()}
        />
        <Button variant="cta" size="sm" onClick={handleShorten}>
          Shorten →
        </Button>
      </div>

      {result && (
        <div className="flex items-center gap-3 rounded-sm border border-border bg-secondary/50 px-4 py-2.5">
          <span className="font-mono text-sm text-primary flex-1">
            {result.short}
          </span>
          <button
            onClick={() => copy(result.short)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Copy size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default QuickShorten;
