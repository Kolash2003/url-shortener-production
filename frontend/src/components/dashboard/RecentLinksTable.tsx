import { Copy, BarChart3, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { useLinks } from "@/context/LinksContext";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { copyToClipboard } from "@/lib/utils";

const RecentLinksTable = () => {
  const { links, deleteLink, searchQuery } = useLinks();
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    let result = [...links];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) => l.original.toLowerCase().includes(q) || l.short.toLowerCase().includes(q)
      );
    }
    return result.slice(0, 10);
  }, [links, searchQuery]);

  const copy = async (text: string) => {
    const ok = await copyToClipboard(text);
    toast.success(ok ? "Copied to clipboard" : "Failed to copy");
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteLink(id);
      toast.success("Link deleted");
    } catch {
      toast.error("Failed to delete link");
    }
  };

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-heading font-semibold text-foreground">
        Recent Links
      </h2>
      {filtered.length === 0 ? (
        <p className="text-xs font-mono text-muted-foreground py-8 text-center">
          {searchQuery ? "No links match your search." : "No links yet. Shorten one above!"}
        </p>
      ) : (
        <div className="rounded-sm border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="font-mono text-[11px] text-muted-foreground">Original URL</TableHead>
                <TableHead className="font-mono text-[11px] text-muted-foreground">Short Link</TableHead>
                <TableHead className="font-mono text-[11px] text-muted-foreground text-right">Clicks</TableHead>
                <TableHead className="font-mono text-[11px] text-muted-foreground">Created</TableHead>
                <TableHead className="font-mono text-[11px] text-muted-foreground">Status</TableHead>
                <TableHead className="font-mono text-[11px] text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((link) => (
                <TableRow key={link.id} className="border-border hover:bg-secondary/40">
                  <TableCell className="font-mono text-xs text-muted-foreground max-w-[200px] truncate">
                    {link.original}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="font-mono text-[11px] text-primary border-primary/30 cursor-pointer hover:bg-primary/10"
                      onClick={() => copy(link.short)}
                    >
                      {link.short}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-foreground text-right">
                    {link.clicks.toLocaleString()}
                  </TableCell>
                  <TableCell className="font-mono text-[11px] text-muted-foreground">
                    {link.created}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-sm px-1.5 py-0.5 text-[10px] font-mono font-medium ${
                        link.status === "Active"
                          ? "bg-primary/10 text-primary"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {link.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => copy(link.short)} className="text-muted-foreground hover:text-foreground transition-colors">
                        <Copy size={13} />
                      </button>
                      <button onClick={() => navigate(`/dashboard/analytics/${link.slug}`)} className="text-muted-foreground hover:text-foreground transition-colors">
                        <BarChart3 size={13} />
                      </button>
                      <button onClick={() => handleDelete(link.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default RecentLinksTable;
