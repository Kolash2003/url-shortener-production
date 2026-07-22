import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LinkIcon } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden">
      {/* Scanline overlay */}
      <div className="pointer-events-none absolute inset-0 z-10 scanlines" />
      {/* Dot grid */}
      <div className="pointer-events-none absolute inset-0 dot-grid opacity-20" />

      <div className="relative z-20 text-center px-6 max-w-lg">
        {/* Broken link icon */}
        <div className="mx-auto mb-6 w-12 h-12 rounded-sm border border-destructive/30 bg-destructive/10 flex items-center justify-center">
          <LinkIcon size={22} className="text-destructive rotate-45" />
        </div>

        {/* Giant 404 */}
        <h1 className="font-mono text-[120px] sm:text-[160px] font-bold leading-none text-foreground glitch-text select-none" data-text="404">
          404
        </h1>

        <h2 className="text-xl font-heading font-bold text-foreground mt-4">
          This link doesn't exist.
        </h2>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-md mx-auto">
          It may have expired, been deleted, or never existed.
          Double-check the URL and try again.
        </p>

        {/* CTAs */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <Button variant="cta" asChild className="font-mono text-sm">
            <Link to="/">Go to Homepage</Link>
          </Button>
          <Button variant="outline" asChild className="font-mono text-sm">
            <Link to="/dashboard">Shorten a New URL</Link>
          </Button>
        </div>

        <p className="text-[11px] text-muted-foreground mt-6 font-mono">
          Are you the owner?{" "}
          <Link to="/auth" className="text-primary hover:underline">
            Log in to check your link status.
          </Link>
        </p>
      </div>
    </div>
  );
};

export default NotFound;
