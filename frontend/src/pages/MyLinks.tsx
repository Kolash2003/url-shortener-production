import { useState, useMemo } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Plus, Copy, MoreVertical, BarChart3, Pencil, CopyPlus, Trash2, X, Download, Tag, Ban, Search, Link as LinkIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useLinks, LinkItem } from "@/context/LinksContext";
import { SHORT_BASE_URL, SHORT_DOMAIN } from "@/lib/config";
import { copyToClipboard } from "@/lib/utils";

const allTags = ["campaign", "social", "docs"];

const Sparkline = ({ data }: { data: number[] }) => {
  const max = Math.max(...data, 1);
  const w = 56;
  const h = 18;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(" ");
  return (
    <svg width={w} height={h} className="inline-block align-middle">
      <polyline points={points} fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" />
    </svg>
  );
};

const MyLinks = () => {
  const navigate = useNavigate();
  const { links, deleteLink, deleteLinks, duplicateLink, updateLink, deactivateLinks, addTagToLinks } = useLinks();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const perPage = 10;

  // Edit dialog
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  const [editUrl, setEditUrl] = useState("");
  const [editSlug, setEditSlug] = useState("");

  // Tag dialog for bulk
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [newTag, setNewTag] = useState("");

  const toggleTag = (tag: string) =>
    setActiveTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));

  const filtered = useMemo(() => {
    let result = [...links];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((l) => l.original.toLowerCase().includes(q) || l.short.toLowerCase().includes(q));
    }
    if (statusFilter !== "all") {
      if (statusFilter === "password") result = result.filter((l) => l.passwordProtected);
      else result = result.filter((l) => l.status.toLowerCase() === statusFilter);
    }
    if (activeTags.length)
      result = result.filter((l) => activeTags.some((t) => l.tags.includes(t)));
    result.sort((a, b) => {
      if (sortBy === "newest") return b.created.localeCompare(a.created);
      if (sortBy === "clicks") return b.clicks - a.clicks;
      return a.short.localeCompare(b.short);
    });
    return result;
  }, [links, search, statusFilter, sortBy, activeTags]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const allSelected = paged.length > 0 && paged.every((l) => selected.has(l.id));
  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(paged.map((l) => l.id)));
  };
  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const copy = async (text: string) => {
    const ok = await copyToClipboard(text);
    toast.success(ok ? "Copied to clipboard" : "Failed to copy");
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setSortBy("newest");
    setActiveTags([]);
  };

  // Bulk actions
  const handleBulkDelete = async () => {
    try {
      await deleteLinks(Array.from(selected));
      toast.success(`${selected.size} link(s) deleted`);
      setSelected(new Set());
    } catch {
      toast.error("Failed to delete links");
    }
  };

  const handleBulkDeactivate = () => {
    deactivateLinks(Array.from(selected));
    toast.success(`${selected.size} link(s) deactivated`);
    setSelected(new Set());
  };

  const handleBulkExport = () => {
    const ids = Array.from(selected);
    const exportLinks = links.filter((l) => ids.includes(l.id));
    const csv = ["Original URL,Short Link,Clicks,Status,Created"]
      .concat(exportLinks.map((l) => `${l.original},${l.short},${l.clicks},${l.status},${l.created}`))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "links-export.csv";
    a.click();
    toast.success("Exported to CSV");
    setSelected(new Set());
  };

  const handleBulkAddTag = () => {
    if (!newTag.trim()) return;
    addTagToLinks(Array.from(selected), newTag.trim().toLowerCase());
    toast.success(`Tag "${newTag.trim()}" added to ${selected.size} link(s)`);
    setNewTag("");
    setTagDialogOpen(false);
    setSelected(new Set());
  };

  // Per-row actions
  const handleEdit = (link: LinkItem) => {
    setEditingLink(link);
    setEditUrl(link.original);
    setEditSlug(link.slug);
  };

  const handleEditSave = () => {
    if (!editingLink) return;
    updateLink(editingLink.id, {
      original: editUrl,
      slug: editSlug,
      short: `${SHORT_BASE_URL}/${editSlug}`,
    });
    toast.success("Link updated");
    setEditingLink(null);
  };

  const handleDuplicate = (id: string) => {
    duplicateLink(id);
    toast.success("Link duplicated");
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteLink(id);
      toast.success("Link deleted");
    } catch {
      toast.error("Failed to delete link");
    }
  };

  const statusColor: Record<string, string> = {
    Active: "bg-primary/10 text-primary",
    Expired: "bg-destructive/10 text-destructive",
    Scheduled: "bg-yellow-500/10 text-yellow-400",
  };

  const tagColor: Record<string, string> = {
    campaign: "border-purple-500/40 text-purple-400",
    social: "border-blue-500/40 text-blue-400",
    docs: "border-emerald-500/40 text-emerald-400",
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <DashboardNavbar />
          <main className="flex-1 p-4 lg:p-6 space-y-4 overflow-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-heading font-bold text-foreground">My Links</h1>
                <Badge variant="outline" className="font-mono text-[11px] border-border text-muted-foreground">
                  {links.length}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="cta" size="sm" className="font-mono text-xs gap-1.5" onClick={() => navigate("/dashboard/links/new")}>
                  <Plus size={13} /> New Link
                </Button>
              </div>
            </div>

            {/* Filter bar */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px] max-w-xs">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Filter by URL or alias..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="h-8 pl-8 font-mono text-xs bg-secondary border-border"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                <SelectTrigger className="h-8 w-[150px] font-mono text-xs bg-secondary border-border">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="password">Password Protected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1); }}>
                <SelectTrigger className="h-8 w-[140px] font-mono text-xs bg-secondary border-border">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="clicks">Most Clicks</SelectItem>
                  <SelectItem value="alpha">Alphabetical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tag chips */}
            <div className="flex items-center gap-1.5">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => { toggleTag(tag); setPage(1); }}
                  className={`px-2 py-0.5 rounded-sm text-[11px] font-mono border transition-colors ${
                    activeTags.includes(tag)
                      ? "bg-primary/15 border-primary/40 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  {tag}
                </button>
              ))}
              {(search || statusFilter !== "all" || activeTags.length > 0) && (
                <button onClick={clearFilters} className="px-2 py-0.5 text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors">
                  Clear all
                </button>
              )}
            </div>

            {/* Table */}
            {paged.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <LinkIcon size={40} className="text-muted-foreground/30 mb-4" />
                <p className="font-heading text-sm text-muted-foreground mb-1">No links match your filters</p>
                <button onClick={clearFilters} className="text-xs font-mono text-primary hover:underline">
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="rounded-sm border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="w-10">
                        <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                      </TableHead>
                      <TableHead className="font-mono text-[11px] text-muted-foreground">Original URL</TableHead>
                      <TableHead className="font-mono text-[11px] text-muted-foreground">Short Link</TableHead>
                      <TableHead className="font-mono text-[11px] text-muted-foreground">Tags</TableHead>
                      <TableHead className="font-mono text-[11px] text-muted-foreground text-right">Clicks</TableHead>
                      <TableHead className="font-mono text-[11px] text-muted-foreground">Created</TableHead>
                      <TableHead className="font-mono text-[11px] text-muted-foreground">Expires</TableHead>
                      <TableHead className="font-mono text-[11px] text-muted-foreground">Status</TableHead>
                      <TableHead className="font-mono text-[11px] text-muted-foreground text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paged.map((link) => (
                      <TableRow key={link.id} className={`border-border hover:bg-secondary/40 ${selected.has(link.id) ? "bg-secondary/30" : ""}`}>
                        <TableCell>
                          <Checkbox checked={selected.has(link.id)} onCheckedChange={() => toggleOne(link.id)} />
                        </TableCell>
                        <TableCell className="max-w-[220px]">
                          <div className="flex items-center gap-2">
                            <img
                              src={`https://www.google.com/s2/favicons?domain=${link.favicon}&sz=16`}
                              alt=""
                              className="w-4 h-4 rounded-sm"
                            />
                            <span className="font-mono text-xs text-muted-foreground truncate">{link.original}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="font-mono text-[11px] text-primary border-primary/30 cursor-pointer hover:bg-primary/10 gap-1"
                            onClick={() => copy(link.short)}
                          >
                            {link.short}
                            <Copy size={10} />
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {link.tags.map((tag) => (
                              <span key={tag} className={`px-1.5 py-0.5 rounded-sm text-[10px] font-mono border ${tagColor[tag] ?? "border-border text-muted-foreground"}`}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Sparkline data={link.sparkline} />
                            <span className="font-mono text-xs text-foreground">{link.clicks.toLocaleString()}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-[11px] text-muted-foreground">{link.created}</TableCell>
                        <TableCell className="font-mono text-[11px] text-muted-foreground">{link.expires}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-sm px-1.5 py-0.5 text-[10px] font-mono font-medium ${statusColor[link.status] ?? ""}`}>
                            {link.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="text-muted-foreground hover:text-foreground transition-colors p-1">
                                <MoreVertical size={14} />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="font-mono text-xs">
                              <DropdownMenuItem onClick={() => navigate(`/dashboard/analytics/${link.slug}`)} className="gap-2">
                                <BarChart3 size={13} /> View Analytics
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(link)} className="gap-2">
                                <Pencil size={13} /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicate(link.id)} className="gap-2">
                                <CopyPlus size={13} /> Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(link.id)} className="gap-2 text-destructive focus:text-destructive">
                                <Trash2 size={13} /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {filtered.length > 0 && (
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-mono text-muted-foreground">
                  Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length} links
                </p>
                <Pagination className="mx-0 w-auto">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        className="h-7 text-xs font-mono"
                        onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)); }}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <PaginationItem key={p}>
                        <PaginationLink
                          href="#"
                          isActive={p === page}
                          className="h-7 w-7 text-xs font-mono"
                          onClick={(e) => { e.preventDefault(); setPage(p); }}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        className="h-7 text-xs font-mono"
                        onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(totalPages, p + 1)); }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}

            {/* Bulk action bar */}
            {selected.size > 0 && (
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-card border border-border rounded-sm px-4 py-2.5 shadow-lg">
                <span className="text-xs font-mono text-foreground">{selected.size} link{selected.size > 1 ? "s" : ""} selected</span>
                <div className="h-4 w-px bg-border" />
                <button onClick={handleBulkDelete} className="flex items-center gap-1.5 text-xs font-mono text-destructive hover:text-destructive/80 transition-colors">
                  <Trash2 size={13} /> Delete
                </button>
                <button onClick={handleBulkExport} className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors">
                  <Download size={13} /> Export
                </button>
                <button onClick={() => setTagDialogOpen(true)} className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors">
                  <Tag size={13} /> Add Tag
                </button>
                <button onClick={handleBulkDeactivate} className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors">
                  <Ban size={13} /> Deactivate
                </button>
                <button onClick={() => setSelected(new Set())} className="ml-1 text-muted-foreground hover:text-foreground transition-colors">
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Edit Dialog */}
            <Dialog open={!!editingLink} onOpenChange={(open) => !open && setEditingLink(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-heading">Edit Link</DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">Update the destination URL or alias for this link.</DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-mono text-muted-foreground">Destination URL</Label>
                    <Input value={editUrl} onChange={(e) => setEditUrl(e.target.value)} className="font-mono text-xs bg-secondary border-border" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-mono text-muted-foreground">Alias</Label>
                    <div className="flex items-center">
                      <span className="h-9 flex items-center px-2.5 bg-muted border border-r-0 border-border rounded-l-sm font-mono text-xs text-muted-foreground">{SHORT_DOMAIN}/</span>
                      <Input value={editSlug} onChange={(e) => setEditSlug(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))} className="rounded-l-none font-mono text-xs bg-secondary border-border" />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" size="sm" onClick={() => setEditingLink(null)}>Cancel</Button>
                  <Button variant="cta" size="sm" onClick={handleEditSave}>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Tag Dialog */}
            <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-heading">Add Tag</DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">Add a tag to {selected.size} selected link(s).</DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  <Label className="text-xs font-mono text-muted-foreground">Tag name</Label>
                  <Input
                    placeholder="e.g. campaign"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleBulkAddTag()}
                    className="font-mono text-xs bg-secondary border-border"
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" size="sm" onClick={() => setTagDialogOpen(false)}>Cancel</Button>
                  <Button variant="cta" size="sm" onClick={handleBulkAddTag}>Add Tag</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MyLinks;
